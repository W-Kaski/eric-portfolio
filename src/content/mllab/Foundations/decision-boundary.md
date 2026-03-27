---
title: "Decision Boundaries"
date: "2026-03-20"
folder: "Foundations"
category: "Machine Learning"
tags: ["Classification", "SVM", "Logistic Regression", "Interactive"]
description: "Interactive exploration of how different classification models (Logistic Regression, SVM, and Neural Networks) partition data space."
featured: true
---

## Understanding Decision Boundaries

A **decision boundary** is a hypersurface that partitions the underlying vector space into two or more sets, one for each class. Depending on the algorithm used, the decision boundary can be linear, non-linear, or highly complex.

In this interactive lab, we visualize how different models learn boundaries between two classes of data points.

### 1. Logistic Regression
Logistic Regression is a linear classifier. It finds a single straight line (hyperplane) that optimally separates the data:
$$y = w_1x_1 + w_2x_2 + b$$
The output is passed through a sigmoid function to yield probabilities. Because the boundary is fundamentally linear, it struggles with XOR or concentrically distributed data unless feature engineering is applied.

### 2. Support Vector Machines (SVM)
The power of SVM lies in the **kernel trick**, which implicitly projects data into a higher-dimensional space where it becomes linearly separable.
- **Linear Kernel**: Produces a straight line boundary (similar to Logistic Regression) but tries to maximize the *margin* separating the classes.
- **RBF (Radial Basis Function) Kernel**: Can create highly non-linear, localized boundaries capable of perfectly segregating complex datasets.

### 3. Neural Networks
Deep learning models learn feature representations internally. A multi-layer perceptron (MLP) with non-linear activation functions (like ReLU) can approximate arbitrarily complex decision boundaries, piecewise-linear style.

Try adding points above and selecting different models to see how their decision boundaries adapt in real-time!
