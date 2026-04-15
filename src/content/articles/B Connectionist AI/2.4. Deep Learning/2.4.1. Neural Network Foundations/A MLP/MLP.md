---
title: "MLP"
date: "2025-05-09"
---
# 多层感知机 (MLP)

**Parent**：[[Neural Network Foundations|2.4.1. 神经网络基础 (Neural Network Foundations)]]

---

# Multilayer Perceptron (MLP)

## 1. 什么是 MLP？ (Definition)

**Multilayer Perceptron (MLP)**，也称为 **Feedforward Neural Network (FNN, 前馈神经网络)**。它是一种由多层神经元构成的结构，信息从输入层开始，单向地穿过隐藏层，最终到达输出层。

### 核心结构 (Architecture):

1. **Input Layer (输入层)**: 负责接收原始数据（例如图像的像素点或特征向量）。
    
2. **Hidden Layer (隐藏层)**: 位于输入和输出之间。一个网络可以有多个隐藏层，这是“深度 (Deep)”的由来。
    
3. **Output Layer (输出层)**: 生成最终的预测结果（例如分类标签或数值）。
    
4. **Fully Connected (FC, 全连接)**: 在 MLP 中，每一层的每一个神经元都与下一层的所有神经元相连，因此也常被称为 **Dense Layer (稠密层)**。
    

---

## 2. 单个神经元的数学模型 (Mathematical Model of a Neuron)

每一个神经元都在执行一个 **Linear Transformation (线性变换)** 后接一个 **Non-linear Activation (非线性激活)**。

公式表示为：

$$y = \sigma(\sum_{i=1}^{n} w_i x_i + b)$$

或者使用矩阵形式 (Matrix Form)：

$$a = \sigma(W \cdot x + b)$$

- **Weights (权重, $W$)**: 决定了输入信号的重要性。
    
- **Bias (偏置, $b$)**: 允许激活函数上下移动，增加模型的灵活性。
    
- **Weighted Sum (加权总和)**: 即 $W \cdot x + b$。
    
- **Activation Function (激活函数, $\sigma$)**: 赋予模型处理非线性问题的能力。
    

---

## 3. 激活函数 (Activation Functions)

如果没有激活函数，无论叠加多少层 MLP，它在数学上仍然等同于一个单层的线性回归。我们需要 **Non-linearity (非线性)**。

- **ReLU (Rectified Linear Unit)**: 目前最常用的激活函数。公式：$f(x) = \max(0, x)$。它能有效缓解 **Gradient Vanishing (梯度消失)** 问题。
    
- **Sigmoid**: 将输出压缩到 $(0, 1)$ 之间。常用于 **Binary Classification (二分类)** 的输出层。
    
- **Tanh (Hyperbolic Tangent)**: 将输出压缩到 $(-1, 1)$ 之间。
    
- **Softmax**: 用于 **Multi-class Classification (多分类)** 的输出层，将输出转化为概率分布。
    

---

## 4. 训练过程 (The Training Process)

训练一个 MLP 包含两个主要循环步骤：

### Step A: Forward Propagation (前向传播)

数据从 Input 流向 Output。每一层计算加权和并经过激活函数，直到算出 **Predicted Value (预测值, $\hat{y}$)**。

### Step B: Backward Propagation (反向传播)

这是神经网络学习的核心。

1. **Loss Function (损失函数)**: 计算预测值与真实值之间的差距。
    
    - 回归问题常用：**Mean Squared Error (MSE, 均方误差)**。
        
    - 分类问题常用：**Cross-Entropy Loss (交叉熵损失)**。
        
2. **Chain Rule (链式法则)**: 通过微积分的链式法则，计算损失函数对每个参数（$W$ 和 $b$）的 **Gradient (梯度)**。
    
3. **Optimizer (优化器)**: 根据梯度更新参数。
    
    - **SGD (Stochastic Gradient Descent, 随机梯度下降)**。
        
    - **Adam (Adaptive Moment Estimation)**: 目前最流行的自适应优化算法。
        
4. **Learning Rate (学习率, $\eta$)**: 控制每次参数更新的步长。
    

---

## 5. 关键术语与挑战 (Key Concepts & Challenges)

- **Universal Approximation Theorem (通用近似定理)**: 该定理证明，只要有足够多的隐藏层神经元，包含至少一个非线性隐藏层的 MLP 可以模拟任何连续函数。
    
- **Overfitting (过拟合)**: 模型在 **Training Set (训练集)** 上表现完美，但在 **Test Set (测试集)** 上表现糟糕（泛化能力差）。
    
- **Regularization (正则化)**: 防止过拟合的技术，如 **L1/L2 Regularization** 或 **Dropout (随机失活)**。
    
- **Hyperparameters (超参数)**: 训练前手动设置的参数，如 **Batch Size (批大小)**, **Epochs (迭代轮数)**, **Number of Hidden Units (隐藏单元数)**。