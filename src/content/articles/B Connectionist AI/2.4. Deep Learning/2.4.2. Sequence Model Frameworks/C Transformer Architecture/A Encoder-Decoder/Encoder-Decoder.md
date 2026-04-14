# 编码器-解码器 (Encoder-Decoder)

**Parent**：[[Transformer Architecture|Transformer 架构 (Transformer Architecture)]]

---


# Encoder-Decoder & Seq2Seq

## 1. 什么是 Seq2Seq？ (Definition)

**Seq2Seq**，全称 **Sequence-to-Sequence**，旨在将一个 **Input Sequence (输入序列)** 映射到另一个 **Output Sequence (输出序列)**。

- **Characteristic (特征)**: 输入和输出的长度通常是不相等的（例如：英语翻译成中文，词数往往不同）。
    
- **Examples**: 机器翻译、文本摘要 (Text Summarization)、对话系统 (Chatbots)。
    

---

## 2. Encoder-Decoder 架构 (The Framework)

该框架将整个任务分为两个阶段：

### A. Encoder (编码器)

- **Function**: 负责读取原始的输入序列，并将其压缩成一个 **Fixed-length Vector (固定长度向量)**。
    
- **Mechanism**: 通常使用 RNN/LSTM/GRU。它逐个处理输入词，直到最后一个词处理完，产生的最终 **Hidden State (隐藏状态)** 被称为 **Context Vector (上下文向量)**。
    
- **Key Term**: **Context Vector ($C$)** —— 它是输入序列的“浓缩精华”。
    

### B. Decoder (解码器)

- **Function**: 根据 **Context Vector**，一步步预测并生成目标序列。
    
- **Mechanism**: 它也是一个 RNN。它的初始隐藏状态通常就是 Encoder 输出的 Context Vector。
    
- **Input**: 它在每一步的输入通常是前一个时间步预测出来的词。
    

---

## 3. 关键组件与技术 (Key Techniques)

### A. Special Tokens (特殊占位符)

为了让模型知道什么时候开始和结束，我们引入了：

- **$<SOS>$ (Start of Sentence)**: 告诉 Decoder 开始生成。
    
- **$<EOS>$ (End of Sentence)**: 告诉 Decoder 生成完毕。
    
- **$<PAD>$ (Padding)**: 用于统一不同序列长度的填充字符。




### B. Teacher Forcing (强制教学)

在 **Training (训练)** 阶段，Decoder 的输入不是上一步“可能猜错”的词，而是**正确的真实标签 (Ground Truth)**。

- **Purpose**: 加速收敛，防止训练初期因为一步错导致步步错。
    
- **Trade-off**: 可能会导致 **Exposure Bias (曝光偏差)**，即模型在测试时因为没有“老师”纠错而变得脆弱。
    

### C. Beam Search (束搜索)

在 **Inference (推理/测试)** 阶段，Decoder 如何选择下一个词？

- **Greedy Search (贪心搜索)**: 每一步只选概率最大的那个词。简单但容易陷入局部最优。
    
- **Beam Search**: 每一步保留概率最大的 $k$ 个候选路径（$k$ 称为 **Beam Width**）。它能在计算量和翻译质量之间取得平衡。
    

---

## 4. 核心术语总结 (Key Terminology)

|**英文术语 (English Term)**|**中文释义**|**在 Seq2Seq 中的作用**|
|---|---|---|
|**Fixed-length Vector**|固定长度向量|Encoder 输出的最终状态，是 Decoder 的唯一线索。|
|**Bottleneck**|瓶颈|所有的信息必须挤在一个向量里，长句子容易丢失细节。|
|**Autoregressive**|自回归|Decoder 预测下一个词依赖于之前已预测出的词。|
|**Alignment**|对齐|决定输入中哪些部分对应输出中的哪些部分（Attention 的核心）。|
|**Inference**|推理|模型在没有标签的情况下，在线生成翻译的过程。|

---

## 5. Seq2Seq 的演进与对比

|**架构阶段**|**核心技术**|**解决的问题**|
|---|---|---|
|**Vanilla Seq2Seq**|纯 RNN / LSTM|实现了变长序列到变长序列的映射。|
|**Attention-based Seq2Seq**|**Attention Mechanism**|解决了 **Bottleneck (瓶颈)** 问题，让 Decoder 能“看到”全部输入。|
|**Transformer**|**Self-Attention**|解决了 **Serial Computation (串行计算)** 慢的问题，实现了并行化。|

---

## 6. 教授的工程建议 (Professor's Best Practices)

1. **Handling Long Sentences**: 如果不加 Attention，Seq2Seq 翻译超过 30 个词的句子效果会断崖式下跌。**Attention 是 Seq2Seq 的救命稻草。**
    
2. **BPE (Byte Pair Encoding)**: 在翻译任务中，直接用单词做词典会导致词典过大且无法处理 **Out-of-Vocabulary (OOV, 词汇表外词)**。现代模型都使用 **Subword (子词)** 技术。
    
3. **Beam Width Selection**: 在生产环境下，$k=5$ 或 $k=10$ 通常是性能和精度的甜点点。$k$ 太大反而可能导致生成重复、平庸的句子。
    

---

### 教授总结：

Encoder-Decoder 就像是两个人在玩“传声筒”游戏。一个人（Encoder）听完一段话并总结，另一个人（Decoder）根据总结复述出另一种语言。理解了这个框架，你就理解了现代自然语言处理 (NLP) 的底层逻辑。

**Next Step (下一步建议)**:

我们已经讲完了 Seq2Seq 的框架。现在，你面前有两条路：

1. **【终极 Boss】Transformer 架构全解**：它是去掉了 RNN、全靠 Attention 驱动的 Seq2Seq。
    
2. **【代码实战】PyTorch Seq2Seq**: 我可以展示如何用代码定义一个 Encoder 类和一个 Decoder 类。
    

**你想先看 Transformer 的数学结构，还是看实战代码？**