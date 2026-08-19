function initSite() {
  window.DualityModules?.initTopicFilter();
  window.DualityModules?.initPerformanceExplorers();
  window.DualityModules?.initCandlestickCharts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
} else {
  initSite();
}
