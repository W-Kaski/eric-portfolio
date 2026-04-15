---
title: "Sequence Model Frameworks"
date: "2025-04-28"
---
# 2.4.2. 序列模型框架 (Sequence Model Frameworks)

**Parent**：[[Deep Learning|2.4. 深度学习 (Deep Learning, DL)]]

**Children**：
- [[A RNN/RNN|A. 循环神经网络 (RNN)]]
- [[B Attention Mechanism/Attention Mechanism|B. 注意力机制 (Attention Mechanism)]]
- [[C Transformer Architecture/Transformer Architecture|C. Transformer 架构 (Transformer Architecture)]]

---

# Sequence Model Frameworks

## 1. 循环范式 (The Recurrent Paradigm)

这是处理序列的“古典时期”，核心在于 **Recursion (递归/循环)**。

- **Mechanism**: 通过一个 **Hidden State (隐藏状态)** 随着时间步逐级传递信息。
    
- **Key Models**: **Vanilla RNN**, **LSTM**, **GRU**。
    
- **Logic**: 认为序列是“流”动的，处理当前信息必须依赖对过去信息的“记忆”。
    
- **Main Weakness**: **Sequential Computation (串行计算)** 导致训练极慢；存在严重的 **Long-term Dependency (长程依赖)** 丢失问题。
    

---

## 2. 编码器-解码器范式 (The Encoder-Decoder / Seq2Seq Paradigm)

这是一种**结构框架**，它定义了如何将一个变长序列转换为另一个变长序列。

- **Mechanism**:
    
    1. **Encoder**: 将输入序列压缩成一个 **Context Vector (上下文向量)**。
        
    2. **Decoder**: 根据这个向量逐步生成输出序列。
        
- **Breakthrough**: 解决了输入和输出长度不匹配的问题。
    
- **Key Enhancement**: 引入 **Attention Mechanism**。它打破了“固定长度向量”的限制，让 Decoder 能实时查看 Encoder 的所有状态。
    

---

## 3. 注意力范式 (The Attention-only / Transformer Paradigm)

这是目前的“统治者”，它彻底抛弃了循环。

- **Mechanism**: 完全基于 **Self-Attention (自注意力)** 和 **Parallel Processing (并行处理)**。
    
- **Logic**: 认为序列中每个词与其他词的关系可以同时计算。不再通过“时间步”传递信息，而是通过“全局视野”直接捕捉关联。
    
- **Key Models**: **Transformer**, **BERT**, **GPT 系列**, **LLaMA**。
    
- **Main Advantage**: 极高的 **Parallelism (并行性)**，能够处理海量数据。
    

---

## 4. 状态空间模型范式 (The State Space Model / SSM Paradigm)

这是 2024-2026 年最前沿的、试图挑战 Transformer 的新框架。

- **Mechanism**: 将序列建模看作是一个连续的线性系统。
    
- **Key Models**: **Mamba**, **S4**。
    
- **Logic**: 试图结合 RNN 的推理效率（$O(n)$ 复杂度）和 Transformer 的训练效果。
    
- **Goal**: 解决 Transformer 随着序列变长（$O(n^2)$）计算开销爆炸的问题。
    

---

## 5. 序列框架综合对比表 (Comprehensive Comparison)

|**框架范式 (Framework)**|**代表模型 (Models)**|**计算复杂度 (Complexity)**|**并行能力 (Parallelism)**|**记忆能力 (Memory Type)**|
|---|---|---|---|---|
|**Recurrent**|RNN, LSTM|$O(n)$|**Low** (逐词计算)|隐藏状态 (容易遗忘)|
|**Convolutional (1D)**|WaveNet, TCN|$O(n)$|**High**|局部窗口 (固定视野)|
|**Attention-only**|**Transformer**, LLMs|**$O(n^2)$**|**Very High**|全局注意力 (永久保留)|
|**State Space (SSM)**|**Mamba**, S4|$O(n)$|**High**|选择性状态 (高效长程)|

---

## 6. 核心术语总结 (Key Terminology)

- **Autoregressive (AR)**: 自回归。模型预测下一步时依赖于之前的预测。
    
- **Sequence-to-Sequence (Seq2Seq)**: 将一个序列映射为另一个序列的通用框架。
    
- **Teacher Forcing**: 训练阶段的一种技巧，直接给模型提供真实标签作为下一步的输入。
    
- **Linear Scaling**: 线性扩展。SSM 追求的目标，即处理速度与序列长度成正比。
    
- **Inductive Bias (归纳偏置)**: 不同框架对序列规律的假设。RNN 假设顺序最重要，CNN 假设局部最重要，Attention 假设一切皆相关。
    

---

## 7. 教授的工程洞察 (Professor's Insights)

1. **架构与硬件的博弈**: Transformer 能够胜出，很大程度上是因为它极度适配 **GPU** 的并行计算特性。而 RNN 因为必须等前一步算完才能算下一步，无法充分利用硬件算力。
    
2. **长文本挑战**: 随着我们进入“长文本时代”（长达 1M tokens 的上下文），传统的 Transformer 框架正面临巨大的内存挑战，这也是为什么 **SSM (Mamba)** 这种线性复杂度模型目前备受关注。
    
3. **万物皆序列**: 现代框架的趋势是将图像（像素点）、音频（采样点）甚至动作指令全部序列化，统一用 **Transformer** 框架来处理。