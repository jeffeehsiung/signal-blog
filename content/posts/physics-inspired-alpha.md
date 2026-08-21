+++
draft = false
date = 2026-08-21
title = "Physics-Inspired Alpha: A Signal Engine Before the Risk Layer"
description = "A transparent research note on a multi-scale directional signal engine, its backtest evidence, and the work still required before capital allocation."
slug = "physics-inspired-alpha"
authors = ["Duality"]
tags = ["quantitative research", "signal processing", "backtesting"]
categories = ["research"]
series = ["DSP research notes"]
math = true
+++

> **Research note.** The results in this article are backtest outputs from a directional signal engine. They are shown gross of risk assessment, position sizing, transaction costs, financing, and slippage. A dedicated risk and allocation module is in development; these figures are not a live track record or an investment recommendation.

## The question

Financial time series are noisy, non-stationary, and reflexive. A useful signal therefore has to do more than predict the next bar. It has to distinguish persistent structure from transient movement, track when a regime is changing, and expose uncertainty rather than hiding it behind a single score.

This research began with a simple question: **can a signal-processing system describe market behaviour in terms that are closer to a physical system than to a static classifier?**

The resulting engine is a layered directional pipeline. Its implementation is proprietary, but its conceptual architecture is straightforward enough to audit:

```text
Market observations
        |
Multi-scale decomposition -> phase and coherence -> geometric state
        |
uncertainty / entropy estimate -> directional state -> signal outcome
        |
                 risk and position allocation [in development]
```

The references to spectral analysis, phase, geometry, thermodynamics, and quantum-inspired state evolution are conceptual lenses. They should not be read as a claim that markets literally obey the equations of physics, nor as a substitute for statistical validation.

## What is being measured

The export contains three views of the signal: a macro component, a micro component, and a composite output. This post focuses on the composite signal where it is useful, while keeping the macro comparison visible in the interactive explorer.

The key distinction is between **signal quality** and **portfolio quality**. A positive expected value before allocation says something about the directional forecast. It does not say how much capital should be exposed, whether trades can be executed at scale, or how the result survives costs.

## Results at a glance

The following highlights use the supplied total-Sharpe, composite-drawdown, Calmar, hit-rate, profit-factor, and annualized-EV fields. EV is shown in the export's native units; it is not relabeled as a percentage.

| Asset | Composite Sharpe | Max drawdown | Calmar | Hit rate | Profit factor | Annualized EV |
|:--|--:|--:|--:|--:|--:|--:|
| GOOGL | 4.10 | -18.0% | 8.56 | 55.8% | 1.14 | 1,284.3 |
| COIN | 4.36 | -34.7% | 15.60 | 56.2% | 1.30 | 1,026.1 |
| NVDA | 3.16 | -21.4% | 13.88 | 54.1% | 1.12 | 979.2 |
| TSLA | 3.46 | -17.8% | 31.69 | 52.9% | 1.19 | 992.6 |
| AAPL | 1.44 | -19.3% | 3.19 | 52.3% | 1.09 | 593.4 |

These are promising diagnostics, not proof of deployability. The sample includes heterogeneous assets and uneven row counts. Some assets also show unstable or negative composite results, which is valuable evidence: the engine is not uniformly reliable across the universe.

## Explore the full export

The explorer below is deliberately outcome-focused. It lets the reader compare macro and composite Sharpe, inspect the return profile, search symbols, and sort the supplied asset-level fields. It does not expose the model's parameters, update schedule, feature construction, or allocation rules.

{{< performance-explorer data="dsp-performance" >}}

## Reading the result

### Separation from noise

A higher Sharpe ratio is consistent with the pipeline separating a repeatable component from short-horizon noise. It is not enough on its own: Sharpe is sensitive to dependence, non-normality, and the return construction used by the backtest.

### Drawdown awareness

The drawdown figures show why signal generation and risk management must remain separate. COIN and several high-volatility names have attractive risk-adjusted statistics alongside material losses from peak to trough. A risk layer should decide whether that exposure is acceptable for a particular mandate.

### Uneven reliability

Hit rate is close to 50% for many assets. That is not a contradiction. A strategy can be profitable with a modest hit rate when the distribution of wins and losses is favorable, and it can be unhelpful when the payoff distribution, costs, or regime changes work against it. The negative or weak composite rows are part of the result, not an embarrassment to remove.

### Why Calmar needs context

Some Calmar values are exceptionally high because the annualized return and drawdown conventions amplify one another. They should be read alongside the raw equity curve, return dispersion, sample length, and the exact definition of the return series. The next version of this study should add confidence intervals, walk-forward splits, and a cost model before making stronger claims.

## What is not included yet

This experiment intentionally stops before capital allocation. The risk module is in development and is expected to address:

- volatility-aware exposure limits;
- drawdown-based de-risking and recovery rules;
- cross-asset concentration and correlation;
- transaction costs, slippage, and liquidity constraints;
- out-of-sample and walk-forward evaluation.

That separation is a design constraint, not a marketing claim. The current output answers **“is there directional information?”** The next layer must answer **“how much of it can be held, when, and at what cost?”**

## Closing perspective

The interesting result is not that every asset produces a spectacular number. It is that a multi-scale signal pipeline produces a measurable, heterogeneous cross-asset profile before position allocation is applied. That gives the research a useful next step: test whether a transparent risk layer can preserve the signal's information while making its path more robust.

The physics-inspired language is a way to organize that investigation: spectra for scale, phase for timing, geometry for state, and entropy for uncertainty. The standard of proof remains ordinary and demanding: clean data, honest splits, realistic costs, and results that survive outside the sample.

### Reproducibility note

The interactive table contains a distilled version of the supplied export. Proprietary implementation details, exact parameters, source-history boundaries, and position-allocation rules are intentionally omitted. The figures should be independently rechecked against the canonical backtest export before publication as a research result.