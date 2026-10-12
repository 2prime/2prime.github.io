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
  <figcaption>Figure 1 · How preference changes probabilities. The base model produces a book alone or a book with a laptop with probabilities 80% and 20%. Multiplying by weights 1 and 4 gives equal weighted mass and target probabilities of 50% each. These teaching values illustrate the target distribution. Click any figure to enlarge it.</figcaption>
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
  <figcaption>Figure 2 · Two paths can reach the same endpoint while having different ratios of base to proposal transition probabilities along the way. Multiplying those ratios and the terminal preference compensates for the change in sampling probability caused by guidance. Curve height does not represent image quality.</figcaption>
</figure>

In discrete time, let $$P_k$$ be the base transition density and $$Q_k$$ the actual proposal density. Assume the same initial distribution and the support conditions needed for the probability ratio. For a generated path, record

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{P_k(X_k,X_{k+1})}{Q_k(X_k,X_{k+1})}.
$$

**Paths drawn too often under guidance should be downweighted; paths drawn too rarely should be upweighted**. The terminal preference specifies what we want, and the probability ratio compensates for how we actually sample.

The continuous time counterpart is Girsanov’s change of measure. URGE computes path weights from the simulated drift and random increments, then reweights and resamples during generation. It is itself an SMC method; the expandable explanation below connects its path weights to particle weights. [[1, §2.3]](#ref_urge_en)

<details class="blog-details" id="urge-particle-relation-en" markdown="1">
<summary>URGE and particle SMC: condition on the endpoint, save derivatives, retain more variance</summary>

**Keep a separate account for each path, or first combine accounts that reach the same endpoint?** Both methods propagate, weight, and resample. URGE’s weight depends on the realized path. The particle perspective averages over paths with the same endpoint using their conditional probabilities, keeping a weight that depends only on the current state. The particle correctors discussed here are specifically FK Corrector and AFDPS.

Under the same proposal law $$Q$$, let $$W$$ be the weight of a path segment. Averaging over the unobserved path while fixing its endpoint gives

$$
\overline W(x)=\mathbb E_Q[W\mid X_t=x].
$$

Intuitively, an endpoint statistic need not distinguish a detour from a direct route if both arrive at the same $$x$$. For any suitable endpoint function $$f$$, the tower property gives

$$
\mathbb E_Q[Wf(X_t)]
=\mathbb E_Q[\overline W(X_t)f(X_t)].
$$

Thus, **weighting paths and then retaining only endpoints gives the same weighted marginal distribution as first averaging path weights conditional on the endpoint and then weighting endpoints**. The normalizing constants also agree, by taking $$f=1$$.

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_path_particle_en.svg"><img src="/images/blog/diffusion_urge_stein/urge_path_particle_en.svg" alt="Four equally likely paths have weights 1 and 3 at endpoint a, and 2 and 6 at endpoint b. Conditioning on the endpoint gives particle weights 2 and 4. Path weight variance 3.5 splits into endpoint weight variance 1 and conditional path variance 2.5." width="1080" height="695" loading="lazy"></a>
  <figcaption>Supplementary figure · The left retains each path’s weight; the right averages paths conditional on their endpoint. In this teaching example the four paths are equally likely under the proposal, so weights 1 and 3 average to 2, while 2 and 6 average to 4. The normalized weighted endpoint masses remain one third and two thirds, but weight variance falls from 3.5 to 1. The removed 2.5 is exactly the path noise within each endpoint.</figcaption>
</figure>

For URGE’s short path increments, the paper further shows, under the relevant regularity and marginal matching conditions,

$$
\lim_{h\downarrow0}
\frac{\mathbb E_Q[W_{t-h,t}\mid X_t=x]-1}{h}
=\lambda_{\mathrm{particle}}(x,t),
$$

where the right side is the FK Corrector / AFDPS particle correction potential. **The conditional averaging identity is exact over a finite interval; identifying the paper’s particle correction potential requires the short time limit.** This does not mean that two finite particle implementations select identical particles at every resampling step. [[1, Theorem 3.3]](#ref_urge_en)

**The benefit: Itô’s formula rewrites derivative terms as increments recorded along a simulated path.** Let $$\ell_t$$ be the log intermediate preference weight, with $$\ell_T=\log\phi$$, and write the guided proposal as $$dX=(b+\sigma u)\,dt+\sigma\,dB^Q$$. URGE’s incremental weight is

$$
\log W_{s,t}
=\ell_t(X_t)-\ell_s(X_s)
-\int_s^t u_\tau^\top dB_\tau^Q
-\frac12\int_s^t\|u_\tau\|^2d\tau.
$$

This uses endpoint function values, the actual change in drift, and noise already generated by the simulation. Why can it replace an expression involving derivatives? Itô’s formula writes the same function increment as

$$
d\ell_t(X_t)
=\left[\partial_t\ell_t+(b+\sigma u)\cdot\nabla\ell_t
+\tfrac12\operatorname{tr}(\sigma\sigma^\top\nabla^2\ell_t)\right]dt
+(\sigma^\top\nabla\ell_t)^\top dB_t^Q.
$$

The right side contains time derivatives, gradients, and a Hessian. Along a simulated path, the left side integrates to a difference of function values. Together with the Girsanov path ratio, this avoids additional derivative or marginal score evaluations for correction. If guidance itself uses $$u=\sigma^\top\nabla G$$, that guidance gradient is still needed.

**The cost: even with the same endpoint, different realized paths can produce different weights.** For square integrable $$W$$, the law of total variance gives

$$
\operatorname{Var}_Q(W)
=\operatorname{Var}_Q(\overline W(X_t))
+\mathbb E_Q[\operatorname{Var}_Q(W\mid X_t)]
\ge\operatorname{Var}_Q(\overline W(X_t)).
$$

Conditional averaging is a Rao–Blackwellization: it removes weight noise caused by different paths reaching the same endpoint. URGE uses the realized path weight, saving the cost of conditional averaging or explicit derivative evaluations while retaining this extra variance. The inequality is strict whenever weights genuinely vary conditional on the endpoint.

**The Itô rewrite is an identity and does not itself increase variance. The extra variance is the cost of retaining path randomness relative to the exact conditional average.** This comparison concerns raw weights under the same proposal. Final algorithmic error also depends on discretization, derivative estimation, resampling, and computational budget.

</details>

## 4. Many paths may already belong to one family

SMC repeatedly copies particles with large weights and removes those with small weights. A copy inherits the particle’s current state and the history that produced it. **The number of particles still on screen and the amount of independent early exploration they retain are different quantities.**

Imagine four people solving a problem. Every so often, each chooses a draft according to its score and continues from it. After several rounds, four answers may remain on the table, yet all descend from one early draft. Later work can differ while still inheriting the same crucial early choice.

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/genealogy_en.svg"><img src="/images/blog/diffusion_urge_stein/genealogy_en.svg" alt="On the left, two rounds of copying reduce four ancestral families A, B, C, D to descendants of A, although each column still contains four particles. On the right, four complete proposals use independent randomness." width="960" height="670" loading="lazy"></a>
  <figcaption>Figure 3 · Four particles remain, but the number of ancestral families falls from four to two to one. Letters and colors on the left identify early ancestors; edges show inheritance. Each complete proposal on the right is generated separately, without copying across paths. Descendants on the left can add independent future noise, but they have already inherited the randomness in their shared prefix.</figcaption>
</figure>

Follow the left panel: the first round retains descendants of A and C, losing the early exploration of B and D. The second retains only family A. The four particles can occupy different positions while still depending on the same early random history. On the right, four complete generations each use their own random numbers, preserving four independent opportunities to explore.

A simple model shows why this matters for statistical precision. Write the final outcomes as $$X_T^{(i)}=A+\varepsilon_i$$: $$A$$ is the inherited random prefix, while the later noises $$\varepsilon_i$$ are independent, identically distributed, and independent of $$A$$. Averaging $$N$$ descendants gives

$$
\operatorname{Var}\!\left(\frac1N\sum_{i=1}^N X_T^{(i)}\right)
=\operatorname{Var}(A)+\frac{\operatorname{Var}(\varepsilon_1)}N.
$$

**Averaging reduces independent noise from the later stages, but it does not average away the early error inherited by everyone.** This additive model illustrates correlation; it is not a representation of every diffusion process.

ESS measures only how uniform the current weights are. Resampling usually resets them to equal values, so $$\mathrm{ESS}=N$$ can hold even when all four particles belong to family A. ESS does not track the family tree and cannot establish independence. Increasing denoising depth can create more opportunities for ancestral merging if it also increases the number of resampling rounds. [[2, §1, Appendix E]](#ref_stein_en)

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

Given a known valid bound $$0<H_{k+1}(y)\le M_k(x)$$, draw $$Y$$ from the base transition $$P_k(x,\cdot)$$ and accept with probability $$H_{k+1}(Y)/M_k(x)$$. Repeat until accepted, then advance. **Independent repetitions of this complete procedure have no shared ancestry across paths**. This is the mechanism on the right below.

<figure class="blog-figure">
  <div style="display:flex;flex-wrap:wrap;gap:0.8rem;">
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="Enlarge: SMC copies parent particles"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" alt="Left panel: SMC copies parent particles across paths, so descendants share history." width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;"></a>
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="Enlarge: retry only your own next step"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection_en.svg" alt="Right panel: rejection retains the current prefix and retries only the current step." width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;transform:translateX(-50%);"></a>
  </div>
  <figcaption>Figure 4 · How two selection mechanisms handle unsuccessful attempts. SMC on the left can copy another particle’s prefix, giving several descendants the same history. Rejection on the right keeps its own current state and retries only the next step. Independent repetitions avoid shared ancestry across paths, while steps within each path remain dependent.</figcaption>
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

Local rejection alone behaves differently. Each step normalizes candidate values into probabilities. Its denominator is the true average next value from the current state, which need not equal the current approximate prediction. **Adjacent value terms can still cancel, but the ratios left by disagreement between prediction and actual average usually do not**. [[2, §3, equations (10)–(11)]](#ref_stein_en)

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

### Another cost of explicit guidance: why can correction need second derivatives?

Start with steering. Changing the drift to $$b+a\nabla\log H$$, where $$a=\sigma\sigma^\top$$, asks which direction increases the value at the current point. That requires a first derivative. But $$H$$ is approximate. After generating a complete path, we still need to ask: **how much did these intermediate judgments distort its sampling probability, and what weight should determine whether we keep it?**

The discrete correction above already gives a clue: each step leaves a factor $$G_k/H_k$$, with $$G_k=P_kH_{k+1}$$. The numerator is the actual average next value after a step of the base dynamics; the denominator is the current prediction of the future. Exact values make them agree. Their discrepancy for approximate values is the Bellman defect that must be accumulated along the path.

**Why does computing this average involve a second derivative?** A random step can move left or right. The first order changes cancel on averaging, but curvature that bends both sides up or down remains. Temporarily ignoring time and drift, the one dimensional Taylor expansion is

$$
H(x+\sqrt h Z)
=H(x)+\sqrt h\,H'(x)Z+\frac h2 H''(x)Z^2+\cdots,
\qquad Z\sim N(0,1).
$$

Since $$\mathbb EZ=0$$ and $$\mathbb EZ^2=1$$, under suitable smoothness and integrability,

$$
\mathbb E[H(x+\sqrt h Z)]-H(x)
=\frac h2 H''(x)+o(h).
$$

For example, take $$H_+(x)=e^{cx^2}$$ and $$H_-(x)=e^{-cx^2}$$ with $$c>0$$. At $$x=0$$, both have value 1 and gradient 0, giving the same instantaneous guidance. Yet one is a valley and the other a hilltop. After a small random step, their average values become $$1+ch+O(h^2)$$ and $$1-ch+O(h^2)$$, respectively. **Identical values and gradients can require opposite local probability corrections. Curvature supplies the missing information.**

Restoring time evolution, base drift, and multidimensional noise gives the relative defect per unit time:

$$
\mathcal E_t(x)
=\frac{\partial_tH_t+b_t\cdot\nabla H_t
+\tfrac12\operatorname{tr}(a_t\nabla^2H_t)}{H_t}(x).
$$

The three terms describe changes due to time, base drift, and the interaction of noise with curvature. The last contracts the Hessian with the noise covariance. Computing it need not require storing the full Hessian, but it still requires second spatial derivative information.

**How does this enter the final accept or reject decision?** For a fixed initial state, $$H_T=\phi$$, positive and sufficiently smooth $$H$$, and a valid change of measure, the continuous time proposal with drift $$b+a\nabla\log H$$ has unnormalized complete path correction weight

$$
R_H=H_0(x_0)\exp\!\left(\int_0^T\mathcal E_t(X_t)\,dt\right).
$$

The terminal preference is already included through $$H_T=\phi$$. The exponential accumulates probability corrections along the whole path and enters the MH ratio of new and old path weights. A valid weight bound also permits complete path rejection sampling. **The acceptance formula is simple; computing its path weight is the challenge. Along the residual route, the gradient provides guidance, while time and second spatial derivatives enter correction.** In discrete time, the counterpart is the accumulated $$\log(G_k/H_k)$$ above. [[2, §4, equation (11)]](#ref_stein_en)

<details class="blog-details" markdown="1">
<summary>How can URGE avoid explicit Hessians?</summary>

The expression above rewrites a path probability ratio as a value function residual. URGE retains the actual drift and noise increments and computes correction directly through the Girsanov path ratio, avoiding explicit time derivatives and Hessians. If its drift uses $$\nabla\log H$$, constructing the proposal still requires value gradients. **Higher derivatives are a cost of evaluating the residual directly, not an unavoidable cost of every correction method.** [[1, §2.2–2.4]](#ref_urge_en)

A continuous time identity also does not make an arbitrary discretization exact. An implementation needs correction weights matched to its actual discrete proposal.

</details>

We therefore need two mechanisms designed together: **use function values to steer toward promising regions, while keeping a probability account that can also be computed from function values.** The next section starts with two symmetric candidates and shows how the same queries can serve both purposes.

## 6. Why do two symmetric candidates produce a log gradient?

**The symmetric difference supplies a directional derivative of value. Normalizing the selection probabilities divides it by the current value, giving $$\nabla H/H=\nabla\log H$$.**

Write the position after the base drift as $$\mu=x+hb(x)$$. Draw a Gaussian perturbation $$\delta=\sqrt h\,\sigma Z$$ with $$Z\sim N(0,I)$$, then construct two symmetric candidates and query their values:

$$
Y^\pm=\mu\pm\delta,\qquad H^\pm=H(Y^\pm).
$$

Select one candidate with probability $$p_\pm=H^\pm/(H^++H^-)$$. Conditional on the current state and perturbation, the mean displacement is exactly

$$
\mathbb E[Y^J-\mu\mid x,Z]
=\delta\frac{H^+-H^-}{H^++H^-}.
$$

Expand the two values to first order: **their difference cancels the constant term and leaves $$2\delta^\top\nabla H(\mu)$$, while their sum has leading term $$2H(\mu)$$**. For a small perturbation,

$$
\frac{H^+-H^-}{H^++H^-}
\approx\frac{\delta^\top\nabla H(\mu)}{H(\mu)}
=\delta^\top\nabla\log H(\mu).
$$

Substituting into the mean displacement gives the leading term $$\delta\delta^\top\nabla\log H(\mu)$$. Average over the random direction and use $$\mathbb E[\delta\delta^\top\mid x]=h\sigma\sigma^\top$$ to obtain

$$
\mathbb E[Y^J\mid x]
=\mu+h\sigma\sigma^\top\nabla\log H(\mu)+o(h).
$$

This is log gradient guidance scaled by the noise covariance. **Implementation only queries two function values and selects one candidate proportionally; the gradient appears in the analysis of the mean displacement and need not be computed.** The small step limit requires smooth positive $$H$$ and integrable remainder terms. It describes the leading mean drift; the finite step transition law still requires correction. [[2, §3.1.1, equation (5), Appendix B.2.1]](#ref_stein_en)

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
  <figcaption>Figure 5 · Two opposite candidates extend to five balanced candidates whose directions sum to zero. Query their values in parallel, then select one in proportion to value. The red point is the selected candidate. Centering also cancels first order noise in the average value, stabilizing the normalizer estimate used for correction. Arrows show the geometry; actual directions are centered Gaussians.</figcaption>
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
  <figcaption>Figure 6 · Generate complete proposals separately, then compare new and old path weights one proposal at a time. Acceptance replaces the path; rejection retains the old path and its weight. Proposals can therefore be generated independently in parallel, while successive MH outputs may repeat and remain correlated. Weights and decisions are illustrative.</figcaption>
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

The scaling figure below compares SD v1.5 and SDXL on 10 prompts, so it should not be equated directly with the 50 prompt aggregate above. Across the tested $$N=2,3,4,6,8$$, URGE’s ImageReward increases and exceeds FK Steering in most configurations. Exceptions are $$N=2$$ for SD v1.5 and $$N=6$$ for SDXL. This is an observed trend in the experiment, not a universal monotonicity guarantee. 

</details>

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp"><img src="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp" alt="ImageReward versus particle count for SD v1.5 and SDXL. URGE improves across the tested range but does not exceed FK Steering in every configuration." width="1400" height="500" loading="lazy"></a>
  <figcaption>Figure 7 · Particle count is on the horizontal axis and ImageReward on the vertical axis; the two panels use SD v1.5 and SDXL. More particles provide additional candidates and selection opportunities. URGE’s score increases over the tested particle counts, although it does not exceed FK Steering in every configuration. Evaluation uses 10 prompts.</figcaption>
</figure>

What visual changes do these scores represent? Figure 8 selects “a toothbrush and a snowboard” and “a horse and a giraffe.” Look for **whether both objects appear separately or become fused into one object**. 

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_image_comparison_en.html" style="position:relative;display:block;overflow:hidden;aspect-ratio:1680/1430;"><img src="/images/blog/diffusion_urge_stein/urge_image_examples_en.webp" alt="Two prompts requesting two objects, comparing base SD v1.5, FK Steering with four particles, and URGE with four particles." width="1680" height="1610" loading="lazy" style="position:absolute;top:0;left:0;display:block;width:100%;max-width:none;height:auto;margin:0;border:0;border-radius:0;transform:translateY(-6.8322981366%);"></a>
  <figcaption>Figure 8 · Compare the base model, FK Steering, and URGE under identical prompts requesting two objects. The upper row checks whether a toothbrush and a snowboard remain separate; the lower row checks whether a horse and a giraffe are blended. These examples connect scores to visible changes. The latter two methods both use four particles; individual images should be read alongside aggregate metrics.</figcaption>
</figure>

### Stein: how many queries can two centered candidates save?

The Brownian experiment in [[2]](#ref_stein_en) compares centered and independent candidates. Its adjusted NESS metric measures the efficiency of normalizing constant estimation, not image quality. [[2, §5.1]](#ref_stein_en)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centering_experiment.webp"><img src="/images/blog/diffusion_urge_stein/centering_experiment.webp" alt="Two centered candidates become more efficient as the grid is refined. Independent candidates require much larger pools to reach similar normalizer estimation efficiency." width="1032" height="429" loading="lazy"></a>
  <figcaption>Figure 9 · How centering stabilizes normalizer estimation. The left panel fixes two candidates and compares adjusted NESS as the grid becomes finer. The right increases the number of independent candidates to examine how many queries match the efficiency of centered candidates. Higher values indicate more efficient normalizer estimation, not a count of independent MH outputs.</figcaption>
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
  <a href="/images/blog/diffusion_urge_stein/image_examples.webp"><img src="/images/blog/diffusion_urge_stein/image_examples.webp" alt="Two object examples comparing FK Steering, SVDD, URGE, and Stein Guidance with two and four candidates." width="1110" height="1200" loading="lazy"></a>
  <figcaption>Figure 10 · Compare FK Steering, SVDD, URGE, and Stein Guidance with two or four candidates on four prompts requesting two objects. Check whether both objects appear and retain distinct identities. Stein uses 11 complete proposals per image; the particle methods shown use four particles. These qualitative examples do not establish a comprehensive ranking at strictly equal computation.</figcaption>
</figure>

## 11. Keep the three jobs separate

**Guidance** sends computation toward promising regions. **Independent proposals** avoid shared ancestry caused by copying across paths. **Path correction** compensates for probability bias from inaccurate judgments. They solve three different problems.

URGE shows how retaining paths makes correction easier to compute. Stein Guidance takes another step: two symmetric candidates provide a finite difference, centered pools of $$K$$ candidates provide parallel Stein guidance, and the same function values provide complete path correction weights.

**Function values can reveal a direction without value derivatives. Avoiding shared ancestry still leaves a need for correction**. Keeping these roles clear tells us what extra computation actually improves.

## 12. Research question: guidance and correction without derivatives

<aside class="blog-key-insight" aria-labelledby="research-question-en" markdown="1">
<h4 id="research-question-en">Design guidance together with the information needed for correction</h4>

**With access only to values of an approximate value function, how can we design guidance that moves toward promising regions while retaining a computable, exact path weight, so that the final correction also requires no value gradients, time derivatives, or Hessians?**

</aside>

Stein Guidance offers one answer by retaining the candidate pool and the selected index: differences between candidate values provide direction, while the pool average and the selected value provide the correction factor. Both operations arise from the same random construction. Here, “exact” refers to the weighting identity on the augmented space; a finite number of MH updates still leaves sampling error. [[2]](#ref_stein_en)

A further research question is: **if candidate distributions are no longer Gaussian, or candidate pools adapt to the current state, can the same function queries still provide effective guidance, verifiable correction, and stable path weights?** A new design must establish more than a useful mean direction: its complete weight must recover the target distribution, and its fluctuations must be controlled as paths become deeper.

## References

<p id="ref_urge_en"><strong>[1] URGE.</strong> Chenyang Wang, Weizhong Wang, Yinuo Ren, Jose Blanchet, Yiping Lu. <em>Simple Approximation and Derivative Free Inference Time Scaling for Diffusion Models via Sequential Monte Carlo on Path Measures.</em> ICML 2026. <a href="https://proceedings.mlr.press/v306/wang26ih.html">Proceedings</a> · <a href="https://arxiv.org/abs/2605.17850">arXiv</a> · <a href="https://arxiv.org/html/2605.17850v1">Full text in HTML</a>.</p>

<p id="ref_stein_en"><strong>[2] Stein Guidance.</strong> Youheng Zhu, Chenyang Wang, Minshuo Chen, Yiping Lu. <em>Stein Guidance without Gradients: Discretization Uniform Diffusion Inference Time Scaling beyond Particle SMC.</em> 2026. <a href="/files/SteinGuidance.pdf">Full paper (PDF)</a>.</p>
