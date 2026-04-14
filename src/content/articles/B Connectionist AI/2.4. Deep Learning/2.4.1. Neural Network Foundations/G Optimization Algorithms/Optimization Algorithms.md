
parent:[[Neural Network Foundations]]
# Optimization Algorithms (优化算法)

## 1. 核心概念 (Core Concepts)

- **Gradient (梯度)**: 损失函数对参数的偏导数向量，指向函数值上升最快的方向。
    
- **Step Size / Learning Rate ($\eta$)**: 学习率，决定了我们在梯度负方向上“迈多大步”。
    
- **Convergence (收敛)**: 随着迭代进行，Loss 趋于稳定并达到最小值的状态。
    
- **Loss Landscape (损失平面)**: 参数空间中损失函数起伏的样子，像是一片山脉。
    

---

## 2. 梯度下降家族 (The Gradient Descent Family)

### A. Batch Gradient Descent (BGD)

- **Method**: 使用**整个训练集**来计算梯度并更新一次参数。
    
- **Cons**: 当数据量巨大时，计算极其缓慢，且无法在线更新。
    

### B. Stochastic Gradient Descent (SGD)

- **Method**: 每看**一个样本**就更新一次参数。
    
- **Pros**: 速度快，引入的噪声有助于跳出 **Local Minima (局部最小值)**。
    
- **Cons**: 更新非常不稳定，路径呈“Z”字形震荡。
    

### C. Mini-batch Gradient Descent

- **Method**: 每次使用一小批数据（如 32, 64, 128 个样本）。
    
- **Status**: 深度学习的**标准做法**。它平衡了计算效率和内存占用。
    

---

## 3. 带有“动量”的优化 (Momentum-based Methods)

为了解决 SGD 在沟壑中震荡严重的问题，我们引入了物理学中的惯性概念。

### A. Momentum (动量法)

- **Concept**: 模拟小球下坡。它不仅考虑当前的梯度，还累积之前的梯度方向（**Velocity**）。
    
- **Formula**: $v_t = \gamma v_{t-1} + \eta \nabla L$; $w = w - v_t$
    
- **Benefit**: 在梯度方向一致的情况下加速，在方向波动的维度减小更新，从而减少震荡。
    

---

## 4. 自适应学习率算法 (Adaptive Learning Rate)

不同的参数（权重）更新频率不同。我们希望经常更新的参数步子小一点，稀疏更新的参数步子大一点。

### A. AdaGrad

- **Feature**: 为每个参数保留梯度的平方和，自动缩小频繁更新参数的学习率。
    
- **Issue**: 训练后期学习率会变得极小，导致训练过早停止。
    

### B. RMSprop

- **Logic**: 由 Hinton 提出，通过使用 **Exponential Moving Average (EMA, 指数移动平均)** 解决了 AdaGrad 学习率消失过快的问题。
    

### C. Adam (Adaptive Moment Estimation)

- **Status**: 深度学习中的 **"Gold Standard" (金准则)**。
    
- **Logic**: 结合了 **Momentum**（梯度的均值）和 **RMSprop**（梯度的方差）。
    
- **Why it's good**: 它对超参数不敏感，通常使用默认的学习率 $0.001$ 就能跑得很好。
    

---

## 5. 挑战与困难 (Challenges in Optimization)

- **Local Minima (局部最小值)**: 损失平面的低洼处。虽然曾被视为大敌，但在高维空间中，真正的局部最小值很少。
    
- **Saddle Points (鞍点)**: 一个维度向上，另一个维度向下的点（形如马鞍）。在深度学习中，模型更容易被困在鞍点周围。
    
- **Gradient Vanishing / Explosion**: 梯度在回传时变得太小或太大。
    

---

## 6. 优化器对比表 (Comparison Table)

|**优化算法 (English Name)**|**核心特点 (Key Feature)**|**优点 (Pros)**|**缺点 (Cons)**|
|---|---|---|---|
|**SGD**|基础更新|简单，理论基础扎实|容易陷入鞍点，收敛慢|
|**Momentum**|引入惯性 (Velocity)|减少震荡，加速收敛|增加了一个超参数 $\gamma$|
|**RMSprop**|自适应学习率|适合非平稳目标（如 RNN）|依然需要手动设置学习率|
|**Adam**|动量 + 自适应|**收敛极快**，最常用|某些场景下泛化能力不如 SGD|

---

## 7. 教授的工程指南 (Professor's Recommendations)

1. **If you are a beginner**: 永远先试 **Adam**。它的默认参数通常表现优异。
    
2. **If you care about Generalization (泛化)**: 在计算机视觉领域，许多顶会论文依然使用 **SGD with Momentum**，因为研究表明它比 Adam 更有可能找到质量更高的解。
    
3. **Learning Rate Decay**: 无论使用哪种优化器，训练后期降低学习率（**Learning Rate Scheduling**）都是提升模型精度的关键。
    

---

### 教授总结：

至此，你已经学习了神经网络的所有核心基础：

- **结构 (Architecture)**: MLP, Activation, BN, Dropout, Init.
    
- **目标 (Objective)**: Loss Functions.
    
- **动力 (Optimization)**: SGD, Adam.