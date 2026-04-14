# Transformer 架构 (Transformer Architecture)

**Parent**：[[Sequence Model Frameworks|2.4.2. 序列模型框架 (Sequence Model Frameworks)]]

**Children**：
- [[A Encoder-Decoder/Encoder-Decoder|A. 编码器-解码器 (Encoder-Decoder)]]
- [[B Encoder-Only (BERT family)/Encoder-Only (BERT family)|B. 仅编码器 (Encoder-Only, BERT family)]]
- [[C Decoder-Only (GPT, LLaMA, PaLM)/Decoder-Only (GPT, LLaMA, PaLM)|C. 仅解码器 (Decoder-Only, GPT/LLaMA/PaLM)]]

---

# Transformer Architecture

## 1. 宏观架构：编码器-解码器 (The Big Picture)

标准的 Transformer 是一个典型的 **Encoder-Decoder** 结构。

- **Encoder (编码器)**: 负责理解输入序列，提取深层特征。
    
- **Decoder (解码器)**: 负责根据编码器的信息，步进式地（Autoregressive）生成输出序列。
    

---

## 2. 核心四大支柱 (The Four Pillars)

### A. Multi-Head Attention (MHA, 多头注意力)

这是 Transformer 的“眼睛”。

- **Concept**: 模型不再只看一遍序列，而是将 $Q, K, V$ 拆分成多组（Heads），在不同的 **Subspaces (子空间)** 并行进行注意力计算。
    
- **Benefit**: 让模型能同时捕捉到不同的关系（例如：头 1 关注语法，头 2 关注语义指代）。
    

### B. Positional Encoding (位置编码)

由于 Transformer 抛弃了 RNN 的顺序处理，它本身是 **Permutation Invariant (置换不变的)**。

- **Solution**: 通过正弦和余弦函数（Sinusoidal Functions）给每个词加上一个特定的“坐标”，让模型知道词在句子中的相对和绝对位置。
    

### C. Feed-Forward Network (FFN, 前馈网络)

每一层注意力之后，都有一个全连接的网络（通常包含两个线性层和一个激活函数）。

- **Insight**: 如果说 Attention 是在词之间进行“交流”，那么 FFN 就是在每个词内部进行“深度加工”。
    

### D. Layer Normalization & Residual Connections

为了能让网络变得极深而不崩溃：

- **Residual Connection (残差连接)**: $x + \text{Sublayer}(x)$，让梯度可以无损通过。
    
- **LayerNorm**: 稳定每一层的输出分布。
    

---

## 3. Transformer 家族对比表 (The Transformer Family)

现在的深度学习已经分化成了不同的分支，理解它们的区别至关重要：

|**模型类型 (Type)**|**典型代表 (Examples)**|**结构 (Structure)**|**核心能力 (Core Capability)**|**常用任务 (Common Tasks)**|
|---|---|---|---|---|
|**Standard**|**Original Transformer**|**Encoder + Decoder**|映射转换|机器翻译 (Machine Translation)|
|**Encoder-only**|**BERT**, RoBERTa|**Only Encoder**|深度语义理解 (NLU)|文本分类、命名实体识别 (NER)|
|**Decoder-only**|**GPT-3/4**, LLaMA|**Only Decoder**|开放式文本生成 (NLG)|对话机器人、代码编写、创作|
|**Unified**|**T5**, BART|**Encoder + Decoder**|万物皆可文本到文本|摘要生成、问答、改写|

---

## 4. 核心术语总结 (Key Terminology)

- **Self-Attention**: 序列内部自己看自己。
    
- **Cross-Attention**: 解码器看编码器的输出。
    
- **Causal Masking**: 在解码器中使用，防止模型“偷看”未来的词。
    
- **Scaling Laws**: 揭示了模型性能随算力、数据、参数量增加而提升的规律。
    
- **Attention Is All You Need**: 该领域的圣经级论文标题。
    

---

## 5. 教授的深度点评 (Professor's Insights)

1. **并行性 (Parallelism)**: Transformer 最大的贡献不是准，而是**快（在相同算力下训练得更多）**。RNN 必须逐词处理，而 Transformer 的 Self-Attention 是一次性处理全句，这让大规模分布式训练成为可能。
    
2. **归一化位置 (Pre-Norm vs. Post-Norm)**: 原版 Transformer 使用 Post-Norm，但现在的大模型（如 LLaMA）几乎都改用 **Pre-Norm**（在注意力之前做 LayerNorm），这能让训练更加稳定。
    
3. **注意力的平方复杂度**: Transformer 的计算量随序列长度 $n$ 呈 $O(n^2)$ 增长。这也就是为什么大模型会有“上下文长度限制（Context Window）”。