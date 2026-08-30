function initSite() {
  window.DualityModules?.initTopicFilter();
  window.DualityModules?.initPerformanceExplorers();
  window.DualityModules?.startPerformanceExplorerRetry();
  window.DualityModules?.initCandlestickCharts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
} else {
  initSite();
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.DualityModules && window.DualityModules.initAssetCharts) {
    window.DualityModules.initAssetCharts();
  }
});
