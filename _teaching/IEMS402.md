---
title: "Statistical Learning (IEMS-402, Northwestern)"
collection: teaching
type: "Graduate course"
permalink: /teaching/2025-Statistical-Learning
venue: "Northwestern IEMS"
date: 2025-03-01
location: "Evanston, IL"
---


Required graduate course on mathematical foundations of data science. **Syllabus**:[[link]](https://docs.google.com/document/d/1n9GF09jiJ5Nfmd1dlQoMNsgoWvffcpU36zzZ-Bc5iug/edit?usp=sharing)


**Time and Location**: Monday and Wednesday, 2:00-3:20, M228

**Office Hour:** 3:30 - 4:30 Monday, M237, but I'll answer question on [campuswire](https://campuswire.com/p/GFA6A52C6) everynight before I go to bed.


Objectives:
======
This course provides foundational and advanced concepts in statistical learning theory, essential for analyzing complex data and making informed predictions. Students will delve into both asymptotic and non-asymptotic analyses of machine learning algorithms, addressing critical challenges such as model bias, variance, and robustness in uncertain environments. Toward the end of the course, students will apply these principles to modern machine learning contexts, including the scaling laws/benign overfitting of deep learning, generative AI, and language models. (e.g. Neural Tagent Kernel, Mean-Field Limit of Neural Network and In-context Learning)

**ChatGPT Tutor:** The [[link]](https://chatgpt.com/g/g-IubmUPho0-iems-402-statistical-learning) here provides a Large Language Model agents that is specifically trained for this course.

If you have a question, to get a response from the teaching staff quickly we strongly encourage you to post it to the class Piazza forum. For suggestions to improve Yiping's teaching, you can use the [(anonymous) form](https://forms.gle/9cddGRikoPMhHCRv8). You can also leave a private matter here. If you wish to contact me via email, kindly include the tag "[IEMS402]" in the subject line. This will help ensure that I do not overlook your message.

Syllabus
======
### Text Book
- [[Learning Theory from First Principles]](https://www.di.ens.fr/~fbach/ltfp_book.pdf ) Francis Bach [LTFP]
- [[Asymptotic Statistics]](https://www.cambridge.org/core/books/asymptotic-statistics/A3C7DAD3F7E66A1FA60E9C8FE132EE1D) A. W. van der Vaart [AS]

### Prelinminary
- Calculus, Linear Algebra
- [IEMS 302 Probability](https://www.mccormick.northwestern.edu/industrial/academics/courses/descriptions/302.html)
- Probability and Statistics: Strong Law of Large Numbers, [Central Limit Theorem](https://www.youtube.com/watch?v=yv9nLOD1QPE&t=3653s),  Big-O, little-o notation, 
- Optimization Theory: Lagrangian Duality Theory [IEMS 450-2: Mathematical Optimization II](https://www.mccormick.northwestern.edu/industrial/academics/courses/descriptions/450-2.html) (Interestingly, IEMS 450-1 is not required)

Here is a review of all the preliminary we'll use in this class:
- Probability and Optimization Review: [[link]](https://2prime.github.io/files/IEMS402/IEMS402ProbOptReview.pdf)
  - Different notion of convergence in probability is useful but not required in our class. Our class will just do intuituive proof.

### Scheldue
- **Lecture 1-2**: <font color=red>Concept</font> 1.6/1.8 [[slide]](https://2prime.github.io/files/IEMS402/402lec1and2.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS402/402lec1and2fill.pdf)
[[Feedback for Lecture 1]](https://forms.gle/atExX4xTGnaghB6RA) [[Feedback for Lecture 2]](https://forms.gle/XcbcPrBbaswdMqNLA) 
  - Supervised Learning, Empirical Risk Minimization, Risk Decomposition ([LTFP] Section 2)
  - Deisgn of Loss function: Max Likelihood, Surrogate Loss
  - Difference between IEMS402 (Statistical Learning) and IEMS401 (Applied Statistics)
    - Loss convergence V.S. Parameter Recover
    - Non-parametric V.S. Parametric
  - Degree of Freedom.
  - Why the success of Deep Learning is a mystery.
    - Curse of Dimensioanality for approximation
    - Benigning Overfitting
    - Non-convexity of Optimization Landscape, Selection of Multiple Minimum
    - Distrbution Mismatch
  - Sugessted Reading:
    - Zhang C, Bengio S, Hardt M, et al. [Understanding deep learning (still) requires rethinking generalization](https://dl.acm.org/doi/10.1145/3446776). Communications of the ACM, 2021, 64(3): 107-115.
    - Kaplan J, McCandlish S, Henighan T, et al. [Scaling laws for neural language models](https://arxiv.org/abs/2001.08361). arXiv preprint arXiv:2001.08361, 2020.
    - Nakkiran P, Kaplun G, Bansal Y, et al. [Deep double descent: Where bigger models and more data hurt](https://arxiv.org/abs/1912.02292). Journal of Statistical Mechanics: Theory and Experiment, 2021, 2021(12): 124003.
    - Curth A, Jeffares A, van der Schaar M. [A U-turn on double descent: Rethinking parameter counting in statistical learning](https://arxiv.org/abs/2310.18988). Advances in Neural Information Processing Systems, 2024, 36.
    - [Rethinking Conventional Wisdom in Machine Learning: From Generalization to Scaling](https://arxiv.org/abs/2409.15156) L Xiao arXiv preprint arXiv:2409.15156
    - <font color=red>(Required)</font> Mallinar N, Simon J, Abedsoltan A, et al. [Benign, tempered, or catastrophic: Toward a refined taxonomy of overfitting](https://proceedings.neurips.cc/paper_files/paper/2022/hash/08342dc6ab69f23167b4123086ad4d38-Abstract-Conference.html). Advances in Neural Information Processing Systems, 2022, 35: 1182-1195.
    - Li H, Xu Z, Taylor G, et al. [Visualizing the loss landscape of neural nets](https://proceedings.neurips.cc/paper/2018/hash/a41b3bb3e6b050b6c9067c67f663b915-Abstract.html). Advances in neural information processing systems, 2018, 31.
    - Keskar N S, Mudigere D, Nocedal J, et al. [On large-batch training for deep learning: Generalization gap and sharp minima](https://arxiv.org/abs/1609.04836). arXiv preprint arXiv:1609.04836, 2016.
    - Wipf D P, Rao B D. [Sparse Bayesian learning for basis selection](https://ieeexplore.ieee.org/document/1315936) IEEE Transactions on Signal processing, 2004, 52(8): 2153-2164.
    - Dai, Bin, and David Wipf. [Diagnosing and enhancing VAE models](https://arxiv.org/abs/1903.05789). arXiv preprint arXiv:1903.05789 (2019).
    - Mücke N, Steinwart I. Empirical Risk Minimization in the Interpolating Regime with Application to Neural Network Learning. arXiv preprint arXiv:1905.10686, 2019.

<font color=red>[Homework 1 DUE]</font>

- **Lecture 3-4**: 1.13/15 [[slide]](https://2prime.github.io/files/IEMS402/402lec3and4.pdf) [[annotated slide]](https://drive.google.com/file/d/1ysSPOXYRvPWdn_7enVEt9sECSNggTRZg/view?usp=sharing)
[[Feedback for Lecture 3]](https://forms.gle/oqk687RQL37kJwVG6) [[Feedback for Lecture 4]](https://forms.gle/wGnELYYeLFojdmbi8) 
  - Bias-Variance Trade-off of Kernel Smoothing Estimator, Curse of Dimensionality ([LTFP] Section 6)
  - Advanced Reading:
    - Xing Y, Song Q, Cheng G. [Benefit of interpolation in nearest neighbor algorithms](https://arxiv.org/abs/2202.11817). SIAM Journal on Mathematics of Data Science, 2022, 4(2): 935-956.
    - Chhor J, Sigalla S, Tsybakov A B. [Benign overfitting and adaptive nonparametric regression](https://link.springer.com/article/10.1007/s00440-024-01278-0). Probability Theory and Related Fields, 2024: 1-32.


<font color=red>[Homework 2 DUE]</font>

- **Lecture 5**: 1.20 <font color=red>[No Class]</font> (Martin Luther King Jr. Day)
- **Lecture 6**: 1.22 [[slide]](https://2prime.github.io/files/IEMS402/402lec6.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS402/402lec6new.pdf)
   - Asymptotic normality
   - Inverse function theorem, (Implicit) Delta Method
   - Moment Methods
<font color=red>[Homework 3 DUE]</font>

- **Lecture 7**: 1.27
  - Influnce function, Fisher Information
  - Cramer-Rao Bound and Con of Unbiased Estimators (James-Stein estimator)
  - Sugessted Reading:
    - Koh P W, Liang P. [Understanding black-box predictions via influence functions International conference on machine learning](https://proceedings.mlr.press/v70/koh17a/koh17a.pdf) PMLR, 2017: 1885-1894. (ICML 2017 best paper)
    - Basu S, Pope P, Feizi S. [Influence functions in deep learning are fragile](https://arxiv.org/abs/2006.14651).


- **Lecture 8**: 1.29
  - Concerntration Inequality
  - Application of Concerntration Inequality: Johnson-Lindenstrauss lemma

<font color=red>[Homework 4 DUE]</font>

- **Lecture 9**: 2.3
  - Generalization via Uniform Bound, Covering Number
- **Lecture 10**: 2.5
  - Symmetrization, Rademacher complexity
  - Advanced Reading:
    - Kur G, Putterman E, Rakhlin A. [On the variance, admissibility, and stability of empirical risk minimization](https://arxiv.org/abs/2305.18508). Advances in Neural Information Processing Systems, 2024, 36.
    - Kur, Gil, et al. [Minimum Norm Interpolation Meets The Local Theory of Banach Spaces](https://openreview.net/forum?id=G4b32bKnBy). Forty-first International Conference on Machine Learning.
    - Xu, Yunbei, and Assaf Zeevi. "Towards optimal problem dependent generalization error bounds in statistical learning theory." Mathematics of Operations Research (2024).

<font color=red>[Homework 5 DUE]</font>

- **Lecture 11**: 2.10 <font color=red>[Advanced Topic]</font>
  - Generalization Theory of Neural Network [[Textbook](https://mjt.cs.illinois.edu/dlt/#two-rademacher-complexity-proofs-for-deep-networks)]
  - Other Ideas of Generalization:
    - PAC-Bayes, Algorithm Stability, ... 
  - Suggested Reading:
    - Bartlett, P.L., 1998. The sample complexity of pattern classification with neural networks: the size of the weights is more important than the size of the network. IEEE transactions on Information Theory, 44(2), pp.525-536
    - Bartlett, P.L., Foster, D.J. and Telgarsky, M., 2017, December. [Spectrally-normalized margin bounds for neural networks](https://arxiv.org/abs/1706.08498). In Proceedings of the 31st International Conference on Neural Information Processing Systems (pp. 6241-6250)
    - Jiang Y, Neyshabur B, Mobahi H, et al. [Fantastic generalization measures and where to find them](https://arxiv.org/abs/1912.02178). arXiv preprint arXiv:1912.02178, 2019.
    - Jiang Y, Nagarajan V, Baek C, et al. [Assessing generalization of SGD via disagreement](https://arxiv.org/abs/2106.13799). arXiv preprint arXiv:2106.13799, 2021.
- **Lecture 12**: <font color=red>[Midterm]</font> 2.12
- **Lecture 13**: 2.17
  - Ledoux-Talagrand Contraction Principle
  - Dudley's theorem
- **Lecture 14**: 2.19 <font color=red>[Advanced Topic]</font>
  - Localized Complexity
  - Non-parametric Least-square
  - Suggested Reading:
<font color=red>[Homework 6 DUE]</font>

- **Lecture 15**: 2.24
  - Reproducing Kernel Hilbert Space
  - Advanced Reading:
    - Haas M, Holzmüller D, Luxburg U, et al. Mind the spikes: Benign overfitting of kernels and neural networks in fixed dimension[J]. Advances in Neural Information Processing Systems, 2024, 36.
    - Schölpple M, Steinwart I. [Which Spaces can be Embedded in Reproducing Kernel Hilbert Spaces?](https://arxiv.org/abs/2312.14711) arXiv preprint arXiv:2312.14711, 2023.
    - Lu Y, Lin D, Du Q. [Which Spaces can be Embedded in Lp-type Reproducing Kernel Banach Space? A Characterization via Metric Entropy](https://arxiv.org/abs/2410.11116). arXiv preprint arXiv:2410.11116, 2024.
- **Lecture 15**: 2.26
  - Distrbution Shift ([Stanford CS329D Machine Learning Under Distribution Shift](https://thashim.github.io/cs329D/))
  - Distributionally Robust Optimization
  - Suggested Reading:
    - [Toward a inductive modeling language for distribution shifts](https://hsnamkoong.github.io/assets/pdf/LiuWaCuNa24-slides.pdf)
    - Geirhos R, Jacobsen J H, Michaelis C, et al. Shortcut learning in deep neural networks. Nature Machine Intelligence, 2020, 2(11): 665-673.
    - Sagawa S, Koh P W, Hashimoto T B, et al. Distributionally robust neural networks for group shifts: On the importance of regularization for worst-case generalization.
  - Suggested Reading:
    - Duchi J, Namkoong H. Variance-based regularization with convex objectives. Journal of Machine Learning Research, 2019, 20(68): 1-55. (Neurips 2017 Best paper)
    - Duchi J C, Namkoong H. Learning models with uniform performance via distributionally robust optimization. The Annals of Statistics, 2021, 49(3): 1378-1406.
    - Hu W, Niu G, Sato I, et al. Does distributionally robust supervised learning give robust classifiers? International Conference on Machine Learning. PMLR, 2018: 2029-2037.


<font color=red>[Homework 7 DUE]</font>

- **Lecture 15**: 3.3 <font color=red>[Advanced Topic]</font>
  - Optimal Transport, Kantorovich Duality
  - Statistics of Optimal Transport and Smoothed Optimal Transport
  - Suggested Reading (Optimal Transport):
    - *<font color=red>(Textbook)</font>* [Computational Optimal Transport](https://arxiv.org/abs/1803.00567)
    - *<font color=red>(Central Limit Theorem)</font>* Goldfeld Z, Greenewald K. [Gaussian-smoothed optimal transport: Metric structure and statistical efficiency] International Conference on Artificial Intelligence and Statistics. PMLR, 2020: 3327-3337.
    - *<font color=red>(Central Limit Theorem)</font>* Si N, Blanchet J, Ghosh S, et al. [Quantifying the empirical Wasserstein distance to a set of measures: Beating the curse of dimensionality](https://proceedings.neurips.cc/paper/2020/hash/f3507289cfdc8c9ae93f4098111a13f9-Abstract.html). Advances in Neural Information Processing Systems, 2020, 33: 21260-21270.
    - *<font color=red>(Optimization)</font>* Li J, Tang J, Kong L, et al. [A convergent single-loop algorithm for relaxation of gromov-wasserstein in graph data](https://arxiv.org/abs/2303.06595). arXiv preprint arXiv:2303.

- **Lecture 16**: 3.5 <font color=red>[Advanced Topic]</font>
  - Sampling via Wasserstein Gradient Flow (JKO Scheme)
  - Generative Modeling and Diffusion Model
  - Suggested Reading (Sampling):
    - Richard Jordan, David Kinderlehrer, and Felix Otto. The variational formulation of the Fokker–Planck equation. SIAM journal on mathematical analysis, 29(1):1–17, 1998.
    - Liu Q, Wang D. [Stein variational gradient descent: A general purpose bayesian inference algorithm](https://proceedings.neurips.cc/paper_files/paper/2016/hash/b3ba8f1bee1238a2f37603d90b58898d-Abstract.html). Advances in neural information processing systems, 2016, 29.
    - [Log-concave sampling](https://chewisinho.github.io/main.pdf)
    - Chen A Y, Sridharan K. [From Optimization to Sampling via Lyapunov Potentials](https://arxiv.org/abs/2410.02979). arXiv preprint arXiv:2410.02979, 2024.
  - Suggested Reading
    - Song Y, Sohl-Dickstein J, Kingma D P, et al. [Score-based generative modeling through stochastic differential equations](https://arxiv.org/abs/2011.13456). arXiv preprint arXiv:2011.13456, 2020.
    - Lipman Y, Chen R T Q, Ben-Hamu H, et al. [Flow matching for generative modeling](https://arxiv.org/abs/2210.02747). arXiv preprint arXiv:2210.02747, 2022.
    - Albergo M S, Boffi N M, Vanden-Eijnden E. [Stochastic interpolants: A unifying framework for flows and diffusions](https://arxiv.org/abs/2303.08797). arXiv preprint arXiv:2303.08797, 2023.


<font color=red>[Homework 8 DUE]</font>

- **Lecture 17**: 3.10
  - Deep Learning Theory:  ([LTFP] Section 12.3, 12.5)
    - Neural Tagent Kernel
    - Mean-field Limit of Neural Network
  - Suggested Reading:
    -  Bach F. [Breaking the curse of dimensionality with convex neural networks](https://arxiv.org/abs/1412.8690). Journal of Machine Learning Research, 2017, 18(19): 1-53.
    -  Chizat L, Oyallon E, Bach F. [On lazy training in differentiable programming](https://arxiv.org/abs/1812.07956). Advances in neural information processing systems, 2019, 32.
  - Advanced Reading:
    - Chizat L, Bach F. [On the global convergence of gradient descent for over-parameterized models using optimal transport](https://arxiv.org/abs/1805.09545). Advances in neural information processing systems, 2018, 31.
    - Yang G, Hu E J, Babuschkin I, et al. [Tensor programs v: Tuning large neural networks via zero-shot hyperparameter transfer](https://arxiv.org/abs/2203.03466). arXiv preprint arXiv:2203.03466, 2022.
      - Hayou S, Ghosh N, Yu B. Lora+: Efficient low rank adaptation of large models. arXiv preprint arXiv:2402.12354, 2024.
      - Ishikawa S, Karakida R. On the Parameterization of Second-Order Optimization Effective Towards the Infinite Width. arXiv preprint arXiv:2312.12226, 2023.

- **Lecture 18**: 3.12 <font color=red>[Advanced Topic]</font>
  - Implicit Bias ([LTFP] Section 12.1)
  - Large Language Model
    - In-context Learning, Chain-of-thoughts and Circuit Theory, Alignment of AI
   - Diagram of Learning: Supervised, Unsupervised, Semi-supervised, Self-supervised, Generative AI
  - spectral clustering and t-SNE
  - Infomax and self-supervised learning
  - Relationship between spectral clustering, t-SNE and self-supervised learning
  - Suggested Reading:
    - Zhou X, Belkin M. Semi-supervised learning by higher order regularization Proceedings of the fourteenth international conference on artificial intelligence and statistics. JMLR Workshop and Conference Proceedings, 2011: 892-900.
    - Hjelm R D, Fedorov A, Lavoie-Marchildon S, et al. Learning deep representations by mutual information estimation and maximization. arXiv preprint arXiv:1808.06670, 2018.
    - Linderman G C, Steinerberger S. Clustering with t-SNE, provably. SIAM journal on mathematics of data science, 2019, 1(2): 313-332.
    - HaoChen J Z, Wei C, Gaidon A, et al. Provable guarantees for self-supervised deep learning with spectral contrastive loss. Advances in Neural Information Processing Systems, 2021, 34: 5000-5011.
  - Advanced Reading:
    - X. Cheng and N. Wu. "Eigen-convergence of Gaussian kernelized graph Laplacian by manifold heat interpolation". Applied and Computational Harmonic Analysis, 61, 132-190 (2022)
    - Cai T T, Ma R. Theoretical foundations of t-sne for visualizing high-dimensional clustered data[J]. Journal of Machine Learning Research, 2022, 23(301): 1-54.
    - Kim J, Nakamaki T, Suzuki T. Transformers are minimax optimal nonparametric in-context learner. arXiv preprint arXiv:2408.12186, 2024.
    - Von Oswald J, Niklasson E, Randazzo E, et al. Transformers learn in-context by gradient descent International Conference on Machine Learning. PMLR, 2023: 35151-35174.
    - Shen L, Mishra A, Khashabi D. Do pretrained Transformers Really Learn In-context by Gradient Descent?. arXiv preprint arXiv:2310.08540, 2023.
    - Giannou A, Yang L, Wang T, et al. How Well Can Transformers Emulate In-context Newton's Method?. arXiv preprint arXiv:2403.03183, 2024.
    - Feng G, Zhang B, Gu Y, et al. Towards revealing the mystery behind chain of thought: a theoretical perspective. Advances in Neural Information Processing Systems, 2024, 36.
    - Lee J, Xie A, Pacchiano A, et al. Supervised pretraining can learn in-context reinforcement learning. Advances in Neural Information Processing Systems, 2024, 36.



### Homework

*Your grade will be computed by max(HW1,HW8)+max(HW2,HW3)+max(HW4,HW5)+max(HW6,HW7).* 

- [[Homework 1]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework1.pdf): Review of Probability Statistics and Optimization
- [[Homework 2]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework2.pdf): Bias and Variance Trade-off 1: Overparameterization
- [[Homework 3]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework3.pdf): Bias and Variance Trade-off 2: Kernel Smoothing
- [[Homework 4]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework4.pdf): Asymptotic Theory 1
- [[Homework 5]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework5.pdf): Asymptotic Theory 2 and Concentration Inequality
- [[Homework 6]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework6.pdf): Generalization Error
- [[Homework 7]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework7.pdf): Complexity of Hypothesis Space
- [[Homework 8]](https://2prime.github.io/files/IEMS402/IEMS_402_Homework8.pdf): RKHS and Robust Learning

### Exams
- [[Practice Mid-Term Exam]](https://2prime.github.io/files/IEMS402/practicemidterm_IEMS402.pdf)
  - Modern Machine Learning Concepts, Bias and Variance Trade-off
  - Kernel Smoothing, Asymptotic Theory, Influnce Function Concentration Inequality, Uniform Bound
- [[Practice Final Exam]](https://2prime.github.io/files/IEMS402/practicefinal_IEMS402.pdf)
  - Rademacher complexity, Covering Number, Dudley's theorem
  - RKHS, Optimal Transport, Robust Learning

### Other Reading
- [[Argmin Blog]](https://www.argmin.net/archive?sort=new)
- [[Francis Bach's Blog]](https://francisbach.com/)

General Policies
======

In general, we do not grant extensions on assignments/exams. There are several exceptions:

- *Medical Emergencies:* If you are sick and unable to complete an assignment or attend class, please go to University Health Services. For minor illnesses, we expect grace days or our late penalties to provide sufficient accommodation. For medical emergencies (e.g. prolonged hospitalization), students may request an extension afterward by contacting their Student Liaison or Academic Advisor and having them reach out to the instructor on their behalf. Please plan ahead if possible.
- *Family/Personal Emergencies:* If you have a family emergency (e.g. death in the family) or a personal emergency (e.g. mental health crisis), please contact your academic adviser or Counseling and Psychological Services (CaPS). In addition to offering support, they will reach out to the instructors for all your courses on your behalf to request an extension.
- *University-Approved Absences:* If you are attending an out-of-town university-approved event (e.g. multi-day athletic/academic trip organized by the university), you may request an extension for the duration of the trip. You must provide confirmation of your attendance, usually from a faculty or staff organizer of the event.

**Accommodations for Students with Disabilities:** If you have a disability and have an accommodation letter from the Disability Resources office, I encourage you to discuss your accommodations and needs with the Moses Center for Student Accessibility as early as possible in the semester for assistance. (Telephone: 212-998-4980, Website: http://www.nyu.edu/csd) We will work with you to ensure that accommodations are provided as appropriate. If you suspect that you may have a disability and would benefit from accommodations but are not yet registered with the Office of Disability Resources, I encourage you to contact them. Please note that it is your responsibility to schedule exams at the Moses Center, and to ensure that you are receiving all accommodations you are approved for.


**Collaboration among Students:** The purpose of student collaboration is to facilitate learning, not to circumvent it. Studying the material in groups is strongly encouraged. It is also allowed to seek help from other students in understanding the material needed to solve a particular homework problem, provided no written notes (including code) are shared, or are taken at that time, and provided learning is facilitated, not circumvented. The actual solution must be done by each student alone.

The presence or absence of any form of help or collaboration, whether given or received, must be explicitly stated and disclosed in full by all involved. Specifically, each assignment solution must include answering the following questions:

- Did you receive any help whatsoever from anyone in solving this assignment? Yes / No.
If you answered ‘yes’, give full details: ____________
(e.g. “Jane Doe explained to me what is asked in Question 3.4”)
- Did you give any help whatsoever to anyone in solving this assignment? Yes / No.
If you answered ‘yes’, give full details: _____________
(e.g. “I pointed Joe Smith to section 2.3 since he didn’t know how to proceed with Question 2”)
