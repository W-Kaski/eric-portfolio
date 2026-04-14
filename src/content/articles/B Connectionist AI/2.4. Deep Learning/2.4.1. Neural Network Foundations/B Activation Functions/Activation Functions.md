# 激活函数 (Activation Functions)

**Parent**：[[Neural Network Foundations|2.4.1. 神经网络基础 (Neural Network Foundations)]]

---

# Activation Functions (激活函数)

## 1. 核心概念 (Core Concepts)

- **Non-linearity (非线性)**: 激活函数必须是非线性的，这样多层神经网络才能拟合复杂的函数（根据 **Universal Approximation Theorem**）。
    
- **Differentiability (可微性)**: 激活函数必须是可微的，因为我们需要通过 **Backpropagation (反向传播)** 计算 **Gradient (梯度)** 来更新参数。
    
- **Saturation (饱和)**: 当输入进入某些函数的平坦区域时，梯度会变得接近于 0，导致 **Gradient Vanishing (梯度消失)**。
    

---

## 2. 常用激活函数详解 (Detailed Functions)

### A. Sigmoid

历史上最早使用的激活函数，将输入压缩到 $(0, 1)$。

- **Formula**: $\sigma(x) = \frac{1}{1 + e^{-x}}$
    
- **Feature**: 它可以被解释为概率（Probability）。
    
- **Critical Issue**: 存在 **Gradient Vanishing** 问题，且输出不是 **Zero-centered (以0为中心)**，这会导致神经网络收敛变慢。
    

### B. Tanh (Hyperbolic Tangent)

将输入压缩到 $(-1, 1)$。

- **Formula**: $\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$
    
- **Advantage**: 它是 **Zero-centered** 的，通常在隐藏层表现优于 Sigmoid。
    
- **Disadvantage**: 依然存在高值区的 **Saturation (饱和)** 和梯度消失问题。
    

### C. ReLU (Rectified Linear Unit)

现代深度学习的默认选择（Standard Choice）。

- **Formula**: $f(x) = \max(0, x)$
    
- **Pros**: 计算速度极快（只需判断是否大于0），且在正区间解决了梯度消失问题。
    
- **Cons**: **Dead ReLU (神经元死亡)** 现象。如果输入恒小于0，该神经元的梯度将永远为0，不再更新。
    

### D. Leaky ReLU

为了解决 **Dead ReLU** 问题而设计。

- **Formula**: $f(x) = \max(\alpha x, x)$，其中 $\alpha$ 是一个很小的常数（如 0.01）。
    
- **Advantage**: 在负区间也有微小的梯度，保证了神经元即使在负输入下也能“存活”。
    

### E. Softmax

通常只用于 **Output Layer (输出层)** 进行多分类任务。

- **Function**: 将一组数值转化为 **Probability Distribution (概率分布)**，所有输出项之和为 1。
    

---

## 3. 激活函数对比表 (Comparison Table)

|**激活函数 (Name)**|**数学公式 (Formula)**|**输出范围 (Output Range)**|**优点 (Pros)**|**缺点 (Cons)**|
|---|---|---|---|---|
|**Sigmoid**|$\frac{1}{1+e^{-x}}$|$(0, 1)$|易于理解，适合输出层概率预测|**Gradient Vanishing**; 非零中心; 计算量相对大|
|**Tanh**|$\frac{e^x - e^{-x}}{e^x + e^{-x}}$|$(-1, 1)$|**Zero-centered**; 收敛比 Sigmoid 快|依然存在 **Saturation (饱和)** 导致的梯度消失|
|**ReLU**|$\max(0, x)$|$[0, \infty)$|**Computational Efficiency** (高计算效率); 缓解梯度消失|**Dead ReLU** (神经元永久失活)|
|**Leaky ReLU**|$\max(\alpha x, x)$|$(-\infty, \infty)$|解决了 Dead ReLU 问题|需要额外调整超参数 $\alpha$|
|**Softmax**|$\frac{e^{z_i}}{\sum e^{z_j}}$|$(0, 1)$|输出符合概率分布|仅适用于多分类输出层|

---

## 4. 教授的工程建议 (Professor's Tips)

1. **Default Choice (默认选择)**: 除非你有特殊理由，否则在 **Hidden Layers (隐藏层)** 中优先使用 **ReLU**。
    
2. **Addressing Issues (问题处理)**: 如果你在训练过程中发现大量神经元“死亡”（输出恒为0），请尝试更换为 **Leaky ReLU** 或 **ELU**。
    
3. **Output Layer (输出层)**:
    
    - **Binary Classification (二分类)**: 使用 Sigmoid。
        
    - **Multi-class Classification (多分类)**: 使用 Softmax。
        
    - **Regression (回归)**: 通常不使用激活函数（即 Linear Activation）。

