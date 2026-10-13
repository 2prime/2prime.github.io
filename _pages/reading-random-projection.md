---
layout: single
title: "课后阅读二：Random Projection 与 Johnson–Lindenstrauss"
permalink: /teaching/2026-ML-Theory-Seminar/reading-random-projection/
mathjax: true
---
## Motivation
虽然 \(k<d\) 的线性映射不能保留整个 \(\mathbb R^d\) 的所有向量长度，但可以同时保留事先固定的有限点集的两两距离。

**引理（卡方集中）。** 若 \(Z_1,\ldots,Z_k\) 独立标准高斯，\(0<\varepsilon<1\)，则
\[
\mathbb P\left(\left|\frac1k\sum_{i=1}^kZ_i^2-1\right|\ge\varepsilon\right)\le2e^{-k\varepsilon^2/8}.
\]

**证明。** 高斯积分给出 \(\mathbb Ee^{\lambda Z^2}=(1-2\lambda)^{-1/2}\)（\(\lambda<1/2\)）。上尾 Chernoff 取 \(\lambda=\varepsilon/[2(1+\varepsilon)]\)，得到
\[
e^{-k[\varepsilon-\log(1+\varepsilon)]/2}\le e^{-k\varepsilon^2/8}.
\]
下尾取 \(\lambda=-\varepsilon/[2(1-\varepsilon)]\)，得到
\[
e^{-k[-\varepsilon-\log(1-\varepsilon)]/2}\le e^{-k\varepsilon^2/4}.
\]
合并两侧即得。

**定理（Gaussian Johnson–Lindenstrauss）。** 给定 \(N\ge2\) 个固定点 \(x_1,\ldots,x_N\in\mathbb R^d\)，令 \(A\in\mathbb R^{k\times d}\) 的元素独立服从 \(N(0,1/k)\)。若
\[
k\ge\frac8{\varepsilon^2}\log\frac{N(N-1)}{\delta},
\]
则以至少 \(1-\delta\) 的概率，对所有 \(i,j\) 同时有
\[
(1-\varepsilon)\|x_i-x_j\|_2^2\le\|Ax_i-Ax_j\|_2^2\le(1+\varepsilon)\|x_i-x_j\|_2^2.
\]

**证明。** 对任意固定非零 \(v\)，\(Av\) 的各坐标独立且服从 \(N(0,\|v\|^2/k)\)。所以
\[
\frac{\|Av\|_2^2}{\|v\|_2^2}\stackrel d=\frac1k\sum_{i=1}^kZ_i^2.
\]
由引理，每个固定向量的失败概率至多 \(2e^{-k\varepsilon^2/8}\)。把 \(v\) 取为所有 \(x_i-x_j\)，对至多 \(\binom N2\) 对取 union bound，失败概率至多 \(N(N-1)e^{-k\varepsilon^2/8}\le\delta\)。

**量词的区别。** 点集必须先于 \(A\) 固定。如果看见 \(A\) 后再挑选向量，就能选到 \(\ker A\) 中的非零向量，距离保持不再成立。