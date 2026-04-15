---
title: "LLM Architecture & Training Knowledge Outline (大模型架构与训练)"
date: "2025-04-26"
---
---
mindmap-plugin: basic
---

# LLM Architecture & Training Knowledge Outline (大模型架构与训练知识大纲)

## 1. Backbone Architecture (骨干架构)

- Decoder-only Transformer (仅解码器Transformer)
    
    - Causal Masking (因果掩码): Ensuring the model can only see past tokens, not future ones during training
        
    - Pre-Normalization (前置归一化): Applying normalization before the attention/FFN blocks (improves stability compared to Post-Norm)
        
    - RMSNorm / Root Mean Square Layer Normalization (均方根层归一化): Simplified LayerNorm without mean centering, computationally faster
        
- Tokenization (分词)
    
    - BPE / Byte Pair Encoding (字节对编码): Iteratively merging the most frequent pair of characters
        
    - Byte-level BPE (字节级BPE): Operating on UTF-8 bytes to handle all unicode characters without "unknown" tokens (used in GPT-2/3/4)
        
    - Vocabulary Size (词表大小): Trade-off between sequence length and embedding parameter size (typically 32k - 128k)
        
- Positional Encodings (位置编码)
    
    - RoPE / Rotary Positional Embeddings (旋转位置编码): Rotating the query and key vectors in complex space to encode relative positions (standard in Llama)
        
    - ALiBi / Attention with Linear Biases (线性偏差注意力): Adding a static penalty bias to attention scores based on distance (better extrapolation)
        
- Activation Functions (激活函数)
    
    - SwiGLU (Swish门控线性单元): A gated activation function combining Swish and GLU, showing better performance than ReLU or GeLU
        

## 2. Pre-training Phase (预训练阶段)

- Objective Function (目标函数)
    
    - Next Token Prediction / Causal Language Modeling (下一个词预测/因果语言建模): Maximizing the probability of the next token given previous tokens
        
    - Cross-Entropy Loss (交叉熵损失): The standard loss function calculating the difference between predicted probability distribution and one-hot true label
        
- Scaling Laws (缩放定律)
    
    - Kaplan Scaling Laws (Kaplan缩放定律): Performance improves as a power law with compute, data size, and parameters
        
    - Chinchilla Scaling Laws (Chinchilla缩放定律): For a fixed compute budget, model size and training data should be scaled equally (optimal ratio is roughly 20 tokens per parameter)
        
- Infrastructure (基础设施)
    
    - 3D Parallelism (3D并行): Combining Data Parallelism, Pipeline Parallelism, and Tensor Parallelism
        
    - ZeRO / Zero Redundancy Optimizer (零冗余优化器): Partitioning optimizer states, gradients, and parameters across GPUs to save memory
        

## 3. Post-training & Alignment (后训练与对齐)

- Supervised Fine-Tuning / SFT (监督微调)
    
    - Instruction Tuning (指令微调): Training on dataset of (Instruction, Output) pairs to teach the model to follow commands
        
    - Chat Format (聊天格式): Structuring data with special tokens like <|user|>, <|assistant|>
        
- Reinforcement Learning from Human Feedback / RLHF (基于人类反馈的强化学习)
    
    - Reward Model / RM (奖励模型): A separate model trained to predict human preference scores (Better vs Worse)
        
    - PPO / Proximal Policy Optimization (近端策略优化): Using the Reward Model to update the LLM policy to maximize reward while not deviating too far from the SFT model
        
- Direct Preference Optimization / DPO (直接偏好优化)
    
    - Concept (概念): Optimizing the policy directly on preference data without training an explicit Reward Model
        
    - Advantage (优势): More stable and computationally efficient than PPO
        

## 4. Advanced Architectures (进阶架构)

- Mixture of Experts / MoE (混合专家模型)
    
    - Sparse Activation (稀疏激活): Only a small subset of "experts" (FFN layers) are activated for each token
        
    - Router / Gating Network (路由/门控网络): A small network deciding which experts process which token
        
    - Efficiency (效率): High parameter count (capacity) with low compute cost (FLOPs) per inference
        
- Long Context (长上下文)
    
    - Sliding Window Attention (滑动窗口注意力): Attending only to local context window
        
    - Ring Attention (环状注意力): Distributing long sequences across multiple devices in a ring topology
        

## 5. Efficient Training & Inference (高效训练与推理)

- Memory Optimization (显存优化)
    
    - FlashAttention (闪电注意力): Tiling memory blocks to minimize HBM (High Bandwidth Memory) access, providing drastic speedup
        
    - KV Cache (键值缓存): Storing calculated Key and Value vectors during generation to avoid re-computation
        
    - PagedAttention (分页注意力): Managing KV Cache like operating system virtual memory (used in vLLM)
        
- Parameter-Efficient Fine-Tuning / PEFT (参数高效微调)
    
    - LoRA / Low-Rank Adaptation (低秩适配): Freezing main weights and training small low-rank decomposition matrices
        
    - QLoRA (量化LoRA): Combining 4-bit quantization with LoRA for fine-tuning on consumer GPUs
        

## 6. Representative Models (代表性模型)

- Closed Source / Proprietary (闭源/专有)
    
    - GPT-4 (OpenAI): Multimodal, suspected MoE architecture
        
    - Claude 3 (Anthropic): Focus on safety and large context window (200k+)
        
    - Gemini (Google): Native multimodal architecture
        
- Open Weights (开放权重)
    
    - Llama 3 (Meta): Standard dense decoder-only architecture, trained on massive token count (15T+)
        
    - Mistral 7B (Mistral AI): Uses Sliding Window Attention and Grouped-Query Attention
        
    - Mixtral 8x7B (Mistral AI): First high-performing open-source MoE model
        
    - Qwen (Alibaba): Strong performance in coding and multilingual tasks