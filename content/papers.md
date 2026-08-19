+++
title = "Papers & insights"
description = "Published research, live trading observations, and the scientific ideas behind the models."
+++

## Research scope

Duality studies financial markets as adaptive dynamical systems using signal processing, statistical physics, information geometry, and control-system ideas. The public research record focuses on evidence, interpretation, and limitations; exact equations, calibration constants, thresholds, and execution contracts remain proprietary.

The conceptual foundations are introduced through the [Blog]({{< ref "posts" >}}) and [Videos]({{< ref "videos" >}}). The [Products]({{< ref "products" >}}) section describes derived analytical workflows without exposing the core signal engine.

## Performance explorer

The explorer demonstrates how the supplied asset-level research export can become an interactive research surface. Hover a chart mark for detail, or search and sort the table to inspect individual assets. The values are a screenshot transcription for interface demonstration and should be replaced by the canonical export before publication.

{{< performance-explorer >}}

## Interpreting the results

The explorer shows summary metrics and comparisons, not the proprietary mechanism that produced them. Active-style measures help diagnose signal behaviour when engaged; total-style measures describe the continuous portfolio experience, including inactive periods. The gap between them can reveal selectivity and cash-timing effects, but must be interpreted alongside costs, drawdowns, and position sizing.

## Methodology

The example dataset contains asset-level summary metrics for Macro and Composite signal layers: return percentile, total Sharpe, annual trade counts, annual win rate, expected value, and hit rate.

These summaries are descriptive research outputs, not a promise of future performance. The screenshot does not provide transaction costs, slippage, position sizing, or a full out-of-sample split.

## Limitations

- Results may be sensitive to the selected universe and evaluation window.
- Drawdown and Sharpe do not fully describe execution risk or liquidity.
- The public view omits proprietary signal construction and implementation details.
- Any live deployment would require independent validation, costs, and risk controls.
