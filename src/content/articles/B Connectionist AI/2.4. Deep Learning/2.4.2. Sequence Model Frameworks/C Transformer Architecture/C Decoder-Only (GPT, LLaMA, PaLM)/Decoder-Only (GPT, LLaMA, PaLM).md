# 仅解码器 (Decoder-Only, GPT/LLaMA/PaLM)

**Parent**：[[Transformer Architecture|Transformer 架构 (Transformer Architecture)]]

---

# Decoder-only Models (GPT 系列, LLaMA, PaLM)

## 1. 为什么是“仅解码器”？ (The "Generative" Power)

与 BERT 这种“双向”查看上下文的模型不同，Decoder-only 模型是 **Unidirectional (单向的)**，也叫 **Causal Transformers (因果变换器)**。

- **Autoregressive (自回归)**：模型通过上文预测下一个词（Next Token Prediction），然后将预测出的词加入输入，再预测再下一个词。
    
- **Causal Masking (因果掩码)**：在训练时，模型被强制要求只能看到当前位置之前的词，不能“偷看”后面的答案。这使得它天然适合 **Text Generation (文本生成)**。
    

---

## 2. GPT 系列：大模型的开创者 (The GPT Legacy)

**GPT (Generative Pre-trained Transformer)** 由 OpenAI 提出，遵循 **Scaling Laws (缩放法则)**：即模型越大、数据越多、算力越强，智能就越呈指数级增长。

- **GPT-3**: 拥有 175B (1750亿) 参数。它证明了模型不需要针对特定任务进行微调（Fine-tuning），只需通过 **In-context Learning (语境学习)** 就能处理各种任务。
    
- **GPT-4**: 引入了更强的推理能力和 **Multimodality (多模态)**（能看图、听声），是目前闭源模型的巅峰。
    

---

## 3. LLaMA：开源界的霸主 (The Open Source King)

由 Meta (Facebook) 提出。**LLaMA** 的出现彻底改变了学术界和工业界的格局，因为它证明了在更小规模的参数（如 7B, 13B, 70B）上使用海量数据训练，也能达到极强的性能。

### LLaMA 的核心改进 (Core Innovations):

- **RMSNorm**: 在每个 Transformer 层输入前进行归一化，提高训练稳定性。
    
- **RoPE (Rotary Positional Embeddings)**: 旋转位置编码，比传统的绝对位置编码更擅长处理长文本。
    
- **SwiGLU**: 一种更高效的激活函数，替代了传统的 ReLU。
    

---

## 4. PaLM：Google 的重型武器

**PaLM (Pathways Language Model)** 是 Google 训练的超大规模模型（540B 参数）。

- **Pathways**: Google 研发的分布式系统，允许在数千个 TPU 芯片上高效训练模型。
    
- **Chain of Thought (CoT, 思维链)**: PaLM 极大地推广了这种 Prompt 技术，通过让模型输出“第一步...第二步...”，显著提升了数学和逻辑推理能力。
    

---

## 5. 大模型的核心训练流程 (The LLM Pipeline)

一个现代解码器模型通常经历以下阶段：

1. **Pre-training (预训练)**：在海量互联网文本上进行自监督学习，学到“百科全书”般的知识。
    
2. **SFT (Supervised Fine-Tuning, 有监督微调)**：在人工编写的问答对上训练，让模型学会“对话”和“听指令”。
    
3. **RLHF (Reinforcement Learning from Human Feedback)**：通过人类的反馈（打分、排序）来对齐（Alignment），让模型变得更有用、更诚实、更无害。
    

---

## 6. 核心对比表 (Comprehensive Comparison)

|**特性 (Feature)**|**GPT-4**|**LLaMA 3**|**PaLM 2 (Gemini)**|
|---|---|---|---|
|**开发者**|OpenAI|Meta|Google|
|**可用性 (Availability)**|闭源 (API)|**开源 (Open Weights)**|闭源 (API)|
|**主要优势**|推理能力最强，多模态|社区生态最丰富，部署灵活|与 Google 生态集成深度|
|**位置编码**|学习的位置编码|**RoPE** (旋转位置编码)|RoPE / ALiBi|
|**典型应用**|ChatGPT|个人本地部署, 研究|Google Search, Bard|

---

## 7. 核心术语总结 (Key Terminology)

- **Context Window (上下文窗口)**：模型一次能处理的最大 Token 数量（如 32k, 128k）。
    
- **Hallucination (幻觉)**：模型一本正经地胡说八道，输出事实错误的信息。
    
- **Zero-shot / Few-shot**: 模型在不看或只看几个例子的情况下完成任务的能力。
    
- **Emergent Abilities (涌现能力)**：当模型规模达到一定程度时，突然出现的、小模型不具备的复杂能力（如逻辑推理）。
    
- **Temperature (温度参数)**：控制生成的随机性。温度越高，回答越有创意；温度越低，回答越保守、稳定。