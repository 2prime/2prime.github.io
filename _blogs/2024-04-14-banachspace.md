---
title: "Geometry of Banach Space"
blog_category: learning-and-optimization
permalink: /blog/2024-04-14-Banach-space
excerpt: 'Type, Cotype and Absolute Summing Operator.'
date: 2024-04-14
---


Reference: [Absolute Summing Operator](https://2prime.github.io/files/Absolutely_Summing_Operators.pdf)


For a fixed Banach space \( X \) we shall denote \( T_p(n) = T_p(X, n) \), \( C_q(n) = C_q(X, n) \), i.e., \( T_p(n) \) is the smallest \( T \) for which
\[
\left(\int_0^1 \left(\sum_{i=1}^n r_i(t)x_i\right)^2 dt\right)^{1/2} \leq T \left(\sum_{i=1}^n \|x_i\|^p\right)^{1/p}
\]
for all \( x_1, \ldots, x_n \in X \). Similarly \( C_q(n) \) is the smallest \( C \) for which
\[
\left(\sum_{i=1}^n \|x_i\|^q\right)^{1/q} \leq C \left(\int_0^1 \left(\sum_{i=1}^n r_i(t)x_i\right)^2 dt\right)^{1/2}
\]
for all \( x_1, \ldots, x_n \).

\textbf{Lemmma} For each \( 1 \leq p \leq 2 \) and \( 2 \leq q < \infty \) the sequences \( \{C_q(n)\}_{n=1}^\infty \) and \( \{T_p(n)\}_{n=1}^\infty \) are sub-multiplicative, i.e., for all integers \( n, k \) we have
- \( C_q(nk) \leq C_q(n)C_q(k) \)
- \( T_p(nk) \leq T_p(n)T_p(k) \).

