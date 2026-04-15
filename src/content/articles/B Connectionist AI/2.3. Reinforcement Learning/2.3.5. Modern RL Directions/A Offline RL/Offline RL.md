---
title: "Offline RL"
date: "2025-04-30"
---


**Parent**：[[Modern RL Directions|2.3.5. 现代强化学习方向 (Modern RL Directions)]]

---

# 离线强化学习 (Offline RL)：核心逻辑

#### 为什么我们需要它？

在现实世界中，让 AI 乱撞是很昂贵的：

- **自动驾驶**：你不能为了训练 AI 而让它在街上随便撞人。
    
- **医疗手术**：你不能为了测试新策略而拿病人的生命开玩笑。
    
- **工业控制**：频繁的探索（乱试）会磨损昂贵的机械零件。
    
    **离线 RL 的目标**：利用公司现有的、已经存好的海量日志数据，直接练出一个最强模型。
    

#### 核心痛点：分布偏移 (Distributional Shift)

这是离线 RL 的“阿喀琉斯之踵”。

当你不能与环境交互时，AI 会产生**“幻觉”**。

> **举个例子**：
> 
> 你的数据集里只有“直行”和“左转”的数据。由于神经网络的泛化（瞎猜）特性，它可能会觉得在某个路口“加速右转”能拿 100 分。
> 
> 在**在线 RL** 中，它试一下发现撞墙了，分数立刻变低（自我纠正）。
> 
> 但在**离线 RL** 中，它没法试！它会一直沉溺在“加速右转”的幻想中，最终练出一个自以为无敌其实一出门就撞车的模型。

#### 解决策略：做个“悲观主义者”

目前主流的离线 RL 算法（如 **CQL, IQL, TD3+BC**）的核心思想都是：**保守**。

- **动作约束**：强迫 AI 做的动作必须和数据集里的动作很像。
    
- **价值惩罚**：对于那些数据集里没出现过的动作，默认给极低分（惩罚）。
    

---

### 2. 离线 RL 核心算法对比

|**算法**|**核心思想**|**评价**|
|---|---|---|
|**BCQ**|只在数据集出现过的动作里选最好的。|离线 RL 的开山之作。|
|**CQL (Conservative Q-Learning)**|强行压低 OOD（分布外）动作的 Q 值。|效果极其稳健，工业界的首选。|
|**IQL (Implicit Q-Learning)**|不去预测没见过的动作，只利用现有的分布。|计算简单，避免了过估计问题。|
|**Decision Transformer**|将 RL 看作是一个序列建模问题（类似 GPT）。|开启了“大模型 + 离线 RL”的新时代。|


### 1. 经典基石：理解“悲观主义”的起源

在阅读前沿论文前，这三篇是绕不开的。它们定义了如何处理“分布偏移”的核心数学逻辑。

- **CQL (Conservative Q-Learning)**
    
    - _论文_：_Conservative Q-Learning for Offline Reinforcement Learning_ (NeurIPS 2020)
        
    - **核心**：目前工业界最常用的算法。它通过修改 Loss 函数，强行压低那些在数据集中没出现过的动作的 Q 值。
        
- **IQL (Implicit Q-Learning)**
    
    - _论文_：_Offline Reinforcement Learning with Implicit Q-Learning_ (ICLR 2022)
        
    - **核心**：它不尝试去估计没见过的动作。通过极高的分位数回归（Expectile Regression），它能只利用现有的数据分布就学到最优策略，训练极其稳定。
        
- **TD3+BC**
    
    - _论文_：_A Minimalist Approach to Offline Reinforcement Learning_ (NeurIPS 2021)
        
    - **核心**：大道至简。在 TD3 的基础上加了一个简单的行为克隆 (BC) 惩罚项。它证明了有时候简单的约束比复杂的数学构造更有效。
        

---

### 2. 序列建模流派：把 RL 当作 GPT 训练

这一流派完全颠覆了传统 RL 的状态转移逻辑，将轨迹看作语言序列。

- **Decision Transformer (DT)**
    
    - _论文_：_Decision Transformer: Reinforcement Learning via Sequence Modeling_ (NeurIPS 2021)
        
    - **核心**：不再预测 Q 值，而是给定一个“目标回报（Return-to-go）”，让 Transformer 像预测下一个单词一样预测下一个动作。
        
- **Trajectory Transformer**
    
    - _论文_：_Offline Reinforcement Learning as One Big Sequence Modeling Problem_ (NeurIPS 2021)
        
    - **核心**：将状态、动作、奖励全部离散化，利用 Transformer 强大的概率建模能力来预测整个轨迹的分布。
        

---

### 3. 生成式模型流派：Diffusion + RL 的崛起

这是 2023-2025 年间最热门的方向，利用扩散模型强大的多模态拟合能力。

- **Diffusion Policy**
    
    - _论文_：_Diffusion Policy: Visuomotor Policy Learning via Action Diffusion_ (RSS 2023)
        
    - **核心**：目前机器人领域的 SOTA。它不是输出一个动作，而是通过扩散过程生成一段平滑的动作序列，非常适合处理复杂、多变的离线数据。
        
- **IDQL (Implicit Diffusion Q-Learning)**
    
    - _论文_：_Offline RL with Implicit Diffusion Models_ (ICLR 2023)
        
    - **核心**：将扩散模型作为 Policy 网络，配合 IQL 的值函数估计，在复杂的离线任务上表现惊人。
        

---

### 4. 2024-2026 最新前沿：大模型与 Scaling Laws

作为身处 2026 年的学习者，你需要关注离线 RL 如何在海量异构数据上进行扩展。

- **Scaling Laws for Offline RL (2024)**
    
    - _论文视角_：类似于 LLM，研究者开始发现 Offline RL 的性能与参数量、数据多样性之间存在明显的幂律关系。
        
- **RT-X / Open X-Embodiment (2024/2025)**
    
    - _核心_：Google 推出的跨机器人任务的大规模离线数据集和模型。它展示了如何通过离线 RL 训练出一个可以控制成百上千种不同型号机器人的“通用大脑”。
        
- **Offline RL as In-Context Learning (2025)**
    
    - _前沿方向_：不再微调模型参数，而是将一小段专家轨迹放入上下文（Context），让预训练的策略大模型直接“悟出”在当前环境下的最优操作。
