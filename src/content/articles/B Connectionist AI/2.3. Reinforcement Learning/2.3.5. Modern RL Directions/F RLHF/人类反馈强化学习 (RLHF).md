

**Parent**：[[Modern RL Directions|2.3.5. 现代强化学习方向 (Modern RL Directions)]]

---

# 人类反馈强化学习 (RLHF) 

### 1. 核心矛盾：为什么不能只用监督学习 (SFT)？

- **无法穷举**：人类的偏好是微妙的（比如：什么是“有礼貌”？什么是“简洁”？）。你很难写出完美的标准答案让模型去背。
    
- **幻觉问题**：监督学习只是在教模型“模仿”。RLHF 则是通过奖励机制，让模型在生成的过程中，学会避开那些虽然概率高但错误的“坑”。
    

### 2. 标准三部曲 (InstructGPT 范式)

这是由 OpenAI 确立的经典流程：

1. **SFT (Supervised Fine-Tuning)**：找专家写几万条高质量的问答对，让模型学会基本的指令跟随。
    
2. **RM (Reward Model, 奖励模型)**：让模型针对一个问题生成 4-9 个答案，由人类进行**排序**。然后训练一个奖励模型，去学习这个排序背后的“人类品味”。
    
3. **RL (Reinforcement Learning)**：使用 **PPO** 算法。让 LLM 不断生成回答，由奖励模型打分，模型根据分数调整参数。为了防止模型“练废了”（偏离原始能力），通常会加入一个 **KL 散度惩罚项**。
    

### 3. 2024-2026 的范式变革：从 PPO 到 DPO/GRPO

虽然 PPO 很强，但它太复杂了（需要同时维护 4 个模型：Policy, Value, Ref, Reward）。现在的趋势是**去 PPO 化**：

- **DPO (Direct Preference Optimization)**：2024 年的大红人。它证明了不需要显式的奖励模型，直接通过数学变换，在偏好数据上做一次损失函数优化就能达到类似 RLHF 的效果。
    
- **GRPO (Group Relative Policy Optimization)**：这是 **DeepSeek-R1** 在 2025 年引爆的技术。它取消了 Critic 网络，通过在一组生成的答案中计算“相对优势”来更新策略，极大地节省了显存。
    

---

# 📚 RLHF 经典与前沿论文 (2022 - 2026)

作为 2026 年的学习者，你应该关注 **从“偏好”向“推理”** 的跨越。

### 1. 奠基之作 (Foundations)

- **Training language models to follow instructions with human feedback (InstructGPT)** (Ouyang et al., 2022)
    
    - _必读理由_：RLHF 的开山鼻祖，定义了现代大模型的对齐流程。
        
- **Deep Reinforcement Learning from Human Preferences** (Christiano et al., 2017)
    
    - _必读理由_：虽然更早，但它提出了“人类只负责排序，模型负责学习奖励”的核心思想。
        

### 2. 效率与方法论革命 (2024 - 2025)

- **"Direct Preference Optimization (DPO): Your Language Model is Secretly a Reward Model"** (Rafailov et al., 2024)
    
    - **核心**：目前最流行的 RLHF 替代方案，简洁、高效。
        
- **"DeepSeek-V3/R1: Scaling RL for Reasoning"** (DeepSeek Team, 2025)
    
    - **核心**：展示了如何通过纯强化学习（无需太多 SFT 数据）让模型涌现出惊人的**逻辑推理能力**。它使用的 **GRPO** 是目前的学术高地。
        
- **"Step-level Value Learning for Improving RLHF"** (2025)
    
    - **核心**：不再对整个段落打分，而是针对推理的**每一步（Step-wise）**进行打分。这解决了长文本中“中间对、结尾错”的信用分配问题。
        

### 3. 2026 最新前沿：自我对齐 (Self-Alignment)

- **"RLAIF: Reinforcement Learning from AI Feedback"** (Anthropic/Google, 2025/2026)
    
    - **核心**：人类太贵了，也太慢了。让一个超强的模型（如 Claude 4）去给弱一点的模型打分。
        
- **"Constitutional AI: Toward a Self-Governing AI"** (2025 更新版)
    
    - **核心**：给模型一套“宪法”（原则），让模型在自我训练中根据宪法审视自己的答案，实现自动对齐。
        

---

### 🧠 教授的深度解读：RLHF 的本质

RLHF 本质上是在处理一个**“多目标优化”**问题。你要同时满足：

1. **Helpful (有用)**：回答用户的需求。
    
2. **Honest (诚实)**：不胡编乱造（减轻幻觉）。
    
3. **Harmless (无害)**：不输出仇恨言论或危险信息。
    

> **教授的预判**：2026 年，单纯的“对齐偏好”已经到头了。现在的 RLHF 正在转向 **RL for Reasoning (RLR)**。我们不再只教 AI 怎么说话好听，而是在通过 RL 教它怎么通过“思考”来解数学题、写复杂的代码。
