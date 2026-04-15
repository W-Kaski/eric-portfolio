---
title: "Initialization Methods"
date: "2025-05-04"
---
# 参数初始化 (Initialization Methods)

**Parent**：[[Neural Network Foundations|2.4.1. 神经网络基础 (Neural Network Foundations)]]

---

# Parameter Initialization (参数初始化)

## 1. 为什么不能初始化为零？ (Why not Zero Initialization?)

这是最经典的面试题。如果我们把所有权重 $W$ 初始化为 0：

- **Symmetry Problem (对称性问题)**: 同一层的所有神经元将具有相同的输出。
    
- **Symmetry Breaking (对称性打破) 失败**: 在反向传播时，它们的梯度也会完全相同，这意味着无论训练多久，这些神经元学到的特征都是一模一样的。这使得多层网络退化成了单层网络。
    

---

## 2. 初始化的核心目标 (Core Objectives)

1. **Breaking Symmetry (打破对称性)**: 保证每个神经元学习不同的特征。
    
2. **Maintaining Variance (维持方差)**: 确保信号（和梯度）在经过多层网络后，其方差既不会消失（变为0），也不会爆炸（变为无穷大）。
    

---

## 3. 经典的初始化方法 (Classic Methods)

### A. Random Normal/Uniform Initialization

- **Logic**: 使用正态分布（Normal）或均匀分布（Uniform）随机采样。
    
- **Issue**: 如果标准差（Standard Deviation）设置不当，很容易导致深层网络的信号迅速衰减。
    

### B. Xavier Initialization (又称 Glorot Initialization)

这是为了解决 **Sigmoid** 或 **Tanh** 激活函数在深层网络中梯度消失的问题。

- **Formula**: 权重从均值为 0，方差为 $\text{Var}(W) = \frac{2}{n_{in} + n_{out}}$ 的分布中采样。
    
- **Insight**: 它的设计思路是让每一层输出的方差等于输入的方差，保持信号强度。
    
- **Best For**: 线性激活、Sigmoid、Tanh。
    

### C. He Initialization (又称 Kaiming Initialization)

由何恺明（Kaiming He）提出。由于 **ReLU** 激活函数会将一半的输入设为 0，Xavier 初始化在 ReLU 网络中会导致信号减半。

- **Formula**: 方差设为 $\text{Var}(W) = \frac{2}{n_{in}}$。
    
- **Insight**: 它考虑到了 ReLU 的特性，补偿了被丢弃的那一半信号。
    
- **Best For**: **ReLU** 及其变体 (Leaky ReLU)。
    

---

## 4. 核心术语对比表 (Key Terminology)

|**英文术语 (English Term)**|**中文释义**|**重要性说明**|
|---|---|---|
|**Symmetry Breaking**|对称性打破|初始化的首要任务，防止神经元“同质化”。|
|**Gradient Vanishing**|梯度消失|权重太小导致深层梯度接近 0。|
|**Gradient Explosion**|梯度爆炸|权重太大导致梯度变为 NaN (Not a Number)。|
|**Fan-in / Fan-out**|输入节点数 / 输出节点数|初始化公式中用于计算方差的关键维度。|
|**Standard Deviation ($\sigma$)**|标准差|控制随机采样波动范围的超参数。|
|**Saturation**|饱和|避免权重过大导致 Sigmoid 等函数进入饱和区。|

---

## 5. 总结与工程建议 (Summary & Tips)

|**激活函数 (Activation)**|**推荐初始化方法 (Recommended Method)**|
|---|---|
|**Sigmoid / Tanh**|**Xavier Initialization**|
|**ReLU / Leaky ReLU**|**He (Kaiming) Initialization**|
|**LSTM / RNN**|**Orthogonal Initialization (正交初始化)**|

### 教授的私房建议 (Pro-Tips):

1. **Bias Initialization**: 偏置（Bias）通常可以直接初始化为 **0**，因为权重 $W$ 已经打破了对称性。
    
2. **Framework Defaults**: 现代框架（PyTorch/TensorFlow）都有默认的初始化策略。比如 PyTorch 的 `nn.Linear` 默认使用一种基于 $1/\sqrt{n_{in}}$ 的初始化。
    
3. **Combination with BN**: 如果你使用了 **Batch Normalization**，模型对初始化的依赖会大大降低，但一个好的初始化依然能让训练起步更稳。
