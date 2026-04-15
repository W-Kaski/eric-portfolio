---
title: "Value-Based Methods"
date: "2025-04-21"
---
# 2.3.2. 基于值的方法 (Value-Based Methods)

**Parent**：[[Reinforcement Learning|2.3. 强化学习 (Reinforcement Learning, RL)]]

**Children**：
- [[A Q-Learning/Q-Learning|A. Q-Learning]]
- [[B SARSA/SARSA|B. SARSA]]
- [[C DQN/DQN|C. DQN (Deep Q-Network)]]
- [[D Double DQN/Double DQN|D. Double DQN]]
- [[E Dueling DQN/Dueling DQN|E. Dueling DQN]]
- [[Rainbow DQN]]

---

|**算法名称**|**核心机制 (Key Mechanics)**|**策略类型**|**目标值 (Target) 计算方式**|**优点 (Pros)**|**缺点 (Cons)**|
|---|---|---|---|---|---|
|**Q-Learning**|查找表 (Q-Table) + 时序差分 (TD)|**Off-policy**|$R + \gamma \max_{a'} Q(s', a')$|简单直观，能学习到理论上的最优策略。|无法处理大状态空间；存在严重的**过估计**问题。|
|**SARSA**|查找表 (Q-Table) + 实际动作采样|**On-policy**|$R + \gamma Q(s', a')$|训练过程更安全、平稳，考虑了探索带来的风险。|收敛较慢，无法像 Q-Learning 那样激进地寻找最优解。|
|**DQN**|神经网络 + **经验回放** + **目标网络**|**Off-policy**|$R + \gamma \max_{a'} Q(s', a'; \theta^-)$|开启了深度 RL 时代，能直接处理像素级原始输入。|训练极不稳定；同样深受**过估计**之苦。|
|**Double DQN**|解耦动作**选择**与**评估**|**Off-policy**|$R + \gamma Q(s', \text{argmax}_{a'} Q(s', a'; \theta); \theta^-)$|极其优雅地解决了过估计问题，Q 值估算更准确。|依然存在采样效率低的问题，对某些状态价值区分度不够。|
|**Dueling DQN**|架构拆分为 **V (状态价值)** 与 **A (优势)**|**Off-policy**|与 DDQN 类似，但网络输出结构不同|在动作冗余的环境下学习效率极高，泛化能力强。|引入了额外的超参数（如均值消减的操作选择）。|
**权衡 (Trade-off)**：

#### 1. 如果你的环境非常“危险” (例如硬件实验)

- **首选：SARSA**。
    
- **理由**：SARSA 是“胆小鬼”算法，它在学习时会把 $\epsilon$-greedy 的随机探索风险算进去。它不会像 Q-Learning 那样为了追求理论最优而频繁掉进陷阱。
    
#### 2. 如果你的状态空间极大 (例如视频游戏、复杂图像)

- **首选：DQN 家族**。
    
- **理由**：查找表在连续或高维空间会发生“维度灾难”，神经网络的函数近似能力是唯一的出路。
    
#### 3. 如果你发现模型“蜜汁自信” (Q 值虚高)

- **首选：Double DQN**。
    
- **理由**：$\max$ 操作本质上是对噪声的极大化。DDQN 通过“两个网络互相制衡”的思想，把这种虚高的火气降了下来。
    
#### 4. 如果你的动作很多，但大部分动作在某些状态下都无所谓

- **首选：Dueling DQN**。
    
- **理由**：它可以让你在不更新每一个动作的情况下，通过更新 $V$ 支路就能让整个状态的价值提升，这大大节省了学习成本。