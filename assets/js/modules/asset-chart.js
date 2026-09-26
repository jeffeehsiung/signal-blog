// assets/js/modules/asset-chart.js
//
// Renders every candlestick module on the page. Handles two wrappers:
//   .asset-chart-module   (multi-asset "backtest" module)
//   .candlestick-module   (single-asset "live demo" module)
//
// Data source: risk_state.signal_ledger_v (via scripts/csv_to_candlestick.py).
// Per-month meta fields: macro, trust, model_dir_aligned, monthly_dir_aligned,
// bias, signal_count, evaluated_count.

function initAssetCharts() {
  if (!window.echarts) return;

  const MODULE_SELECTOR    = '.asset-chart-module, .candlestick-module';
  const SELECTOR_SELECTOR  = '.asset-selector, .candlestick-asset-selector';

  // Three-state alignment mark (accepts booleans and 'true'/'false'/'unknown').
  const mark = (v) =>
    v === true  || v === 'true'  ? '✅' :
    v === false || v === 'false' ? '❌' : '—';

  // Format a trust value: numeric 0..1, shown to 3 decimals.
  const fmtTrust = (v) => (v == null || isNaN(v)) ? 'N/A' : Number(v).toFixed(3);

  document.querySelectorAll(MODULE_SELECTOR).forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const chartElement  = root.querySelector('.candlestick-chart');
    const selectElement = root.querySelector(SELECTOR_SELECTOR);
    const encodedData   = root.dataset.assets;

    if (!chartElement || !selectElement || !encodedData) return;

    let assetsData;
    try {
      assetsData = JSON.parse(atob(encodedData));
    } catch (e) {
      console.warn('Failed to parse candlestick data:', e);
      return;
    }

    const assetKeys = Object.keys(assetsData);
    if (assetKeys.length === 0) return;

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

      const rows = asset.series;
      const meta = asset.meta || {};

      const items = rows.map((r, i) => ({
        date:  r[0],
        open:  r[1],
        high:  r[2],
        low:   r[3],
        close: r[4],
        macro:               meta.macro?.[i]               ?? 'neutral',
        trust:               meta.trust?.[i]               ?? null,
        model_dir_aligned:   meta.model_dir_aligned?.[i]   ?? 'unknown',
        monthly_dir_aligned: meta.monthly_dir_aligned?.[i] ?? 'unknown',
        bias:                meta.bias?.[i]                ?? 'N/A',
        signal_count:        meta.signal_count?.[i]        ?? null,
        evaluated_count:     meta.evaluated_count?.[i]     ?? null,
      }));

      const dates        = items.map(d => d.date);
      const values       = items.map(d => [d.open, d.close, d.low, d.high]);
      const macroSignals = items.map(d => d.macro);

      const colorMap = { long: '#00f5d4', short: '#ff6b6b', neutral: '#aaaaaa' };
      const itemStyles = macroSignals.map(dir => ({
        color:        colorMap[dir] || '#aaaaaa',
        color0:       colorMap[dir] || '#aaaaaa',
        borderColor:  colorMap[dir] || '#888888',
        borderColor0: colorMap[dir] || '#888888',
      }));

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
              <strong>🛡 Trust</strong>: <span style="color:#8998a9;">${fmtTrust(item.trust)}</span><br/>
              <hr/>
              Open: ${Number(item.open).toFixed(2)} | High: ${Number(item.high).toFixed(2)}<br/>
              Low: ${Number(item.low).toFixed(2)} | Close: ${Number(item.close).toFixed(2)}<br/>
              <hr/>
              <strong>Model aligned</strong>:   ${mark(item.model_dir_aligned)}   <span style="color:#8998a9;">(realized_pnl sign)</span><br/>
              <strong>Monthly aligned</strong>: ${mark(item.monthly_dir_aligned)} <span style="color:#8998a9;">(OHLC vs macro)</span><br/>
              Evaluated: ${evalCoverage}<br/>
              <hr/>
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
window.DualityModules.initCandlestickCharts = initAssetCharts;