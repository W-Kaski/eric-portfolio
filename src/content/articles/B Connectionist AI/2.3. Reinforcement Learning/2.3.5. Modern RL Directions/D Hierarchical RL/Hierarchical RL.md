---
title: "Hierarchical RL"
date: "2025-05-10"
---
# 分层强化学习 (Hierarchical RL)

**Parent**：[[Modern RL Directions|2.3.5. 现代强化学习方向 (Modern RL Directions)]]

---

# 分层强化学习 (HRL) 核心笔记

### 1. 核心架构：经理与员工 (Manager-Worker)

HRL 的标准架构通常分为两层（甚至更多）：

- **高层策略 (High-level Policy / Manager)**：
    
    - **职责**：制定宏观目标或选择“技能”。
        
    - **决策频率**：低频（每隔几十步做一次决策）。
        
    - **目标**：比如“移动到坐标 $(x, y)$”。
        
- **低层策略 (Low-level Policy / Worker)**：
    
    - **职责**：执行具体的原子动作（如：向前、点火、旋转）。
        
    - **决策频率**：高频（每步都在做决策）。
        
    - **奖励**：通常由高层下达的内在奖励 (Intrinsic Reward) 驱动。
        

---

### 📊 HRL 核心算法对比表

|**算法流派**|**代表算法**|**核心机制**|**优点**|**缺点**|
|---|---|---|---|---|
|**Options 框架**|**Option-Critic**|学习什么时候开始、结束一个“选项”（技能）。|数学框架最通用、优雅。|容易退化成单层动作（选项长度变为1）。|
|**目标条件 (Goal-Conditioned)**|**HIRO / HAC**|高层给低层设定一个状态目标 $g$。|**HIRO** 解决了非平稳性；**HAC** 利用后视经验极大地提升了效率。|对状态空间的表征能力要求很高。|
|**数据驱动/子任务**|**FeUdal Networks**|“封建管理”，高层通过隐向量指导低层。|能够学习到极长跨度的任务。|结构复杂，训练非常吃资源。|
|**大模型驱动 (2025-26)**|**HLA / PTA-GRPO**|**LLM 作高层规划**，小模型/脚本作执行。|利用了 LLM 的常识，**无需从零探索**逻辑。|推理延迟高，对 Prompt 敏感。|

---

### 🧠 2026 年的前沿趋势：从 Token 到 语义 (Semantic)

作为身处 2026 年的开发者，你需要关注一个正在发生的范式转移：**语义级强化学习 (Semantic-Level RL)**。

以往的 HRL 是在物理坐标系里分层，现在的趋势是利用 **大语言模型 (LLM)** 作为“慢思考 (System 2)”，进行战略规划；利用轻量级模型作为“快思考 (System 1)”，进行快速反应。

> **核心观点**：2026 年的研究（如 _Emergent Hierarchical Reasoning_）发现，LLM 的推理能力提升其实经历了两个阶段：先学会**规程正确性**（低层技能），再通过 RL 涌现出**战略规划能力**（高层决策）。

---

# 📚 HRL 前沿论文推荐 (2024 - 2026)

### 1. 经典与改进 (2024)

- **"Guided Cooperation in Hierarchical Reinforcement Learning via Model-Based Rollout"** (IEEE, 2024)
    
    - **核心**：提出了 **GCMR** 框架，利用高层的 Critic 来引导低层的策略，解决了层级间的信息断层问题。
        
- **"Goal-Conditioned HRL with High-Level Model Approximation" (HLMA)** (IEEE, 2024)
    
    - **核心**：通过构建高层动力学模型来预测 $k$ 步后的状态转移，显著提升了采样效率。
        

### 2. 大模型集成 (2025 - 2026)

- **"Plan Then Action: High-Level Planning Guidance RL for LLM Reasoning"** (arXiv/NeurIPS, 2025)
    
    - **核心**：提出 **PTA-GRPO** 算法，利用大模型的规划能力为 CoT (思维链) 提供全局指导。
        
- **"Emergent Hierarchical Reasoning in LLMs through Reinforcement Learning"** (OpenReview/ICLR, 2026)
    
    - **核心**：揭示了 RL 如何驱动 LLM 从简单的 Token 预测演化为“战略规划+规程执行”的双层分层架构。
        
- **"Hierarchical Decision-making via Multi-turn Reinforcement Learning"** (NeurIPS, 2025)
    
    - **核心**：模仿人类的双系统理论，System 1 生成高层目标，System 2 执行多步动作，极大增强了长程任务的处理能力。
