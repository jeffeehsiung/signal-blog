+++
title = "Papers & insights"
description = "Published research, live trading observations, and the evidence behind the models."
+++

## Performance explorer

The explorer compares the current asset-level results using the metrics available in the research dataset. Hover a chart mark for detail, or search and sort the table to inspect individual assets.

{{< performance-explorer >}}

## Live trading insights

The public research layer documents methods and findings. The core algorithm remains private; derived analytical modules can be developed independently around risk, performance, allocation, and behaviour.

## Methodology

The dataset contains asset-level summary metrics for the evaluated signal set. Excess Sharpe measures risk-adjusted performance, expected value is reported per trade, and maximum drawdown indicates the deepest observed peak-to-trough decline.

These summaries are descriptive research outputs, not a promise of future performance. The current public dataset does not include transaction costs, slippage, position sizing, or a full out-of-sample split.

## Limitations

- Results may be sensitive to the selected universe and evaluation window.
- Drawdown and Sharpe do not fully describe execution risk or liquidity.
- The public view omits proprietary signal construction and implementation details.
- Any live deployment would require independent validation, costs, and risk controls.
