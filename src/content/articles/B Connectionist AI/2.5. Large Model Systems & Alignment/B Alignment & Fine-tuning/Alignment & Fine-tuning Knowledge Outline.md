---
title: "Alignment & Fine-tuning Knowledge Outline"
date: "2025-05-14"
---
---
mindmap-plugin: basic
---

# Alignment & Fine-tuning Knowledge Outline (对齐与微调知识大纲)

## 1. Fundamentals of Transfer Learning (迁移学习基础)

- Pre-training (预训练)
    
    - Objective (目标): Learning general representations from massive unlabeled data
        
    - Base Model (基座模型): The raw model with high perplexity but low instruction-following ability
        
- Fine-tuning (微调)
    
    - Definition (定义): Updating a pre-trained model on a specific downstream task
        
    - Full Fine-tuning (全量微调): Updating all parameters of the model, computationally expensive
        
- Challenges (挑战)
    
    - Catastrophic Forgetting (灾难性遗忘): The model loses previously learned knowledge while learning new tasks
        
    - Overfitting (过拟合): The model memorizes the small fine-tuning dataset and fails to generalize
        

## 2. Supervised Fine-Tuning / SFT (监督微调)

- Instruction Tuning (指令微调)
    
    - Concept (概念): Training the model to follow specific instructions (e.g., "Summarize this", "Write code")
        
    - Data Format (数据格式): Triples of (Instruction, Input, Output) or conversation history
        
    - Chat Templates (聊天模板): Standardizing inputs with special tokens (e.g., <|user|>, <|assistant|>) to delineate turns
        
- Data Quality (数据质量)
    
    - Diversity (多样性): Covering various tasks (reasoning, creative writing, coding) to prevent mode collapse
        
    - Synthetic Data (合成数据): Using stronger models (like GPT-4) to generate high-quality training examples (Distillation)
        
- NEFTune (噪声嵌入微调)
    
    - Method (方法): Adding random noise to the embedding vectors during training
        
    - Benefit (收益): Improves robustness and generalization of the fine-tuned model
        

## 3. Parameter-Efficient Fine-Tuning / PEFT (参数高效微调)

- LoRA / Low-Rank Adaptation (低秩适配)
    
    - Mechanism (机制): Freezing original weights W and injecting trainable rank decomposition matrices A and B
        
    - Formula (公式): W_new = W + A * B, where A and B are much smaller than W
        
    - Advantages (优势): Drastically reduces VRAM usage and storage (only saving adapter weights)
        
    - QLoRA (量化LoRA): Combining 4-bit NormalFloat quantization with LoRA for training on consumer GPUs
        
- Adapter Modules (适配器模块)
    
    - Architecture (架构): Inserting small neural network layers between existing transformer layers
        
    - Bottleneck (瓶颈): Compressing and then expanding dimensions to keep parameter count low
        
- Prompt Tuning (提示词微调)
    
    - Soft Prompts (软提示): Appending learnable continuous vectors to the input sequence
        
    - P-Tuning (P-Tuning方法): Using a prompt encoder to generate soft prompts, optimizing for specific tasks without touching model weights
        

## 4. Alignment Paradigms (对齐范式)

- Reinforcement Learning from Human Feedback / RLHF (基于人类反馈的强化学习)
    
    - Step 1: Supervised Fine-Tuning (第一步：监督微调): Training a policy model on high-quality demonstration data
        
    - Step 2: Reward Modeling (第二步：奖励建模): Training a model to predict human preferences (ranking A vs B)
        
    - Step 3: PPO / Proximal Policy Optimization (第三步：近端策略优化): Using the reward model to optimize the policy
        
    - KL Divergence Penalty (KL散度惩罚): Constraining the new model to stay close to the reference model to prevent gibberish
        
- Direct Preference Optimization / DPO (直接偏好优化)
    
    - Insight (洞察): The reward model and policy can be unified mathematically
        
    - Mechanism (机制): Optimizing the policy directly on preference pairs (chosen vs rejected) using a simple classification loss
        
    - Stability (稳定性): Removes the need for a separate reward model and complex PPO sampling
        
- KTO / Kahneman-Tversky Optimization (KTO优化)
    
    - Unpaired Data (非配对数据): Learning from simple "thumbs up" or "thumbs down" signals without needing pairs of responses
        
    - Loss Function (损失函数): Based on Prospect Theory, weighting gains and losses differently
        

## 5. Safety & Evaluation (安全与评估)

- Red Teaming (红队测试)
    
    - Definition (定义): Adversarial testing to provoke the model into generating harmful or biased content
        
    - Jailbreak (越狱): Techniques to bypass safety filters (e.g., "Do Anything Now" prompts)
        
- Benchmarks (基准测试)
    
    - MT-Bench (MT-Bench评测): Using LLMs (like GPT-4) to judge multi-turn conversation quality
        
    - AlpacaEval (羊驼评测): Head-to-head comparison against a baseline model
        
    - GSM8K (GSM8K数据集): Testing mathematical reasoning capabilities
        
- Hallucination Mitigation (幻觉缓解)
    
    - Factuality (事实性): Alignment training focused on refusing to answer unknowns rather than fabricating
        

## 6. Representative Models & Datasets (代表性模型与数据集)

- Key Models (关键模型)
    
    - InstructGPT (InstructGPT模型): The predecessor to ChatGPT, popularized RLHF
        
    - Llama-2/3-Chat (Llama对话模型): Open-weights models optimized with heavy RLHF and safety tuning
        
    - Zephyr (Zephyr模型): Demonstrated that DPO alone can achieve high performance on smaller models (7B)
        
- Famous Datasets (著名数据集)
    
    - HH-RLHF (Anthropic Helpful & Harmless): Large dataset of human preference rankings
        
    - UltraChat (UltraChat数据集): Large-scale synthetic dialogue dataset for SFT
        
    - OpenAssistant (OpenAssistant数据集): Crowdsourced human-generated conversations