---
title: Understanding Transformers from Scratch
date: 2026-03-10
category: Machine Learning
tags: [Deep Learning, NLP]
excerpt: A deep dive into the architecture that revolutionized natural language processing.
---

# Understanding Transformers from Scratch

The Transformer model, introduced in the seminal paper "Attention is All You Need", has become the backbone of modern NLP.

## The Core Idea: Attention

Unlike RNNs that process sequences step-by-step, Transformers use **Self-Attention** to weigh the importance of different words in a sentence simultaneously.

```python
import torch
import torch.nn as nn

def scaled_dot_product_attention(q, k, v):
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) /  math.sqrt(d_k)
    weights = torch.softmax(scores, dim=-1)
    return torch.matmul(weights, v)
```

# 强化学习第 4 讲：函数近似与 DQN 思维导图大纲

### 基础知识回顾 (Recall)

- **学习范式 (Learning Paradigms)**
    
    - **同策 (On-Policy)**：学习并评估当前执行的策略（如 SARSA） 。
        
    - **异策 (Off-Policy)**：学习最优策略，同时遵循探索性策略（如 Q-Learning） 。
        
    - **在线/离线 (Online/Offline)**：实时更新与从固定数据集中学习 。
        
- **关键算法回顾**
    
    - **SARSA**：基于 $(s_t, a_t, r_t, s_{t+1}, a_{t+1})$ 更新，学习 $Q^{\pi}$ 。
        
    - **Q-Learning**：使用 $max_{a'}$ 更新，直接学习最优价值函数 $Q^*$ 。
        
- **典型案例：悬崖行走 (Cliff Walking)**
    
    - Q-Learning 学习最优但危险的路径 。
        
    - SARSA 学习避开边缘的安全路径 。
        

---

### 函数近似基础 (Function Approximation Basics)

- **表格型的局限性 (Limitations of Tabular RL)**
    
    - **内存**：无法存储海量状态（如象棋 $10^{120}$） 。
        
    - **泛化**：无法对未见过的状态进行推断 。
        
    - **效率/连续性**：采样效率低，无法处理连续状态空间 。
        
- **核心理念**
    
    - 使用带参数 $w$ 的函数：$\hat{V}(s;w) \approx V^{\pi}(s)$ 或 $\hat{Q}(s,a;w) \approx Q^{\pi}(s,a)$ 。
        
    - **类型**：线性组合、神经网络、决策树、最近邻 。
        
- **数学工具：随机梯度下降 (SGD)**
    
    - **损失函数**：$J(w)=\mathbb{E}_{\pi}[(Q^{\pi}(s,a)-\hat{Q}(s,a;w))^{2}]$ 。
        
    - **更新规则**：$\Delta w = \alpha(Target - \hat{Q})\nabla_w \hat{Q}$ 。
        

---

### 模型无关的策略评估 (Policy Evaluation w/ VFA)

- **蒙特卡洛评估 (MC Evaluation)**
    
    - 目标值是回报 $G_t$（无偏但高方差） 。
        
    - 视为对 $(s, a, G)$ 样本进行监督学习 。
        
- **时序差分评估 (TD Evaluation)**
    
    - 目标值是 TD Target：$r + \gamma \hat{V}(s'; w)$ 。
        
    - **三重近似**：采样、引导（Bootstrapping）、函数近似 。
        
- **收敛性对比**
    
    - **线性近似**：MC 和 TD(0) 均能收敛 。
        
    - **非线性近似**：TD(0) 有不收敛的风险 。
        

---

### 函数近似下的控制 (Control w/ VFA)

- **增量式控制方法更新规则**
    
    - **MC 控制**：$\Delta w=\alpha(G_{t}-\hat{Q}(s_{t},a_{t};w))\nabla_{w}\hat{Q}$ 。
        
    - **SARSA 控制**：$\Delta w=\alpha(r+\gamma\hat{Q}(s^{\prime},a^{\prime};w)-\hat{Q}(s,a;w))\nabla_{w}\hat{Q}$ 。
        
    - **Q-Learning 控制**：$\Delta w=\alpha(r+\gamma \max_{a'}\hat{Q}(s^{\prime},a^{\prime};w)-\hat{Q}(s,a;w))\nabla_{w}\hat{Q}$ 。
        
- **稳定性挑战：“致命三要素 (Deadly Triad)”**
    
    1. **引导 (Bootstrapping)**（TD 方法） 。
        
    2. **函数近似 (Function Approximation)** 。
        
    3. **异策学习 (Off-policy learning)**（如 Q-Learning） 。
        

---

### 深度 Q 网络 (DQN)

- **面临的问题**
    
    - 样本间的相关性 。
        
    - 非稳态目标（目标随更新而变） 。
        
- **核心解决方案**
    
    - **经验回放 (Experience Replay)**：存储并随机采样历史数据，打破相关性 。
        
    - **固定 Q 目标 (Fixed Q-Targets)**：使用独立的参数 $w^-$ 计算目标值 。
        
- **Atari 实践**
    
    - **输入**：像素堆栈 。
        
    - **架构**：卷积神经网络 (CNN) 。
        
- **进阶扩展**
    
    - Double DQN、优先回放 (Prioritized Replay)、Dueling DQN 。