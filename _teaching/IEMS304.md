---
title: "Statistical Learning for Data Analysis (IEMS-304, Northwestern)"
collection: teaching
type: "Undergraduate course"
permalink: /teaching/2024-SL-Da
venue: "Northwestern IEMS"
date: 2025-01-01
location: "Evanston, IL"
---


Required undergraduate course on predictive modeling in data science. **Syllabus**:[[pdf]](https://2prime.github.io/files/IEMS304/SyllabusIEMS304.pdf)


## Objectives:

- Understand common data structures in modern predictive and explanatory modeling in business, engineering, and science and how to formulate the appropriate solutions.
- Learn R software basics and how to use it for various regression and classification problems.
- Develop ability to fit appropriate linear and logistic models, including model selection and model diagnostics.
- Develop ability to interpret fitted linear and logistic regression models for both explanatory and predictive purposes.
- Learn concept in regression and classification with nonlinearity, including maximum likelihood estimation, cross-validation, ridge and lasso.
- Learn how to fit and interpret popular supervised learning models including trees, smoothers, nearest neighbors, random forests, and boosted trees.

## Logistics
**Time and Location:** Monday, Wednesday and Friday, 9.00 A.M.- 9.50 A.M. Tech L251

**Office Hour:** Monday 10 A.M. Tech M237

**TA Office Hour:**

**ChatGPT Tutor:** The link here provides a Large Language Model agents that is specifically trained for this course.

**Preliminary**: [[Note]](https://2prime.github.io/files/IEMS304/IEMS304ReferenceGuide.pdf)
 
## Scheldue:

[[Cheat Sheet and Sample Exam]](https://www.overleaf.com/read/rbzhmhqxmrdh#5df6dc)

**Textbook**: 
- ISL: James, Gareth, et al. An introduction to statistical learning.
- 229: [[Stanford CS229 Lecture Note]](https://cs229.stanford.edu/main_notes.pdf)
  
###  Lecture 1: Introduction to Statistical Learning
(4.1,4.2,4.4) [[Feedback Form]](https://forms.gle/jfDxyZF5E2TD8T3i6)

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec1.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/IEMS304lec1filled.pdf), **Reference**: ISL Section 2
- Logistics
- What is and why statistical learning?
- Supervised Learning, Unsupervised learning, Reinforcement Learning

**Reading**
  - [[the bitter lesson]](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)
  - [[blog on generative models]](https://oecs.mit.edu/pub/oye8m8nz/release/4)
  - [[bias-variance trade-off]](https://mlu-explain.github.io/bias-variance/)

#### Lab 1: Statistical Review  (4.4)
**Reference:** [[Note]](https://2prime.github.io/files/IEMS304/IEMS304ReferenceGuide.pdf)

#### Homework 1: (Due:4.11)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework1.pdf), [[latex]](https://www.overleaf.com/read/hrjdgxcbrxkw#3c9a85), Data: [[miles.csv]](https://drive.google.com/file/d/1RHTCfHUYgMXP5uzeGqr53H9Hq4eZ2wJL/view?usp=sharing)

###  Lecture 2: Simple Linear Regression
(4.7,4.9,4.11)[[Feedback Form]](https://forms.gle/ES25pNxWpWy5LzUM9)

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec2.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/IEMS304lec2filled.pdf), [[additional note on math]](https://2prime.github.io/files/IEMS304/simplelinearregression.pdf) 


**Reference**: ISL Section 3.1, 4.3
- Simple Linear Regression and closed form of Least Square
- Unbias and Varaince, Confidence Interval
- log likelihood, logistic regression
- Gradient descent and Newton methods

#### Lab 2: Linear Algebra Review (4.11)
**Slide**: [[pdf]](https://cs229.stanford.edu/notes2022fall/linalg.pdf)

#### Homework 2: (Due:4.18)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework2.pdf), [[latex]](https://www.overleaf.com/read/sfpcfntxkbzx#90d554), 

###  Lecture 3: Multiple Linear Regression
(4.14,4.16,4.18,4.23,4.25) [[Feedback Form]]()

[[application examples]](https://2prime.github.io/files/IEMS304/linear_regression_code.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/linear_regression_code_filled.pdf)

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec3.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/IEMS304lec3filled.pdf), **Reference**: ISL Section 3.2,3.3
- Multiple Linear Regression, Degree of Freedom
- t-test, confidence interval
- Categorical Predictor and interaction
- Leverage and Influence
-  Residual Diagnostics
**Reading**:
- [[Linear Regression]](https://mlu-explain.github.io/linear-regression/)

### Midterm 1 (4.21)
- Taxonomy of Learning, Bias and Variance Trade-off
- Optimization
- Linear Regression and Statistical Inference

#### Homework 3: (Due:5.2)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework3.pdf), [[latex]](https://www.overleaf.com/read/krrjpgbfmfkt#6a9b05), [[data]](https://2prime.github.io/files/IEMS304/HW2_data.xls)


#### Lab 3: Linear Regression
(5.2)


### Midterm 2 (5.09)
- Linear Regression
- Model Selection
- Shrinkage



###  Lecture 4: Model and Variable Selection, Shrinkage, and Multicollinearity
(4.28,4.30,5.2,5.5)[[Feedback Form]]()

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec4.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/IEMS304lec4filled.pdf), **Reference**: ISL Section 6
- Model and Variable Selection,
- Multicollinearity
- James-Stein Estimator, Ridge Regression, Lasso, ISTA

#### Lab 4: Shrinkage
(5.2)

#### Homework 4: (Due:5.16)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework4.pdf), [[latex]](https://www.overleaf.com/read/gdcsnhftfhbv#7d6dfd), [[data]](https://2prime.github.io/files/IEMS304/HW4_data.csv)

#### Homework 5: (Due: 5.23)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework5.pdf) [[latex]](https://www.overleaf.com/read/hrkdhtqpnsyy#f612b7)

###  Lecture 5: Basic Nonlinear and Nonparametric regression/classification
(5.5,5.12,5.14)
**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec5.pdf) [[annotated slide]](https://2prime.github.io/files/IEMS304/IEMS304lec5filled.pdf), **Reference**: ISL Section 2.2,3.5,4.6.5, 5.2,5.3,7
- K-Nearest Neighboor, nonlinear regression
- Bootstrap and Conformal Prediction [[note]](https://www.stat.berkeley.edu/~ryantibs/statlearn-s23/lectures/conformal.pdf)

#### Homework 6: (Due: 5.31)
Homework: [[pdf]](https://2prime.github.io/files/IEMS304/IEMS304homework6.pdf) [[latex]](https://www.overleaf.com/read/jmczjqssqywq#38a373) [[data HW6]](https://2prime.github.io/files/IEMS304/HW6_data.csv) [[spambase.txt]](https://2prime.github.io/files/IEMS304/spambase.txt) [[spambase_info.txt]](https://2prime.github.io/files/IEMS304/spambase_info.txt)

**Readings**
- [[Curse of Dimensionality in Classification]](https://www.visiondummy.com/2014/04/curse-dimensionality-affect-classification/)


**Cheatsheet**:

### Lecture 6: Trees and Neural Network
(5.16,5.19,5.21)[[Feedback Form]]()

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec6.pdf) [[annotated slide]](), **Reference**: ISL Section 8.1, 229 Section 7
- Neural Network
- Regression Tree, Classification Tree

**Readings**
-[[Decision Tree]](https://mlu-explain.github.io/decision-tree/)
-[[Random Forest]](https://mlu-explain.github.io/random-forest/)

#### Lab 5: Nonlinear Regression
(5.23)

###  Lecture 7: Unsupervised Learning
(5.23,5.26,5.28)[[Feedback Form]]()

**Slide**:[[pdf]](https://2prime.github.io/files/IEMS304/IEMS304lec8.pdf) [[annotated slide]](), **Reference**: ISL Section 10, 229 Section 10, 12
- $k-$means, Spectral Clustering, PCA

#### Lab 6: Unsupervised Learning
(5.30)



### Final Review 
(6.8)
**Cheat Sheet**:

## ChatGPT
While the use of AI tools to aid in problem-solving is becoming increasingly prevalent, it is important to note that relying solely on AI to complete your homework is not in accordance with the expectations of this course. Submitting AI-generated solutions without proper acknowledgment is a violation of ethical guidelines and academic standards.

## General Policies
In general, we do not grant extensions on assignments/exams. There are several exceptions:

- Medical Emergencies: If you are sick and unable to complete an assignment or attend class, please go to University Health Services. For minor illnesses, we expect grace days or our late penalties to provide sufficient accommodation. For medical emergencies (e.g. prolonged hospitalization), students may request an extension afterward by contacting their Student Liaison or Academic Advisor and having them reach out to the instructor on their behalf. Please plan ahead if possible.
- Family/Personal Emergencies: If you have a family emergency (e.g. death in the family) or a personal emergency (e.g. mental health crisis), please contact your academic adviser or Counseling and Psychological Services (CaPS). In addition to offering support, they will reach out to the instructors for all your courses on your behalf to request an extension.
- University-Approved Absences: If you are attending an out-of-town university-approved event (e.g. multi-day athletic/academic trip organized by the university), you may request an extension for the duration of the trip. You must provide confirmation of your attendance, usually from a faculty or staff organizer of the event.




