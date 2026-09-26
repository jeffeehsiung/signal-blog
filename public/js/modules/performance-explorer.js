function initPerformanceExplorers() {
  const explorers = document.querySelectorAll('.performance-explorer');

  explorers.forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const dataElement    = root.querySelector('script[type="application/json"]');
    const chartElements  = root.querySelectorAll('.explorer-chart');
    const tableElement   = root.querySelector('.performance-table');
    const searchElement  = root.querySelector('.explorer-search input');
    const cohortSelect   = root.querySelector('.explorer-cohort-select');

    if (!dataElement || chartElements.length < 2 || !tableElement || !searchElement) return;
    if (!window.echarts || !window.Tabulator) return;

    try {
      const parsedAssets = JSON.parse(dataElement.textContent);
      const rawAssets = typeof parsedAssets === 'string' ? JSON.parse(parsedAssets) : parsedAssets;
      if (!Array.isArray(rawAssets)) throw new Error('Performance data must be an array.');

      // Coerce per-cohort numerics once.
      const numericFields = [
        'span_years', 'trades_per_year', 'mean_holding_hours',
        'macro_ret_pct_p50', 'macro_ret_pct_mean', 'macro_ret_pct_std',
        'sharpe_macro', 'max_drawdown_macro', 'calmar_macro',
        'profit_factor_macro', 'annualized_ev_macro', 'hit_rate_macro',
      ];
      const coerce = (cohort) => {
        if (!cohort) return null;
        const out = { ...cohort };
        for (const k of numericFields) {
          if (out[k] != null) out[k] = Number(out[k]);
        }
        return out;
      };

      const assets = rawAssets.map((a) => ({
        symbol:       a.symbol,
        n_slots:      Number(a.n_slots),
        n_candidates: Number(a.n_candidates),
        n_acted:      Number(a.n_acted),
        candidate:    coerce(a.candidate),
        acted:        coerce(a.acted),
      }));

      // ── Cohort state ──
      let cohortKey = cohortSelect?.value || 'candidate';
      const cohortOf = (asset) => asset[cohortKey];

      const formatMetric = (v, digits, suffix = '') =>
        Number.isFinite(v) ? `${v.toFixed(digits)}${suffix}` : 'N/A';

      const colors = { bar: '#00f5d4' };
      const textColor = '#8998a9';
      const lineColor = '#1d3041';

      const findAsset = (symbol) => assets.find((a) => a.symbol === symbol);
      const normalizeSearch = (value) => {
        const n = value.trim().toUpperCase();
        return n === 'NDVA' ? 'NVDA' : n;
      };

      const formatTooltip = (symbol) => {
        const a = findAsset(symbol);
        if (!a) return '';
        const m = cohortOf(a);
        if (!m) return `<strong>${a.symbol}</strong><br>(no ${cohortKey} data)`;

        const label = cohortKey === 'acted' ? 'Acted' : 'Candidate';
        return `<strong>${a.symbol}</strong> <span style="color:#8998a9;">[${label}]</span><br>` +
          `Sharpe: ${formatMetric(m.sharpe_macro, 2)}<br>` +
          `Hit rate: ${formatMetric(m.hit_rate_macro * 100, 1, '%')}<br>` +
          `Median trade: ${formatMetric(m.macro_ret_pct_p50, 3, '%')}<br>` +
          `Max drawdown: ${formatMetric(m.max_drawdown_macro * 100, 1, '%')}<br>` +
          `Calmar: ${formatMetric(m.calmar_macro, 2)}<br>` +
          `Profit factor: ${formatMetric(m.profit_factor_macro, 2)}<br>` +
          `Trades / yr: ${formatMetric(m.trades_per_year, 0)}<br>` +
          `Mean hold: ${formatMetric(m.mean_holding_hours, 1, ' h')}`;
      };

      const comparison = window.echarts.init(chartElements[0]);
      const risk       = window.echarts.init(chartElements[1]);

      function renderCharts() {
        const withData = assets.filter((a) => cohortOf(a));
        comparison.setOption({
          backgroundColor: 'transparent',
          color: [colors.bar],
          grid: { left: 48, right: 18, top: 35, bottom: 60 },
          tooltip: { trigger: 'axis', formatter: (p) => formatTooltip(p[0]?.axisValue) },
          xAxis: {
            type: 'category',
            data: withData.map((a) => a.symbol),
            axisLabel: { color: textColor, rotate: 45, fontSize: 10 },
            axisLine: { lineStyle: { color: lineColor } },
          },
          yAxis: {
            type: 'value', name: 'Sharpe',
            nameTextStyle: { color: textColor },
            axisLabel: { color: textColor, fontSize: 10 },
            splitLine: { lineStyle: { color: lineColor } },
          },
          series: [{
            name: 'Sharpe',
            type: 'bar',
            barMaxWidth: 22,
            data: withData.map((a) => cohortOf(a)?.sharpe_macro ?? null),
          }],
        }, true);

        risk.setOption({
          backgroundColor: 'transparent',
          grid: { left: 55, right: 18, top: 25, bottom: 45 },
          tooltip: { trigger: 'item', formatter: (p) => formatTooltip(p.data.asset) },
          xAxis: {
            type: 'value', name: 'Median return %',
            nameTextStyle: { color: textColor },
            axisLabel: { color: textColor, fontSize: 10 },
            splitLine: { lineStyle: { color: lineColor } },
          },
          yAxis: {
            type: 'value', name: 'Sharpe',
            nameTextStyle: { color: textColor },
            axisLabel: { color: textColor, fontSize: 10 },
            splitLine: { lineStyle: { color: lineColor } },
          },
          series: [{
            type: 'scatter',
            symbolSize: 13,
            data: withData.map((a) => {
              const m = cohortOf(a);
              return {
                value: [m.macro_ret_pct_p50, m.sharpe_macro],
                asset: a.symbol,
                itemStyle: { color: m.macro_ret_pct_p50 >= 0 ? colors.bar : '#ff6b6b' },
              };
            }),
          }],
        }, true);
      }

      // ── Table with cohort-bound columns ──
      const columns = () => [
        { title: 'Asset', field: 'symbol', sorter: 'string', width: 100 },
        { title: 'Slots',     field: 'n_slots',      sorter: 'number' },
        { title: 'Candidates',field: 'n_candidates', sorter: 'number' },
        { title: 'Acted',     field: 'n_acted',      sorter: 'number' },
        {
          title: 'Trades', sorter: 'number',
          sorterParams: { field: `_${cohortKey}_n` },
          field: `_${cohortKey}_n`,
          formatter: (cell) => {
            const a = cell.getRow().getData();
            const m = cohortOf(a);
            return m ? m.n_rows : '—';
          },
        },
        {
          title: 'Years', field: `_${cohortKey}_years`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.span_years, 2) : '—';
          },
        },
        {
          title: 'Trades/yr', field: `_${cohortKey}_tpy`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.trades_per_year, 0) : '—';
          },
        },
        {
          title: 'Median ret %', field: `_${cohortKey}_med`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.macro_ret_pct_p50, 3) : '—';
          },
        },
        {
          title: 'Sharpe', field: `_${cohortKey}_sharpe`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.sharpe_macro, 2) : '—';
          },
        },
        {
          title: 'Hit rate', field: `_${cohortKey}_hit`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.hit_rate_macro * 100, 1, '%') : '—';
          },
        },
        {
          title: 'Max DD', field: `_${cohortKey}_dd`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.max_drawdown_macro * 100, 1, '%') : '—';
          },
        },
        {
          title: 'Calmar', field: `_${cohortKey}_calmar`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.calmar_macro, 2) : '—';
          },
        },
        {
          title: 'Profit factor', field: `_${cohortKey}_pf`, sorter: 'number',
          formatter: (cell) => {
            const m = cohortOf(cell.getRow().getData());
            return m ? formatMetric(m.profit_factor_macro, 2) : '—';
          },
        },
      ];

      // Flatten cohort metrics onto the row so Tabulator's sorter has fields.
      const flattenForCohort = (asset) => {
        const m = cohortOf(asset) || {};
        return {
          ...asset,
          [`_${cohortKey}_n`]:      m.n_rows,
          [`_${cohortKey}_years`]:  m.span_years,
          [`_${cohortKey}_tpy`]:    m.trades_per_year,
          [`_${cohortKey}_med`]:    m.macro_ret_pct_p50,
          [`_${cohortKey}_sharpe`]: m.sharpe_macro,
          [`_${cohortKey}_hit`]:    m.hit_rate_macro,
          [`_${cohortKey}_dd`]:     m.max_drawdown_macro,
          [`_${cohortKey}_calmar`]: m.calmar_macro,
          [`_${cohortKey}_pf`]:     m.profit_factor_macro,
        };
      };

      let table = new window.Tabulator(tableElement, {
        data: assets.map(flattenForCohort),
        layout: 'fitColumns',
        responsiveLayout: 'collapse',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20],
        placeholder: 'No matching assets',
        columns: columns(),
      });

      // Search
      searchElement.addEventListener('input', (event) => {
        const query = normalizeSearch(event.target.value);
        table.setFilter((row, params) => row.symbol.toUpperCase().includes(params.query), { query });
      });

      // Cohort switch: refresh charts + table in place
      if (cohortSelect) {
        cohortSelect.addEventListener('change', (e) => {
          cohortKey = e.target.value;
          renderCharts();
          table.setData(assets.map(flattenForCohort));
          table.setColumns(columns());
        });
      }

      renderCharts();

      window.addEventListener('resize', () => { comparison.resize(); risk.resize(); });
      root.querySelector('.explorer-status')?.remove();
      root.dataset.initialized = 'true';
    } catch (error) {
      showExplorerStatus(root, 'Interactive modules failed to initialize. See the browser console for details.');
      console.error('Duality performance explorer:', error);
    }
  });
}

