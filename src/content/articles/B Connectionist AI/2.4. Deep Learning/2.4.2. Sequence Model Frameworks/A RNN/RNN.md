# 循环神经网络 (Recurrent Neural Network, RNN)

**Parent**：[[Sequence Model Frameworks|2.4.2. 序列模型框架 (Sequence Model Frameworks)]]

**Children**：
- [[A LSTM/LSTM|A. LSTM]]
- [[B GRU/GRU|B. GRU]]

---

# Recurrent Neural Network (RNN)

## 1. 核心定义 (The Core Definition)

**RNN** 是一种专门设计用于处理 **Sequential Data (序列数据)** 的神经网络。它的核心特征是包含一个 **Recurrent Connection (循环连接)**，允许信息从当前步骤传递到下一步骤。

- **Temporal Dependency (时间依赖)**: RNN 假设序列中当前时刻的输出不仅取决于当前的输入，还取决于之前的“记忆”。
    
- **Hidden State ($h_t$, 隐藏状态)**: 这是 RNN 的“大脑”或“记忆”，它存储了截至目前为止所有历史信息的压缩表示。
    

---

## 2. 数学表达 (The Mathematics)

在每一个时间步 (Time Step) $t$，网络执行以下计算：

1. **Update Hidden State**:
    
    $$h_t = \sigma(W_{hh}h_{t-1} + W_{xh}x_t + b_h)$$
    
2. **Calculate Output**:
    
    $$y_t = \text{softmax}(W_{hy}h_t + b_y)$$
    

- **$W_{hh}$ (Recurrent Weights)**: 负责将过去的记忆传递到未来。
    
- **$W_{xh}$ (Input Weights)**: 负责将当前的输入映射到隐藏空间。
    
- **Shared Parameters (权重共享)**: 关键点在于，**在所有时间步中，$W$ 和 $b$ 都是完全相同的**。这大大减少了参数量，并允许处理任意长度的序列。
    

---

## 3. RNN 的四种基本模式 (Architecture Patterns)

根据输入和输出的数量，RNN 有不同的变体：

|**模式 (Pattern)**|**描述 (Description)**|**应用场景 (Applications)**|
|---|---|---|
|**One-to-Many**|一个输入，多个输出|**Image Captioning** (给图像写描述词)|
|**Many-to-One**|多个输入，一个输出|**Sentiment Analysis** (情感分析，如判断一段话是好评还是差评)|
|**Many-to-Many (Sync)**|多个输入，等量输出|**Video Classification** (视频帧标记), **NER** (命名实体识别)|
|**Many-to-Many (Async)**|多个输入，变量输出|**Machine Translation** (机器翻译，即 Seq2Seq 架构)|


---

## 4. 致命缺陷：梯度消失与爆炸 (The Achilles' Heel)

RNN 理论上可以记住无限长的历史，但实际上存在严重的 **Long-term Dependency Problem (长程依赖问题)**：

- **Gradient Vanishing (梯度消失)**: 在 **BPTT (Backpropagation Through Time, 随时间反向传播)** 过程中，导数在时间轴上连乘。如果权重较小，梯度会迅速衰减为 0，导致网络“忘记”遥远的过去。
    
- **Gradient Explosion (梯度爆炸)**: 如果权重较大，梯度会呈指数级增长。通常使用 **Gradient Clipping (梯度裁剪)** 来强制限制梯度的最大值。
    

---

## 5. RNN 家族全成员对比表 (The RNN Family)

既然我们已经学完了 LSTM 和 GRU，这里给出一个最终的横向对比：

|**架构 (Architecture)**|**核心机制 (Mechanism)**|**记忆能力 (Memory)**|**计算效率 (Efficiency)**|
|---|---|---|---|
|**Vanilla RNN**|简单的线性变换 + Tanh|极短 (容易遗忘)|**Very High** (最快)|
|**LSTM**|**Forget/Input/Output Gates**|**Long-term** (最强)|Low (参数量大)|
|**GRU**|**Reset/Update Gates**|**Long-term** (较强)|Medium (平衡之选)|

---

## 6. 核心术语总结 (Key Terminology)

- **Unrolling / Unfolding**: 展开。将循环结构按时间轴拉平，便于理解和计算。
    
- **BPTT (Backpropagation Through Time)**: 随时间反向传播。RNN 特有的训练算法。
    
- **Hidden State ($h_t$)**: 隐藏状态。保存序列特征的向量。
    
- **Bottleneck**: 瓶颈。所有历史信息必须压缩在一个固定长度的向量中，这是 RNN 的局限。
    
- **Sequence-to-Sequence (Seq2Seq)**: 由一个 Encoder (编码器) 和一个 Decoder (解码器) 组成的结构。