function initSharpeCharts() {
  document.querySelectorAll('[data-sharpe-chart]').forEach((el) => {
    if (el.dataset.initialized === 'true') return;
    const dataEl = el.parentElement.querySelector('[data-sharpe-data]');
    if (!dataEl || !window.echarts) return;

    try {
      const assets = JSON.parse(dataEl.textContent);
      const chart = window.echarts.init(el);
      const symbols = assets.map((a) => a.symbol);
      const sharpe  = assets.map((a) => a.excess_sharpe);
      const colors  = sharpe.map((v) => v > 2 ? '#7c3aed' : v > 1 ? '#2563eb' : v < 0 ? '#dc2626' : '#f59e0b');

      chart.setOption({
        title: { text: 'Excess Sharpe by Asset', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: symbols, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: 'Excess Sharpe' },
        series: [{
          type: 'bar',
          data: sharpe.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
          barWidth: '50%',
        }],
      });

      window.addEventListener('resize', () => chart.resize());
      el.dataset.initialized = 'true';
    } catch (e) {
      console.error('sharpe-chart init failed:', e);
    }
  });
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initSharpeCharts = initSharpeCharts;