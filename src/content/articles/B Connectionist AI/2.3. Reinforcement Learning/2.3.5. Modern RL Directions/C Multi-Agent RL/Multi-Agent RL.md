---
title: "Multi-Agent RL"
date: "2025-05-16"
---
# 多智能体强化学习 (Multi-Agent RL)

**Parent**：[[Modern RL Directions|2.3.5. 现代强化学习方向 (Modern RL Directions)]]

---

# 多智能体强化学习 (MARL) 

### 1. 核心挑战：为什么 MARL 这么难？

- **非平稳性 (Non-stationarity)**：最致命的问题。当智能体 A 学习时，智能体 B 也在变。对 A 来说，环境的规律时刻在变，导致传统的收敛保证全部失效。
    
- **多智能体信用分配 (Credit Assignment)**：如果团队赢了，是前锋踢得好，还是守门员守得稳？很难通过一个总分来判断每个个体的贡献。
    
- **维度灾难 (Scalability)**：随着智能体数量增加，状态和动作组合的空间呈指数级爆炸。
    

### 2. 三大训练范式

目前最主流的思路是 **CTDE (Centralized Training, Decentralized Execution)**：**集中训练，分布式执行。**

- **集中训练**：在实验室里，大家可以互相看牌，共享信息，由一个“超级大脑”来评估全局表现。
    
- **分布式执行**：到了实战场（部署），每个智能体只能看到自己的局部信息，独立决策。
    

---

### 📊 MARL 核心算法对比表

|**算法**|**类型**|**核心机制**|**优缺点**|
|---|---|---|---|
|**IQL**|独立式|每个 Agent 各玩各的，把别人当环境。|简单但极度不稳定，容易陷入死循环。|
|**VDN**|协作式|**价值分解**：$Q_{tot} = \sum Q_i$。|简单有效，但假设太理想（认为总分只是简单相加）。|
|**QMIX**|协作式|**非线性融合**：用 Mixing Network 合成总 $Q$ 值。|**目前的经典基石**。能处理复杂的协作，但计算开销稍大。|
|**MADDPG**|混合式|每一个 Actor 都有一个能看全局的 Critic。|适应性强（协作/竞争均可），但难以扩展到超大规模数量。|
|**MAPPO**|协作式|将 PPO 扩展到多智能体，加入全局状态估计。|**SOTA 级别的稳健**。在星际争霸等环境表现极佳。|

---

# 📚 MARL 前沿论文推荐 (2024 - 2026)

作为 2026 年的学习者，你应该关注 **大模型 (LLM) 如何作为“指挥官”** 以及 **异构智能体 (Heterogeneous Agents)** 的协作。

### 1. 经典基石 (入门必读)

- **QMIX**: _Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning_ (Rashid et al., 2018)
    
    - _必读理由_：理解“价值分解”思想的教科书。
        
- **MAPPO**: _The Surprising Effectiveness of MAPPO in Cooperative Multi-Agent Games_ (Yu et al., 2021)
    
    - _必读理由_：证明了只要调优得当，Policy-Based 方法在多智能体中也非常强。
        

### 2. 2025 - 2026 顶级前沿

- **"YOLO-MARL: You Only LLM Once for Multi-agent Reinforcement Learning" (2025)**
    
    - **核心**：利用 LLM 的高层规划能力，只在环境初始化时进行一次规划，指导底层 MARL 智能体学习协作。极大降低了 LLM 的调用成本。
        
- **"MAGRPO: Multi-Agent Group-Relative Policy Optimization" (Anil et al., 2025)**
    
    - **核心**：借鉴了 DeepSeek 等大模型的 **GRPO** 算法，将其引入多智能体领域，利用群体相对优势来优化协作，特别是在 LLM 协同办公场景下表现卓越。
        
- **"Heterogeneity in Multi-Agent Reinforcement Learning" (Hu et al., 2026)**
    
    - **核心**：定义了**“异构距离” (Heterogeneity Distance)**。研究当团队里有“无人机”、“机器狗”和“地面车”等完全不同的物种时，如何进行高效的动态参数共享。
        
- **"Explainable MARL for Large-scale Swarms" (2025/2026 IEEE)**
    
    - **核心**：研究如何解释成千上万个智能体组成的集群行为。不仅仅是拿高分，还要让后续的人类指挥官明白：“为什么这群无人机决定采用这个阵型？”
        

---

### 🧠 教授的“实战感悟”

在 MARL 中，**“沟通” (Communication)** 是目前最火的子领域。与其让智能体去猜别人的心思，不如让它们学会一套**“加密暗号”**。

> **前沿趋势**：现在的研究不再局限于传简单的数字信号，而是让智能体通过 **语言协议** 交流。这正是 **MARL 与大模型结合** 的魅力所在。