function initPerformanceTables() {
  document.querySelectorAll('[data-performance-table]').forEach((el) => {
    if (el.dataset.initialized === 'true') return;
    const dataEl = document.getElementById(el.id + '-data');
    if (!dataEl || !window.Tabulator) return;

    try {
      new window.Tabulator(el, {
        data: JSON.parse(dataEl.textContent),
        layout: 'fitColumns',
        responsiveLayout: 'collapse',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20],
        placeholder: 'No performance data available',
        columns: [
          { title: 'Asset', field: 'symbol', sorter: 'string', width: 100 },
          { title: 'Excess Sharpe', field: 'excess_sharpe', sorter: 'number',
            formatter: (cell) => {
              const v = Number(cell.getValue());
              const cls = v > 2 ? 'is-exceptional' : v > 1 ? 'is-positive' : v < 0 ? 'is-negative' : 'is-neutral';
              return `<span class="metric-value ${cls}">${v.toFixed(2)}</span>`;
            } },
          { title: 'Max drawdown', field: 'max_drawdown', sorter: 'string' },
          { title: 'EV / trade', field: 'ev', sorter: 'number',
            formatter: (cell) => Number(cell.getValue()).toFixed(3) },
          { title: 'Verdict', field: 'verdict', sorter: 'string',
            formatter: (cell) => `<span class="performance-verdict performance-verdict-${cell.getValue()}">${cell.getValue()}</span>` },
        ],
      });
      el.dataset.initialized = 'true';
    } catch (e) {
      console.error('performance-table init failed:', e);
    }
  });
}

function showExplorerStatus(root, message) {
  if (root.querySelector('.explorer-status')) return;
  const status = document.createElement('p');
  status.className = 'explorer-status';
  status.textContent = message;
  root.appendChild(status);
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initPerformanceExplorers = initPerformanceExplorers;
window.DualityModules.initPerformanceTables = initPerformanceTables;
