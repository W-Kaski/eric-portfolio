---
title: "DDPG"
date: "2025-04-23"
---
# DDPG (Deep Deterministic Policy Gradient)

**Parent**：[[Policy-Based Methods|2.3.3. 基于策略的方法 (Policy-Based Methods)]]

---

# DDPG (深度确定性策略梯度)

## 1. 核心身份：它是谁？

- **Deep**：使用了深度神经网络。
    
- **Deterministic**：**确定性**。不同于 PPO 输出一个概率分布（抽样），DDPG 的 Actor 直接输出一个具体的动作数值（比如：转向角度 **24.5°**）。
    
- **Policy Gradient**：基于策略梯度进行优化。
    
- **Actor-Critic**：它是典型的演员-评论家架构。
    

---

## 2. 核心挑战：为什么不能直接用 DQN？

在 DQN 中，我们要找最优动作需要计算 $\max_a Q(s, a)$。

- 如果动作是离散的（左、右），这很简单。
    
- 如果动作是连续的（0 到 360 度之间的任意数），你无法通过穷举法找到让 $Q$ 值最大的那个 $a$。
    

**DDPG 的解法**：我不去算哪个 $a$ 最大，我直接训练一个 **Actor 网络**，让它负责“写出”那个能让 $Q$ 值最大的动作。

---

## 3. DDPG 的“四大法宝”（稳定性保障）

DDPG 继承了 DQN 的优良传统，并针对连续空间做了优化：

1. **经验回放 (Experience Replay)**：
    
    跟 DQN 一样，把经历存起来随机抽样，打碎数据相关性。
    
2. **目标网络 (Target Networks)**：
    
    它丧心病狂地使用了**4 个网络**：
    
    - **Online Actor / Critic**：负责当前的训练。
        
    - **Target Actor / Critic**：负责提供稳定的目标值。
        
3. **软更新 (Soft Updates)**：
    
    这是 DDPG 的神来之笔。不同于 DQN 每隔几千步硬拷贝一次参数，DDPG 每一刻都在“慢慢渗透”：
    
    $$\theta_{target} \leftarrow \tau \theta_{online} + (1 - \tau) \theta_{target}$$
    
    其中 $\tau$ 非常小（如 0.001），这让目标值极其稳定。
    
4. **探索噪声 (Exploration Noise)**：
    
    因为策略是确定的，模型很容易钻牛角尖。为了强制它探索，DDPG 在训练时会给动作加点“乱子”（通常使用 **Ornstein-Uhlenbeck 噪声**）。
    

---

## 4. 数学原理：它是怎么更新的？

### Critic 的更新（跟 DQN 几乎一样）：

最小化均方误差，让 $Q$ 估算得更准：

$$L = E[( \underbrace{r + \gamma Q_{target}(s', \mu_{target}(s'))}_{TD\ Target} - Q_{online}(s, a) )^2]$$

### Actor 的更新（核心）：

目标是让 $Q$ 值最大化。我们直接对 $Q$ 值求导，让 Actor 往 $Q$ 增大的方向走：

$$\nabla_{\theta_\mu} J \approx E [ \nabla_a Q(s, a) \cdot \nabla_{\theta_\mu} \mu(s) ]$$

> **通俗解释**：评论家告诉演员：“你刚才那个动作，如果再往左一点，分数会更高。” 演员就根据这个建议调整自己的肌肉记忆。

---

## 5. DDPG vs PPO：巅峰对决

|**特性**|**DDPG**|**PPO**|
|---|---|---|
|**策略性质**|确定性 (Deterministic)|随机性 (Stochastic)|
|**数据利用**|**Off-policy** (极高，有回放池)|**On-policy** (较低，数据学完就扔)|
|**稳定性**|较难调参，容易由于 Q 估算偏差崩盘|非常稳健，不容易跑飞|
|**适用场景**|工业机械臂、简单物理仿真|复杂动作、游戏 AI、大模型微调|

---

## 💡 教授的实战点评

DDPG 是一个“高收益、高风险”**的算法。 它的**数据效率极高，因为它能利用历史数据。但在实际应用中，DDPG 经常会遇到 **Q 值过估计** 的问题（就像 DQN 一样）。为了修补这个 Bug，后来又诞生了更强的 **TD3 (双延迟深度确定性策略梯度)**。
