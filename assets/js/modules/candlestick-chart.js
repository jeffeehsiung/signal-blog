// assets/js/modules/candlestick-chart.js

function initCandlestickCharts() {
  if (!window.echarts) {
    console.warn('ECharts not loaded');
    return;
  }
  console.log('initCandlestickCharts called');

  document.querySelectorAll('.candlestick-module').forEach((root) => {
    if (root.dataset.initialized === 'true') return;

    const chartElement = root.querySelector('.candlestick-chart');
    const dataElement = root.querySelector('script[type="application/json"]');
    if (!chartElement || !dataElement) {
      console.warn('Missing chart container or data script');
      return;
    }

    const rawData = dataElement.textContent.trim();
    let items;
    try {
      items = JSON.parse(rawData);
    } catch (e) {
      console.error('JSON parse error:', e);
      return;
    }

    // Handle double-encoded JSON
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e2) {
        console.error('Second parse failed:', e2);
        return;
      }
    }

    // Handle nested "series" object
    if (items && typeof items === 'object' && !Array.isArray(items) && Array.isArray(items.series)) {
      items = items.series;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('No valid data array');
      return;
    }

    console.log('Parsed items count:', items.length);

    const chart = window.echarts.init(chartElement);

    // ─── Data extraction ───
    const dates = items.map(d => d.date);
    const ohlc = items.map(d => [d.open, d.close, d.low, d.high]);
    const macroSignals = items.map(d => d.macro || 'neutral');

    // ─── Candle colors (Macro = benchmark) ───
    const colorMap = { long: '#00f5d4', short: '#ff6b6b', neutral: '#aaaaaa' };
    const itemStyles = macroSignals.map(dir => ({
      color: colorMap[dir] || '#aaaaaa',
      color0: colorMap[dir] || '#aaaaaa',
      borderColor: colorMap[dir] || '#888888',
      borderColor0: colorMap[dir] || '#888888'
    }));

    // ─── Background Ribbon (Macro direction mark) ───
    const ribbonData = items.map((item, idx) => {
      const color = item.macro === 'long'
        ? 'rgba(0, 245, 212, 0.12)'
        : item.macro === 'short'
        ? 'rgba(255, 107, 107, 0.12)'
        : 'rgba(136, 136, 136, 0.06)';
      return [
        { xAxis: idx - 0.5, itemStyle: { color: color } },
        { xAxis: idx + 0.5 }
      ];
    });

    // ─── ECharts Option ───
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { left: 58, right: 20, top: 30, bottom: 42 },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const idx = params[0].dataIndex;
          const item = items[idx];
          if (!item) return '';
          return `
            <strong>${item.date}</strong><br/>
            <hr/>
            <strong>🧠 Macro</strong> (Benchmark): <span style="color:#00f5d4;font-weight:bold;">${item.macro?.toUpperCase() || 'N/A'}</span><br/>
            <strong>⚡ Micro</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${item.micro?.toUpperCase() || 'N/A'}</span><br/>
            <strong>🎯 Composite</strong> (Ref): <span style="color:#8998a9;font-weight:bold;">${item.composite?.toUpperCase() || 'N/A'}</span><br/>
            <hr/>
            Open: ${item.open.toFixed(2)} | High: ${item.high.toFixed(2)}<br/>
            Low: ${item.low.toFixed(2)} | Close: ${item.close.toFixed(2)}<br/>
            Confidence: ${item.confidence || 'N/A'} | Aligned: ${item.aligned ? '✅' : '❌'}<br/>
            Monthly Bias: ${item.bias || 'N/A'}
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#8998a9', rotate: 30 },
        axisLine: { lineStyle: { color: '#1d3041' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#8998a9',
          // ✅ Format Y‑axis labels to 2 decimal places
          formatter: function(value) {
            return value.toFixed(2);
          }
        },
        splitLine: { lineStyle: { color: '#1d3041' } }
      },
      series: [
        {
          name: 'Macro Signal (Benchmark)',
          type: 'candlestick',
          data: ohlc,
          itemStyle: {
            color: (params) => itemStyles[params.dataIndex]?.color || '#00f5d4',
            color0: (params) => itemStyles[params.dataIndex]?.color0 || '#ff6b6b',
            borderColor: (params) => itemStyles[params.dataIndex]?.borderColor || '#00f5d4',
            borderColor0: (params) => itemStyles[params.dataIndex]?.borderColor0 || '#ff6b6b'
          },
          markArea: {
            silent: true,
            data: ribbonData
          }
        }
      ]
    });

    window.addEventListener('resize', () => chart.resize());
    root.dataset.initialized = 'true';
  });
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initCandlestickCharts = initCandlestickCharts;