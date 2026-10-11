---
title: "让扩散模型多想一会儿：从 URGE 到无导数 Stein Guidance"
date: 2026-10-11 14:00:00 +0800
description: "从共同祖先到独立拒绝，从近似价值的偏差到完整路径校正，再用两点有限差分和 Stein 恒等式理解无导数引导。"
tags: ["扩散模型", "推理时计算", "URGE", "Stein Guidance"]
title_en: "Let Diffusion Models Think Longer: From URGE to Stein Guidance without Gradients"
description_en: "From shared ancestry to independent rejection, from imperfect values to path correction: finite differences and Stein’s identity explain guidance using only function values."
tags_en: ["Diffusion models", "Inference time computation", "URGE", "Stein Guidance"]
content_en: blogs/diffusion-urge-stein.en.md
lang: zh-CN
permalink: /blog/diffusion-urge-stein/
---

输入“一本书和一台笔记本电脑”，模型画出了一台电脑，却忘了书。再试一次，书出现了，电脑又不见了。**既然模型偶尔能画对，能不能多花一些生成时的计算，让它更经常画对**？

最直接的办法是多生成几张，最后挑一张。更主动的办法是：图像还没画完，就判断哪些方向更有希望，把后续计算放在那里。

但中途的判断可能不准；很多条生成路径，也可能在反复筛选后变成同一个祖先的后代。我们既希望计算用得更有效，也希望最后的概率分布没有被错误判断带偏。

