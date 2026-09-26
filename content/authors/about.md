+++
title = "About"
date = "2026-08-29"
description = "Building systems that turn noisy signals into decisions."
url = "/about/"
disableComments = true
kind = "profile"
accent = "cyan"
+++

<div class="profile-intro">
  <p class="module-code">PROFILE / 2026.08</p>
  <h2>Building systems that turn noisy signals into decisions.</h2>
  <p class="profile-lede">I began with electronics and signal processing, moved through radar imaging and industrial AI, and now apply the same physics-first discipline to market research.</p>
</div>

{{/* Signal count is read from the generated exporter output, so it stays
     in sync with whatever universe the pipeline actually covers. */}}
{{ $perf := index site.Data "system-performance" }}
{{ $n_signals := 0 }}
{{ with $perf }}{{ $n_signals = len .assets }}{{ end }}

<div class="profile-metrics" aria-label="Profile highlights">
  <div><strong>5+</strong><span>years building AI systems</span></div>
  <div><strong>3</strong><span>domains: sensing, manufacturing, markets</span></div>
  <div><strong>{{ $n_signals }}</strong><span>US equity signals in current study</span></div>
</div>

<div class="profile-foundations" aria-label="Technical foundations">
  <span class="foundations-label">R&amp;D · Signal Processing · Systems</span>
  <div class="foundations-logos">
    {{< org-logo src="images/logos/foxconn.png" alt="Foxconn" >}}
    {{< org-logo src="images/logos/kuleuven.png" alt="KU Leuven" >}}
    {{< org-logo src="images/logos/imec.png" alt="IMEC" >}}
    {{< org-logo src="images/logos/amat.png" alt="Applied Materials" >}}
  </div>
</div>

## The through-line

<div class="profile-timeline" aria-label="Career timeline">
  <div class="profile-step">
    <span class="profile-year">FOXCONN<br>2017-2020</span>
    <div><h3>Failure analysis at prototype-to-production scale</h3><p>Learned to trace complex failures steming from prototype to production; Driven from their failure symptoms to their systems-level causes.</p><em class="profile-honor">Golden Engineer Award · 2020</em></div>
  </div>
  <div class="profile-step">
    <span class="profile-year">KU LEUVEN<br>2020–2024</span>
    <div><h3>Electronics & ICT engineering</h3><p>Built the mathematical, physical, and deep-learning foundation behind my work.</p><em class="profile-honor">BSc + MSc · Cum Laude</em></div>
  </div>
  <div class="profile-step">
    <span class="profile-year">IMEC<br>2023–2024</span>
    <div><h3>Radar signals + point-cloud deep learning</h3><p>Combined interferometric ISAR, tracking, and Point Cloud Transformers for few-shot person identification.</p><em class="profile-honor">First author · EUSIPCO 2026 · Bruges</em></div>
  </div>
  <div class="profile-step">
    <span class="profile-year">AMAT + ROBOEYE.AI<br>2024–2025</span>
    <div><h3>Computer vision across two team scales</h3><p>Applied Materials: industrial AI in a large organization. Roboeye.ai: fast, hands-on delivery in a small startup. Both made the interaction between signals, vision, and team design tangible.</p><em class="profile-honor">No formal award · durable operating insight</em></div>
  </div>
  <div class="profile-step profile-step-current">
    <span class="profile-year">SPECTRUM<br>2026–NOW</span>
    <div><h3>Market state estimation</h3><p>A signal-processing framework for testing structure before allocating capital.</p><em class="profile-honor">Independent R&amp;D · live trading</em></div>
  </div>
</div>

## A transferable operating model

<div class="profile-system" aria-label="Operating model from observation to decision">
  <div><span>01</span><strong>Observe</strong><small>measure the system</small></div>
  <i aria-hidden="true">→</i>
  <div><span>02</span><strong>Model</strong><small>represent hidden state</small></div>
  <i aria-hidden="true">→</i>
  <div><span>03</span><strong>Stress-test</strong><small>find failure modes</small></div>
  <i aria-hidden="true">→</i>
  <div><span>04</span><strong>Decide</strong><small>act with constraints</small></div>
</div>

The setting changes, but the work stays recognizable: extract structure from imperfect observations, make uncertainty visible, and investigate failures at the level where they begin.

## Current work

SPECTRUM is my independent quantitative research framework. It combines multi-scale signal decomposition, latent state representation, and online parameter identification to study directional information in US equities. The methodology, backtest diagnostics, and live snapshot are documented separately.

<div class="profile-close">
  <p class="module-code">NEXT / ORGANIZATION</p>
  <strong>Keep the technical depth. Add the people, capital, and execution around it.</strong>
</div>

### Supporting material

- [Research note: Physics-Inspired Alpha]({{< ref "posts/physics-inspired-alpha" >}})
- [Live signal dashboard]({{< ref "spectrum" >}})
- [Radar paper and poster](https://jeffeehsiung.github.io/few_shot_gait_based_person_identification_from_inisar_point_clouds_with_pretrained_meta_learning/)
- [GitHub](https://github.com/jeffeehsiung)
- [LinkedIn](https://www.linkedin.com/in/jeffee-hsiung/)