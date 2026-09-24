// assets/js/modules/asset-chart.js
//
// Renders every candlestick module on the page. Handles two wrappers:
//
//   .asset-chart-module   (multi-asset "backtest" module)
//   .candlestick-module   (single-asset "live demo" module)
//
// Both supply:
//   - data-assets="<base64(JSON({ [symbol]: {title, subtitle, series, meta} }))>"
//   - a <select> for asset selection (one of the two known classes)
//   - a .candlestick-chart container

function initAssetCharts() {
  if (!window.echarts) return;

  const MODULE_SELECTOR    = '.asset-chart-module, .candlestick-module';
  const SELECTOR_SELECTOR  = '.asset-selector, .candlestick-asset-selector';

  // Three-state alignment mark: accepts booleans and the
  // 'true' / 'false' / 'unknown' strings the Python writer emits.
  const mark = (v) =>
    v === true  || v === 'true'  ? '✅' :
    v === false || v === 'false' ? '❌' : '—';

  document.querySelectorAll(MODULE_SELECTOR).forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const chartElement  = root.querySelector('.candlestick-chart');
    const selectElement = root.querySelector(SELECTOR_SELECTOR);
    const encodedData   = root.dataset.assets;

    if (!chartElement || !selectElement || !encodedData) return;

    // ─── Parse base64 → JSON ───
    let assetsData;
    try {
      assetsData = JSON.parse(atob(encodedData));
    } catch (e) {
      console.warn('Failed to parse candlestick data:', e);
      return;
    }

    const assetKeys = Object.keys(assetsData);
    if (assetKeys.length === 0) return;

    // ─── Populate dropdown (once) ───
    assetKeys.forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key;
      selectElement.appendChild(opt);
    });

    const chart = window.echarts.init(chartElement);

    function renderChart(assetKey) {
      const asset = assetsData[assetKey];
      if (!asset || !Array.isArray(asset.series) || asset.series.length === 0) {
        chart.clear();
        chart.setOption({
          title: {
            text: 'No data available for ' + assetKey,
            textStyle: { color: '#8998a9' },
          },
        });
        return;
      }

      const rows = asset.series;     // [[date, o, h, l, c], ...]
      const meta = asset.meta || {};

      // ─── Flatten rows + meta into uniform item objects ───
      const items = rows.map((r, i) => ({
        date:  r[0],
        open:  r[1],
        high:  r[2],
        low:   r[3],
        close: r[4],
        macro:               meta.macro?.[i]               ?? 'neutral',
        micro:               meta.micro?.[i]               ?? 'neutral',
        composite:           meta.composite?.[i]           ?? 'neutral',
        confidence:          meta.confidence?.[i]          ?? 'low',
        model_dir_aligned:   meta.model_dir_aligned?.[i]   ?? 'unknown',
        monthly_dir_aligned: meta.monthly_dir_aligned?.[i] ?? 'unknown',
        bias:                meta.bias?.[i]                ?? 'N/A',
        signal_count:        meta.signal_count?.[i]        ?? null,
        evaluated_count:     meta.evaluated_count?.[i]     ?? null,
      }));

      const dates        = items.map(d => d.date);
      const values       = items.map(d => [d.open, d.close, d.low, d.high]);
      const macroSignals = items.map(d => d.macro);

      // ─── Candle colors (macro = benchmark) ───
      const colorMap = { long: '#00f5d4', short: '#ff6b6b', neutral: '#aaaaaa' };
      const itemStyles = macroSignals.map(dir => ({
        color:        colorMap[dir] || '#aaaaaa',
        color0:       colorMap[dir] || '#aaaaaa',
        borderColor:  colorMap[dir] || '#888888',
        borderColor0: colorMap[dir] || '#888888',
      }));

      // ─── Background ribbon (macro direction) ───
      const ribbonData = items.map((item, idx) => {
        const color = item.macro === 'long'
          ? 'rgba(0, 245, 212, 0.12)'
          : item.macro === 'short'
          ? 'rgba(255, 107, 107, 0.12)'
          : 'rgba(136, 136, 136, 0.06)';
        return [
          { xAxis: idx - 0.5, itemStyle: { color } },
          { xAxis: idx + 0.5 },
        ];
      });

      chart.setOption({
        backgroundColor: 'transparent',
        title: {
          text:    asset.title    || assetKey,
          subtext: asset.subtitle || '',
          textStyle:    { color: '#e8eef4', fontSize: 14, fontWeight: 400 },
          subtextStyle: { color: '#8998a9', fontSize: 11 },
          left: 0,
          top: 0,
        },
        grid: { left: 58, right: 20, top: 48, bottom: 42 },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const idx  = params[0].dataIndex;
            const item = items[idx];
            if (!item) return '';

            const evalCoverage =
              (item.signal_count != null && item.evaluated_count != null)
                ? `${item.evaluated_count} / ${item.signal_count}`
                : 'N/A';

            return `
              <strong>${item.date}</strong><br/>
              <hr/>
              <strong>🧠 Macro</strong> (Benchmark): <span style="color:#00f5d4;font-weight:bold;">${item.macro.toUpperCase()}</span><br/>
              <strong>⚡ Micro</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${item.micro.toUpperCase()}</span><br/>
              <strong>🎯 Composite</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${item.composite.toUpperCase()}</span><br/>
              <hr/>
              Open: ${Number(item.open).toFixed(2)} | High: ${Number(item.high).toFixed(2)}<br/>
              Low: ${Number(item.low).toFixed(2)} | Close: ${Number(item.close).toFixed(2)}<br/>
              <hr/>
              <strong>Model aligned</strong>:   ${mark(item.model_dir_aligned)}   <span style="color:#8998a9;">(per-row eval)</span><br/>
              <strong>Monthly aligned</strong>: ${mark(item.monthly_dir_aligned)} <span style="color:#8998a9;">(OHLC vs macro)</span><br/>
              Evaluated: ${evalCoverage}<br/>
              <hr/>
              Confidence: ${item.confidence}<br/>
              Monthly Bias: ${item.bias}
            `;
          },
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { color: '#8998a9', rotate: 30 },
          axisLine:  { lineStyle: { color: '#1d3041' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#8998a9', formatter: (v) => v.toFixed(2) },
          splitLine: { lineStyle: { color: '#1d3041' } },
        },
        series: [{
          name: 'Macro Signal (Benchmark)',
          type: 'candlestick',
          data: values,
          itemStyle: {
            color:        (p) => itemStyles[p.dataIndex]?.color        || '#00f5d4',
            color0:       (p) => itemStyles[p.dataIndex]?.color0       || '#ff6b6b',
            borderColor:  (p) => itemStyles[p.dataIndex]?.borderColor  || '#00f5d4',
            borderColor0: (p) => itemStyles[p.dataIndex]?.borderColor0 || '#ff6b6b',
          },
          markArea: { silent: true, data: ribbonData },
        }],
      });

      chart.resize();
    }

    renderChart(assetKeys[0]);

    selectElement.addEventListener('change', (e) => {
      renderChart(e.target.value);
    });

    window.addEventListener('resize', () => chart.resize());
    root.dataset.initialized = 'true';
  });
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initAssetCharts = initAssetCharts;

// Back-compat alias: any loader still calling initCandlestickCharts works.
window.DualityModules.initCandlestickCharts = initAssetCharts;