+++
draft = false
date = "2026-03-20"
title = "Markets Have Two Rhythms: What 14 Stocks Taught Me About Windows and Memory"
tags = [
    "signal processing",
    "quantitative finance",
    "Laplace transform",
    "market microstructure",
    "multi-scale"
]
+++

## Every spectral method faces the same question.

**How much history should you use?**

Too short, and noise eats your signal. Too long, and you're trading last year's market.

Most people pick a number and move on. I spent two years asking the data instead.

**Here’s what I found — and why it changed how I think about market structure.**

---

## The Setup

I applied a Laplace‑based system identification to 14 stocks (high‑growth, large‑cap, crypto‑exposed — the usual suspects) using hourly data from 2024 to 2026.

Two parameters matter most:

- **Window size** — how much past data you feed into each analysis.
- **Sample length** — the subsequence length used to estimate damping/growth modes.

To avoid cherry‑picking, I defined “best” as **maximum temporal stability** — consistency when evaluated at different start times. This filters out overfitting and exposes what’s actually robust.

The output included fit quality, damping ratio (ζ), dominant frequencies, and rolling diagnostics that track how these properties evolve over time.

---

## Finding 1: A Universal Sample Length

Across all 14 stocks, the optimal **sample length** converged to a narrow range — roughly **five trading days**.

This surprised me. Different stocks, different behaviors, yet the amount of history needed to reliably estimate damping/growth modes looks like a market‑wide constant.

In signal‑processing terms: this might be the inherent “memory” of market information. The time it takes for a shock to dissipate and the system to return to its underlying drift.

---

## Finding 2: Window Size Varies with Volatility

Here’s where it gets interesting.

The optimal **window size** varied dramatically across stocks — and correlated strongly with realized volatility:

- High‑volatility names (crypto‑exposed, TSLA) → windows under a day.
- Lower‑volatility names (AAPL) → windows of a couple of days.
- Some names (NVDA) sat in between, with windows of several days.

Makes sense. Fast movers need a shorter lens. Slower assets let you take a longer view without losing relevance.

But here’s the twist: **window size is personal. Sample length is universal.**

---

## What the Cross‑Stock Table Looks Like

The table below summarizes key characteristics. Values are presented as ranges — enough to see the pattern, not enough to copy the recipe.

| **Symbol** | **Optimal Window (relative)** | **Damping Character** | **Dominant Period** | **Rolling Behaviour** |
|--------|--------------------------|-------------------|-----------------|------------------|
| **AAPL**   | short                     | mixed (switches)  | short-cycle      | frequent regime changes |
| **BABA**   | very short                | underdamped       | short-cycle      | stable underdamped |
| **BIDU**   | short                     | balanced          | medium-cycle     | frequent switching |
| **BLTE**   | medium                    | overdamped        | medium-cycle     | stable overdamped |
| **COIN**   | long                      | underdamped       | long-cycle       | very stable |
| **FUTU**   | short                     | transition-heavy  | short-cycle      | most unstable |
| **GOOGL**  | short                     | overdamped        | short-cycle      | high switching |
| **META**   | medium                    | underdamped       | medium-cycle     | moderate switching |
| **MSFT**   | long                      | balanced          | long-cycle       | very stable |
| **MSTR**   | medium                    | mixed             | medium-cycle     | moderate switching |
| **NFLX**   | medium                    | overdamped        | medium-cycle     | stable |
| **NVDA**   | medium                    | underdamped       | medium-cycle     | moderate switching (nonstationary outlier) |
| **QCOM**   | long                      | underdamped       | long-cycle       | stable (limited sample) |
| **TSLA**   | very short                | underdamped       | short-cycle      | stable underdamped |

**Three things jump out:**

1. **Stable names** (COIN, MSFT, BABA, TSLA) show consistent damping regimes over time — you can trust their “personality.”
2. **Switching names** (AAPL, BIDU, FUTU, GOOGL) oscillate between momentum and mean‑reversion. They’re sensitive to market regime shifts.
3. **NVDA** is the outlier — its optimal window changes with context length. A fixed‑window approach would fail here.

---

## Rolling Diagnostics: Markets Are a State Machine

Static snapshots aren’t enough. The real structure lives in how damping, fit quality, and drift evolve over time.

I computed rolling estimates (window sliding daily) for each stock. This reveals:

- **Regime transitions** — how often a stock flips between underdamped (momentum‑like) and overdamped (mean‑reverting).
- **Fit quality** — periods where the model captures price dynamics well versus noisy periods.
- **Drift direction and persistence** — local trend sign and how long it holds.

Some stocks (FUTU) transition constantly — a clear signal to reduce size. Others (COIN, MSFT) are remarkably stable — suitable for longer‑horizon directional strategies.

The figure below shows reconstruction quality for three representative stocks (AAPL, NVDA, COIN) using their respective optimal windows. Blue = original price, orange = Laplace reconstruction. The fit adapts to each stock’s dynamics.

![Three reconstructions](/images/appl_nvda_coin_reconstrcuted.png)

---

## What This Means for Market Structure

**Markets aren’t random walks**. They’re layered:

- A **fast layer** (symbol‑specific window) captures short‑term oscillatory behavior — momentum or mean reversion depending on the damping regime.
- A **slow layer** (universal sample length) reflects a common, slowly varying background — risk appetite, liquidity cycles, macro narratives.

This aligns with my earlier work on spectral clustering: long‑term spectral features are shared across stocks, while high‑frequency tails separate them.

---

## From Physics to Portfolio Logic

If markets are layered, your approach should be too:

- **Slow layer** → regime bias (direction, risk‑on/off).
- **Fast layer** → entry timing, tactical adjustments.
- **Combine them with state‑dependent weights** — gate the fast signal by the slow layer’s confidence.

The rolling diagnostics give you a natural state machine:

- **Underdamped + positive drift + high fit** → momentum‑long setup.
- **Overdamped + drift near zero + high fit** → mean‑reversion setup around extremes.
- **Low fit or recent transition** → reduce size or stand aside.

This isn’t a static “one model fits all.” It’s adaptive — scaling exposure based on model clarity and regime stability.

---

## Next Steps

I’m extending this in three directions:

1. **Multi‑scale superposition** — explicitly combining fast and slow layers into a single forecast, with state‑dependent weights.
2. **State estimation** — moving beyond scalar damping ratios to a richer representation of market regimes
3. **Forward validation** — tracking directional alignment against realized returns after the forecast horizon. Closing the feedback loop.

---

## Final Thoughts

This exploration convinced me that **markets have intrinsic time scales** — but they’re not the same for every asset.

A successful quantitative approach must respect both the common market rhythm and the individual personality of each name. The way forward is layered, physics‑inspired models that combine spectral analysis with geometric state estimation.

**What’s your experience with adaptive windows?** Ever seen similar patterns in your own work?

I’m happy to discuss ideas — reach out on [LinkedIn](https://www.linkedin.com/in/jeffee-hsiung/) or [X](https://x.com/jeffeehs). Code and detailed results remain private while I continue validating, but the conversation is open.

*— Jeffee*