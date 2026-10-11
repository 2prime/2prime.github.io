Ask for “a book and a laptop,” and the model draws a laptop but forgets the book. Try again: the book appears, but the laptop disappears. **If the model sometimes gets it right, can extra computation during generation make it succeed more often?**

The simplest strategy is to generate several images and pick one. A more active strategy is to judge promising directions before an image is finished, then spend more computation there.

Those intermediate judgments may be wrong. And repeated selection can turn many generation paths into descendants of the same ancestor. We want to use computation effectively while keeping inaccurate judgments from distorting the final distribution.

This blog follows one thread: **URGE corrects guidance using path information; independent rejection avoids shared ancestry; Stein Guidance makes both guidance and correction depend only on function values**. Here, “without gradients” means without differentiating the value function. The base denoising model still runs as usual. [[1]](#ref_urge_en) [[2]](#ref_stein_en)

## 1. What should extra computation achieve?

Think of a diffusion model as a random drawing process: start from noise, denoise gradually, and finish with an image. Time runs in the generation direction here: $$0$$ is the start and $$T$$ is completion. The trained model defines a base distribution $$p_{\mathrm{base}}$$.

Assign a score $$r(x)$$ to the finished image and convert it into a positive preference weight $$\phi(x)=e^{\beta r(x)}$$. Our target distribution is

$$
\pi(x)=\frac{p_{\mathrm{base}}(x)\phi(x)}
{\mathbb E_{p_{\mathrm{base}}}[\phi(X)]}.
$$

This retains the model’s original preferences while making highly rewarded outcomes relatively more likely. The parameter $$\beta$$ controls the strength of that preference. [[1, §2.1]](#ref_urge_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/target_en.svg"><img src="/images/blog/diffusion_urge_stein/target_en.svg" alt="The base probabilities of a book alone and a book with a laptop are 80% and 20%. Multiplying by preference weights 1 and 4 gives target probabilities of 50% each." width="960" height="650"></a>
  <figcaption>Figure 1 · Multiply by preference, then normalize. These probabilities and weights are teaching examples, not experimental results. Click any figure to enlarge it.</figcaption>
</figure>

This sampling objective is related to finding the highest scoring image, but they are different objectives. Generating independent images and keeping the best generally does not sample from $$\pi$$. All claims about correct sampling below refer to this specific distributional target.

There are also three distinct ways to increase computation: **more denoising steps $$n$$, more generation paths $$N$$, or more candidates $$K$$ at each step**. These increase numerical depth, statistical width, and local queries, respectively. They should not all be called a “sample count.” [[2, §1]](#ref_stein_en)

## 2. To choose the next step, ask about its future

A partially generated image is still blurry. Asking whether it looks like a book now may tell us little about the finished result. A better question is: **if generation continues from this state, what is the average final preference weight?**

$$
H_t^\star(x)=\mathbb E[\phi(X_T)\mid X_t=x].
$$

This value function accounts for possible futures. If we knew it exactly, we could sample the next step in proportion to “base transition probability × next step’s value.” In continuous time, the corresponding guidance drift is $$\sigma\sigma^\top\nabla\log H_t^\star$$, the Doob transform. [[1, §1]](#ref_urge_en) [[2, §3]](#ref_stein_en)

The difficulty is that $$H^\star$$ itself contains a high dimensional integral. In practice, we usually have only an approximate value $$H$$, for example by predicting the final image and scoring that prediction.

This separates two jobs: **approximate values provide directions; correction compensates for the probability bias caused by wrong directions**. Better judgments usually make correction easier, but correctness cannot rely on every judgment being accurate.

## 3. URGE: keep the accounts for the entire path

Guidance changes how the model moves. Many paths can reach the same endpoint, so calculating the guided endpoint density directly is difficult. URGE instead **retains the actual path and computes a probability ratio for that path**. [[1, §2.3]](#ref_urge_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/path_weight_en.svg"><img src="/images/blog/diffusion_urge_stein/path_weight_en.svg" alt="Two paths reach the same endpoint but can have different ratios between their base and proposal transition probabilities." width="960" height="660" loading="lazy"></a>
  <figcaption>Figure 2 · The same endpoint can have different path weights. The curves are schematic; vertical position does not represent image quality.</figcaption>
</figure>

In discrete time, let $$P_k$$ be the base transition density and $$Q_k$$ the actual proposal density. Assume the same initial distribution and the support conditions needed for the probability ratio. For a generated path, record

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{P_k(X_k,X_{k+1})}{Q_k(X_k,X_{k+1})}.
$$

**Paths drawn too often under guidance should be downweighted; paths drawn too rarely should be upweighted**. The terminal preference specifies what we want, and the probability ratio compensates for how we actually sample.

The continuous time counterpart is Girsanov’s change of measure. URGE uses the simulated drift and random increments to compute path weights, then reweights and resamples during generation. Conditionally averaging short path weights given their endpoint, followed by a short time limit, also connects them to particle level correction potentials. [[1, §2.3, Theorem 3.3]](#ref_urge_en)

URGE’s path weights avoid additional Hessian, score, or PDE residual calculations. If the guidance itself is written as $$\nabla G$$, however, constructing that drift still requires this information. **Correction without extra higher derivatives and guidance using only function values are two different achievements**. Stein Guidance connects them. Finite particle estimates still have sampling error, and consistency statements require the appropriate limits. [[1, Algorithm 1, Theorem 3.1]](#ref_urge_en)

## 4. Many paths may already belong to one family

SMC repeatedly copies particles with large weights and removes those with small weights. This directs computation toward promising regions, but copying also means that **different particles may share increasingly long generation histories**.

Imagine four people solving a problem. Every so often, each chooses a draft according to its score and continues from it. After several rounds, there are still four answers on the table, yet all may descend from one early draft. Later exploration can differ, but the lost early diversity does not automatically return.

The usual ESS statistic measures how uniform the current weights are; it does not remember ancestry. Equal weights and $$\mathrm{ESS}=N$$ therefore do not establish independence of the $$N$$ particles. Can we increase denoising depth without also increasing this dependence? [[2, §1, Appendix E]](#ref_stein_en)

<details class="blog-details" markdown="1">
<summary>A rigorous example: resampling at every step can accumulate error with depth</summary>

Reference [[2]](#ref_stein_en) constructs a Brownian example with a fixed terminal target and local Bellman error $$O(1/n)$$. With full multinomial resampling at every numerical step, the distribution of one final particle satisfies

$$
\left\|\nu_{n,N}^{\mathrm{SMC}}-\pi\right\|_{\mathrm{TV}}
\asymp\frac nN,\qquad 2\le n\le N.
$$

Total variation measures the largest difference between the probabilities that two distributions assign to the same event. This result concerns the constructed model and full resampling at every step. It is not a lower bound for every SMC method, and does not rule out the value of sparse or adaptive resampling. [[2, Theorem 1]](#ref_stein_en)

</details>

<h2 id="sequential-rejection-en">5. Why correct paths that never copy each other?</h2>

### Reject this step, keep your own draft

A natural alternative is **sequential rejection sampling**: propose a move from the current state, then accept or reject according to the candidate’s value. On rejection, retain your own prefix and retry only this step, instead of copying another path’s history.

Given a known valid bound $$0<H_{k+1}(y)\le M_k(x)$$, draw $$Y$$ from the base transition $$P_k(x,\cdot)$$ and accept with probability $$H_{k+1}(Y)/M_k(x)$$. Repeat until accepted, then advance. **Independent repetitions of this complete procedure have no shared ancestry across paths**. This is the mechanism on the right below. [[3, p. 57]](#ref_slides_en)

<figure class="blog-figure">
  <div style="display:flex;flex-wrap:wrap;gap:0.8rem;">
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="Enlarge: SMC copies parent particles"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" alt="Left panel from the slides: SMC copies parent particles across paths, so descendants share history." width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;"></a>
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="Enlarge: retry only your own next step"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" alt="Right panel: rejection retains the current prefix and retries only the current step." width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;transform:translateX(-50%);"></a>
  </div>
  <figcaption>Figure 3 · Original vector diagram from page 57 of <em>Diffusion Overview</em>, with English labels. Nodes and edges are retained, and the panels stack on narrow screens. The left borrows another path’s prefix; the right retries only its own next step. Independently repeating the right procedure avoids shared ancestry across paths. Steps within one path are still dependent.</figcaption>
</figure>

This also differs from the outer MH correction introduced later. Here, rejection concerns one substep; outer MH accepts or retains an entire path.

### Independent paths can still follow inaccurate directions

One advantage of SMC is that it **keeps a running account of weights**. For a fixed initial state and terminal value $$H_n=\phi$$, use incremental weights $$H_{k+1}(X_{k+1})/H_k(X_k)$$ under the base transitions. Then

$$
\frac{H_1(X_1)}{H_0(X_0)}
\frac{H_2(X_2)}{H_1(X_1)}\cdots
\frac{\phi(X_n)}{H_{n-1}(X_{n-1})}
=\frac{\phi(X_n)}{H_0(X_0)}.
$$

**Intermediate judgments are provisional entries: add one now, subtract it next time**. They need not equal the true future value for the correct unnormalized target to depend only on the terminal preference. This is an identity for the weights, not a claim that finite particle SMC is exact. [[2, Appendix E.2]](#ref_stein_en)

Local rejection alone behaves differently. Each step normalizes candidate values into probabilities. Its denominator is the true average next value from the current state, which need not equal the current approximate prediction. **Adjacent value terms can still cancel, but the ratios left by disagreement between prediction and actual average usually do not**. [[2, §3, equations (10)–(11)]](#ref_stein_en) [[3, p. 58]](#ref_slides_en)

A two step teaching example makes this clear. The base model chooses routes A and B with equal probability. Each route then reaches its own distinct endpoint, and both terminal preferences equal 1, so the target should assign each route half the mass. But an intermediate predictor gives A a value of 9 and B a value of 1:

| Disjoint routes | Target probability | Intermediate prediction | Probability after local rejection |
| :--- | :--- | :--- | :--- |
| A | 50% | 9 | 90% |
| B | 50% | 1 | 10% |

At the endpoint, both rewards are correct but equal to 1, so the last step does not distinguish the routes. **The extra chances given to A earlier are not automatically refunded by accurate terminal scores**.

Correction multiplies A’s relative weight by $$1/9$$ and B’s by $$1$$. Both weighted masses become $$0.1$$, giving $$50\%$$ each after normalization. Alternatively, accept A at the end with probability $$1/9$$ and always accept B. This restores the probabilities without copying another path’s prefix. These numbers illustrate the mechanism; they are not experimental results.

<aside class="blog-key-insight" aria-labelledby="independence-not-correctness-en" markdown="1">
<h4 id="independence-not-correctness-en">Independence concerns ancestry; correction concerns the target distribution</h4>

Avoiding copies of other paths prevents shared ancestry. Approximate values can still distort selection probabilities. **What needs to be restored is the account left by local normalization**.

</aside>

<details class="blog-details" markdown="1">
<summary>The formula: why locally exact sampling can remain globally biased</summary>

Write

$$
G_k(x)=(P_kH_{k+1})(x),\qquad
Q_k^H(x,dy)=\frac{P_k(x,dy)H_{k+1}(y)}{G_k(x)}.
$$

With a valid envelope, local rejection samples exactly from $$Q_k^H$$. Relative to the final target $$\Pi_n\propto\phi(X_n)P_n$$, however, the complete path still has weight

$$
R_H=\phi(X_n)\frac{dP_n}{dQ^H}(X_{0:n})
=H_0(x_0)\prod_{k=0}^{n-1}\frac{G_k(X_k)}{H_k(X_k)}.
$$

Exact Doob values satisfy $$G_k=H_k$$, making the weight constant, so local sampling suffices. Approximate values generally leave a product that depends on the path. If that product happens to be constant, correction is also unnecessary; otherwise it is the missing complete path correction. [[2, §3, Appendix C.3]](#ref_stein_en)

In the two step example, $$G_0=5$$ and $$G_1(A)=G_1(B)=1$$. The exact path weights are therefore $$5/9$$ and $$5$$. Removing their shared factor of 5 gives the relative weights $$1/9$$ and $$1$$ used above.

The difficulty is that $$G_k$$ is itself an integral and is usually unavailable exactly. A finite candidate pool must provide computable correction information as well as a next step. For a random initial state, the initial distribution factor must also be included; the constant factor argument for a fixed start cannot simply be reused. [[2, Proposition 22]](#ref_stein_en)

</details>

### Another cost of explicit guidance: where do derivatives enter?

Another route changes the drift directly to $$b+a\nabla\log H$$, with $$a=\sigma\sigma^\top$$, and then corrects the complete path. **Guidance needs first derivatives. Computing correction through a Bellman or PDE residual also introduces time derivatives and second spatial derivatives**. [[3, p. 59]](#ref_slides_en)

Why another derivative? To compare the prediction now with the average prediction after a random step, we need to account for how noise interacts with curvature. In one dimension, temporarily ignoring time dependence and drift, smoothness gives

$$
\mathbb E[H(x+\sqrt h Z)]
=H(x)+\frac h2 H''(x)+o(h),\qquad Z\sim N(0,1).
$$

**Both a hilltop and a valley can have zero slope. A random step to either side decreases the average value at the hilltop and increases it in the valley**. The gradient alone cannot distinguish these situations; the second derivative describes the curvature. The full residual also includes time evolution and the base drift.

<details class="blog-details" markdown="1">
<summary>The full residual, and an alternative that avoids Hessians</summary>

For a fixed initial state, $$H_T=\phi$$, sufficiently smooth $$H>0$$, and a valid change of measure, define the base generator

$$
\mathcal L_t f=b_t\cdot\nabla f+\tfrac12\operatorname{tr}(a_t\nabla^2f).
$$

For continuous time guidance $$a_t\nabla\log H_t$$, Itô’s formula and Girsanov’s change of measure give the path correction, in our notation,

$$
R_H=H_0(x_0)\exp\!\left(\int_0^T\mathcal E_t(X_t)\,dt\right),
\qquad
\mathcal E_t=\frac{(\partial_t+\mathcal L_t)H_t}{H_t}.
$$

Evaluating this residual directly requires $$\partial_tH$$, $$\nabla H$$, and $$\nabla^2H$$. It corresponds to the discrete path contribution $$\log(G_k/H_k)$$. [[2, §4, equation (11)]](#ref_stein_en) [[3, pp. 58–59]](#ref_slides_en)

**Higher derivatives are not required by every rejection correction**. URGE’s Girsanov path expression uses the actual drift and noise to avoid explicit Hessians and PDE residuals. If the drift itself uses $$\nabla\log H$$, however, value gradients are still needed. These are different computational routes to the required correction information. [[1, §2.2–2.4]](#ref_urge_en)

</details>

Our goal is now clear: **avoid copying across paths, allow imperfect values, and use only function values for both guidance and correction**. Start with the smallest possible operation: try one candidate on each side.

## 6. Warm up: two symmetric candidates are a finite difference

First reduce image space to one dimension. The base model supplies a tentative next position $$\mu$$, and we try a small displacement in each direction:

$$
Y^+=\mu+\delta,\qquad Y^-=\mu-\delta,\qquad \delta>0.
$$

If the right candidate has value 11 and the left has value 9, sampling in proportion to value selects the right with probability 55% and the left with probability 45%. For $$\delta=0.1$$, the average displacement is $$0.55\times0.1+0.45\times(-0.1)=0.01$$.

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/two_queries_en.svg"><img src="/images/blog/diffusion_urge_stein/two_queries_en.svg" alt="Candidates at 0.1 to either side have values 9 and 11. Their central difference slope is 10. Selection probabilities of 45% and 55% produce an average rightward displacement of 0.01." width="960" height="820" loading="lazy"></a>
  <figcaption>Figure 4 · A finite difference becomes a selection probability. These are teaching values. Each draw selects just one candidate; 0.01 is the average displacement.</figcaption>
</figure>

Where is the finite difference? Over a distance of $$0.2$$, value increases by $$2$$, so the slope is $$10$$. Write $$H^\pm=H(\mu\pm\delta)$$. The exact mean displacement is

$$
\mathbb E[Y^J-\mu\mid\delta]
=\delta\frac{H^+-H^-}{H^++H^-}
=\delta^2\frac{(H^+-H^-)/(2\delta)}{(H^++H^-)/2}.
$$

In words: **mean displacement = squared step size × central difference slope ÷ average value**. Here, that is $$0.1^2\times10/10=0.01$$.

For nearby candidates and smooth $$H$$, this approaches $$\delta^2H'(\mu)/H(\mu)=\delta^2(\log H)'(\mu)$$. The logarithm $$\log H$$ appears because selection depends on relative values: multiplying both 11 and 9 by 100 leaves the probabilities unchanged. [[2, §3.1.1]](#ref_stein_en)

<details class="blog-details" markdown="1">
<summary>Why does this recover the Doob guidance drift in high dimensions?</summary>

Use a Gaussian direction: $$\mu=x+hb(x)$$, $$\delta=\sqrt h\,\sigma Z$$, $$Z\sim N(0,I)$$. Given the direction, the leading mean displacement is $$\delta\delta^\top\nabla\log H(\mu)$$. Using $$\mathbb E[ZZ^\top]=I$$ then gives

$$
\mathbb E[Y^J\mid x]
=x+h[b(x)+\sigma\sigma^\top\nabla\log H(x)]+o(h).
$$

Both the candidate displacement and the change in selection probability have order $$\sqrt h$$; multiplying them gives an order $$h$$ guidance drift. This limit needs appropriate smoothness and integrability. It describes the leading mean drift, not an exact finite step transition law. [[2, equation (5), Appendix B.2.1]](#ref_stein_en)

</details>

Implementation has just three steps: **construct candidates, query values, and select one proportionally**. Gradients explain the mechanism but need not be computed by backpropagation.

## 7. Stein’s identity: from two points to K parallel candidates

Two points reveal directional information. Can we query $$K$$ directions simultaneously using only function values? Gaussian Stein’s identity provides the connection:

$$
\mathbb E[Zf(Z)]=\mathbb E[\nabla f(Z)],\qquad Z\sim N(0,I).
$$

The left side uses values; the right side is an average gradient. Intuitively, **the average of “random direction × value” points toward directions that tend to receive higher values**. For $$Y=\mu+\sqrt h\,\sigma Z$$,

$$
\mathbb E[ZH(Y)]=\sqrt h\,\sigma^\top\mathbb E[\nabla H(Y)].
$$

This holds under the appropriate Gaussian integration by parts conditions. [[2, §3.1.2, Proposition 6]](#ref_stein_en)

<aside class="blog-key-insight" aria-labelledby="stein-rejection-guidance-en" markdown="1">
<h4 id="stein-rejection-guidance-en">Stein’s identity connects rejection using values to gradient guidance</h4>

**Accepting candidates according to their values can produce the corresponding gradient guidance in mean drift without computing value gradients**.

Start from the base Gaussian candidate $$Y=\mu+\sqrt h\,\sigma Z$$. With a known bound $$0<H\le M$$, accept with probability $$H(Y)/M$$ and redraw on rejection. The accepted law is the normalized product of the base transition and the value.

Let $$G_h(\mu)=\mathbb E[H(\mu+\sqrt h\,\sigma Z)]$$. Stein’s identity gives

$$
\mathbb E[Y\mid\mathrm{accept}]
=\mu+h\sigma\sigma^\top\nabla_\mu\log G_h(\mu).
$$

**The left side selects using values; the right side reveals gradient guidance**. The exact relation uses the Gaussian smoothed value $$G_h$$. For small steps, its logarithmic gradient approaches $$\nabla\log H$$.

Here $$\sigma$$ is frozen, and integration by parts and interchange of differentiation and expectation must be valid. The equivalence concerns the mean drift; the accepted law need not be a simply shifted Gaussian. Selecting from finitely many ($$K$$) candidates also leaves normalization error. [[2, equation (23)]](#ref_stein_en)

</aside>

### Preserve symmetry by making the directions sum to zero

The two candidate method has $$Z_1+Z_2=0$$. For $$K\ge2$$, draw independent standard Gaussians $$G_i$$, subtract their average, and restore each direction’s variance:

$$
\bar G=\frac1K\sum_iG_i,\qquad
Z_i=\sqrt{\frac K{K-1}}(G_i-\bar G),\qquad
\sum_iZ_i=0.
$$

Each $$Z_i$$ remains marginally standard Gaussian, while directions in the pool are dependent. Construct candidates, **query all values in parallel, then randomly select one in proportion to its value**:

$$
Y_i=\mu+\sqrt h\,\sigma Z_i,\qquad
H_i=H(Y_i),\qquad
\Pr(J=i\mid Y_{1:K})=\frac{H_i}{\sum_jH_j}.
$$

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centered_pool_en.svg"><img src="/images/blog/diffusion_urge_stein/centered_pool_en.svg" alt="Two opposite candidates extend to five directions whose sum is zero. Values are queried in parallel, and one candidate is randomly selected." width="960" height="860" loading="lazy"></a>
  <figcaption>Figure 5 · From a symmetric pair to a centered pool. Directions are schematic; the algorithm uses centered Gaussians. The red point is the selected candidate, not the weighted mean.</figcaption>
</figure>

Given a candidate pool $$U$$, the mean displacement is exactly

$$
\mathbb E[Y_J-\mu\mid U]
=\sqrt h\,\sigma\frac{\sum_iZ_iH_i}{\sum_iH_i}.
$$

Finite queries replace the expectations in ideal value tilting. For $$K=2$$, $$Z_1=(G_1-G_2)/\sqrt2=-Z_2$$, recovering the finite difference construction. Odd values of $$K$$ work too; candidates need not be arranged in pairs. [[2, equations (7)–(8)]](#ref_stein_en)

### Why does centering also help correction?

The same queries serve two purposes: **the value weighted directions indicate where to move, while the average value supplies normalization information**.

If all candidate values are equal, directions summing to zero give exactly zero mean guidance. For the average value $$S=K^{-1}\sum_iH(Y_i)$$, the first order fluctuation also cancels because $$\sum_iZ_i=0$$, leaving smaller fluctuations controlled by curvature. Under the uniform smoothness and positive value bounds in [[2]](#ref_stein_en), the variance of the normalized average improves from $$O(h/K)$$ for independent candidates to $$O(h^2/(K-1))$$. [[2, Remark 2, Assumption 3]](#ref_stein_en)

<details class="blog-details" markdown="1">
<summary>Why can guidance remain biased when the value estimators are unbiased?</summary>

Let $$G=\mathbb E[H(Y)]$$. Stein’s identity gives

$$
\widehat v=\frac1{K\sqrt h}\sum_iZ_iH(Y_i),\qquad
\mathbb E\widehat v=\sigma^\top\mathbb E\nabla H(Y),\qquad
\mathbb ES=G.
$$

But generally $$\mathbb E[\widehat v/S]\ne\mathbb E[\widehat v]/\mathbb E[S]$$. Unbiased numerator and denominator estimators do not make their ratio unbiased. Bias from finite candidate pools and imperfect values still requires the path weights in the next section. [[2, Proposition 6, Theorem 11]](#ref_stein_en)

</details>

## 8. Correct the entire path after generation

Section 5 left an obstacle: the ideal local normalizer $$G_k=P_kH_{k+1}$$ is difficult to compute. A finite candidate pool provides a way forward: **retain the average of the same value queries to construct an exact augmented space weight, without evaluating the integral exactly**. [[2, §3.2, Theorem 12]](#ref_stein_en)

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{S_k}{H_{k+1}(X_{k+1})},\qquad
S_k=\frac1K\sum_{i=1}^K H_{k+1}(Y_{k,i}).
$$

This weight addresses the bias left by both approximate values and finite candidate selection, using no extra value queries or derivatives. Its validity comes from an augmented space containing the candidate pools and selection indices. Arbitrarily replacing $$G_k$$ with an unbiased estimator would not automatically be valid.

Now apply independence Metropolis–Hastings to entire paths. If new and old path weights are $$R_{\mathrm{new}}$$ and $$R_{\mathrm{old}}$$, accept with probability

$$
\alpha=\min\{1,R_{\mathrm{new}}/R_{\mathrm{old}}\}.
$$

On acceptance, move to the new path. On rejection, retain the old path and its old weight. Compare the corrected path weights, not just the terminal rewards. [[2, Algorithm 2]](#ref_stein_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/outer_mh_en.svg"><img src="/images/blog/diffusion_urge_stein/outer_mh_en.svg" alt="Complete proposals are independently generated and processed by MH using new and old path weights. Rejection retains the old path and weight." width="960" height="680" loading="lazy"></a>
  <figcaption>Figure 6 · Complete proposals can be generated in parallel; acceptance decisions are processed sequentially. The displayed weights and decisions are teaching examples.</figcaption>
</figure>

**Proposal paths are independent; consecutive outputs from one MH chain remain correlated**. A finite number of updates also leaves initialization error. Independent outputs require independent repetitions of the full procedure. With a known valid bound on the complete path weight, rejection of entire paths can instead give independent exact samples from the finite grid target. Here we focus on outer MH with a fixed computation budget. [[2, Algorithm 2, Appendix G.2]](#ref_stein_en)

<details class="blog-details" markdown="1">
<summary>Why the weight works: one exact cancellation</summary>

Given the candidate pool, $$S=K^{-1}\sum_iH(Y_i)$$ and candidate i is selected with probability $$H(Y_i)/(KS)$$. Hence

$$
\mathbb E\!\left[\frac S{H(Y_J)}f(Y_J)\mid U\right]
=\sum_i\frac{H(Y_i)}{KS}\frac S{H(Y_i)}f(Y_i)
=\frac1K\sum_i f(Y_i).
$$

Average over the pool. Each candidate has the correct base transition marginal, so the right side recovers the base transition. Repeating over time and multiplying by $$\phi(X_n)$$ gives

$$
\mathbb E_{\widetilde Q}[RF(X_{0:n})]
=\mathbb E_{P_n}[\phi(X_n)F(X_{0:n})].
$$

This restores the weighted path target, beyond merely correcting an average drift. That target is invariant for the resulting MH chain; approaching it in finite time still requires convergence analysis. [[2, Theorem 12]](#ref_stein_en)

</details>

## 9. Can more denoising steps stop forcing us to add more paths?

Fix total time $$T$$ and set $$h=T/n$$. The centered pool’s per step normalization variance is $$O(h^2/(K-1))$$. Across $$n$$ steps, the corresponding scale is

$$
\frac{nh^2}{K-1}=\frac{Th}{K-1}.
$$

This pool noise contribution decreases as the grid becomes finer. The approximate value’s Bellman error is a separate term; a larger candidate pool does not automatically remove it. [[2, §4]](#ref_stein_en)

With a fixed initial state, $$H_n=\phi$$, uniform positive upper and lower value bounds, and bounded second spatial derivatives and noise coefficients, the paper proves that **the number of complete proposals required for prescribed finite grid sampling accuracy need not grow with denoising depth**. Constants may depend on dimension and value bounds; the claim is not dimension independence. [[2, Theorem 4]](#ref_stein_en)

Depth is still not free. There are $$m+1$$ complete proposals for $$m$$ outer updates plus initialization, and the value query count is $$Kn(m+1)$$. The result addresses whether longer paths force us to increase the number of paths as well. It does not eliminate the cost of making each path longer.

<details class="blog-details" markdown="1">
<summary>With a fixed query budget per path, are two candidates already enough?</summary>

Fix a proposal budget $$B=Kn$$. Then

$$
\frac{Th}{K-1}=\frac{T^2}{B}\frac K{K-1}.
$$

For $$K\ge2$$, the last factor lies between 1 and 2. Considering only pool noise, two candidates already achieve the same budget order. More candidates increase parallelism but reduce the number of steps available within the same budget, so they do not necessarily reduce total error. [[2, §4]](#ref_stein_en)

These statements concern the discrete model’s target distribution. Its numerical error relative to the continuous time diffusion target needs separate analysis. Numerical error, value approximation error, and finite computation sampling error should be accounted for separately.

</details>

## 10. Experiments: URGE, then Stein

<h3 id="urge-experiments-en">URGE: first test a distribution with a known answer</h3>

URGE uses a Gaussian mixture in 30 dimensions with 40 components. After applying a quadratic reward, the target remains analytically available, so distributional accuracy can be checked directly. The following excerpt from Table 2 compares methods using both guidance $$G=r$$ and resampling. [[1, §4.1, Table 2]](#ref_urge_en)

| Method | MMD ↓ | SWD ↓ | Mean error ↓ | Covariance error ↓ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.07 | 0.85 | 4.86 | 198.20 |
| URGE | 0.06 | 0.62 | 3.20 | 181.31 |

Lower is better for all four metrics. MMD and SWD measure distributional differences; mean and covariance errors describe the center and spread of the point cloud. **In this experiment, URGE is closer to the target: SWD decreases from 0.85 to 0.62, and mean error from 4.86 to 3.20**. This supports the effectiveness of correction, but a smaller empirical error does not establish exact sampling.

<details class="blog-details" markdown="1">
<summary>How was this experiment run?</summary>

It uses 8192 particles and 500 discretization steps, with resampling when ESS falls below 80% of the particle count. URGE’s original table averages five random seeds. SWD can be understood by projecting a high dimensional point cloud in many directions and comparing the resulting one dimensional distributions. [[1, Table 2, Appendix C]](#ref_urge_en)

</details>

### URGE: what changes at the same particle count?

The image generation evaluation uses 50 prompts with three random seeds each. Below are three methods from Table 4, all using four particles. Higher is better for every metric. [[1, §4.3, Table 4]](#ref_urge_en)

| Method, all with 4 particles | CLIP ↑ | HPS ↑ | ImageReward ↑ | GenEval ↑ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.2901 | 0.2849 | 0.8397 | 0.7200 |
| FK Steering with gradient guidance | 0.2899 | 0.2839 | 0.7906 | 0.7467 |
| URGE | 0.2997 | 0.2927 | 0.9955 | 0.7800 |

CLIP measures semantic agreement between image and text. HPS and ImageReward are learned preference scores. GenEval checks requested conditions such as the presence of objects. Relative to FK Steering, URGE increases **ImageReward from 0.8397 to 0.9955 and GenEval from 0.7200 to 0.7800**. Equal particle counts do not imply equal measured runtime.

<details class="blog-details" markdown="1">
<summary>Sampling settings and the scope of the comparison</summary>

This evaluation uses 100 DDIM steps, noise parameter 1, CFG scale 7.5, and resampling every 20 steps. [[1, Appendix C]](#ref_urge_en)

The scaling figure below compares SD v1.5 and SDXL on 10 prompts, so it should not be equated directly with the 50 prompt aggregate above. Across the tested $$N=2,3,4,6,8$$, URGE’s ImageReward increases and exceeds FK Steering in most configurations. Exceptions are $$N=2$$ for SD v1.5 and $$N=6$$ for SDXL. This is an observed trend in the experiment, not a universal monotonicity guarantee. [[1, Figure 3]](#ref_urge_en)

</details>

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp"><img src="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp" alt="Figure 3 from URGE: ImageReward versus particle count for SD v1.5 and SDXL. URGE improves across the tested range but does not exceed FK Steering in every configuration." width="1400" height="500" loading="lazy"></a>
  <figcaption>Figure 7 · Practical gains from more particles. Figure 3 of <a href="#ref_urge_en">[1]</a>, retaining the original axes, legends, and baselines. Evaluation uses 10 prompts.</figcaption>
</figure>

What visual changes do these scores represent? Figure 8 selects “a toothbrush and a snowboard” and “a horse and a giraffe.” Look for **whether both objects appear separately or become fused into one object**. [[1, Table 5]](#ref_urge_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_image_examples_en.webp"><img src="/images/blog/diffusion_urge_stein/urge_image_examples_en.webp" alt="Two prompts with two objects each, comparing base SD v1.5, FK Steering with four particles, and URGE with four particles." width="1680" height="1610" loading="lazy"></a>
  <figcaption>Figure 8 · Excerpts from Table 5 of <a href="#ref_urge_en">[1]</a>. The six generated images are unchanged; only selection, layout, and labels are adapted. FK Steering and URGE both use four particles. Read individual examples alongside aggregate metrics. Original images used under CC BY 4.0.</figcaption>
</figure>

### Stein: how many queries can two centered candidates save?

The Brownian experiment in [[2]](#ref_stein_en) compares centered and independent candidates. Its adjusted NESS metric measures the efficiency of normalizing constant estimation, not image quality. [[2, §5.1]](#ref_stein_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centering_experiment.webp"><img src="/images/blog/diffusion_urge_stein/centering_experiment.webp" alt="Two centered candidates become more efficient as the grid is refined. Independent candidates require much larger pools to reach similar normalizer estimation efficiency." width="1032" height="429" loading="lazy"></a>
  <figcaption>Figure 9 · Figure 2 of <a href="#ref_stein_en">[2]</a>. The left fixes two candidates; the right increases the independent pool size. The metric is not the number of independent MH samples.</figcaption>
</figure>

With perturbed values and $$n=192$$, **two centered candidates reach 92.76%, compared with 31.40% for two independent candidates**. Independent pools need 128 and 256 candidates to reach 92.38% and 92.81%, respectively. In this setting, arranging dependence within the pool stabilizes weights more effectively than simply adding candidates. [[2, §5.1]](#ref_stein_en)

### Stein: what does complete path correction contribute?

The Hopper experiment fixes the diffusion policy and critic, then tests whether the critic score distribution of generated actions matches the target. Three targets place 30%, 60%, or 80% of the mass on the top 10% of actions ranked by the original policy’s critic scores. KS distance measures the largest difference between score cumulative distributions; smaller is better. [[2, §5.2]](#ref_stein_en)

| Target strength | Two candidate guidance without outer correction | Correction with 32 complete proposals |
| :--- | :--- | :--- |
| 30% | 0.2174 | 0.0306 |
| 60% | 0.2804 | 0.0697 |
| 80% | 0.4041 | 0.1128 |

These are mean conditional KS distances across eight fixed states. **Guidance helps, but complete path correction still substantially improves agreement with the target**. The metric concerns a fixed critic’s score distribution; it cannot be interpreted as the same proportional improvement in actual robot returns. [[2, Table 2, Appendix H.3]](#ref_stein_en)

Finally, return to the book and laptop. Figure 10 shows four prompts, each with two objects, using the same SD v1.5 backbone. Check whether both objects appear and remain distinct, rather than judging only visual appeal. [[2, §5.3]](#ref_stein_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/image_examples.webp"><img src="/images/blog/diffusion_urge_stein/image_examples.webp" alt="Examples from reference [2], comparing FK Steering, SVDD, URGE, and Stein Guidance with two and four candidates." width="1110" height="1200" loading="lazy"></a>
  <figcaption>Figure 10 · Table 3 of <a href="#ref_stein_en">[2]</a>. Stein uses 11 complete proposals per image, while the particle methods shown use four particles. These are qualitative examples, not a comprehensive comparison at strictly equal computation.</figcaption>
</figure>

## 11. Keep the three jobs separate

**Guidance** sends computation toward promising regions. **Independent proposals** avoid shared ancestry caused by copying across paths. **Path correction** compensates for probability bias from inaccurate judgments. They solve three different problems.

URGE shows how retaining paths makes correction easier to compute. Stein Guidance takes another step: two symmetric candidates provide a finite difference, centered pools of $$K$$ candidates provide parallel Stein guidance, and the same function values provide complete path correction weights.

**Function values can reveal a direction without value derivatives. Avoiding shared ancestry still leaves a need for correction**. Keeping these roles clear tells us what extra computation actually improves.

## References and figure sources

<p id="ref_urge_en"><strong>[1] URGE.</strong> Chenyang Wang, Weizhong Wang, Yinuo Ren, Jose Blanchet, Yiping Lu. <em>Simple Approximation and Derivative Free Inference Time Scaling for Diffusion Models via Sequential Monte Carlo on Path Measures.</em> ICML 2026. <a href="https://proceedings.mlr.press/v306/wang26ih.html">Proceedings</a> · <a href="https://arxiv.org/abs/2605.17850">arXiv</a> · <a href="https://arxiv.org/html/2605.17850v1">Full text in HTML</a>.</p>

<p id="ref_stein_en"><strong>[2] Stein Guidance.</strong> Youheng Zhu, Chenyang Wang, Minshuo Chen, Yiping Lu. <em>Stein Guidance without Gradients: Discretization Uniform Diffusion Inference Time Scaling beyond Particle SMC.</em> 2026. <a href="/files/SteinGuidance.pdf">Full paper (PDF)</a>.</p>

<p id="ref_slides_en"><strong>[3] Seminar slides.</strong> Yiping Lu, <em>Diffusion Overview</em>, pp. 57–59: sequential rejection along individual paths, path correction for approximate values, and replacing derivatives with Stein’s identity. Figure 3 uses the original vector diagram from page 57, cropped to the mechanism and adapted with browser fonts and English labels.</p>

Figures 1, 2, 4, 5, and 6 are teaching diagrams; Figure 3 comes from the slides above. Figures 7 and 8 use Figure 3 and Table 5 of [1] under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Figure 8 adapts selection, layout, and labels only. Figures 9 and 10 reproduce Figure 2 and Table 3 of [2]. Numerical examples of routes, candidate values, acceptance probabilities, and MH decisions illustrate mechanisms. Experimental numbers are attributed where they appear.
