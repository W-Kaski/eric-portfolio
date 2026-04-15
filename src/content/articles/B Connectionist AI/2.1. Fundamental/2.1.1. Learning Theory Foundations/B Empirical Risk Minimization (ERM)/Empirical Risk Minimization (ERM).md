---
title: "Empirical Risk Minimization (ERM)"
date: "2025-04-06"
---
# 经验风险最小化 (Empirical Risk Minimization, ERM)

**Parent**：[[Learning Theory Foundations|2.1.1. 学习理论基础 (Learning Theory Foundations)]]

---


### 3.2 经验风险 (我们能做的事)

由于算不出上面的积分，我们用样本均值来代替：

$$R_{emp}(f) = \frac{1}{n} \sum_{i=1}^{n} L(f(x_i), y_i)$$

- **$\sum$ (Sum)**：把你手里 $n$ 个样本的错误加起来。
    
- **$\frac{1}{n}$**：算平均分。
    