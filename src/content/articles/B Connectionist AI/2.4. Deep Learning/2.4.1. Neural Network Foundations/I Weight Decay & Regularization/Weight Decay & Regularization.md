---
title: "Weight Decay & Regularization"
date: "2025-04-18"
---

parent:[[Neural Network Foundations]]
# Weight Decay & Regularization

## 1. 核心挑战：过拟合 (Overfitting)

在深度学习中，我们的目标是获得优秀的 **Generalization (泛化能力)**。

- **Overfitting**: 模型记住了训练数据的**噪声 (Noise)** 而非底层**规律 (Patterns)**。
    
- **Occam's Razor (奥卡姆剃刀原理)**: 在所有能解释数据的模型中，最简单的那个往往是最好的。正则化的本质就是追求 **Simplicity (简单性)**。
    

---

## 2. L2 Regularization (L2 正则化 / 权重衰减)

这是深度学习中最常用的正则化方法，也叫 **Weight Decay (权重衰减)**。

### 数学直觉 (Mathematical Intuition)

我们在原始的 **Loss Function ($L_0$)** 后面加上一个 **Penalty Term (惩罚项)**：

$$L = L_0 + \frac{\lambda}{2n} \sum |w|^2$$

- **$\lambda$ (Lambda)**: 称为 **Regularization Parameter (正则化参数)**。它控制了我们对“参数大小”的惩罚力度。
    
- **Why it works**: 较小的权重意味着模型对输入数据的微小扰动不那么敏感，从而使拟合出的函数更加平滑。
    

### 为什么叫权重衰减？ (Weight Decay)

在梯度下降更新参数时，权重的更新公式变为：

$$w_{t+1} = (1 - \eta \lambda) w_t - \eta \nabla L_0$$

你看，在减去梯度之前，权重先乘以了一个小于 1 的系数 $(1 - \eta \lambda)$。这意味着每一轮迭代，权重都在自发地 **Decay (衰减)**。

---

## 3. L1 Regularization (L1 正则化)

与 L2 不同，L1 惩罚的是权重的绝对值。

- **Formula**: $L = L_0 + \frac{\lambda}{n} \sum |w|$
    
- **Feature: Sparsity (稀疏性)**: L1 正则化倾向于产生 **Sparse Weights (稀疏权重)**，即让许多不重要的权重直接变为 **0**。这在某种程度上起到了 **Feature Selection (特征选择)** 的作用。
    

---

## 4. L1 vs. L2 对比表 (Comparison Table)

|**特性 (Property)**|**L1 Regularization (Lasso)**|**L2 Regularization (Ridge/Weight Decay)**|
|---|---|---|
|**惩罚项 (Penalty)**|权重的绝对值之和|权重的平方和|
|**权重影响**|产生许多为 0 的权重|产生许多接近 0 的小权重|
|**主要用途**|**Feature Selection** (特征选择)|**Preventing Overfitting** (通用的防止过拟合)|
|**数学性质**|在 0 点处不可导 (Computational complexity)|处处可导 (Mathematically convenient)|
|**鲁棒性**|对异常值更具鲁棒性|计算更稳定|

---

## 5. Early Stopping (提前停止)

这是一种非常直观且高效的“时间维度”上的正则化。

- **Logic**: 在训练过程中，同时监控 **Training Loss** 和 **Validation Loss (验证集损失)**。
    
- **Action**: 当 Training Loss 持续下降，但 Validation Loss 开始上升时，说明模型开始过拟合了。此时我们立即停止训练，保留 Validation Loss 最小时的参数。
    

---

## 6. 核心术语总结 (Key Terminology)

- **Penalty Term**: 惩罚项。加在 Loss 后面的额外部分。
    
- **Complexity**: 复杂度。正则化试图降低模型的复杂度。
    
- **Hyperparameter Tuning**: 超参数调优。$\lambda$ 的大小需要通过实验找到最优值。
    
- **Generalization Error**: 泛化误差。衡量模型在未知数据上的表现。
    
- **Shrinkage**: 缩减。正则化将参数向 0 的方向“拉拽”的过程。