---
title: "Attention Mechanism"
date: "2025-04-05"
---
# 注意力机制 (Attention Mechanism)

**Parent**：[[Sequence Model Frameworks|2.4.2. 序列模型框架 (Sequence Model Frameworks)]]

**Children**：
- [[Additive & Multiplicative Attention|A. Bahdanau/Luong Attention]]
- [[Self-Attention]]

---

# Attention Mechanism (注意力机制) 分类

## 1. 核心数学框架：Q, K, V

在进入分类之前，你必须先熟记这三个核心术语，它们构成了几乎所有注意力机制的底层逻辑：

- **Query (查询, $Q$)**: 你当前关心的信息（例如当前正在翻译的词）。
    
- **Key (键, $K$)**: 输入序列中所有信息点的“索引”或“特征描述”。
    
- **Value (值, $V$)**: 输入序列中实际包含的内容信息。
    

计算公式通常为：

$$\text{Attention}(Q, K, V) = \text{Softmax}(\text{Score}(Q, K)) \cdot V$$

---

## 2. 维度一：根据关注的范围 (Scope of Attention)

### A. Global Attention (全局注意力)

又称 **Soft Attention (软注意力)**。

- **Mechanism**: 在计算时考虑输入序列中**所有的**隐藏状态。
    
- **Feature**: 计算量大，但是它是 **Differentiable (可微的)**，可以直接通过反向传播训练。
    
- **Use case**: 机器翻译中的经典翻译模型。
    

### B. Local Attention (局部注意力)

又称 **Hard Attention (硬注意力)** 的一种变体。

- **Mechanism**: 只关注输入序列中一个特定的 **Window (窗口)** 或一部分子集。
    
- **Feature**: 计算效率更高。如果是严格的 Hard Attention（只选一个点），通常是不可微的，需要用到 **Reinforcement Learning (强化学习)** 来训练。
    

---

## 3. 维度二：根据信息的来源 (Source of Information)

这是目前最主流的分类方式：

### A. Self-Attention (自注意力)

- **Definition**: $Q, K, V$ 全部来自于**同一个**输入序列。
    
- **Insight**: 旨在捕捉序列内部的 **Internal Correlation (内部相关性)**。例如，在句子“The animal didn't cross the street because **it** was too tired”中，Self-attention 能够识别出 "it" 指向的是 "animal"。
    
- **Standard in**: **Transformer**, BERT, GPT.
    

### B. Cross-Attention (交叉注意力 / Encoder-Decoder Attention)

- **Definition**: $Q$ 来自于一个序列（如 Decoder），而 $K, V$ 来自于另一个序列（如 Encoder）。
    
- **Insight**: 旨在建立两个不同序列之间的关联。
    
- **Standard in**: Seq2Seq 翻译模型。
    

---

## 4. 维度三：根据计算的数学形式 (Score Function)

决定了 $Q$ 和 $K$ 如何计算“相关性得分”：

|**类型 (English Name)**|**数学形式 (Formula)**|**特点 (Pros/Cons)**|
|---|---|---|
|**Dot-product Attention**|$Q K^T$|简单，计算速度极快。|
|**Scaled Dot-product**|$\frac{QK^T}{\sqrt{d_k}}$|**Transformer 默认**。通过缩放防止梯度消失。|
|**Additive Attention**|$W_v \tanh(W_q Q + W_k K)$|由 Bahdanau 提出，处理高维特征时效果较好，但计算慢。|
|**Multi-Head Attention**|$\text{Concat}(\text{head}_1, ..., \text{head}_n)W$|同时在多个 **Subspaces (子空间)** 学习不同的注意力特征。|

---

## 5. 维度四：应用在计算机视觉 (Computer Vision Specific)

在 CNN 中，注意力被分为：

1. **Spatial Attention (空间注意力)**: 关注图像中的“哪个位置”最重要（Where）。
    
2. **Channel Attention (通道注意力)**: 关注“哪个特征通道”最重要（What）。例如著名的 **SE-Net (Squeeze-and-Excitation)**。
    

---

## 6. 核心术语总结 (Key Terminology)

- **Alignment (对齐)**: 注意力权重分配的过程。
    
- **Attention Map (注意力图)**: 权重分布的可视化表示。
    
- **Context Vector (上下文向量)**: 注意力加权后的输出向量。
    
- **Inductive Bias (归纳偏置)**: 注意力机制相对于 RNN，对顺序的假设更少。
    
- **Parallelization (并行化)**: 注意力机制（尤其是 Self-attention）允许并行计算，这是它超越 RNN 的关键。
    

---

## 7. 教授的工程建议 (Professor's Best Practices)

1. **Scaling is essential**: 如果你使用 Dot-product，一定要做 **Scaling ($\sqrt{d_k}$)**，否则在维度很高时，Softmax 的梯度会变得极其微小。
    
2. **Multi-Head is better**: 永远优先考虑 **Multi-head Attention**。它就像让多个学生从不同角度读同一本书，最后综合意见。
    
3. **Position Encoding**: 注意力机制本身是 **Order-independent (与顺序无关的)**。如果你处理的是文本，一定要加上 **Positional Encoding (位置编码)**，否则模型分不清“我爱你”和“你爱我”。

