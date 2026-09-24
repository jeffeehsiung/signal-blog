function initSite() {
  window.DualityModules?.initTopicFilter();
  // lib-dependent modules (asset-chart, performance-explorer) are
  // initialized from body/extensions.html, after ECharts/Tabulator load.
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
} else {
  initSite();
}