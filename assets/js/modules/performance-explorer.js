function initPerformanceExplorers() {
  const explorers = document.querySelectorAll('.performance-explorer');

  explorers.forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const dataElement = root.querySelector('script[type="application/json"]');
    const chartElements = root.querySelectorAll('.explorer-chart');
    const tableElement = root.querySelector('.performance-table');
    const searchElement = root.querySelector('.explorer-search input');

    if (!dataElement || chartElements.length < 2 || !tableElement || !searchElement) return;
    if (!window.echarts || !window.Tabulator) return;

    try {
      const parsedAssets = JSON.parse(dataElement.textContent);
      const rawAssets = typeof parsedAssets === 'string' ? JSON.parse(parsedAssets) : parsedAssets;
      if (!Array.isArray(rawAssets)) throw new Error('Performance data must be an array.');
      const assets = rawAssets.map((asset) => ({
        ...asset,
        max_drawdown_composite: Number(asset.max_drawdown_composite),
        calmar_composite: Number(asset.calmar_composite),
        avg_annual_profit_factor_composite: Number(asset.avg_annual_profit_factor_composite),
        annualized_ev_composite: Number(asset.annualized_ev_composite)
      }));
      const formatMetric = (value, digits, suffix = '') => Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : 'N/A';
      const colors = { macro: '#00f5d4', composite: '#7d72ff' };
      const textColor = '#8998a9';
      const lineColor = '#1d3041';
      const findAsset = (symbol) => assets.find((asset) => asset.symbol === symbol);
      const normalizeSearch = (value) => {
        const normalized = value.trim().toUpperCase();
        return normalized === 'NDVA' ? 'NVDA' : normalized;
      };
      const formatTooltip = (symbol) => {
        const asset = findAsset(symbol);
        if (!asset) return '';
        return `<strong>${asset.symbol}</strong><br>` +
          `Macro Sharpe: ${Number(asset.sharpe_total_macro).toFixed(2)}<br>` +
          `Composite Sharpe: ${Number(asset.sharpe_total_composite).toFixed(2)}<br>` +
          `Composite drawdown: ${formatMetric(asset.max_drawdown_composite * 100, 1, '%')}<br>` +
          `Composite Calmar: ${formatMetric(asset.calmar_composite, 2)}<br>` +
          `Composite hit rate: ${formatMetric(Number(asset.composite_hit_rate) * 100, 1, '%')}`;
      };

      const comparison = window.echarts.init(chartElements[0]);
      comparison.setOption({
        backgroundColor: 'transparent',
        color: [colors.macro, colors.composite],
        grid: { left: 48, right: 18, top: 35, bottom: 60 },
        legend: { textStyle: { color: textColor, fontSize: 11 }, top: 0 },
        tooltip: { trigger: 'axis', formatter: (params) => formatTooltip(params[0]?.axisValue) },
        xAxis: { type: 'category', data: assets.map((asset) => asset.symbol), axisLabel: { color: textColor, rotate: 45, fontSize: 10 }, axisLine: { lineStyle: { color: lineColor } } },
        yAxis: { type: 'value', axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: lineColor } } },
        series: [
          { name: 'Macro Sharpe', type: 'bar', barMaxWidth: 18, data: assets.map((asset) => asset.sharpe_total_macro) },
          { name: 'Composite Sharpe', type: 'bar', barMaxWidth: 18, data: assets.map((asset) => asset.sharpe_total_composite) }
        ]
      });

      const risk = window.echarts.init(chartElements[1]);
      risk.setOption({
        backgroundColor: 'transparent',
        grid: { left: 55, right: 18, top: 25, bottom: 45 },
        tooltip: { trigger: 'item', formatter: (params) => formatTooltip(params.data.asset) },
        xAxis: { type: 'value', name: 'Macro return p50', nameTextStyle: { color: textColor }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: lineColor } } },
        yAxis: { type: 'value', name: 'Macro Sharpe', nameTextStyle: { color: textColor }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: lineColor } } },
        series: [{ type: 'scatter', symbolSize: 13, data: assets.map((asset) => ({ value: [asset.macro_ret_pct_p50, asset.sharpe_total_macro], asset: asset.symbol, itemStyle: { color: asset.macro_ret_pct_p50 >= 0 ? colors.macro : '#ff6b6b' } })) }]
      });

      const table = new window.Tabulator(tableElement, {
        data: assets,
        layout: 'fitColumns',
        responsiveLayout: 'collapse',
        pagination: true,
        paginationSize: 10,
        paginationSizeSelector: [10, 20],
        placeholder: 'No matching assets',
        columns: [
          { title: 'Asset', field: 'symbol', sorter: 'string', width: 100 },
          { title: 'Rows', field: 'n_rows', sorter: 'number' },
          { title: 'Macro Sharpe', field: 'sharpe_total_macro', sorter: 'number', formatter: (cell) => Number(cell.getValue()).toFixed(2) },
          { title: 'Composite Sharpe', field: 'sharpe_total_composite', sorter: 'number', formatter: (cell) => Number(cell.getValue()).toFixed(2) },
          { title: 'Composite drawdown', field: 'max_drawdown_composite', sorter: 'number', formatter: (cell) => formatMetric(cell.getValue() * 100, 1, '%') },
          { title: 'Composite Calmar', field: 'calmar_composite', sorter: 'number', formatter: (cell) => formatMetric(cell.getValue(), 2) },
          { title: 'Profit factor', field: 'avg_annual_profit_factor_composite', sorter: 'number', formatter: (cell) => formatMetric(cell.getValue(), 2) },
          { title: 'Composite hit rate', field: 'composite_hit_rate', sorter: 'number', formatter: (cell) => formatMetric(cell.getValue() * 100, 1, '%') },
          { title: 'Annualized EV', field: 'annualized_ev_composite', sorter: 'number', formatter: (cell) => formatMetric(cell.getValue(), 1) }
        ]
      });

      searchElement.addEventListener('input', (event) => {
        const query = normalizeSearch(event.target.value);
        table.setFilter((row, params) => row.symbol.toUpperCase().includes(params.query), { query });
      });
      window.addEventListener('resize', () => { comparison.resize(); risk.resize(); });
      root.querySelector('.explorer-status')?.remove();
      root.dataset.initialized = 'true';
    } catch (error) {
      showExplorerStatus(root, 'Interactive modules failed to initialize. See the browser console for details.');
      console.error('Duality performance explorer:', error);
    }
  });
}

function startPerformanceExplorerRetry() {
  const attempt = () => {
    const explorers = document.querySelectorAll('.performance-explorer:not([data-initialized="true"])');
    if (!explorers.length) return;
    window.DualityModules.initPerformanceExplorers();
  };

  attempt();
  let attempts = 0;
  const retry = window.setInterval(() => {
    attempts += 1;
    attempt();
    if (attempts >= 30 || !document.querySelector('.performance-explorer:not([data-initialized="true"])')) {
      window.clearInterval(retry);
    }
  }, 100);
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
window.DualityModules.startPerformanceExplorerRetry = startPerformanceExplorerRetry;
