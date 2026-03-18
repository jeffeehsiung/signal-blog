+++
draft = false
date = "2026-03-18"
title = 'What Fourier Reveals About Markets: Unsupervised Clustering of 15 Stocks by Spectral Signature'
tags = [
    "hugo",
    "markdown",
    "spectral",
    "cluster",
]
+++

## Empirical Validation — Spectral Clustering (March 2026)

**Purpose:** Validate a physics‑inspired spectral approach against real market data across a diverse set of 14 symbols.

### Spectral Cluster Analysis

![PSD Hierarchical Clustering — 14-Symbol Universe](/images/assets_psd_clusters_correlation.png)

*Figure 1: Hierarchical clustering (correlation distance) applied to the full power spectral densities of 14 stocks. Seven stable clusters emerge, recovering known sector/thematic groupings **without using any sector labels**. For example, crypto‑exposed assets (COIN, MSTR) show distinct high‑frequency tails, while mega‑cap tech (META, MSFT, NVDA, TSLA) share a common low‑frequency dominant period near 10 trading days.*

A hierarchical clustering (correlation distance) of the full‑series PSDs produced seven distinct groups. The table below summarises each cluster and its general spectral character – exact period lists are omitted as they are part of ongoing research.

| Cluster | Members | Spectral Character | Market Interpretation |
|---------|---------|-------------------|----------------------|
| **1** | COIN, MSTR | Strong high‑frequency content | Crypto‑exposed: elevated intraday volatility |
| **2** | FUTU, NFLX | Mid‑frequency peaks | Momentum growth: medium‑cycle dominance |
| **3** | META, MSFT, NVDA, TSLA | Concentrated low‑frequency power | Mega‑cap tech: sector co‑movement |
| **4** | AAPL | Broad spectrum | Liquidity giant: market‑wide signal |
| **5** | BABA, BIDU, GOOGL | Similar dominant periods | Chinese ADRs + Google: correlated regime |
| **6** | QCOM | Distinct spectrum | Outlier: idiosyncratic dynamics |
| **7** | BLTE | Distinct spectrum | Outlier: idiosyncratic dynamics |

All clusters share a common set of long‑term base periods (the exact values are under active study), confirming that the chosen thermodynamic windows correctly capture dominant market cycles. Differences emerge at higher frequencies: crypto‑exposed and momentum‑growth assets exhibit richer high‑frequency content, consistent with higher intraday volatility. AAPL forms its own cluster – its spectrum lacks the very short periods seen in other groups, possibly reflecting its unique liquidity and stability. Clusters 6 and 7 are outliers with exceptionally short periods, suggesting they behave differently (sector‑specific or data‑quality issues).

![PSD overlay for the 14‑symbol universe, 512‑hour analysis window](/images/assets_psd_overlay_window_512.png)

*Figure 2: PSD overlay using a 512‑hour analysis window. A shared pair of dominant base periods appears near 15.75 and 11.24 trading days (approximately 3‑week and 2‑week cycles) across most assets. This indicates a robust medium‑horizon spectral structure and suggests that the default thermodynamic windows should prioritize this band.*

### Interpretation

- All clusters share the same long‑term base periods, validating that the chosen thermodynamic windows correctly capture dominant market cycles.
- The full two‑year spectrum reveals that almost all assets present a ~3‑week and ~2‑week base cycle, indicating that a window length around 2–3 weeks may be more appropriate than a longer one for certain analyses.
- Differences at higher frequencies (shorter periods) align with known asset characteristics: crypto‑exposed and momentum‑growth assets show richer high‑frequency content (consistent with higher intraday volatility), while AAPL’s spectrum is notably clean at short periods.

### Implications for Future Design

- Cluster membership can serve as a feature in strategy selection (e.g., treat crypto‑exposed assets differently from mega‑cap tech).
- Monitoring cluster stability over time may signal regime shifts: if an asset changes groups, it could indicate a change in its underlying market dynamics.
- Assets in the same spectral cluster should exhibit similar geometric properties (e.g., curvature and torsion) – this provides a cross‑check for the manifold geometry underlying the physics model.

---

### Key Findings

**Finding 1: Clusters align with known sector/thematic groupings**  
PSD‑based clustering recovers fundamental market structure without using any sector labels. This confirms that the power spectral density encodes asset‑specific market dynamics.

**Finding 2: Dominant periods match intuitive cycle lengths**  
The observed dominant periods (e.g., ~10‑day, ~5‑day, ~2.5‑day cycles) are consistent with natural trading rhythms. This provides empirical support for the window lengths used in the thermodynamic layers of the physics model.

**Finding 3: Crypto‑related assets show distinct high‑frequency tails**  
COIN and MSTR exhibit elevated power in the high‑frequency range, consistent with higher intraday volatility. This supports using a measure of local nonlinearity (Cartan torsion) as a distinguishing feature between crypto‑exposed and traditional equities.

**Finding 4: A universal decoherence gap appears near 7–9 hours**  
Across most assets, spectral power drops to near‑noise levels in the 7–9 h band. This suggests a destructive interference zone in the underlying state space – signals in this band have minimal predictive value and can be filtered out.

**Finding 5: Two‑timescale market geometry**  
Analysis with different window lengths reveals a clear separation between a slow manifold (regime curvature, periods of several days) and a fast manifold (local torsion, intra‑day to sub‑day cycles). This supports a hierarchical control architecture with separate feedback loops for regime identification and tactical execution.

---

### What’s Next

This is the first in a series of posts exploring the application of physics‑inspired signal processing to financial markets. Future articles will delve into:

- Using other spectral techniques to extract damping/growth modes from price series & multi‑scale decomposition.
- How these spectral features can inform strategy design and risk management.

All code and data used in this research are proprietary and not publicly available, but the methodology is described in sufficient detail to allow replication by those with access to similar data. Feedback and discussion are welcome – you can reach me on [LinkedIn](https://www.linkedin.com/in/jeffee-hsiung/) / [X](https://x.com/jeffeehs).

---

*Last validated: March 2026*  
*Universe: 14 symbols, hourly OHLCV data (two year available history)*  