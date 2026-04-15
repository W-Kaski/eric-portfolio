---
title: "Structural Risk Minimization (SRM)"
date: "2025-05-11"
---
# 结构风险最小化 (Structural Risk Minimization, SRM)

**Parent**：[[Learning Theory Foundations|2.1.1. 学习理论基础 (Learning Theory Foundations)]]

---

### B. 结构风险最小化 (SRM)

为了解决 ERM 的作弊问题，我们给公式加个限制：

$$R_{srm}(f) = \frac{1}{n} \sum_{i=1}^{n} L(f(x_i), y_i) + \lambda J(f)$$

- **$J(f)$ (Regularization)**：**正则化项**。描述模型有多复杂（比如参数有多少、数值有多大）。
    
- **$\lambda$**：调节系数。你有多在意模型的复杂程度。
    
- **哲学含义**：如果两个模型表现一样好，我选那个更简单的（奥卡姆剃刀原则）。
    