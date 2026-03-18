+++
title = "Projects"
slug = "projects"
date = "2026-03-18"
author = "Jeffee Hsiung"
+++

## 🧠 Featured Research: Spectral Market Analysis Framework

<div style="background-color: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
  <p style="font-size: 1.1rem; font-style: italic; margin: 0;">
    "Applying physics-inspired signal processing to uncover hidden structures in financial time series."
  </p>
</div>

### Project Overview

The **Spectral Market Analysis Framework** is an ongoing research initiative to apply advanced mathematical tools—Fourier analysis, Laplace transforms, wavelet decomposition, and information geometry—to market data. The goal is to move beyond traditional technical indicators and build models that capture the **intrinsic dynamics** of asset behavior.

<img src="/images/project_spectral_clustering.png" alt="Spectral clustering dendrogram" width="100%" style="border-radius: 4px; margin: 1.5rem 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

### 🔬 Key Research Directions

#### 1. **Spectral Clustering of Assets**
Using power spectral density (PSD) as a feature representation, I've shown that assets naturally cluster into groups that align with known sector/thematic relationships—**without any label supervision**. This validates that spectral signatures encode fundamental market dynamics.

- **Status**: ✅ Published (March 2026)
- **Key finding**: Crypto-exposed assets (COIN, MSTR) exhibit distinct high-frequency tails; mega-cap tech (META, MSFT, NVDA, TSLA) share common low-frequency cycles.
- **Next step**: Monitor cluster stability over time as a regime-shift indicator.

#### 2. **Multi-Scale Market Geometry**
Markets operate on multiple timescales simultaneously. Using analysis windows tuned to different horizons (e.g., ~3 weeks, ~1 week, intraday), I'm building a hierarchical model of market dynamics:

| Timescale | Window | Primary Dynamics | Application |
|-----------|--------|------------------|-------------|
| **Slow regime** | ~3 weeks | Regime curvature, macro cycles | Strategic positioning |
| **Medium tactical** | ~1 week | Sector rotation, momentum | Swing trading |
| **Fast execution** | Intraday | Local torsion, microstructure | Entry/exit timing |

- **Status**: 🔄 In progress
- **Method**: Combined spectral + geometric analysis (curvature/torsion from information geometry)

#### 3. **Physics-Based Feature Engineering**
Traditional features (RSI, MACD) are heuristics. I'm developing features grounded in **signal processing and differential geometry**:

- **Spectral entropy**: Measures market randomness
- **Dominant frequency tracking**: Identifies cycle length changes
- **Cartan torsion**: Captures local nonlinearity (skew) in price paths

- **Status**: 🧪 Early research
- **Goal**: Build features that are interpretable, robust, and directly linked to market physics

### 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| **Data** | Hourly OHLCV (2-year history, 15-symbol universe) |
| **Analysis** | Python, NumPy, SciPy, custom FFT/Laplace implementations |
| **Visualization** | Matplotlib, Seaborn |
| **Backtesting** | Custom event-driven engine |
| **Deployment** | GitHub Pages (this blog) |

### 📈 Current Status & Roadmap

```mermaid
gantt
    title Project Roadmap 2026
    dateFormat  YYYY-MM
    axisFormat %b
    
    section Completed
    Spectral Clustering (Mar 2026)        :done, 2026-03, 30d
    
    section In Progress
    Multi-Scale Analysis (Q2)              :active, 2026-04, 60d
    Feature Engineering Framework (Q2)     :active, 2026-04, 60d
    
    section Planned
    Strategy Prototyping (Q3)              :2026-07, 60d
    Paper/Documentation (Q4)               :2026-09, 90d