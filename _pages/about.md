---
permalink: /
title: "Yiping Lu"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---
<style>
#boxshadow {
    border: 4px solid purple;
    box-shadow: 5px 6px gray;
    border-radius: 2mm;
    background-color: white;
}

.half_highlight {
background: linear-gradient(to top, #F9E79F  50%, transparent 50%);
}

#boxshadow2 {
    border: 4px solid IndianRed;
    box-shadow: 5px 6px gray;
    border-radius: 2mm;
    background-color: white;
}
</style>

<div id="boxshadow2">
<center style="color: gray; font-size: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
My lab <a href="https://scale-lab-northwestern.github.io/">Homepage</a> is online! You can see more information there.
 </center>
</div>


<br/>
I am a tenure-track assistant professor at  [Industrial Engineering & Management Science](https://www.mccormick.northwestern.edu/industrial/) and [Engineering Sciences & Applied Mathematics](https://www.mccormick.northwestern.edu/applied-math/) (by courtesy), Northwestern University. Previously, I worked at [Courant Institute of Mathematical Sciences](https://cims.nyu.edu/dynamic/), New York University as a Courant instructor for one year. I received my Ph.D. degree in applied math from Stanford University in 2023 and my Bachelor’s degree in applied math from Peking University in 2019. The long-term goal of Yiping's research is to develop a hybrid scientific research discipline that combines <mark color='orange'>domain knowledge</mark> (differential equation, stochastic process, control,...), <mark color='orange'>machine learning</mark> and <mark color='orange'>(randomized) experiments</mark>. To this end, Yiping and his group are working on an interdisciplinary research approach across probability and statistics, machine learning, numerical algorithms, control theory, signal processing/inverse problem, and operations research. Yiping is among the first to work at the interface of deep learning and differential equation. Yiping was a recipient of the Conference on Parsimony and Learning (CPAL) Rising Star Award in 2024, the Rising Star in Data Science from the University of Chicago in 2022, the Stanford Interdisciplinary Graduate Fellowship and the SenseTime Scholarship in 2021 for undergraduates in AI in 2019. Yiping also served as Area Chair for top machine learning conference such as ICML, Neurips, ICLR and AISTATS.

> Recent Projects:
> - First principle of the recent [MUON](https://github.com/MoonshotAI/Moonlight) optimizer. [[Slide]](https://2prime.github.io/files/MOGA.pdf)
> - [Theory-inspired](https://arxiv.org/abs/2602.01381) and [Physics-Informed](https://arxiv.org/abs/2504.16172) Inference Time Scaling, with application in Diffusion model
> - Hybrid numercial analysis and ML applications in scientific applications [[slide]](https://2prime.github.io/files/debiasandprecondition.pdf)
> - Statistical analysis of Scaling law [[slide]](https://2prime.github.io/files/howtoscaleSCiML.pdf)
> - Multiscale Structure of Gradient Descent
> - LLM agents for Math 


> **Advertisement** I am happy to host (remote) undergraduate/graduate visitors and looking for Ph.D. Students and Postdocs. Prospective Students see [here](https://2prime.github.io/students/). Summer Intern for 2025 can see [here](https://2prime.github.io/files/SummerIntern_Yiping.pdf). You can also find information about my research [here](https://2prime.github.io/research/) 

**To anyone:** I would appreciate [(anonymous) feedback](https://docs.google.com/forms/d/e/1FAIpQLScCWSzTQGMVKhxDVSiCopYD740Txm-cMoxIh-dg08FcRKT-8Q/viewform?usp=sf_link) about anything!


Here's my [<mark color='orange'>research statement</mark>](https://2prime.github.io/files/rs.pdf) and my latest [CV](https://www.overleaf.com/read/rmcykgwmwbcq#cbe18b).


**Contact**: yiping [dot] lu [at] northwestern [dot] edu

**Office**: 2145 Sheridan Road Technological Institute, M237, Evanston, IL 60208

**<font color='red'>[*New*]</font> ** AAAI 2024 Tutorial: Recent advance in Physics-informed Machine Learning  [website](https://sites.google.com/view/aaai-2024-tutorial-piml/) [slide](https://2prime.github.io/files/SML/piml_aaai.pdf)

# Research Interest and Highlights

My research focuses on scaling laws in machine learning—understanding **when, why, and how machine-learning systems improve predictably as we scale resources, including data, model size, optimization effort, and inference-time computation.**

In large language models, scaling has become a remarkably reliable principle: performance improves smoothly as we increase compute and data, often following simple power laws. This predictability fundamentally changes how we design learning systems, making it possible to forecast performance and allocate resources optimally. However, this kind of reliable scaling behavior is far from universal. In many settings—especially when models interact with complex structure, constraints, or long-horizon dynamics—scaling breaks down: optimization becomes unstable, hyperparameters stop transferring across model sizes, and accuracy plateaus despite increased compute.

My research aims to build a general theory and algorithmic framework for scalable learning, in which increased resources provably and reliably lead to better performance. Rather than treating scaling as an empirical phenomenon, I study it as a principled question of **optimization geometry, statistical complexity, and resource allocation**.

**1. Why Do Some Models Scale—and Others Don’t?** A central question in my work is understanding **what fundamentally limits scaling**. I study how approximation error, optimization difficulty, and statistical uncertainty interact as models grow wider, deeper, or are trained with more data. This includes identifying error floors, characterizing regimes where scaling laws hold, and explaining why naive scaling often fails. The goal is to move beyond ad-hoc heuristics and develop predictive scaling theories that apply across model classes.



**2. Scaling-Aware Optimization and Geometry** As model size increases, the geometry of the loss landscape changes in ways that strongly affect optimization. Learning rates and optimizer hyperparameters that work well at small scale often fail at large scale. I study optimization from a **geometric perspective**, viewing modern optimizers as instances of steepest descent under different norms. This leads to **new scaling-aware optimization methods** whose convergence behavior and hyperparameter choices remain stable as width and depth increase. Ultimately, I aim to design optimizers whose performance scales smoothly with model size, rather than deteriorating.



**3. Inference-Time Scaling: Trading Compute for Accuracy** Beyond training-time scaling, I am particularly interested in inference-time scaling—improving model performance by allocating more computation after training, without changing model parameters. Inspired by ideas from Monte Carlo simulation, control, and sequential decision-making, my work develops methods that use additional **inference-time compute to detect, correct, and reduce model error on the fly**. This establishes inference-time computation as a first-class scaling axis, alongside data and model size, and provides a principled way to trade compute for reliability.


## Optimizer for Large Scale Language Models
> 1. <font color='red'>[*New*]</font> Ruihan Xu, Jiajin Li, **Yiping Lu** On the Width Scaling of Neural Optimizers Under Matrix Operator Norms I: Row/Column Normalization and Hyperparameter Transfer

## Theory and Algorithms for Inference Time Scaling
> 1. <font color='red'>[*New*]</font> JChenyang Wang, Weizhong Wang, Yinuo Ren, Jose Blanchet, **Yiping Lu** Simple Unbiased Derivative Free Inference-Time Scaling for Diffusion Models via Sequential Monte Carlo on Path Measures (ICML 2026)
> 2. <font color='red'>[*New*]</font> JYouheng Zhu, **Yiping Lu** On the Power of (Approximate) Reward Models for Inference-Time Scaling (ICML 2026)
> 3. Lifu Wei, Yinuo Ren, Naichen Shi, **Yiping Lu** SURGE:Unbiased Data Assimilation for Diffusion Model via Particle Filtering (ICML 2026)
> 4. <font color='red'>[*New*]</font> JZexi Fan, Yan Sun, Shihao Yang, **Yiping Lu** Physics-Informed Inference Time Scaling for Solving High-Dimensional PDE via Defect Correction (ICLR 2026)



## Debiasing Machine Learning Algorithm for Scientific Computing

> 1.Zexi Fan, Yan Sun, Shihao Yang, **Yiping Lu** Physics-Informed Inference Time Scaling for Solving High-Dimensional PDE via Defect Correction (ICLR 2026)
> 2. Kaizhao Liu, Jose Blanchet, Lexing Ying , Yiping Lu. Orthogonal Bootstrap: Efficient Simulation of Input Uncertainty, The Forty-first International Conference on Machine Learning (ICML), 2024.
> 3. <font color='red'>[*New*]</font>  Jose Blanchet, Haoxuan Chen, **Yiping Lu**, Lexing Ying. When can Regression-Adjusted Control Variates Help? Rare Events, Sobolev Embedding and Minimax Optimality (alphabetical order) Neurips 2023

## Experiment Design

> 1.<font color='red'>[*New*]</font> **Yiping Lu**, Jiajin Li, Lexing Ying, Jose Blancet. Synthetic Principal Component Design: Fast Covariate Balancing with Synthetic Controls, 40th Conference on Uncertainty in Artificial Intelligence (UAI 2024) (Oral)

  
## Algorithms and Statistics of Scientific Machine Learning


>  1.Sifan Wang, Shawn Koohy,**Yiping Lu**, Paris Perdikaris When PINNs Go Wrong: Pseudo-Time Stepping Against Spurious Solutions 
>  2.<font color='red'>[*New*]</font> Jikai Jin, **Yiping Lu**, Jose Blanchet, Lexing Ying Minimax Optimal Kernel Operator Learning via Multilevel Training ICLR 2023 
>  2.**Yiping Lu**, Haoxuan Chen, Jianfeng Lu, Lexing Ying, Jose Blanchet. Machine Learning For Elliptic PDEs: Fast Rate Generalization Bound, Neural Scaling Law and Minimax Optimality. International Conference on Learning Representations(ICLR) 2022
>
>  3.**Yiping Lu**, Jose Blanchet,Lexing Ying. Sobolev Acceleration and Statistical Optimality for Learning Elliptic Equations via Gradient Descent. Neurips 2022
>  
>  4.Zichao long*, **Yiping Lu** *, Xianzhong Ma*, Bin Dong. "PDE-Net:Learning PDEs From Data", Thirty-fifth International Conference on Machine Learning (ICML), 2018

## Robust Machine Learning

>  1. Wenlong Ji, **Yiping Lu**, et al. An unconstrained layer-peeled perspective on neural collapse. ICLR 2022.
>
>  2. Dinghuai Zhang *, Tianyuan Zhang *,**Yiping Lu** *, Zhanxing Zhu, Bin Dong. "You Only Propagate Once: Painless Adversarial Training Using Maximal Principle." 33rd Annual Conference on Neural Information Processing Systems (NeurIPS) 2019 (*equal contribution) 
>  
>  3.  **Yiping Lu**, Wenlong Ji, Zach Izzo, et al. Importance Tempering: Group Robustness for Overparameterized Models. arXiv preprint arXiv:2209.08745, 2022.
 
## Optimal Control Formulation of Deep Learning


>  1. Yihang Chen, Fanghui Liu, **Yiping Lu**, Grigorios Chrysos, Volkan Cevher. Generalization Guarantees of Deep ResNets in the Mean-Field Regime, International Conference on Learning Representations(ICLR) 2024
>     
>  2.**Yiping Lu**, Chao Ma, Yulong Lu, Jianfeng Lu, Lexing Ying. "A Mean-field Analysis of Deep ResNet and Beyond: Towards Provable Optimization Via Overparameterization From Depth" Thirty-seventh International Conference on Machine Learning (ICML), 2020
>  
>  3.Dinghuai Zhang *, Tianyuan Zhang *,**Yiping Lu** *, Zhanxing Zhu, Bin Dong. "You Only Propagate Once: Painless Adversarial Training Using Maximal Principle." 33rd Annual Conference on Neural Information Processing Systems (NeurIPS) 2019 (*equal contribution) 
>  
>  4.**Yiping Lu** *, Aoxiao Zhong *, Quanzheng Li, Bin Dong. "Beyond Finite Layer Neural Network:Bridging Deep Architects and Numerical Differential Equations" Thirty-fifth International Conference on Machine Learning (ICML), 2018 (*equal contribution) 

## Inverse Problem and Image Processing


>  1.Xiaoshuai Zhang*, **Yiping Lu** *, Jiaying Liu, Bin Dong. "Dynamically Unfolding Recurrent Restorer: A Moving Endpoint Control Method for Image Restoration" Seventh International Conference on Learning Representations(ICLR) 2019(*equal contribution) 
> 
>  2.Bin Dong, Haochen Ju, **Yiping Lu**, Zuoqiang Shi. " CURE: Curvature Regularization For Missing Data Recovery." SIAM Journal on Imaging Science, 13(4), 2169-2188, 2020 (alphabetical order)




My Erdos Number = 4

> Yiping Lu -> Lexing Ying -> David L. Donoho -> Charles Kam-tai Chui -> Paul Erdős
> 
> Yiping Lu -> Jose H. Blanchet -> Martin I. Reiman -> Fan Chung -> Paul Erdős

<br> 
<br> 
