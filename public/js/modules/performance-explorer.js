// assets/js/modules/performance-explorer.js
//
// Renders the interactive performance explorer. Reads risk_state.signal_ledger_v
// metrics exported by scripts/export_record_yaml.py.
//
// Each asset has two cohorts:
//   candidate — window_selected AND admitted
//   acted     — order_action IS NOT NULL (⊆ candidate)

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

      // Field names must match scripts/export_record_yaml.py's _cohort_metrics return dict.
      const numericFields = [
        'n_rows', 'n_trading_days', 'span_years', 'trades_per_year', 'mean_holding_hours',
        'macro_ret_pct_p50', 'macro_ret_pct_mean', 'macro_ret_pct_std', 'hit_rate_macro',
        'mean_daily_ret_pct', 'std_daily_ret_pct', 'annualized_return_pct',
        'sharpe_macro', 'sharpe_portfolio',
        'capital_base_usd', 'cash_annual_yield',
        'mean_deployed_pct', 'peak_deployed_pct', 'idle_yield_usd_total',
        'max_drawdown_capital_usd',
        'pnl_usd_total', 'pnl_usd_mean',
        'max_drawdown_usd', 'max_drawdown_pct',
        'calmar_macro', 'profit_factor_macro', 'annualized_ev_macro',
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

      let cohortKey = cohortSelect?.value || 'candidate';
      const cohortOf = (asset) => asset[cohortKey];

      const fmt = (v, digits, suffix = '') =>
        Number.isFinite(v) ? `${v.toFixed(digits)}${suffix}` : 'N/A';

      const textColor = '#8998a9';
      const lineColor = '#1d3041';
      const barColor  = '#00f5d4';

      const findAsset = (symbol) => assets.find((a) => a.symbol === symbol);

      const formatTooltip = (symbol) => {
        const a = findAsset(symbol);
        if (!a) return '';
        const m = cohortOf(a);
        if (!m) return `<strong>${a.symbol}</strong><br>(no ${cohortKey} data)`;

        const label = cohortKey === 'acted' ? 'Acted' : 'Candidate';
        return `<strong>${a.symbol}</strong> <span style="color:#8998a9;">[${label}]</span><br>` +
          `Sharpe (strategy):  ${fmt(m.sharpe_macro, 2)}<br>` +
          `Sharpe (portfolio): ${fmt(m.sharpe_portfolio, 2)}<br>` +
          `Hit rate:           ${fmt(m.hit_rate_macro * 100, 1, '%')}<br>` +
          `Median trade:       ${fmt(m.macro_ret_pct_p50, 3, '%')}<br>` +
          `Max DD (of depl.):  ${fmt(m.max_drawdown_pct * 100, 2, '%')}<br>` +
          `Max DD (of cap.):   ${fmt(m.max_drawdown_capital_usd, 0, ' USD')}<br>` +
          `Calmar:             ${fmt(m.calmar_macro, 2)}<br>` +
          `Profit factor:      ${fmt(m.profit_factor_macro, 2)}<br>` +
          `Trades / yr:        ${fmt(m.trades_per_year, 0)}<br>` +
          `Mean hold:          ${fmt(m.mean_holding_hours, 1, ' h')}<br>` +
          `Net P&L:            ${fmt(m.pnl_usd_total, 0, ' USD')}<br>` +
          `Deployed (mean):    ${fmt(m.mean_deployed_pct, 2, '%')}<br>` +
          `Deployed (peak):    ${fmt(m.peak_deployed_pct, 2, '%')}`;
      };

      const comparison = window.echarts.init(chartElements[0]);
      const risk       = window.echarts.init(chartElements[1]);

      function renderCharts() {
        const withData = assets.filter((a) => cohortOf(a));

        comparison.setOption({
          backgroundColor: 'transparent',
          color: [barColor],
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
                itemStyle: { color: m.macro_ret_pct_p50 >= 0 ? barColor : '#ff6b6b' },
              };
            }),
          }],
        }, true);
      }

      const columns = () => [
        { title: 'Asset',      field: 'symbol',       sorter: 'string', width: 90 },
        { title: 'Slots',      field: 'n_slots',      sorter: 'number' },
        { title: 'Candidates', field: 'n_candidates', sorter: 'number' },
        { title: 'Acted',      field: 'n_acted',      sorter: 'number' },
        {
          title: 'Trades', field: `_${cohortKey}_n`, sorter: 'number',
          formatter: (c) => cohortOf(c.getRow().getData())?.n_rows ?? '—',
        },
        {
          title: 'Years', field: `_${cohortKey}_years`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.span_years, 2),
        },
        {
          title: 'Trades/yr', field: `_${cohortKey}_tpy`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.trades_per_year, 0),
        },
        {
          title: 'Median ret %', field: `_${cohortKey}_med`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.macro_ret_pct_p50, 3),
        },
        {
          title: 'Sharpe (strat)', field: `_${cohortKey}_sharpe`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.sharpe_macro, 2),
        },
        {
          title: 'Sharpe (port)', field: `_${cohortKey}_sharpe_port`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.sharpe_portfolio, 2),
        },
        {
          title: 'Hit rate', field: `_${cohortKey}_hit`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.hit_rate_macro * 100, 1, '%'),
        },
        {
          title: 'Max DD %', field: `_${cohortKey}_dd`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.max_drawdown_pct * 100, 2, '%'),
        },
        {
          title: 'Max DD $', field: `_${cohortKey}_ddusd`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.max_drawdown_usd, 0),
        },
        {
          title: 'Calmar', field: `_${cohortKey}_calmar`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.calmar_macro, 2),
        },
        {
          title: 'Profit factor', field: `_${cohortKey}_pf`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.profit_factor_macro, 2),
        },
        {
          title: 'Deployed %', field: `_${cohortKey}_dep`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.mean_deployed_pct, 2, '%'),
        },
        {
          title: 'Net P&L $', field: `_${cohortKey}_pnl`, sorter: 'number',
          formatter: (c) => fmt(cohortOf(c.getRow().getData())?.pnl_usd_total, 0),
        },
      ];

      const flattenForCohort = (asset) => {
        const m = cohortOf(asset) || {};
        return {
          ...asset,
          [`_${cohortKey}_n`]:         m.n_rows,
          [`_${cohortKey}_years`]:     m.span_years,
          [`_${cohortKey}_tpy`]:       m.trades_per_year,
          [`_${cohortKey}_med`]:       m.macro_ret_pct_p50,
          [`_${cohortKey}_sharpe`]:    m.sharpe_macro,
          [`_${cohortKey}_sharpe_port`]: m.sharpe_portfolio,
          [`_${cohortKey}_hit`]:       m.hit_rate_macro,
          [`_${cohortKey}_dd`]:        m.max_drawdown_pct,
          [`_${cohortKey}_ddusd`]:     m.max_drawdown_usd,
          [`_${cohortKey}_calmar`]:    m.calmar_macro,
          [`_${cohortKey}_pf`]:        m.profit_factor_macro,
          [`_${cohortKey}_dep`]:       m.mean_deployed_pct,
          [`_${cohortKey}_pnl`]:       m.pnl_usd_total,
        };
      };

      const table = new window.Tabulator(tableElement, {
        data: assets.map(flattenForCohort),
        layout: 'fitColumns',
        responsiveLayout: 'collapse',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20],
        placeholder: 'No matching assets',
        columns: columns(),
      });

      searchElement.addEventListener('input', (event) => {
        const query = event.target.value.trim().toUpperCase();
        table.setFilter((row, params) => row.symbol.toUpperCase().includes(params.query), { query });
      });

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
      const payload = JSON.parse(dataEl.textContent);
      const rawAssets = Array.isArray(payload)
        ? payload
        : (typeof payload === 'string' ? JSON.parse(payload) : payload);
      if (!Array.isArray(rawAssets)) throw new Error('performance-table: assets must be an array.');

      const num = (v) => (v == null ? null : Number(v));
      const fmt = (v, digits, suffix = '') =>
        Number.isFinite(v) ? `${v.toFixed(digits)}${suffix}` : '—';

      // Default to the "acted" cohort — the deployed strategy.
      const rows = rawAssets.map((a) => {
        const m = a.acted || a.candidate || {};
        return {
          symbol:              a.symbol,
          n_slots:             num(a.n_slots),
          n_candidates:        num(a.n_candidates),
          n_acted:             num(a.n_acted),
          n_rows:              num(m.n_rows),
          span_years:          num(m.span_years),
          trades_per_year:     num(m.trades_per_year),
          macro_ret_pct_p50:   num(m.macro_ret_pct_p50),
          sharpe_macro:        num(m.sharpe_macro),
          sharpe_portfolio:    num(m.sharpe_portfolio),
          hit_rate_macro:      num(m.hit_rate_macro),
          max_drawdown_pct:    num(m.max_drawdown_pct),
          max_drawdown_usd:    num(m.max_drawdown_usd),
          calmar_macro:        num(m.calmar_macro),
          profit_factor_macro: num(m.profit_factor_macro),
          mean_deployed_pct:   num(m.mean_deployed_pct),
          pnl_usd_total:       num(m.pnl_usd_total),
          annualized_ev_macro: num(m.annualized_ev_macro),
        };
      });

      new window.Tabulator(el, {
        data: rows,
        layout: 'fitColumns',
        responsiveLayout: 'collapse',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20],
        placeholder: 'No performance data available',
        columns: [
          { title: 'Asset', field: 'symbol', sorter: 'string', width: 90 },
          { title: 'Trades', field: 'n_rows', sorter: 'number' },
          { title: 'Trades/yr', field: 'trades_per_year', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 0) },
          { title: 'Median ret %', field: 'macro_ret_pct_p50', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 3) },
          { title: 'Sharpe (strat)', field: 'sharpe_macro', sorter: 'number',
            formatter: (c) => {
              const v = Number(c.getValue());
              const cls = v > 2 ? 'is-exceptional' : v > 1 ? 'is-positive' : v < 0 ? 'is-negative' : 'is-neutral';
              return `<span class="metric-value ${cls}">${v.toFixed(2)}</span>`;
            } },
          { title: 'Sharpe (port)', field: 'sharpe_portfolio', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 2) },
          { title: 'Hit rate', field: 'hit_rate_macro', sorter: 'number',
            formatter: (c) => fmt(c.getValue() * 100, 1, '%') },
          { title: 'Max DD %', field: 'max_drawdown_pct', sorter: 'number',
            formatter: (c) => fmt(c.getValue() * 100, 2, '%') },
          { title: 'Calmar', field: 'calmar_macro', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 2) },
          { title: 'Profit factor', field: 'profit_factor_macro', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 2) },
          { title: 'Deployed %', field: 'mean_deployed_pct', sorter: 'number',
            formatter: (c) => fmt(c.getValue(), 2, '%') },
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