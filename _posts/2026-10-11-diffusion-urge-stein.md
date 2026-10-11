---
title: "让扩散模型多想一会儿：从 URGE 到无导数 Stein Guidance"
date: 2026-10-11 14:00:00 +0800
description: "从共同祖先到独立拒绝，从近似价值的偏差到完整路径校正，再用两点有限差分和 Stein 恒等式理解无导数引导。"
tags: ["扩散模型", "推理时计算", "URGE", "Stein Guidance"]
lang: zh-CN
permalink: /blog/diffusion-urge-stein/
---

输入“一本书和一台笔记本电脑”，模型画出了一台电脑，却忘了书。再试一次，书出现了，电脑又不见了。**既然模型偶尔能画对，能不能多花一些生成时的计算，让它更经常画对**？

最直接的办法是多生成几张，最后挑一张。更主动的办法是：图像还没画完，就判断哪些方向更有希望，把后续计算放在那里。

但中途的判断可能不准；很多条生成路径，也可能在反复筛选后变成同一个祖先的后代。我们既希望计算用得更有效，也希望最后的概率分布没有被错误判断带偏。

这篇博客沿着一条线展开：**URGE 用路径信息校正引导；独立拒绝避开共同祖先；Stein Guidance 则让引导和校正都只依赖函数值**。这里的“无导数”指不必对价值函数求导，基础去噪模型仍照常运行。[［1］](#ref_urge)[［2］](#ref_stein)

## 1. 多算一点，究竟想得到什么？

把扩散模型想成一个随机的绘画过程：从噪声出发，逐步去噪，最后生成图像。本文沿生成方向记时间，$$0$$ 是开始，$$T$$ 是完成。训练好的模型对应基础分布 $$p_{\mathrm{base}}$$。

给成品一个分数 $$r(x)$$，再把它变成正的偏好权重 $$\phi(x)=e^{\beta r(x)}$$，就得到我们希望采样的分布：

$$
\pi(x)=\frac{p_{\mathrm{base}}(x)\phi(x)}
{\mathbb E_{p_{\mathrm{base}}}[\phi(X)]}.
$$

它保留模型原本的生成偏好，同时提高高分结果的相对概率。$$\beta$$ 控制偏好强度。[［1，§2.1］](#ref_urge)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/target.svg"><img src="/images/blog/diffusion_urge_stein/target.svg" alt="基础分布中只有书占80%，书与电脑同时出现占20%；分别乘以1和4的偏好后，两类归一化概率各为50%。" width="960" height="650"></a>
  <figcaption>图 1 · 先乘偏好，再重新归一化。这里的概率与权重是教学数值，不是模型实验结果。所有配图都可以点击放大。</figcaption>
</figure>

这个采样目标与“找到最高分的一张图”有关，但并不相同。例如，独立生成多张后取最高分，一般不会得到上面的 $$\pi$$。下面的“校正正确”，都针对这个明确的分布目标。

增加计算也有三种不同方式：**更多去噪步 $$n$$，更多生成路径 $$N$$，或者每一步更多候选 $$K$$**。它们分别增加数值深度、统计宽度和局部查询量，不能混成一个“采样次数”。[［2，§1］](#ref_stein)

## 2. 想知道下一步怎么走，先问它的未来

半成品还很模糊，直接问“现在像不像一本书”，未必能判断最后画得好不好。更合理的问题是：**从这个状态继续生成，最终偏好权重的平均值是多少**？

$$
H_t^\star(x)=\mathbb E[\phi(X_T)\mid X_t=x].
$$

这个价值函数把未来的可能性都考虑进来。如果它精确已知，下一步就可以按照“基础转移概率 × 下一步的价值”抽样。在连续时间里，相应的引导漂移是 $$\sigma\sigma^\top\nabla\log H_t^\star$$，也就是 Doob 变换。[［1，§1］](#ref_urge)[［2，§3］](#ref_stein)

困难在于：$$H^\star$$ 本身就包含一个高维积分。实践中通常只能得到近似价值 $$H$$，例如先预测最终图像，再对预测结果打分。

因此，需要把两件事分开：**近似价值负责指路，校正机制负责处理指错路造成的概率偏差**。判断越好，校正通常越容易，但正确性不能建立在每次判断都准确之上。

## 3. URGE：把整条生成路径的账算清楚

引导改变了模型的走法。同一个终点可以从许多不同路径到达，因此很难直接计算引导后的终点密度。URGE 的切入点是：**保留实际走过的路径，对这条路径计算概率比**。[［1，§2.3］](#ref_urge)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/path_weight.svg"><img src="/images/blog/diffusion_urge_stein/path_weight.svg" alt="两条不同路径到达同一个终点，沿途基础转移与实际提议的概率比可以不同。" width="960" height="660" loading="lazy"></a>
  <figcaption>图 2 · 终点相同，路径权重仍可能不同。曲线为概念示意，纵向位置不代表图像质量。</figcaption>
</figure>

离散时间里，设基础转移密度是 $$P_k$$，实际提议密度是 $$Q_k$$，二者使用相同的初始分布，并满足概率比所需的支持条件。对实际生成的路径记录

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{P_k(X_k,X_{k+1})}{Q_k(X_k,X_{k+1})}.
$$

**被引导抽得过于频繁的路径，权重要压下来；被抽得太少的路径，权重要补上去**。最终偏好告诉我们想要什么，概率比补偿实际怎样抽样。

连续时间里对应 Girsanov 换测度。URGE 利用模拟时的漂移与随机增量计算路径权重，并在生成过程中重加权、重采样。把短路径权重按当前终点作条件平均，再取短时间极限，还能联系到粒子层面的校正势。[［1，§2.3、Theorem 3.3］](#ref_urge)

这里有一个重要区分：URGE 的路径权重避免了额外的 Hessian、score 或 PDE 残差计算；若引导本身写成 $$\nabla G$$，构造漂移仍需要这部分信息。**“校正不额外求高阶导数”与“引导也只用函数值”是两个层次**。后面的 Stein Guidance 要把它们接起来。有限粒子的结果也仍有采样误差，一致性结论有相应极限条件。[［1，Algorithm 1、Theorem 3.1］](#ref_urge)

## 4. 多条路径，可能已经变成一家人

SMC 不断复制高权重粒子，淘汰低权重粒子。它能及时把计算放到有希望的地方，但复制也意味着：**不同粒子可能共享越来越长的生成历史**。

想象四个人各自解题，每隔一会儿，都按评分挑一份草稿接着写。几轮以后，桌上仍有四份答卷，却可能都源自同一份早期草稿。后续可以各自探索，此前丢掉的多样性却不会自动回来。

常用的 ESS 指标只看当前权重是否均匀，不记录祖先是谁。权重都一样、$$\mathrm{ESS}=N$$，也不能据此认定 $$N$$ 个粒子互相独立。这提示我们：增加去噪步时，能否不同时加重这种统计依赖？[［2，§1、附录 E］](#ref_stein)

<details class="blog-details" markdown="1">
<summary>一个严格的反例：每步重采样，误差可能随深度累积</summary>

Stein 稿件构造了一个布朗运动例子：终点目标固定，局部 Bellman 误差为 $$O(1/n)$$；若每个数值步都做完整的多项分布重采样，一个最终粒子的分布满足

$$
\left\|\nu_{n,N}^{\mathrm{SMC}}-\pi\right\|_{\mathrm{TV}}
\asymp\frac nN,\qquad 2\le n\le N.
$$

这里的总变差距离衡量两个分布对同一事件给出的概率最多能差多少。这个结果针对论文构造的模型和每步完整重采样，不能外推为所有 SMC 的下界，也不排除稀疏或自适应重采样的价值。[［2，Theorem 1］](#ref_stein)

</details>

<h2 id="sequential-rejection">5. 不复制别人的路径，为什么仍要校正？</h2>

### 拒绝这一步，保留自己的草稿

一个自然的替代是**逐步拒绝采样（sequential rejection sampling）**：从当前状态试走一步，按候选价值决定接受还是拒绝。拒绝后保留自己的前缀，只重新尝试这一步，而不是复制另一个人的历史。

若有已知有效上界 $$0<H_{k+1}(y)\le M_k(x)$$，就从基础转移 $$P_k(x,\cdot)$$ 抽取候选 $$Y$$，以 $$H_{k+1}(Y)/M_k(x)$$ 的概率接受，重复到接受后再前进。**独立重跑整套路径生成程序，各条路径就没有跨路径的共同祖先**。这是下图右侧的机制。[［3，第 57 页］](#ref_slides)

<figure class="blog-figure">
  <div style="display:flex;flex-wrap:wrap;gap:0.8rem;">
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="放大查看原图：SMC 复制父粒子"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" alt="PPT原图左半：SMC跨路径复制父粒子，后代共享历史。" width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;"></a>
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="放大查看原图：只重试自己的下一步"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" alt="PPT原图右半：拒绝后保留当前前缀，只重试这一步。" width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;transform:translateX(-50%);"></a>
  </div>
  <figcaption>图 3 · 提取自《Diffusion Overview》第 57 页的原始矢量图，保留节点、连线与标注，窄屏时上下排列。左侧借用别人的前缀，右侧只重试自己的下一步。独立重复右侧程序，不会产生跨路径共同祖先；这不等于说一条路径内部的各步独立。</figcaption>
</figure>

它也不同于后面“整条路径生成完以后，再做外层 MH 校正”：这里拒绝的是一个子步；后者接受或保留的是一条完整提议。

### 没有共同祖先，不等于中途不会指错路

SMC 的一个好处是**保留沿途的权重账本**。例如，固定起点，并令终点价值 $$H_n=\phi$$，在基础转移下使用增量权重 $$H_{k+1}(X_{k+1})/H_k(X_k)$$，就有

$$
\frac{H_1(X_1)}{H_0(X_0)}
\frac{H_2(X_2)}{H_1(X_1)}\cdots
\frac{\phi(X_n)}{H_{n-1}(X_{n-1})}
=\frac{\phi(X_n)}{H_0(X_0)}.
$$

**中间判断像暂记的账：前一步记上，后一步扣回**。因此，中间价值不必等于真实未来价值，正确的未归一化目标仍由终点偏好决定。这里说的是权重构造的恒等式，不是有限粒子的 SMC 已经精确。[［2，附录 E.2］](#ref_stein)

只做局部拒绝则不同。每一步都把候选价值重新归一化成概率，分母是“从当前状态出发，下一步价值的真实平均”，不一定等于当前的近似预测。**相邻的价值项仍能相消，但预测与实际平均不一致留下的比值，通常消不掉**。[［2，§3、式 (10)–(11)］](#ref_stein)[［3，第 58 页］](#ref_slides)

用一个两步教学例子就能看清。基础模型等概率选择路线 A、B；选定后各自到达不同终点，两个终点的真实偏好都为 1。因此目标应当各占一半。可是中途的预测把 A 评为 9、B 评为 1：

| 两条互不相通的路线 | 目标概率 | 中途预测 | 局部拒绝后的概率 |
| :--- | :--- | :--- | :--- |
| A | 50% | 9 | 90% |
| B | 50% | 1 | 10% |

到终点时，两边的奖励都算对了，却都等于 1，后一步没有任何筛选差别。于是，**前面多给 A 的机会，不会因为终点打分正确而自动退回来**。

校正需要把 A 的相对权重乘以 $$1/9$$，B 乘以 $$1$$；两边加权质量都是 $$0.1$$，重新归一化才恢复各 $$50\%$$。也可以在最后以 $$1/9$$ 的概率接受 A、总是接受 B：补回概率，不需要复制别人的前缀。这组数字是教学例子，不是论文实验。

<aside class="blog-key-insight" aria-labelledby="independence-not-correctness" markdown="1">
<h4 id="independence-not-correctness">独立性解决“是不是同一家人”，校正解决“是不是走对了分布”</h4>

不复制其他路径，可以避免共同祖先；但近似价值仍可能把选择概率带偏。**需要补上的是沿途归一化留下的账，而不是再复制一群粒子**。

</aside>

<details class="blog-details" markdown="1">
<summary>把这笔账写成公式：局部精确，为什么全局仍可能有偏？</summary>

按本文记号，令

$$
G_k(x)=(P_kH_{k+1})(x),\qquad
Q_k^H(x,dy)=\frac{P_k(x,dy)H_{k+1}(y)}{G_k(x)}.
$$

有效包络下的局部拒绝能精确模拟 $$Q_k^H$$。但相对于最终目标 $$\Pi_n\propto\phi(X_n)P_n$$，整条路径仍有权重

$$
R_H=\phi(X_n)\frac{dP_n}{dQ^H}(X_{0:n})
=H_0(x_0)\prod_{k=0}^{n-1}\frac{G_k(X_k)}{H_k(X_k)}.
$$

精确 Doob 价值满足 $$G_k=H_k$$，这时权重为常数，局部采样就够了。近似价值一般留下依赖路径的乘积；如果这个乘积恰好为常数，也不需要校正。否则它就是漏掉的完整路径校正。[［2，§3、附录 C.3］](#ref_stein)

对于上面的两步例子，$$G_0=5$$，而 $$G_1(A)=G_1(B)=1$$，因此精确路径权重分别为 $$5/9$$ 和 $$5$$。省略两者共同的因子 5，就是正文中的 $$1/9$$ 与 $$1$$。

困难是 $$G_k$$ 本身是积分，通常不能精确计算。有限候选池的作用不仅是帮我们选下一步，还要提供可计算的校正信息。若起点随机，初始分布的因子也必须纳入分析，不能直接套用固定起点下的常数结论。[［2，Proposition 22］](#ref_stein)

</details>

### 显式 guidance 的另一笔成本：导数从哪里来？

另一条路是直接把漂移改成 $$b+a\nabla\log H$$，其中 $$a=\sigma\sigma^\top$$，再校正完整路径。**指路需要一阶导数；若通过 Bellman 或 PDE 残差计算校正，还会出现时间导数与二阶空间导数**。[［3，第 59 页］](#ref_slides)

为什么会多一阶？想比较“现在的预测”与“随机走一步以后的平均预测”，就必须考虑噪声怎样作用于曲率。一维、暂时忽略时间变化与漂移时，光滑条件下有

$$
\mathbb E[H(x+\sqrt h Z)]
=H(x)+\frac h2 H''(x)+o(h),\qquad Z\sim N(0,1).
$$

**坡顶和谷底的斜率都可以是零，但向两边随机走一步，前者平均变差，后者平均变好**。只看梯度分不出这件事，二阶导数才描述这种弯曲。完整的残差还要加上时间变化和基础漂移的作用。

<details class="blog-details" markdown="1">
<summary>残差校正的完整表达，以及不求 Hessian 的另一条路线</summary>

在固定起点、$$H_T=\phi$$、$$H>0$$ 足够光滑且换测度合法时，记基础生成元

$$
\mathcal L_t f=b_t\cdot\nabla f+\tfrac12\operatorname{tr}(a_t\nabla^2f).
$$

将连续时间 guidance 取为 $$a_t\nabla\log H_t$$，由 Itô 公式与 Girsanov 换测度，其路径校正可按本文记号整理成

$$
R_H=H_0(x_0)\exp\!\left(\int_0^T\mathcal E_t(X_t)\,dt\right),
\qquad
\mathcal E_t=\frac{(\partial_t+\mathcal L_t)H_t}{H_t}.
$$

因此，直接计算残差会用到 $$\partial_tH$$、$$\nabla H$$ 与 $$\nabla^2H$$。这与离散路径上留下的 $$\log(G_k/H_k)$$ 是对应的两种表达。[［2，§4、式 (11)］](#ref_stein)[［3，第 58 至 59 页］](#ref_slides)

**高阶导数并不是所有拒绝校正都必须付出的代价**。URGE 的 Girsanov 路径表达利用实际漂移和噪声，可以避开显式 Hessian 与 PDE 残差；但若漂移本身由 $$\nabla\log H$$ 构造，价值梯度仍要计算。这里区分的是计算同一类校正信息的不同路线。[［1，§2.2–2.4］](#ref_urge)

</details>

于是目标更明确了：**既不靠跨路径复制，也不要求价值完全准确，还希望引导和校正都只用函数值**。下一节先从最小的操作开始：向两边各试一次。

## 6. 热身：两个对称候选，就是有限差分

先把图像空间缩成一维。基础模型决定下一步的大致位置 $$\mu$$，我们向左右各试一点：

$$
Y^+=\mu+\delta,\qquad Y^-=\mu-\delta,\qquad \delta>0.
$$

如果右边价值是 11，左边是 9，按价值比例抽样，就有 55% 的机会选右边、45% 选左边。取 $$\delta=0.1$$，平均位移为 $$0.55\times0.1+0.45\times(-0.1)=0.01$$。

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/two_queries.svg"><img src="/images/blog/diffusion_urge_stein/two_queries.svg" alt="左右候选各距中心0.1，价值为9和11；中心差分斜率为10，按45%与55%选择，平均向右移动0.01。" width="960" height="820" loading="lazy"></a>
  <figcaption>图 4 · 两点有限差分变成了选择概率。数值为教学示例；实际每次只选一个候选，0.01 是平均位移。</figcaption>
</figure>

有限差分藏在哪里？两点相距 $$0.2$$，价值增加 $$2$$，所以斜率是 $$10$$。记 $$H^\pm=H(\mu\pm\delta)$$，平均位移有一个精确关系：

$$
\mathbb E[Y^J-\mu\mid\delta]
=\delta\frac{H^+-H^-}{H^++H^-}
=\delta^2\frac{(H^+-H^-)/(2\delta)}{(H^++H^-)/2}.
$$

也就是：**平均位移 = 步幅平方 × 中心差分斜率 ÷ 两侧平均价值**。在例子中，它等于 $$0.1^2\times10/10=0.01$$。

两点足够接近、$$H$$ 足够光滑时，这个表达接近 $$\delta^2H'(\mu)/H(\mu)=\delta^2(\log H)'(\mu)$$。之所以出现 $$\log H$$，是因为选择关心相对价值：把 11 和 9 同时乘以 100，概率不会变化。[［2，§3.1.1］](#ref_stein)

<details class="blog-details" markdown="1">
<summary>高维扩散里，为什么恢复了 Doob 引导漂移？</summary>

把方向换成高斯方向：$$\mu=x+hb(x)$$，$$\delta=\sqrt h\,\sigma Z$$，$$Z\sim N(0,I)$$。给定方向时，平均位移的主导项是 $$\delta\delta^\top\nabla\log H(\mu)$$。再利用 $$\mathbb E[ZZ^\top]=I$$，得到

$$
\mathbb E[Y^J\mid x]
=x+h[b(x)+\sigma\sigma^\top\nabla\log H(x)]+o(h).
$$

候选位移和选择概率的偏移都是 $$\sqrt h$$ 量级，相乘就形成 $$h$$ 量级的引导漂移。这个极限需要相应光滑性与可积性；它说明一阶平均漂移，不表示有限步的整个转移分布已经精确。[［2，式 (5)、附录 B.2.1］](#ref_stein)

</details>

执行时只有三件事：**构造候选、查询价值、按比例选一个**。梯度出现在解释中，不需要通过反向传播计算。

## 7. Stein 恒等式：把两点推广到 K 个并行候选

两个点揭示了方向信息。能否同时查询 $$K$$ 个方向，并仍然只用函数值？高斯 Stein 恒等式给出连接：

$$
\mathbb E[Zf(Z)]=\mathbb E[\nabla f(Z)],\qquad Z\sim N(0,I).
$$

左边只用函数值，右边是梯度的平均。直觉是：**哪个方向更常得到高价值，“随机方向 × 价值”的平均就偏向哪里**。对 $$Y=\mu+\sqrt h\,\sigma Z$$，它给出

$$
\mathbb E[ZH(Y)]=\sqrt h\,\sigma^\top\mathbb E[\nabla H(Y)].
$$

这在相应高斯分部积分条件下成立。[［2，§3.1.2、Proposition 6］](#ref_stein)

<aside class="blog-key-insight" aria-labelledby="stein-rejection-guidance" markdown="1">
<h4 id="stein-rejection-guidance">Stein 引理：无导数拒绝采样与梯度引导的等价联系</h4>

**按价值接受候选，不必计算价值梯度，却能在平均漂移上实现相应的梯度引导**。

从基础高斯候选 $$Y=\mu+\sqrt h\,\sigma Z$$ 出发。若有已知上界 $$0<H\le M$$，以 $$H(Y)/M$$ 的概率接受，拒绝后重新抽样。接受分布就是“基础转移概率 × 价值”归一化后的结果。

令 $$G_h(\mu)=\mathbb E[H(\mu+\sqrt h\,\sigma Z)]$$，Stein 恒等式给出

$$
\mathbb E[Y\mid\mathrm{accept}]
=\mu+h\sigma\sigma^\top\nabla_\mu\log G_h(\mu).
$$

**左边只按函数值筛选，右边显现梯度引导**。精确对应的是高斯平滑后的价值 $$G_h$$；小步长下，其对数梯度趋近于 $$\nabla\log H$$。

这里冻结 $$\sigma$$，并要求分部积分及求导与期望交换合法。等价性指平均漂移，不是说接受分布等于一个简单平移后的高斯。有限 $$K$$ 的候选选择还会留下归一化误差。[［2，式 (23)］](#ref_stein)

</aside>

### 保留对称性：让整组方向加起来为零

两点方法满足 $$Z_1+Z_2=0$$。推广到 $$K\ge2$$，先抽取独立标准高斯 $$G_i$$，减去平均，再恢复每个方向的方差：

$$
\bar G=\frac1K\sum_iG_i,\qquad
Z_i=\sqrt{\frac K{K-1}}(G_i-\bar G),\qquad
\sum_iZ_i=0.
$$

每个 $$Z_i$$ 单独看仍是标准高斯，池内则相互依赖。随后构造候选，**同时查询全部价值，再按价值比例随机选一个**：

$$
Y_i=\mu+\sqrt h\,\sigma Z_i,\qquad
H_i=H(Y_i),\qquad
\Pr(J=i\mid Y_{1:K})=\frac{H_i}{\sum_jH_j}.
$$

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centered_pool.svg"><img src="/images/blog/diffusion_urge_stein/centered_pool.svg" alt="两个反向候选推广为五个整体平衡的方向，向量和为零；并行查询价值，随机选出其中一个候选。" width="960" height="860" loading="lazy"></a>
  <figcaption>图 5 · 从双点对称到整组中心化。方向为教学示意；实际使用中心化高斯。红点表示本次选中的候选，不是加权均值。</figcaption>
</figure>

给定候选池 $$U$$，选择产生的平均位移恰好为

$$
\mathbb E[Y_J-\mu\mid U]
=\sqrt h\,\sigma\frac{\sum_iZ_iH_i}{\sum_iH_i}.
$$

这就是用有限次查询，替换理想价值倾斜中的期望。$$K=2$$ 时，$$Z_1=(G_1-G_2)/\sqrt2=-Z_2$$，恰好回到刚才的有限差分。构造也支持奇数 $$K$$，不必成对分组。[［2，式 (7)–(8)］](#ref_stein)

### 为什么中心化还帮助校正？

同一组查询做了两件事：**价值加权的方向告诉我们往哪走，平均价值告诉我们这一步怎样归一化**。

如果所有候选价值相同，零和方向让平均引导恰好为零。对于平均价值 $$S=K^{-1}\sum_iH(Y_i)$$，一阶波动也因 $$\sum_iZ_i=0$$ 消失，只留下由曲率控制的更小波动。在稿件的统一光滑性与正值界条件下，归一化平均值的方差由独立候选的 $$O(h/K)$$ 改善为 $$O(h^2/(K-1))$$。[［2，Remark 2、Assumption 3］](#ref_stein)

<details class="blog-details" markdown="1">
<summary>函数值估计无偏，为什么最后的引导仍可能有偏？</summary>

令 $$G=\mathbb E[H(Y)]$$。Stein 恒等式保证

$$
\widehat v=\frac1{K\sqrt h}\sum_iZ_iH(Y_i),\qquad
\mathbb E\widehat v=\sigma^\top\mathbb E\nabla H(Y),\qquad
\mathbb ES=G.
$$

但一般 $$\mathbb E[\widehat v/S]\ne\mathbb E[\widehat v]/\mathbb E[S]$$。分子和分母分别无偏，不代表比值无偏。因此，有限池近似和不精确价值造成的路径偏差，仍要用下一节的权重处理。[［2，Proposition 6、Theorem 11］](#ref_stein)

</details>

## 8. 生成完以后，再校正整条路径

第 5 节留下一个问题：理想局部归一化常数 $$G_k=P_kH_{k+1}$$ 不好算。有限候选池提供了一个出口：**不用精确求这个积分，保留同一批查询的平均值，也能构造正确的扩展空间权重**。[［2，§3.2、Theorem 12］](#ref_stein)

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{S_k}{H_{k+1}(X_{k+1})},\qquad
S_k=\frac1K\sum_{i=1}^K H_{k+1}(Y_{k,i}).
$$

这个权重同时处理近似价值与有限候选选择留下的偏差，无需额外价值查询或导数。注意：它的正确性来自包含候选池与选择编号的扩展空间构造，不是把 $$G_k$$ 随意替换成一个无偏估计就自动正确。

随后使用整条路径的独立提议 Metropolis–Hastings 更新。新旧路径权重分别为 $$R_{\mathrm{new}}$$ 与 $$R_{\mathrm{old}}$$，接受概率为

$$
\alpha=\min\{1,R_{\mathrm{new}}/R_{\mathrm{old}}\}.
$$

接受就换成新路径；拒绝就保留旧路径和旧权重。比较的是经过概率补偿的路径权重，不能直接换成终点奖励。[［2，Algorithm 2］](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/outer_mh.svg"><img src="/images/blog/diffusion_urge_stein/outer_mh.svg" alt="完整提议独立生成，按新旧路径权重依次进行MH更新，拒绝时保留旧路径与旧权重。" width="960" height="680" loading="lazy"></a>
  <figcaption>图 6 · 完整提议可以并行生成，接受与保留按顺序处理。图中权重与决定为教学示例。</figcaption>
</figure>

**独立的是提议路径，一条 MH 链相邻的输出仍然相关**。有限次更新也仍有初始化误差；若需要独立输出，应独立重复整套程序。已知有效全路径权重上界时，可另用完整路径拒绝采样获得独立的精确有限网格样本；这里主要讨论固定计算预算的外层 MH。[［2，Algorithm 2、附录 G.2］](#ref_stein)

<details class="blog-details" markdown="1">
<summary>为什么这个权重有效？关键是一次精确消去</summary>

给定候选池，$$S=K^{-1}\sum_iH(Y_i)$$，选择概率是 $$H(Y_i)/(KS)$$。因此

$$
\mathbb E\!\left[\frac S{H(Y_J)}f(Y_J)\mid U\right]
=\sum_i\frac{H(Y_i)}{KS}\frac S{H(Y_i)}f(Y_i)
=\frac1K\sum_i f(Y_i).
$$

再对候选池取平均，每个候选都有正确的基础转移边际，右边便恢复基础转移。沿时间重复、最后乘上 $$\phi(X_n)$$，得到

$$
\mathbb E_{\widetilde Q}[RF(X_{0:n})]
=\mathbb E_{P_n}[\phi(X_n)F(X_{0:n})].
$$

所以，这不是仅仅对“平均漂移”作校正，而是恢复正确的加权路径目标。相应 MH 的目标是不变分布，有限时间的接近程度还需要收敛分析。[［2，Theorem 12］](#ref_stein)

</details>

## 9. 更多去噪步，能否不再强迫我们堆更多路径？

固定总时间 $$T$$，步长 $$h=T/n$$。中心化候选每步的归一化方差是 $$O(h^2/(K-1))$$，累积 $$n$$ 步，对应的量级是

$$
\frac{nh^2}{K-1}=\frac{Th}{K-1}.
$$

网格越细，这部分池噪声反而越小。但近似价值的 Bellman 误差是另一项，扩大候选池不能自动消除它。[［2，§4］](#ref_stein)

在固定起点、$$H_n=\phi$$、统一正值上下界、二阶空间导数和噪声系数有界等条件下，论文证明：**达到给定有限网格采样精度所需的完整提议数量，可以不随去噪深度增长**。常数可以依赖维数与价值函数的界，并不声称维数无关。[［2，Theorem 4］](#ref_stein)

这不意味着加深免费。$$m$$ 次外层更新加一次初始化，共用 $$m+1$$ 条完整提议，价值查询数仍是 $$Kn(m+1)$$。解决的是“每条路变长后，是否还被迫增加路的数量”，不是免去走更长路径的成本。

<details class="blog-details" markdown="1">
<summary>固定每条路径的查询预算，两个候选是否已经够好？</summary>

若单条提议预算 $$B=Kn$$ 固定，则

$$
\frac{Th}{K-1}=\frac{T^2}{B}\frac K{K-1}.
$$

对 $$K\ge2$$，最后的因子介于 1 和 2 之间。仅从池噪声项看，两点已经获得相同的预算阶；更多候选可以增加并行度，但也减少预算内可走的步数，不能据此断言总误差一定更小。[［2，§4］](#ref_stein)

这些结论针对离散模型的目标分布；它与连续时间扩散目标之间的数值误差需要单独分析。数值误差、价值近似误差和有限计算下的采样误差，应当分开记账。

</details>

## 10. 实验：先看 URGE，再看 Stein

<h3 id="urge-experiments">URGE：先在“知道正确答案”的分布上检验</h3>

URGE 使用 30 维、40 个分量的高斯混合模型。加入二次奖励后，目标仍有解析表达，因而能直接检查分布是否采对。下表节选原论文 Table 2；两种方法均使用引导 $$G=r$$ 与重采样。[［1，§4.1、Table 2］](#ref_urge)

| 方法 | MMD ↓ | SWD ↓ | 均值误差 ↓ | 协方差误差 ↓ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.07 | 0.85 | 4.86 | 198.20 |
| URGE | 0.06 | 0.62 | 3.20 | 181.31 |

四项都是越小越好。MMD 与 SWD 衡量分布差异，均值和协方差误差分别看点云的中心与散开方式。**这组实验中，URGE 的分布更接近目标：SWD 从 0.85 降到 0.62，均值误差从 4.86 降到 3.20**。它支持校正有效，但有限样本误差更小不等于实验已经证明精确采样。

<details class="blog-details" markdown="1">
<summary>这组实验怎样运行？</summary>

使用 8192 个粒子、500 个离散步，ESS 低于粒子数的 80% 时重采样。URGE 在原表中报告 5 个随机种子的平均结果。SWD 可以理解为从许多方向投影高维点云，再比较一维分布。[［1，Table 2、附录 C］](#ref_urge)

</details>

### URGE：相同粒子数下，图像有什么变化？

文生图实验在 50 个提示词、每个 3 个随机种子上比较。下面节选原论文 Table 4 中均使用 4 个粒子的三种方法；指标均越大越好。[［1，§4.3、Table 4］](#ref_urge)

| 方法，均为 4 个粒子 | CLIP ↑ | HPS ↑ | ImageReward ↑ | GenEval ↑ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.2901 | 0.2849 | 0.8397 | 0.7200 |
| FK Steering 加梯度引导 | 0.2899 | 0.2839 | 0.7906 | 0.7467 |
| URGE | 0.2997 | 0.2927 | 0.9955 | 0.7800 |

CLIP 衡量图文语义匹配，HPS 和 ImageReward 是学习得到的偏好评分，GenEval 检查物体等提示条件。相对于 FK Steering，URGE 的 **ImageReward 从 0.8397 提高到 0.9955，GenEval 从 0.7200 提高到 0.7800**。相同粒子数不意味着实测运行时间相同。

<details class="blog-details" markdown="1">
<summary>文生图的采样设置与比较范围</summary>

上述评测使用 100 步 DDIM，噪声参数为 1，CFG 强度为 7.5，每隔 20 步重采样。[［1，附录 C］](#ref_urge)

下面的粒子扩展图在 10 个提示词上比较 SD v1.5 与 SDXL，不与上表 50 个提示词的汇总数值直接对齐。在测试的 $$N=2,3,4,6,8$$ 下，URGE 的 ImageReward 持续上升，多数配置高于 FK Steering；SD v1.5 的 $$N=2$$ 和 SDXL 的 $$N=6$$ 是例外。这是给定实验里的趋势，不是所有任务上的单调性保证。[［1，Figure 3］](#ref_urge)

</details>

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp"><img src="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp" alt="URGE原论文Figure 3：SD v1.5和SDXL随粒子数增加的ImageReward，URGE在测试范围内持续提升，但不是每个配置都高于FK Steering。" width="1400" height="500" loading="lazy"></a>
  <figcaption>图 7 · 更多粒子带来的实际收益。URGE 原论文 Figure 3，保留原图坐标、图例与基准线；评测使用 10 个提示词。</figcaption>
</figure>

分数对应怎样的视觉变化？图 8 选出“牙刷与单板滑雪板”和“马与长颈鹿”。重点看：**两个物体是否同时出现，还是被混成了一个物体**？[［1，Table 5］](#ref_urge)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_image_examples.webp"><img src="/images/blog/diffusion_urge_stein/urge_image_examples.webp" alt="两组双物体提示词，对比基础SD v1.5、四粒子FK Steering和四粒子URGE。" width="1680" height="1610" loading="lazy"></a>
  <figcaption>图 8 · URGE 原论文 Table 5 节选。六张生成图片未改动，仅重新排版并添加中文标签。FK Steering 与 URGE 均为 4 个粒子；个别例子应结合汇总指标阅读。原图按 CC BY 4.0 使用。</figcaption>
</figure>

### Stein：两个中心化候选能省下多少查询？

Stein 稿件的布朗运动实验比较中心化候选与独立候选，指标 adjusted NESS 衡量归一化常数估计效率，不是图像质量。[［2，§5.1］](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centering_experiment.webp"><img src="/images/blog/diffusion_urge_stein/centering_experiment.webp" alt="中心化两个候选随网格变细效率提高；独立候选需要远大的池才能达到相近的归一化常数估计效率。" width="1032" height="429" loading="lazy"></a>
  <figcaption>图 9 · Stein 稿件 Figure 2。左图固定两个候选，右图增加独立候选数。该指标不等于 MH 独立样本数。</figcaption>
</figure>

受扰动价值、$$n=192$$ 时，**两个中心化候选达到 92.76%，两个独立候选只有 31.40%**。独立候选增至 128 和 256，才分别达到 92.38% 和 92.81%。这说明在该设置中，安排好候选之间的关系，比单纯堆数量更能稳定权重。[［2，§5.1］](#ref_stein)

### Stein：完整路径校正贡献了什么？

Hopper 实验固定扩散策略与 critic，检查动作的 critic 分数分布是否接近目标。三个目标分别把 30%、60%、80% 的概率放到原策略分数最高的 10% 动作中。KS 距离衡量分数累积分布的最大差距，越小越好。[［2，§5.2］](#ref_stein)

| 目标强度 | 两点引导，未做外层校正 | 使用 32 条完整提议校正 |
| :--- | :--- | :--- |
| 30% | 0.2174 | 0.0306 |
| 60% | 0.2804 | 0.0697 |
| 80% | 0.4041 | 0.1128 |

表中是八个固定状态的平均条件 KS。**指路已经有用，但完整路径校正仍大幅改善目标分布的匹配**。这里测量的是固定 critic 的分数分布，不能直接解释为机器人实际回报提高了同样比例。[［2，Table 2、附录 H.3］](#ref_stein)

最后回到书和电脑。图 10 在同一个 SD v1.5 骨干上展示四组双物体提示词。观察它们是否同时出现、保持独立，而不是只看一张图是否漂亮。[［2，§5.3］](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/image_examples.webp"><img src="/images/blog/diffusion_urge_stein/image_examples.webp" alt="Stein论文双物体生成示例，对比FK Steering、SVDD、URGE以及两个和四个候选的Stein方法。" width="1110" height="1200" loading="lazy"></a>
  <figcaption>图 10 · Stein 稿件 Table 3。Stein 每张图使用 11 条完整提议，图中粒子方法使用 4 个粒子；这是定性示例，不是严格等算力的全面排名。</figcaption>
</figure>

## 11. 把三件事分开，算法就清楚了

**引导**让计算更常走向有希望的区域；**独立提议**避免跨路径复制带来的共同祖先；**路径校正**补偿不精确判断造成的概率偏差。它们解决的是三个不同问题。

URGE 说明，记录路径就能更方便地算清校正的账。Stein Guidance 再往前一步：两个对称候选提供有限差分，中心化的 $$K$$ 个候选提供并行的 Stein 引导，而同一批函数值同时给出完整路径的校正权重。

**不用价值导数，不等于没有方向；不复制祖先，也不等于可以不校正**。把这些分工明确下来，才知道多出的计算究竟改善了什么。

## 参考文献与图示来源

<p id="ref_urge"><strong>［1］URGE。</strong>Chenyang Wang, Weizhong Wang, Yinuo Ren, Jose Blanchet, Yiping Lu. <em>Simple Approximation and Derivative Free Inference Time Scaling for Diffusion Models via Sequential Monte Carlo on Path Measures.</em> ICML 2026。<a href="https://proceedings.mlr.press/v306/wang26ih.html">正式论文页面</a> · <a href="https://arxiv.org/abs/2605.17850">arXiv</a> · <a href="https://arxiv.org/html/2605.17850v1">HTML 全文</a>。</p>

<p id="ref_stein"><strong>［2］Stein Guidance。</strong><em>Stein Guidance without Gradients: Discretization Uniform Diffusion Inference Time Scaling beyond Particle SMC.</em> 2026 年研究稿。本文依据该稿的 §1 至 §5、Theorem 1、Theorem 4、Proposition 6、Theorem 11、Theorem 12、Proposition 22，以及附录 E、G、H。理论结论与实验数值按本文所依据的稿件版本表述。</p>

<p id="ref_slides"><strong>［3］讨论班幻灯片。</strong>陆一平，<em>Diffusion Overview</em>，第 57 至 59 页：逐条路径拒绝采样、近似价值的路径校正，以及用 Stein 恒等式替代导数计算。图 3 提取自第 57 页原始矢量图，仅截取机制图区域并替换为浏览器通用字体。</p>

图 1、2、4、5、6 为教学示意图；图 3 来自上述幻灯片。图 7、8 分别来自 URGE 原论文 Figure 3、Table 5，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 使用，图 8 仅作选图、排版与中文标签处理。图 9、10 摘自 Stein 稿件 Figure 2、Table 3。两条路线、候选价值、接受概率及 MH 决定的数值例子均用于教学，实验数值在相应段落注明出处。
