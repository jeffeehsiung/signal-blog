// assets/js/modules/asset-chart.js

function initAssetCharts() {
  if (!window.echarts) return;

  document.querySelectorAll('.asset-chart-module').forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const chartElement = root.querySelector('.candlestick-chart');
    const selectElement = root.querySelector('.asset-selector');
    const encodedData = root.dataset.assets;

    if (!chartElement || !selectElement || !encodedData) return;

    let assetsData;
    try {
      const jsonString = atob(encodedData);
      assetsData = JSON.parse(jsonString);
    } catch (e) {
      console.warn('Failed to parse candlestick data:', e);
      return;
    }

    const assetKeys = Object.keys(assetsData);
    if (assetKeys.length === 0) return;

    // 填充下拉菜单
    assetKeys.forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      selectElement.appendChild(option);
    });

    const chart = window.echarts.init(chartElement);
    let currentAsset = assetKeys[0];

    function renderChart(assetKey) {
      const asset = assetsData[assetKey];
      if (!asset || !asset.series || asset.series.length === 0) {
        chart.clear();
        chart.setOption({
          title: { text: 'No data available for ' + assetKey, textStyle: { color: '#8998a9' } },
        });
        return;
      }

      const data = asset.series;
      const meta = asset.meta || {};

      const dates = data.map((item) => item[0]);
      const values = data.map((item) => [item[1], item[4], item[3], item[2]]);

      // --- 信号颜色（来自 meta 或 fallback）---
      const macroSignals = meta.macro || data.map(() => 'neutral');
      const colorMap = { long: '#00f5d4', short: '#ff6b6b', neutral: '#aaaaaa' };
      const itemStyles = macroSignals.map((dir) => ({
        color: colorMap[dir] || '#aaaaaa',
        color0: colorMap[dir] || '#aaaaaa',
        borderColor: colorMap[dir] || '#888888',
        borderColor0: colorMap[dir] || '#888888',
      }));

      // --- 背景色带（macro 信号）---
      const ribbonData = macroSignals.map((dir, idx) => {
        const color = dir === 'long'
          ? 'rgba(0, 245, 212, 0.12)'
          : dir === 'short'
          ? 'rgba(255, 107, 107, 0.12)'
          : 'rgba(136, 136, 136, 0.06)';
        return [
          { xAxis: idx - 0.5, itemStyle: { color: color } },
          { xAxis: idx + 0.5 },
        ];
      });

      chart.setOption({
        backgroundColor: 'transparent',
        title: {
          text: asset.title || assetKey,
          textStyle: { color: '#e8eef4', fontSize: 14, fontWeight: 400 },
          left: 0,
          top: 0,
        },
        grid: { left: 58, right: 20, top: 48, bottom: 42 },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const idx = params[0].dataIndex;
            const itemData = data[idx];
            if (!itemData) return '';

            // 提取 meta 信息（如果有）
            const macro = (meta.macro && meta.macro[idx]) || 'neutral';
            const micro = (meta.micro && meta.micro[idx]) || 'neutral';
            const composite = (meta.composite && meta.composite[idx]) || 'neutral';
            const bias = (meta.bias && meta.bias[idx]) || 'N/A';
            const confidence = (meta.confidence && meta.confidence[idx]) || 'low';
            const aligned = (meta.aligned && meta.aligned[idx]) || 'false';

            return `
              <strong>${dates[idx]}</strong><br/>
              <hr/>
              <strong>🧠 Macro</strong> (Benchmark): <span style="color:#00f5d4;font-weight:bold;">${macro.toUpperCase()}</span><br/>
              <strong>⚡ Micro</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${micro.toUpperCase()}</span><br/>
              <strong>🎯 Composite</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${composite.toUpperCase()}</span><br/>
              <hr/>
              Open: ${itemData[1].toFixed(2)} | High: ${itemData[2].toFixed(2)}<br/>
              Low: ${itemData[3].toFixed(2)} | Close: ${itemData[4].toFixed(2)}<br/>
              Confidence: ${confidence} | Aligned: ${aligned === 'true' ? '✅' : '❌'}<br/>
              Monthly Bias: ${bias}
            `;
          },
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { color: '#8998a9', rotate: 30 },
          axisLine: { lineStyle: { color: '#1d3041' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#8998a9', formatter: (v) => v.toFixed(2) },
          splitLine: { lineStyle: { color: '#1d3041' } },
        },
        series: [
          {
            type: 'candlestick',
            data: values,
            itemStyle: {
              color: (params) => itemStyles[params.dataIndex]?.color || '#00f5d4',
              color0: (params) => itemStyles[params.dataIndex]?.color0 || '#ff6b6b',
              borderColor: (params) => itemStyles[params.dataIndex]?.borderColor || '#00f5d4',
              borderColor0: (params) => itemStyles[params.dataIndex]?.borderColor0 || '#ff6b6b',
            },
            markArea: { silent: true, data: ribbonData },
          },
        ],
      });

      chart.resize();
    }

    renderChart(currentAsset);

    selectElement.addEventListener('change', (e) => {
      currentAsset = e.target.value;
      renderChart(currentAsset);
    });

    window.addEventListener('resize', () => chart.resize());
    root.dataset.initialized = 'true';
  });
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initAssetCharts = initAssetCharts;