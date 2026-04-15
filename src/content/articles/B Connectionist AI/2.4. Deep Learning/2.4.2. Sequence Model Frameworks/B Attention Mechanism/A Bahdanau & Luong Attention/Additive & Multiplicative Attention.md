---
title: "Additive & Multiplicative Attention"
date: "2025-04-04"
---
# Bahdanau/Luong Attention

**Parent**：[[Attention Mechanism|注意力机制 (Attention Mechanism)]]

---

# Bahdanau vs. Luong Attention

## 1. Bahdanau Attention (Additive Attention)

由 Dzmitry Bahdanau 等人在 2014 年提出。这通常被称为 **Additive Attention (加性注意力)**。

### 核心特点：

- **Motivation**: 它是为了让 Decoder 在生成每个词时，都能“看到” Encoder 中所有的隐藏状态，而不是只依赖最后一个。
    
- **Alignment Score (对齐得分)**: 使用一个带有可学习参数的全连接层（MLP）来计算。
    
    - **Formula**: $score(s_{t-1}, h_i) = v_a^T \tanh(W_a [s_{t-1}; h_i])$
        
    - 这里 $s_{t-1}$ 是 Decoder 上一个时刻的隐藏状态，$h_i$ 是 Encoder 的隐藏状态。
        
- **Timing (时机)**: 它在计算当前步的隐藏状态 $s_t$ **之前**计算注意力。
    

---

## 2. Luong Attention (Multiplicative Attention)

由 Thang Luong 等人在 2015 年提出。它通常被称为 **Multiplicative Attention (乘性注意力)**，是对 Bahdanau 机制的简化和改进。

### 核心特点：

- **Simplified Computation**: 相比加法，它主要使用矩阵乘法（点积），计算效率更高。
    
- **Variations**: 提出了 **Global Attention**（关注全部 Encoder 状态）和 **Local Attention**（只关注一部分）的概念。
    
- **Alignment Score**: 提供了三种计算方式：
    
    1. **Dot (点积)**: $s_t^T h_i$
        
    2. **General (通用)**: $s_t^T W_a h_i$
        
    3. **Concat (拼接)**: $v_a^T \tanh(W_a [s_t; h_i])$
        
- **Timing**: 它在计算完当前步的隐藏状态 $s_t$ **之后**才计算注意力，用于生成最终的输出。
    

---

## 3. Bahdanau vs. Luong 深度对比表

|**特性 (Feature)**|**Bahdanau Attention (Additive)**|**Luong Attention (Multiplicative)**|
|---|---|---|
|**提出年份**|2014 年|2015 年|
|**得分函数 (Score Function)**|**Additive**: $v^T \tanh(W[s;h])$|**Dot-product**: $s^T h$ 或 $s^T Wh$|
|**计算复杂度**|较高（包含参数矩阵和 Tanh）|**较低**（矩阵乘法极快）|
|**对齐路径 (Alignment)**|使用 **Previous** hidden state ($s_{t-1}$)|使用 **Current** hidden state ($s_t$)|
|**主要贡献**|奠定了注意力机制的基础|引入了多种 Score 函数和 Local 概念|
|**计算顺序**|$s_{t-1} \to \text{attn} \to s_t$|$s_t \to \text{attn} \to \hat{s}_t$|

---

## 4. 核心术语总结 (Key Terminology)

- **Encoder Hidden States ($h_i$)**: 编码器各时刻的输出，作为注意力计算中的 **Values** 和 **Keys**。
    
- **Decoder Hidden State ($s_t$)**: 解码器的当前状态，作为注意力计算中的 **Query**。
    
- **Context Vector ($c_t$)**: 上下文向量。它是 Encoder 所有状态的加权平均值，代表了当前最值得关注的信息。
    
- **Alignment (对齐)**: 衡量输入序列与输出序列之间相关性的过程。
    
- **Attention Weights ($\alpha$)**: 经过 Softmax 后的权重，代表模型对每个输入位置的关注程度。
    

---

## 5. 教授的工程建议 (Professor's Best Practices)

1. **Efficiency**: 在现代的大规模模型中，我们几乎不再使用 Bahdanau 的加法形式，因为 **Dot-product (点积)** 在 GPU 上的并行计算速度要快得多。
    
2. **Evolution**: 实际上，Luong Attention 的“缩放点积”思想直接启发了后来 **Transformer** 中的 **Scaled Dot-Product Attention**。
    
3. **Understanding the Flow**: 理解这两者的区别，关键在于看它是用“旧的隐藏状态”还是“新的隐藏状态”去寻找注意力。
