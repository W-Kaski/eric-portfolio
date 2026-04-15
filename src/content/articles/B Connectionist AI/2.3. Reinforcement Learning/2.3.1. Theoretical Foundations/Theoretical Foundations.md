---
title: "Theoretical Foundations"
date: "2025-04-13"
---
# 2.3.1. 理论基础 (Theoretical Foundations)

**Parent**：[[Reinforcement Learning|2.3. 强化学习 (Reinforcement Learning, RL)]]

**Children**：
- [[A Markov Decision Process (MDP)/Markov Decision Process (MDP)|A. 马尔可夫决策过程 (Markov Decision Process, MDP)]]
- [[B Bellman Equation/Bellman Equation|B. 贝尔曼方程 (Bellman Equation)]]
- [[C Dynamic Programming/Dynamic Programming|C. 动态规划 (Dynamic Programming)]]
- [[D Policy Evaluation/Policy Evaluation|D. 策略评估 (Policy Evaluation)]]
- [[E Policy Improvement/Policy Improvement|E. 策略改进 (Policy Improvement)]]
- [[F Value Iteration & Policy Iteration/Value Iteration & Policy Iteration|F. 值迭代与策略迭代 (Value Iteration & Policy Iteration)]]
- [[G Convergence Analysis/Convergence Analysis|G. 收敛性分析 (Convergence Analysis)]]
- [[广义策略迭代 (GPI)]]

---

|**理论模块**|**角色与定位**|**核心组成 / 公式**|**优势 (Pros)**|**局限 (Cons)**|
|---|---|---|---|---|
|**MDP**|**问题定义**：描述智能体与环境交互的数学框架。|$(S, A, P, R, \gamma)$|提供标准化的数学语言，使各种算法具有通用性。|假设环境具有马尔可夫性；现实中建模 $P$ 和 $R$ 极难。|
|**贝尔曼方程**|**数学工具**：定义价值与未来价值的递归关系。|$V(s) = E[r + \gamma V(s')]$|将长期预测任务转化为局部的递归计算，是所有 RL 算法的根基。|计算复杂度随状态空间呈指数增长（维数灾难）。|
|**动态规划 (DP)**|**求解范式**：在已知环境模型的前提下进行“规划”。|策略评估 + 策略改进|理论上能找到全局最优解；无需实际与环境交互。|**必须知道模型 ($P, R$)**；无法处理连续或超大状态空间。|
|**策略评估**|**计算步骤**：测量当前策略到底有多好。|$V_{k+1} = \mathcal{T}^\pi V_k$|能精确衡量风险与收益，为改进提供依据。|需要多次迭代才能收敛，计算成本高。|
|**策略改进**|**优化步骤**：根据评估结果寻找更优动作。|$\pi' = \text{argmax } Q^\pi(s, a)$|具有数学保证：改进后的策略一定不会比旧策略差。|仅基于当前价值，可能陷入局部最优（在非凸情况下）。|
|**策略迭代 (PI)**|**完整算法**：交替进行完整的评估和改进。|评估 $\to$ 改进 $\to$ 循环|**收敛速度快**（迭代次数少）；逻辑严密。|每次评估都要迭代到收敛，单次循环极其耗时。|
|**值迭代 (VI)**|**完整算法**：将评估与改进合二为一。|$V_{k+1} = \max_a \mathcal{T} V_k$|**单次计算效率高**；不需要显式维护策略表。|价值函数收敛通常比策略收敛慢；直观性稍差。|
|**收敛性分析**|**理论保证**：证明算法最终能找到最优解。|巴拿赫不动点 / 收缩映射|确保了算法在有限步骤内一定能停止并给出真理。|很多证明依赖于线性近似或离散空间，在深度学习中往往失效。|
### 如何区分它们？

- 如果你在纠结 **“如何描述这个世界”** $\rightarrow$ 看 **MDP**。
    
- 如果你在纠结 **“这个状态值多少钱”** $\rightarrow$ 看 **贝尔曼方程**。
    
- 如果你在纠结 **“有地图怎么走最快”** $\rightarrow$ 看 **值迭代/策略迭代**。
    
- 如果你在纠结 **“为什么这算法能成”** $\rightarrow$ 看 **收敛性分析（收缩映射）**。