# 仅编码器 (Encoder-Only, BERT family)

**Parent**：[[Transformer Architecture|Transformer 架构 (Transformer Architecture)]]

---

# Encoder-only Models (BERT 及其变体)

## 1. 为什么是“仅编码器”？ (Motivation)

**Encoder-only** 模型的核心目标是生成文本的 **Deep Contextual Representations (深层上下文表征)**。

- **Bidirectionality (双向性)**: 与 GPT 等从左到右阅读的模型不同，Encoder 模型可以同时看到左边和右边的词（即全局视野）。
    
- **Focus**: 它们擅长“理解”语言（如情感分析、实体识别、阅读理解），而不是“生成”语言（如写诗、对话）。
    

---

## 2. BERT: 奠基者 (The Foundation)

**BERT** 全称 **Bidirectional Encoder Representations from Transformers**，由 Google 在 2018 年提出。

### 核心预训练任务 (Pre-training Tasks):

1. **Masked Language Model (MLM, 掩码语言模型)**:
    
    - **Mechanism**: 随机掩盖句子中 15% 的词（用 `[MASK]` 代替），让模型预测这些词。
        
    - **Nickname**: 被称为“完形填空”。这是实现双向理解的关键。
        
2. **Next Sentence Prediction (NSP, 下一句预测)**:
    
    - **Mechanism**: 输入两个句子，让模型判断第二句是否是第一句的下一句。
        
    - **Purpose**: 学习句子之间的 **Logical Relationship (逻辑关系)**。
        

### 输入表示 (Input Representation):

- **Token Embeddings**: 单词或子词（WordPiece）。
    
- **Segment Embeddings**: 区分句子 A 和句子 B。
    
- **Position Embeddings**: 赋予位置信息。
    

---

## 3. BERT 的家族变体 (The Evolution)

### A. RoBERTa (Robustly Optimized BERT)

FaceBook (Meta) 发现 BERT 其实并没有被充分训练。

- **Changes**: 取消了 **NSP** 任务；使用了 **Dynamic Masking (动态掩码)**；使用了更大的 **Batch Size** 和更多的训练数据。
    
- **Verdict**: “更强、更狠的 BERT”。
    

### B. ALBERT (A Lite BERT)

为了解决模型参数量过大的问题，使其更轻量化。

- **Technique 1: Factorized Embedding Parameterization**: 将词向量维度与隐藏层维度解耦。
    
- **Technique 2: Cross-parameter Sharing**: 每一层 Encoder 共享一套参数。
    
- **Result**: 参数量大幅减少，但性能依然强劲。
    

### C. ELECTRA

改变了预训练的逻辑，效率极高。

- **Mechanism: Replaced Token Detection (RTD)**: 引入一个判别器（Discriminator），判断句子中的每个词是原始的还是被替换过的。
    
- **Advantage**: BERT 只学习 15% 的掩码词，而 ELECTRA 学习句子中的每一个词，**Sample Efficiency (样本效率)** 极高。
    

---

## 4. 核心对比表 (Comparison Table)

|**模型 (Model)**|**核心创新 (Key Innovation)**|**预训练任务 (Pre-training Task)**|**优缺点 (Pros & Cons)**|
|---|---|---|---|
|**BERT**|**Bidirectional Context**|MLM + NSP|开创性模型，但训练不够充分。|
|**RoBERTa**|**Refined Training**|MLM (Dynamic)|性能更稳健，去除了没用的 NSP。|
|**ALBERT**|**Parameter Sharing**|MLM + SOP (Sentence Order)|内存占用极小，适合资源受限场景。|
|**ELECTRA**|**Discriminative Training**|RTD (Replaced Token Detection)|训练速度极快，在小模型上表现卓越。|

---

## 5. 核心术语总结 (Key Terminology)

- **Fine-tuning (微调)**: 在大规模预训练后，针对具体任务（如分类）进行小幅调整。
    
- **Downstream Tasks (下游任务)**: 具体的应用任务，如 QA (问答)、NER (实体识别)。
    
- **Pre-train-then-Fine-tune**: 现代 NLP 的标准范式。
    
- **Self-Supervised Learning (自监督学习)**: 无需人工标注标签，直接从文本本身学习。
    
- **Latent Space (潜空间)**: 文本被编码后所处的数学空间。
    

---

## 6. 教授的工程建议 (Professor's Best Practices)

1. **Don't train from scratch**: 除非你拥有像 Google 那样的算力，否则永远从 **Hugging Face** 下载预训练好的权重进行 **Fine-tuning**。
    
2. **Model Selection**:
    
    - 追求性能：选 **RoBERTa-large**。
        
    - 追求部署速度：选 **ALBERT** 或 **DistilBERT**。
        
    - 追求性价比（训练快）：选 **ELECTRA**。
        
3. **CLS Token**: 在进行分类任务时，通常使用序列开头的 `[CLS]` 标记对应的输出向量作为整个句子的 **Global Representation**。
