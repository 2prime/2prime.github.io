---
layout: modern
permalink: /research/
title: "Research"
nav_key: research
description: "Research by Yiping Lu on inference time scaling, scientific machine learning, optimization, mathematical reasoning, probability, and randomized numerical algorithms."
---

<header class="page-intro">
  <div class="shell page-intro-grid">
    <div>
      <span class="page-number">01 · Research</span>
      <h1>Structure makes scaling possible.</h1>
    </div>
    <p class="lede">
      I study when more data, model capacity, optimization effort, or inference computation can be converted into predictable improvements.
      The common language is mathematics: differential equations, stochastic processes, control, geometry, and randomization.
    </p>
  </div>
</header>

<section class="section">
  <div class="shell prose-grid">
    <aside class="prose-sticky">
      <div class="eyebrow">The scaling lens</div>
      <h2>One question, several computational worlds</h2>
    </aside>
    <div class="prose-main">
      <div class="principle">
        <h3>Why do some models scale while others stall?</h3>
        <p>
          Scaling fails when approximation, optimization, statistical uncertainty, or simulation error becomes the hidden bottleneck.
          I aim to identify that bottleneck mathematically and redesign the algorithm so that added resources improve the quantity we actually care about.
        </p>
      </div>
      <div class="principle">
        <h3>What should be preserved?</h3>
        <p>
          Physical laws, operator geometry, stochastic dynamics, and algebraic identities are not auxiliary information.
          They determine the representation, metric, and estimator. Preserving them often turns an unstable black box into a controllable computational method.
        </p>
      </div>
      <div class="principle">
        <h3>How should theory meet computation?</h3>
        <p>
          The objective is not a bound in isolation. A useful theory should identify the right algorithm, predict its scaling behavior,
          and survive high dimensional experiments. This loop connects my work in machine learning, numerical analysis, and probability.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section section-soft" id="inference">
  <div class="shell prose-grid">
    <aside class="prose-sticky">
      <div class="eyebrow">Direction 01</div>
      <h2>Inference Time Scaling</h2>
    </aside>
    <div class="prose-main">
      <div class="principle">
        <h3>Trading computation for reliability after training</h3>
        <p>
          Can a fixed generative model become more accurate simply by spending more computation at inference time?
          I approach this through sequential Monte Carlo, importance sampling, stochastic control, data assimilation, and reward twisting.
          The goal is to make additional computation reduce error in a measurable and theoretically controlled way.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2605.17850">URGE · Path space SMC</a>
          <a href="https://arxiv.org/abs/2605.18745">SURGE · Data assimilation</a>
          <a href="https://arxiv.org/abs/2602.01381">Approximate reward models</a>
        </div>
      </div>
      <div class="principle">
        <h3>Scientific inference as a second scaling axis</h3>
        <p>
          For PDE and inverse problems, a learned approximation can be calibrated through simulation without retraining.
          The resulting defect equation turns model error into a new computational target and gives an end to end relation between extra simulation and improved accuracy.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2504.16172">Simulation Calibrated Scientific ML</a>
          <a href="/files/scasml.pdf">Slides</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="sciml">
  <div class="shell prose-grid">
    <aside class="prose-sticky">
      <div class="eyebrow">Direction 02</div>
      <h2>Scientific Machine Learning</h2>
    </aside>
    <div class="prose-main">
      <div class="principle">
        <h3>Learning functions and operators with the right notion of error</h3>
        <p>
          Scientific learning problems are infinite dimensional. Their optimal algorithms depend on the geometry of function spaces,
          regularity, multilevel structure, and the downstream quantity of interest. My work develops minimax theory and algorithms for PDE solution learning and operator learning.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2110.06897">Learning elliptic PDEs</a>
          <a href="https://arxiv.org/abs/2209.14430">Multilevel operator learning</a>
          <a href="https://arxiv.org/abs/2205.07331">Sobolev acceleration</a>
        </div>
      </div>
      <div class="principle">
        <h3>Encoding physics into architectures</h3>
        <p>
          PDE Net learns differential operators as constrained convolution filters. Neural ODE viewpoints connect deep architectures to numerical discretization and optimal control.
          These connections provide interpretable representations and expose the computational structure needed for analysis.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/1710.09668">PDE Net</a>
          <a href="https://arxiv.org/abs/1710.10121">Neural differential equations</a>
          <a href="https://arxiv.org/abs/2003.05508">Deep ResNet mean field analysis</a>
        </div>
      </div>
      <div class="principle">
        <h3>Uncertainty quantification and debiasing</h3>
        <p>
          Learned surrogates are useful only when their error can be detected and corrected. I combine approximation with Monte Carlo,
          control variates, and orthogonal bootstrap ideas to obtain statistically efficient scientific estimators.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2305.16527">Regression adjusted control variates</a>
          <a href="/files/debiasandprecondition.pdf">Debiasing and preconditioning</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section-soft" id="optimization">
  <div class="shell prose-grid">
    <aside class="prose-sticky">
      <div class="eyebrow">Direction 03</div>
      <h2>Optimization and Reliability</h2>
    </aside>
    <div class="prose-main">
      <div class="principle">
        <h3>Geometry that survives width and depth</h3>
        <p>
          Standard Euclidean smoothness often grows with model size and cannot explain learning rate transfer.
          I study steepest descent under matrix operator norms and depth aware function space metrics to design optimizers with stable scaling laws.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2603.09952">Matrix operator geometry</a>
          <a href="/files/MOGA.pdf">MOGA slides</a>
          <a href="/files/row_norm_pku.pdf">Dimension dependence of neural optimizers</a>
        </div>
      </div>
      <div class="principle">
        <h3>Reliable randomized numerical algorithms</h3>
        <p>
          Randomization accelerates matrix computation, but accuracy alone is not enough. My work asks when randomized solvers are backward stable,
          how sketching interacts with preconditioning, and how spectral structure controls convergence.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2502.07993">Sketch and precondition</a>
          <a href="/files/SIRR.pdf">Randomized iterative refinement</a>
          <a href="/files/sketchandprecondition.pdf">Slides</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="reasoning">
  <div class="shell prose-grid">
    <aside class="prose-sticky">
      <div class="eyebrow">Direction 04</div>
      <h2>Agentic Mathematical Reasoning</h2>
    </aside>
    <div class="prose-main">
      <div class="principle">
        <h3>Making mathematical structure searchable</h3>
        <p>
          AI systems are most useful for mathematics when the problem is represented in a form that supports exact search, verification,
          and compositional reuse. I study how apparently analytic or probabilistic arguments can be converted into algebraic objects and correction circuits.
        </p>
      </div>
      <div class="principle">
        <h3>AI assisted discovery with proof responsibility</h3>
        <p>
          The signed basic adjoint relationship problem illustrates the workflow: use AI to explore transformations and counterexamples,
          isolate an invariant algebraic mechanism, and then turn it into a human verifiable theorem with a precisely stated boundary of validity.
        </p>
        <div class="principle-links">
          <a href="https://arxiv.org/abs/2607.03639">Signed BAR paper</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section-soft">
  <div class="shell">
    <div class="section-head">
      <div>
        <div class="eyebrow">Foundations</div>
        <h2>Mathematics beneath the applications</h2>
      </div>
      <p>The applications vary, but the toolkit is intentionally coherent.</p>
    </div>
    <div class="fact-grid">
      <article class="fact-card">
        <div class="project-meta">Probability</div>
        <h3>Stochastic processes and sampling</h3>
        <p>Reflected Brownian motion, Markov chains, rare events, Monte Carlo, and high dimensional sampling.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Analysis</div>
        <h3>PDEs and function spaces</h3>
        <p>Sobolev and reproducing kernel spaces, operator approximation, multilevel structure, and regularity.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Computation</div>
        <h3>Optimization and linear algebra</h3>
        <p>Geometric optimization, eigenvalue methods, randomized solvers, preconditioning, and numerical stability.</p>
      </article>
    </div>
  </div>
</section>
