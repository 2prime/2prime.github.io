---
layout: single
title: "课后阅读一：高维随机向量几乎垂直"
permalink: /teaching/2026-ML-Theory-Seminar/reading-orthogonality/
mathjax: true
---
## Motivation
高维随机方向的内积是大量独立、均值为零的坐标贡献之和，因而集中在零附近。

**定理（Rademacher 方向）** 令 \(U,V\) 独立均匀取自 \(\{-1/\sqrt d,1/\sqrt d\}^d\)。则
\[
\mathbb P(|\langle U,V\rangle|\ge\varepsilon)\le2e^{-d\varepsilon^2/2}.
\]

**证明。** 写 \(U_i=\xi_i/\sqrt d,V_i=\eta_i/\sqrt d\)，令 \(\zeta_i=\xi_i\eta_i\)。则 \(\zeta_i\) 独立且均匀取 \(\pm1\)，因此
\[
\mathbb E e^{\lambda\sum_i\zeta_i}=(\cosh\lambda)^d\le e^{d\lambda^2/2}.
\]
最后一步来自 \((\log\cosh\lambda)''\le1\)。对指数变量应用 Markov，再取 \(\lambda=\varepsilon\)，得到单侧尾界 \(e^{-d\varepsilon^2/2}\)；负尾相同，两侧相加即得。

**推论（同时近似正交）。** 若独立抽取 \(N\) 个上述方向，则
\[
\mathbb P\left(\max_{i<j}|\langle U^{(i)},U^{(j)}\rangle|\ge\varepsilon\right)\le N(N-1)e^{-d\varepsilon^2/2}.
\]
证明对全部 \(\binom N2\) 对取 union bound。

**球面均匀方向。** 对独立均匀的 \(U,V\in S^{d-1}\)，旋转不变性允许固定 \(U=e_1\)，并用 \(V=G/\|G\|\)（\(G\) 为标准高斯向量）。设 \(S=\sum_{i=2}^dG_i^2\)，由高斯尾界及 \(\mathbb E e^{-aS}=(1+2a)^{-(d-1)/2}\) 得
\[
\mathbb P(|\langle U,V\rangle|\ge\varepsilon)\le2(1-\varepsilon^2)^{(d-1)/2}\le2e^{-(d-1)\varepsilon^2/2}.
\]
这里 \(0<\varepsilon<1\)。