function initCandlestickCharts() {
  if (!window.echarts) return;

  document.querySelectorAll('.candlestick-module').forEach((root) => {
    if (root.dataset.initialized === 'true') return;
    const chartElement = root.querySelector('.candlestick-chart');
    const dataElement = root.querySelector('script[type="application/json"]');
    if (!chartElement || !dataElement) return;

    const parsedData = JSON.parse(dataElement.textContent);
    const data = typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData;
    if (!Array.isArray(data)) return;
    const chart = window.echarts.init(chartElement);
    const values = data.map((item) => [item[1], item[4], item[3], item[2]]);
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { left: 58, right: 20, top: 18, bottom: 42 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map((item) => item[0]), axisLabel: { color: '#8998a9' }, axisLine: { lineStyle: { color: '#1d3041' } } },
      yAxis: { type: 'value', axisLabel: { color: '#8998a9' }, splitLine: { lineStyle: { color: '#1d3041' } } },
      series: [{ type: 'candlestick', data: values, itemStyle: { color: '#00f5d4', color0: '#ff6b6b', borderColor: '#00f5d4', borderColor0: '#ff6b6b' } }]
    });
    window.addEventListener('resize', () => chart.resize());
    root.dataset.initialized = 'true';
  });
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initCandlestickCharts = initCandlestickCharts;
