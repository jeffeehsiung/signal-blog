+++
title = "SPECTRUM — Signal dashboard"
description = "Live diagnostics from the SPECTRUM directional signal engine."
slug = "spectrum"
disableComments = true
+++

<div class="profile-intro">
  <p class="module-code">LIVE / DASHBOARD</p>
  <h2>SPECTRUM signal diagnostics.</h2>
  <p class="profile-lede">Cross-asset backtest metrics and the live trading snapshot. Regenerated whenever the research pipeline runs.</p>
</div>

{{ partial "hub/live-snapshot.html" . }}

> **Scope.** These figures describe signal-level outcomes from a directional signal engine running with the risk layer engaged. They remain gross of full execution costs and slippage. Live figures describe realized results from a small, live account and are not a track record or investment recommendation.

## Backtest performance

{{< performance-explorer data="system-performance" >}}

## Signal charts

{{< asset-chart >}}