这篇博客沿着一条线展开：**URGE 用路径信息校正引导；独立拒绝避开共同祖先；Stein Guidance 则让引导和校正都只依赖函数值**。这里的“无导数”指不必对价值函数求导，基础去噪模型仍照常运行。[[1]](#ref_urge)[[2]](#ref_stein)

## 1. 多算一点，究竟想得到什么？

把扩散模型想成一个随机的绘画过程：从噪声出发，逐步去噪，最后生成图像。本文沿生成方向记时间，$$0$$ 是开始，$$T$$ 是完成。训练好的模型对应基础分布 $$p_{\mathrm{base}}$$。

给成品一个分数 $$r(x)$$，再把它变成正的偏好权重 $$\phi(x)=e^{\beta r(x)}$$，就得到我们希望采样的分布：

$$
\pi(x)=\frac{p_{\mathrm{base}}(x)\phi(x)}
{\mathbb E_{p_{\mathrm{base}}}[\phi(X)]}.
$$

它保留模型原本的生成偏好，同时提高高分结果的相对概率。$$\beta$$ 控制偏好强度。[[1, §2.1]](#ref_urge)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/target.svg"><img src="/images/blog/diffusion_urge_stein/target.svg" alt="基础分布中只有书占80%，书与电脑同时出现占20%；分别乘以1和4的偏好后，两类归一化概率各为50%。" width="960" height="650"></a>
  <figcaption>图 1 · 偏好怎样改变概率：基础模型生成“只有书”和“书与电脑”的概率为 80% 与 20%，分别乘以 1 与 4 后，两类加权质量相同，归一化后各占 50%。数值用于说明目标分布的构造。配图均可点击放大。</figcaption>
</figure>

这个采样目标与“找到最高分的一张图”有关，但并不相同。例如，独立生成多张后取最高分，一般不会得到上面的 $$\pi$$。下面的“校正正确”，都针对这个明确的分布目标。

增加计算也有三种不同方式：**更多去噪步 $$n$$，更多生成路径 $$N$$，或者每一步更多候选 $$K$$**。它们分别增加数值深度、统计宽度和局部查询量，不能混成一个“采样次数”。[[2, §1]](#ref_stein)

## 2. 想知道下一步怎么走，先问它的未来

半成品还很模糊，直接问“现在像不像一本书”，未必能判断最后画得好不好。更合理的问题是：**从这个状态继续生成，最终偏好权重的平均值是多少**？

$$
H_t^\star(x)=\mathbb E[\phi(X_T)\mid X_t=x].
$$

这个价值函数把未来的可能性都考虑进来。如果它精确已知，下一步就可以按照“基础转移概率 × 下一步的价值”抽样。在连续时间里，相应的引导漂移是 $$\sigma\sigma^\top\nabla\log H_t^\star$$，也就是 Doob 变换。[[1, §1]](#ref_urge)[[2, §3]](#ref_stein)

困难在于：$$H^\star$$ 本身就包含一个高维积分。实践中通常只能得到近似价值 $$H$$，例如先预测最终图像，再对预测结果打分。

因此，需要把两件事分开：**近似价值负责指路，校正机制负责处理指错路造成的概率偏差**。判断越好，校正通常越容易，但正确性不能建立在每次判断都准确之上。

## 3. URGE：把整条生成路径的账算清楚

引导改变了模型的走法。同一个终点可以从许多不同路径到达，因此很难直接计算引导后的终点密度。URGE 的切入点是：**保留实际走过的路径，对这条路径计算概率比**。[[1, §2.3]](#ref_urge)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/path_weight.svg"><img src="/images/blog/diffusion_urge_stein/path_weight.svg" alt="两条不同路径到达同一个终点，沿途基础转移与实际提议的概率比可以不同。" width="960" height="660" loading="lazy"></a>
  <figcaption>图 2 · 两条路径到达同一个终点，沿途的基础转移概率与提议概率之比却可以不同。路径权重把这些比值相乘，再乘终点偏好，补偿 guidance 对整条路的抽样概率所作的改变。曲线高度不代表图像质量。</figcaption>
</figure>

离散时间里，设基础转移密度是 $$P_k$$，实际提议密度是 $$Q_k$$，二者使用相同的初始分布，并满足概率比所需的支持条件。对实际生成的路径记录

$$
R=\phi(X_n)\prod_{k=0}^{n-1}
\frac{P_k(X_k,X_{k+1})}{Q_k(X_k,X_{k+1})}.
$$

**被引导抽得过于频繁的路径，权重要压下来；被抽得太少的路径，权重要补上去**。最终偏好告诉我们想要什么，概率比补偿实际怎样抽样。

连续时间里对应 Girsanov 换测度。URGE 利用模拟时的漂移与随机增量计算路径权重，并在生成过程中重加权、重采样。把短路径权重按当前终点作条件平均，再取短时间极限，还能联系到粒子层面的校正势。[[1, §2.3、Theorem 3.3]](#ref_urge)

这里有一个重要区分：URGE 的路径权重避免了额外的 Hessian、score 或 PDE 残差计算；若引导本身写成 $$\nabla G$$，构造漂移仍需要这部分信息。**“校正不额外求高阶导数”与“引导也只用函数值”是两个层次**。后面的 Stein Guidance 要把它们接起来。有限粒子的结果也仍有采样误差，一致性结论有相应极限条件。[[1, Algorithm 1、Theorem 3.1]](#ref_urge)

## 4. 多条路径，可能已经变成一家人

SMC 不断复制高权重粒子，淘汰低权重粒子。复制的并不只是一个分数，而是粒子当前的状态，以及通向这个状态的整段历史。**所以，屏幕上还剩多少粒子，与它们保留了多少份独立的早期探索，是两件事。**

想象四个人各自解题，每隔一会儿，都按评分挑一份草稿接着写。几轮以后，桌上仍有四份答卷，却可能都源自同一份早期草稿。后面写得再不一样，最初的关键选择也已经被一起继承了。

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/genealogy.svg"><img src="/images/blog/diffusion_urge_stein/genealogy.svg" alt="左侧四个祖先 A、B、C、D 经两轮复制后只剩 A 的后代，但每一列仍有四个粒子；右侧四条完整提议分别使用独立随机性。" width="960" height="670" loading="lazy"></a>
  <figcaption>图 3 · 粒子数保持为四，祖先家族却从四个减到两个，再减到一个。左侧字母和颜色标记早期祖先，连线表示继承关系；右侧每条完整提议各自生成，没有跨路径复制。左侧后代可以继续加入独立噪声，但共享前缀的随机性已经进入每个后代。</figcaption>
</figure>

沿左图看：第一轮只保留 A、C 的后代，B、D 的早期探索消失；第二轮只留下 A 家族。此时的四个粒子可以位于不同位置，却都受同一段早期随机历史影响。右图则让四次完整生成各用各的随机数，保留四份独立的探索机会。

一个简化例子能说明这为什么影响统计精度。假设最终结果可写成 $$X_T^{(i)}=A+\varepsilon_i$$：$$A$$ 是大家继承的随机前缀，后续噪声 $$\varepsilon_i$$ 相互独立、同分布，并且独立于 $$A$$。平均 $$N$$ 个后代后，

$$
\operatorname{Var}\!\left(\frac1N\sum_{i=1}^N X_T^{(i)}\right)
=\operatorname{Var}(A)+\frac{\operatorname{Var}(\varepsilon_1)}N.
$$

**后半程的独立噪声可以靠平均降低，大家共同继承的早期误差却不会被这次平均消掉。** 这是一个解释相关性的教学模型，不是所有扩散过程都具有这种加法形式。

ESS 只看当前权重是否均匀。重采样后权重通常重新设为相等，因此即使四个粒子全是 A 家族，也可以有 $$\mathrm{ESS}=N$$。它没有记录家谱，不能据此认定粒子独立。增加去噪步若也增加重采样次数，就可能带来更多祖先合并的机会。[[2, §1、附录 E]](#ref_stein)

<details class="blog-details" markdown="1">
<summary>一个严格的反例：每步重采样，误差可能随深度累积</summary>

文献 [[2]](#ref_stein) 构造了一个布朗运动例子：终点目标固定，局部 Bellman 误差为 $$O(1/n)$$；若每个数值步都做完整的多项分布重采样，一个最终粒子的分布满足

$$
\left\|\nu_{n,N}^{\mathrm{SMC}}-\pi\right\|_{\mathrm{TV}}
\asymp\frac nN,\qquad 2\le n\le N.
$$

这里的总变差距离衡量两个分布对同一事件给出的概率最多能差多少。这个结果针对论文构造的模型和每步完整重采样，不能外推为所有 SMC 的下界，也不排除稀疏或自适应重采样的价值。[[2, Theorem 1]](#ref_stein)

</details>

<h2 id="sequential-rejection">5. 不复制别人的路径，为什么仍要校正？</h2>

### 拒绝这一步，保留自己的草稿

一个自然的替代是**逐步拒绝采样（sequential rejection sampling）**：从当前状态试走一步，按候选价值决定接受还是拒绝。拒绝后保留自己的前缀，只重新尝试这一步，而不是复制另一个人的历史。

若有已知有效上界 $$0<H_{k+1}(y)\le M_k(x)$$，就从基础转移 $$P_k(x,\cdot)$$ 抽取候选 $$Y$$，以 $$H_{k+1}(Y)/M_k(x)$$ 的概率接受，重复到接受后再前进。**独立重跑整套路径生成程序，各条路径就没有跨路径的共同祖先**。这是下图右侧的机制。

<figure class="blog-figure">
  <div style="display:flex;flex-wrap:wrap;gap:0.8rem;">
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="放大查看：SMC 复制父粒子"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" alt="左侧：SMC跨路径复制父粒子，后代共享历史。" width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;"></a>
    <a href="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" style="flex:1 1 18rem;min-width:0;overflow:hidden;aspect-ratio:205/102;" aria-label="放大查看：只重试自己的下一步"><img src="/images/blog/diffusion_urge_stein/ppt_child_rejection.svg" alt="右侧：拒绝后保留当前前缀，只重试这一步。" width="1230" height="306" loading="lazy" style="width:200%;max-width:none;margin:0;border:0;border-radius:0;transform:translateX(-50%);"></a>
  </div>
  <figcaption>图 4 · 两种筛选方式如何处理失败的尝试。左侧 SMC 可以复制其他粒子的前缀，使多个后代继承相同历史；右侧拒绝后保留自己的当前状态，只重新尝试下一步。独立重复右侧程序不会产生跨路径的共同祖先，但一条路径内部的各步仍然相关。</figcaption>
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

**中间判断像暂记的账：前一步记上，后一步扣回**。因此，中间价值不必等于真实未来价值，正确的未归一化目标仍由终点偏好决定。这里说的是权重构造的恒等式，不是有限粒子的 SMC 已经精确。[[2, 附录 E.2]](#ref_stein)

只做局部拒绝则不同。每一步都把候选价值重新归一化成概率，分母是“从当前状态出发，下一步价值的真实平均”，不一定等于当前的近似预测。**相邻的价值项仍能相消，但预测与实际平均不一致留下的比值，通常消不掉**。[[2, §3、式 (10)–(11)]](#ref_stein)

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

精确 Doob 价值满足 $$G_k=H_k$$，这时权重为常数，局部采样就够了。近似价值一般留下依赖路径的乘积；如果这个乘积恰好为常数，也不需要校正。否则它就是漏掉的完整路径校正。[[2, §3、附录 C.3]](#ref_stein)

对于上面的两步例子，$$G_0=5$$，而 $$G_1(A)=G_1(B)=1$$，因此精确路径权重分别为 $$5/9$$ 和 $$5$$。省略两者共同的因子 5，就是正文中的 $$1/9$$ 与 $$1$$。

困难是 $$G_k$$ 本身是积分，通常不能精确计算。有限候选池的作用不仅是帮我们选下一步，还要提供可计算的校正信息。若起点随机，初始分布的因子也必须纳入分析，不能直接套用固定起点下的常数结论。[[2, Proposition 22]](#ref_stein)

</details>

### 显式 guidance 的另一笔成本：为什么校正会碰到二阶导数？

先看指路。把漂移改为 $$b+a\nabla\log H$$，其中 $$a=\sigma\sigma^\top$$，只需知道价值在当前位置往哪个方向上升，因此要算一阶导数。可是 $$H$$ 是近似的；走完整条路径以后，我们还要知道：**这些中途判断累计把抽样概率改偏了多少，最后该以多大权重保留这条路径？**

上一段的离散校正已经给出了线索：每一步留下 $$G_k/H_k$$，其中 $$G_k=P_kH_{k+1}$$。分子是“按基础动力学走一步后，下一时刻价值的真实平均”，分母是“当前位置对未来的预测”。精确价值让两者一致；近似价值留下的差，就是要沿途累计的 Bellman 缺陷。

**为什么算这个平均会遇到二阶导数？** 随机步既可能向左，也可能向右。向两边的一阶变化在平均时抵消，但两边共同向上或向下弯的部分会留下。暂时忽略时间与漂移，一维 Taylor 展开是

$$
H(x+\sqrt h Z)
=H(x)+\sqrt h\,H'(x)Z+\frac h2 H''(x)Z^2+\cdots,
\qquad Z\sim N(0,1).
$$

由于 $$\mathbb EZ=0$$、$$\mathbb EZ^2=1$$，在相应光滑性与可积性条件下，

$$
\mathbb E[H(x+\sqrt h Z)]-H(x)
=\frac h2 H''(x)+o(h).
$$

例如 $$H_+(x)=e^{cx^2}$$ 与 $$H_-(x)=e^{-cx^2}$$，其中 $$c>0$$。在 $$x=0$$，它们的价值都为 1，梯度都为 0，因而给出同样的瞬时引导；但前者是谷底，后者是坡顶。随机走一小步，平均价值分别变为 $$1+ch+O(h^2)$$ 与 $$1-ch+O(h^2)$$。**相同的价值和梯度，需要方向相反的局部概率补偿；缺失的信息就在曲率里。**

把时间变化、基础漂移和多维噪声一起放回去，每单位时间的相对缺陷就是

$$
\mathcal E_t(x)
=\frac{\partial_tH_t+b_t\cdot\nabla H_t
+\tfrac12\operatorname{tr}(a_t\nabla^2H_t)}{H_t}(x).
$$

三项分别记录价值随时间的变化、基础漂移造成的变化，以及噪声遇到曲率时造成的平均变化。最后一项是 Hessian 与噪声协方差的收缩；未必需要显式存储整个 Hessian，但仍需二阶空间导数信息。

**这与最后的接受或拒绝有什么关系？** 在固定起点、$$H_T=\phi$$、正且足够光滑的 $$H$$ 以及合法换测度等条件下，对漂移为 $$b+a\nabla\log H$$ 的连续时间提议，完整路径的未归一化校正权重满足

$$
R_H=H_0(x_0)\exp\!\left(\int_0^T\mathcal E_t(X_t)\,dt\right).
$$

终点偏好已经通过 $$H_T=\phi$$ 进入这个恒等式。剩下的指数项累积整条路上的概率补偿，最终进入新旧路径的 MH 权重比；若另有有效权重上界，也可以据此做完整路径拒绝采样。**接受概率的公式很简单，困难在于把其中的路径权重算出来。沿残差这条路线，梯度负责 guidance，时间导数与二阶空间导数参与 correction。** 离散时对应上一段的 $$\log(G_k/H_k)$$ 累积。[[2, §4、式 (11)]](#ref_stein)

<details class="blog-details" markdown="1">
<summary>为什么 URGE 又能避开显式 Hessian？</summary>

上式把路径概率比整理成了价值函数的残差。URGE 保留实际漂移与噪声增量，直接用 Girsanov 路径比计算校正，因此可以绕开显式时间导数和 Hessian。若漂移本身采用 $$\nabla\log H$$，构造提议仍要计算价值梯度。**高阶导数是直接计算残差的成本，并不是所有校正方法都不可避免的成本。** [[1, §2.2–2.4]](#ref_urge)

连续时间的恒等式也不意味着任意离散实现自动精确。实际算法必须使用与其离散提议匹配的校正权重。

</details>

现在要设计的是一对配套机制：**用函数值把路径引向好区域，同时留下可以用函数值算清的概率账本。** 下一节从两个对称候选开始，看看这两件事怎样共用同一批查询。

## 6. 热身：两个对称候选，就是有限差分

先把图像空间缩成一维。基础模型决定下一步的大致位置 $$\mu$$，我们向左右各试一点：

$$
Y^+=\mu+\delta,\qquad Y^-=\mu-\delta,\qquad \delta>0.
$$

如果右边价值是 11，左边是 9，按价值比例抽样，就有 55% 的机会选右边、45% 选左边。取 $$\delta=0.1$$，平均位移为 $$0.55\times0.1+0.45\times(-0.1)=0.01$$。

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/two_queries.svg"><img src="/images/blog/diffusion_urge_stein/two_queries.svg" alt="左右候选各距中心0.1，价值为9和11；中心差分斜率为10，按45%与55%选择，平均向右移动0.01。" width="960" height="820" loading="lazy"></a>
  <figcaption>图 5 · 两侧候选的价值为 9 和 11，按比例选择就得到 45% 与 55% 的概率。每次实际只移动到一个候选，但重复抽样后的平均位移是向右 0.01；这个方向来自两点价值差，无需计算价值梯度。数值为教学示例。</figcaption>
</figure>

有限差分藏在哪里？两点相距 $$0.2$$，价值增加 $$2$$，所以斜率是 $$10$$。记 $$H^\pm=H(\mu\pm\delta)$$，平均位移有一个精确关系：

$$
\mathbb E[Y^J-\mu\mid\delta]
=\delta\frac{H^+-H^-}{H^++H^-}
=\delta^2\frac{(H^+-H^-)/(2\delta)}{(H^++H^-)/2}.
$$

也就是：**平均位移 = 步幅平方 × 中心差分斜率 ÷ 两侧平均价值**。在例子中，它等于 $$0.1^2\times10/10=0.01$$。

两点足够接近、$$H$$ 足够光滑时，这个表达接近 $$\delta^2H'(\mu)/H(\mu)=\delta^2(\log H)'(\mu)$$。之所以出现 $$\log H$$，是因为选择关心相对价值：把 11 和 9 同时乘以 100，概率不会变化。[[2, §3.1.1]](#ref_stein)

<details class="blog-details" markdown="1">
<summary>高维扩散里，为什么恢复了 Doob 引导漂移？</summary>

把方向换成高斯方向：$$\mu=x+hb(x)$$，$$\delta=\sqrt h\,\sigma Z$$，$$Z\sim N(0,I)$$。给定方向时，平均位移的主导项是 $$\delta\delta^\top\nabla\log H(\mu)$$。再利用 $$\mathbb E[ZZ^\top]=I$$，得到

$$
\mathbb E[Y^J\mid x]
=x+h[b(x)+\sigma\sigma^\top\nabla\log H(x)]+o(h).
$$

候选位移和选择概率的偏移都是 $$\sqrt h$$ 量级，相乘就形成 $$h$$ 量级的引导漂移。这个极限需要相应光滑性与可积性；它说明一阶平均漂移，不表示有限步的整个转移分布已经精确。[[2, 式 (5)、附录 B.2.1]](#ref_stein)

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

这在相应高斯分部积分条件下成立。[[2, §3.1.2、Proposition 6]](#ref_stein)

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

这里冻结 $$\sigma$$，并要求分部积分及求导与期望交换合法。等价性指平均漂移，不是说接受分布等于一个简单平移后的高斯。有限 $$K$$ 的候选选择还会留下归一化误差。[[2, 式 (23)]](#ref_stein)

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
  <figcaption>图 6 · 从两个反向候选推广到五个整体平衡的候选：方向之和为零，各候选的价值可以并行查询，再按价值比例随机选出一个。红点是本次选中的候选；中心化还会抵消价值平均中的一阶噪声，使校正所用的归一化估计更稳定。箭头表示几何关系，实际方向由中心化高斯生成。</figcaption>
</figure>

给定候选池 $$U$$，选择产生的平均位移恰好为

$$
\mathbb E[Y_J-\mu\mid U]
=\sqrt h\,\sigma\frac{\sum_iZ_iH_i}{\sum_iH_i}.
$$

这就是用有限次查询，替换理想价值倾斜中的期望。$$K=2$$ 时，$$Z_1=(G_1-G_2)/\sqrt2=-Z_2$$，恰好回到刚才的有限差分。构造也支持奇数 $$K$$，不必成对分组。[[2, 式 (7)–(8)]](#ref_stein)

### 为什么中心化还帮助校正？

同一组查询做了两件事：**价值加权的方向告诉我们往哪走，平均价值告诉我们这一步怎样归一化**。

如果所有候选价值相同，零和方向让平均引导恰好为零。对于平均价值 $$S=K^{-1}\sum_iH(Y_i)$$，一阶波动也因 $$\sum_iZ_i=0$$ 消失，只留下由曲率控制的更小波动。在文献 [[2]](#ref_stein) 的统一光滑性与正值界条件下，归一化平均值的方差由独立候选的 $$O(h/K)$$ 改善为 $$O(h^2/(K-1))$$。[[2, Remark 2、Assumption 3]](#ref_stein)

<details class="blog-details" markdown="1">
<summary>函数值估计无偏，为什么最后的引导仍可能有偏？</summary>

令 $$G=\mathbb E[H(Y)]$$。Stein 恒等式保证

$$
\widehat v=\frac1{K\sqrt h}\sum_iZ_iH(Y_i),\qquad
\mathbb E\widehat v=\sigma^\top\mathbb E\nabla H(Y),\qquad
\mathbb ES=G.
$$

但一般 $$\mathbb E[\widehat v/S]\ne\mathbb E[\widehat v]/\mathbb E[S]$$。分子和分母分别无偏，不代表比值无偏。因此，有限池近似和不精确价值造成的路径偏差，仍要用下一节的权重处理。[[2, Proposition 6、Theorem 11]](#ref_stein)

</details>

## 8. 生成完以后，再校正整条路径

第 5 节留下一个问题：理想局部归一化常数 $$G_k=P_kH_{k+1}$$ 不好算。有限候选池提供了一个出口：**不用精确求这个积分，保留同一批查询的平均值，也能构造正确的扩展空间权重**。[[2, §3.2、Theorem 12]](#ref_stein)

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

接受就换成新路径；拒绝就保留旧路径和旧权重。比较的是经过概率补偿的路径权重，不能直接换成终点奖励。[[2, Algorithm 2]](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/outer_mh.svg"><img src="/images/blog/diffusion_urge_stein/outer_mh.svg" alt="完整提议独立生成，按新旧路径权重依次进行MH更新，拒绝时保留旧路径与旧权重。" width="960" height="680" loading="lazy"></a>
  <figcaption>图 7 · 完整提议先各自生成，再逐条比较新旧路径权重。接受时换成新路径；拒绝时保留旧路径和旧权重。因此，提议可以独立并行生成，MH 链的连续输出仍可能重复并相互相关。图中权重与决定为教学示例。</figcaption>
</figure>

**独立的是提议路径，一条 MH 链相邻的输出仍然相关**。有限次更新也仍有初始化误差；若需要独立输出，应独立重复整套程序。已知有效全路径权重上界时，可另用完整路径拒绝采样获得独立的精确有限网格样本；这里主要讨论固定计算预算的外层 MH。[[2, Algorithm 2、附录 G.2]](#ref_stein)

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

所以，这不是仅仅对“平均漂移”作校正，而是恢复正确的加权路径目标。相应 MH 的目标是不变分布，有限时间的接近程度还需要收敛分析。[[2, Theorem 12]](#ref_stein)

</details>

## 9. 更多去噪步，能否不再强迫我们堆更多路径？

固定总时间 $$T$$，步长 $$h=T/n$$。中心化候选每步的归一化方差是 $$O(h^2/(K-1))$$，累积 $$n$$ 步，对应的量级是

$$
\frac{nh^2}{K-1}=\frac{Th}{K-1}.
$$

网格越细，这部分池噪声反而越小。但近似价值的 Bellman 误差是另一项，扩大候选池不能自动消除它。[[2, §4]](#ref_stein)

在固定起点、$$H_n=\phi$$、统一正值上下界、二阶空间导数和噪声系数有界等条件下，论文证明：**达到给定有限网格采样精度所需的完整提议数量，可以不随去噪深度增长**。常数可以依赖维数与价值函数的界，并不声称维数无关。[[2, Theorem 4]](#ref_stein)

这不意味着加深免费。$$m$$ 次外层更新加一次初始化，共用 $$m+1$$ 条完整提议，价值查询数仍是 $$Kn(m+1)$$。解决的是“每条路变长后，是否还被迫增加路的数量”，不是免去走更长路径的成本。

<details class="blog-details" markdown="1">
<summary>固定每条路径的查询预算，两个候选是否已经够好？</summary>

若单条提议预算 $$B=Kn$$ 固定，则

$$
\frac{Th}{K-1}=\frac{T^2}{B}\frac K{K-1}.
$$

对 $$K\ge2$$，最后的因子介于 1 和 2 之间。仅从池噪声项看，两点已经获得相同的预算阶；更多候选可以增加并行度，但也减少预算内可走的步数，不能据此断言总误差一定更小。[[2, §4]](#ref_stein)

这些结论针对离散模型的目标分布；它与连续时间扩散目标之间的数值误差需要单独分析。数值误差、价值近似误差和有限计算下的采样误差，应当分开记账。

</details>

## 10. 实验：先看 URGE，再看 Stein

<h3 id="urge-experiments">URGE：先在“知道正确答案”的分布上检验</h3>

URGE 使用 30 维、40 个分量的高斯混合模型。加入二次奖励后，目标仍有解析表达，因而能直接检查分布是否采对。下表节选原论文 Table 2；两种方法均使用引导 $$G=r$$ 与重采样。[[1, §4.1、Table 2]](#ref_urge)

| 方法 | MMD ↓ | SWD ↓ | 均值误差 ↓ | 协方差误差 ↓ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.07 | 0.85 | 4.86 | 198.20 |
| URGE | 0.06 | 0.62 | 3.20 | 181.31 |

四项都是越小越好。MMD 与 SWD 衡量分布差异，均值和协方差误差分别看点云的中心与散开方式。**这组实验中，URGE 的分布更接近目标：SWD 从 0.85 降到 0.62，均值误差从 4.86 降到 3.20**。它支持校正有效，但有限样本误差更小不等于实验已经证明精确采样。

<details class="blog-details" markdown="1">
<summary>这组实验怎样运行？</summary>

使用 8192 个粒子、500 个离散步，ESS 低于粒子数的 80% 时重采样。URGE 在原表中报告 5 个随机种子的平均结果。SWD 可以理解为从许多方向投影高维点云，再比较一维分布。[[1, Table 2、附录 C]](#ref_urge)

</details>

### URGE：相同粒子数下，图像有什么变化？

文生图实验在 50 个提示词、每个 3 个随机种子上比较。下面节选原论文 Table 4 中均使用 4 个粒子的三种方法；指标均越大越好。[[1, §4.3、Table 4]](#ref_urge)

| 方法，均为 4 个粒子 | CLIP ↑ | HPS ↑ | ImageReward ↑ | GenEval ↑ |
| :--- | :--- | :--- | :--- | :--- |
| FK Steering | 0.2901 | 0.2849 | 0.8397 | 0.7200 |
| FK Steering 加梯度引导 | 0.2899 | 0.2839 | 0.7906 | 0.7467 |
| URGE | 0.2997 | 0.2927 | 0.9955 | 0.7800 |

CLIP 衡量图文语义匹配，HPS 和 ImageReward 是学习得到的偏好评分，GenEval 检查物体等提示条件。相对于 FK Steering，URGE 的 **ImageReward 从 0.8397 提高到 0.9955，GenEval 从 0.7200 提高到 0.7800**。相同粒子数不意味着实测运行时间相同。

<details class="blog-details" markdown="1">
<summary>文生图的采样设置与比较范围</summary>

上述评测使用 100 步 DDIM，噪声参数为 1，CFG 强度为 7.5，每隔 20 步重采样。[[1, 附录 C]](#ref_urge)

下面的粒子扩展图在 10 个提示词上比较 SD v1.5 与 SDXL，不与上表 50 个提示词的汇总数值直接对齐。在测试的 $$N=2,3,4,6,8$$ 下，URGE 的 ImageReward 持续上升，多数配置高于 FK Steering；SD v1.5 的 $$N=2$$ 和 SDXL 的 $$N=6$$ 是例外。这是给定实验里的趋势，不是所有任务上的单调性保证。

</details>

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp"><img src="/images/blog/diffusion_urge_stein/urge_particle_scaling.webp" alt="SD v1.5和SDXL随粒子数增加的ImageReward，URGE在测试范围内持续提升，但不是每个配置都高于FK Steering。" width="1400" height="500" loading="lazy"></a>
  <figcaption>图 8 · 横轴为粒子数，纵轴为 ImageReward，两个面板分别使用 SD v1.5 和 SDXL。增加粒子为生成过程提供更多候选和筛选机会；在这里测试的粒子数范围内，URGE 的评分持续上升，但并非每个配置都优于 FK Steering。评测使用 10 个提示词。</figcaption>
</figure>

分数对应怎样的视觉变化？图 9 选出“牙刷与单板滑雪板”和“马与长颈鹿”。重点看：**两个物体是否同时出现，还是被混成了一个物体**？

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/urge_image_comparison.html" style="position:relative;display:block;overflow:hidden;aspect-ratio:1680/1430;"><img src="/images/blog/diffusion_urge_stein/urge_image_examples.webp" alt="两组双物体提示词，对比基础 SD v1.5、四粒子 FK Steering 和四粒子 URGE。" width="1680" height="1610" loading="lazy" style="position:absolute;top:0;left:0;display:block;width:100%;max-width:none;height:auto;margin:0;border:0;border-radius:0;transform:translateY(-6.8322981366%);"></a>
  <figcaption>图 9 · 相同双物体提示词下，比较基础模型、FK Steering 与 URGE 的输出。上排观察牙刷与滑雪板是否成为两个独立物体，下排观察马与长颈鹿是否被混合；这些例子展示了分数提升可能对应的视觉变化。后两种方法均使用 4 个粒子，个别图片应结合汇总指标阅读。</figcaption>
</figure>

### Stein：两个中心化候选能省下多少查询？

文献 [[2]](#ref_stein) 的布朗运动实验比较中心化候选与独立候选，指标 adjusted NESS 衡量归一化常数估计效率，不是图像质量。[[2, §5.1]](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/centering_experiment.webp"><img src="/images/blog/diffusion_urge_stein/centering_experiment.webp" alt="中心化两个候选随网格变细效率提高；独立候选需要远大的池才能达到相近的归一化常数估计效率。" width="1032" height="429" loading="lazy"></a>
  <figcaption>图 10 · 中心化如何稳定归一化常数的估计。左图固定两个候选，比较网格加深时的 adjusted NESS；右图增加独立候选数，观察需要多少查询才能达到中心化候选的效率。指标越高表示该归一化估计越有效，并不表示 MH 输出中独立样本的数量。</figcaption>
</figure>

受扰动价值、$$n=192$$ 时，**两个中心化候选达到 92.76%，两个独立候选只有 31.40%**。独立候选增至 128 和 256，才分别达到 92.38% 和 92.81%。这说明在该设置中，安排好候选之间的关系，比单纯堆数量更能稳定权重。[[2, §5.1]](#ref_stein)

### Stein：完整路径校正贡献了什么？

Hopper 实验固定扩散策略与 critic，检查动作的 critic 分数分布是否接近目标。三个目标分别把 30%、60%、80% 的概率放到原策略分数最高的 10% 动作中。KS 距离衡量分数累积分布的最大差距，越小越好。[[2, §5.2]](#ref_stein)

| 目标强度 | 两点引导，未做外层校正 | 使用 32 条完整提议校正 |
| :--- | :--- | :--- |
| 30% | 0.2174 | 0.0306 |
| 60% | 0.2804 | 0.0697 |
| 80% | 0.4041 | 0.1128 |

表中是八个固定状态的平均条件 KS。**指路已经有用，但完整路径校正仍大幅改善目标分布的匹配**。这里测量的是固定 critic 的分数分布，不能直接解释为机器人实际回报提高了同样比例。[[2, Table 2、附录 H.3]](#ref_stein)

最后回到书和电脑。图 11 在同一个 SD v1.5 骨干上展示四组双物体提示词。观察它们是否同时出现、保持独立，而不是只看一张图是否漂亮。[[2, §5.3]](#ref_stein)

<figure class="blog-figure">
  <a href="/images/blog/diffusion_urge_stein/image_examples.webp"><img src="/images/blog/diffusion_urge_stein/image_examples.webp" alt="双物体生成示例，对比FK Steering、SVDD、URGE以及两个和四个候选的Stein方法。" width="1110" height="1200" loading="lazy"></a>
  <figcaption>图 11 · 四组双物体提示词下，比较 FK Steering、SVDD、URGE 与使用两个或四个候选的 Stein Guidance。重点检查两类物体是否同时出现并保持各自身份。Stein 每张图使用 11 条完整提议，图中粒子方法使用 4 个粒子；这些是定性例子，不构成严格等算力的全面排名。</figcaption>
</figure>

## 11. 把三件事分开，算法就清楚了

**引导**让计算更常走向有希望的区域；**独立提议**避免跨路径复制带来的共同祖先；**路径校正**补偿不精确判断造成的概率偏差。它们解决的是三个不同问题。

URGE 说明，记录路径就能更方便地算清校正的账。Stein Guidance 再往前一步：两个对称候选提供有限差分，中心化的 $$K$$ 个候选提供并行的 Stein 引导，而同一批函数值同时给出完整路径的校正权重。

**不用价值导数，不等于没有方向；不复制祖先，也不等于可以不校正**。把这些分工明确下来，才知道多出的计算究竟改善了什么。

## 12. 研究问题：怎样同时实现无导数引导与校正？

<aside class="blog-key-insight" aria-labelledby="research-question" markdown="1">
<h4 id="research-question">设计引导时，就把校正需要的信息一起设计出来</h4>

**只允许查询近似价值函数的数值时，怎样设计 guidance，使生成过程既能向高价值区域移动，又能留下可计算的精确路径权重，让最终的 correction 同样不需要价值函数的梯度、时间导数或 Hessian？**

</aside>

Stein Guidance 给出的一个答案，是把候选池与选择编号保留下来：候选之间的价值差提供方向，候选价值的平均与选中值提供校正因子。无导数引导与无导数校正因此来自同一个随机构造。这里“精确”指扩展空间的加权恒等式；有限次 MH 更新仍有采样误差。[[2]](#ref_stein)

进一步的研究是：**当候选分布不再是高斯，或者候选池随状态自适应变化时，能否仍然让同一批函数值同时支持有效引导、可验证的校正和稳定的路径权重？** 检验一个新设计，除了看平均移动方向，还要证明完整权重恢复了目标分布，并控制其波动是否会随路径加深而恶化。

## 参考文献

<p id="ref_urge"><strong>[1]URGE。</strong>Chenyang Wang, Weizhong Wang, Yinuo Ren, Jose Blanchet, Yiping Lu. <em>Simple Approximation and Derivative Free Inference Time Scaling for Diffusion Models via Sequential Monte Carlo on Path Measures.</em> ICML 2026。<a href="https://proceedings.mlr.press/v306/wang26ih.html">正式论文页面</a> · <a href="https://arxiv.org/abs/2605.17850">arXiv</a> · <a href="https://arxiv.org/html/2605.17850v1">HTML 全文</a>。</p>

<p id="ref_stein"><strong>[2] Stein Guidance。</strong>Youheng Zhu, Chenyang Wang, Minshuo Chen, Yiping Lu. <em>Stein Guidance without Gradients: Discretization Uniform Diffusion Inference Time Scaling beyond Particle SMC.</em> 2026。<a href="/files/SteinGuidance.pdf">PDF 全文</a>。</p>
