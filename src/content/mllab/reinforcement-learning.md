---
title: "Q-Learning Grid World"
date: "2026-03-10"
folder: "Reinforcement"
category: "Machine Learning"
tags: ["RL", "Q-Learning", "Grid World", "Agents"]
description: "Observe an AI agent learning to navigate a grid world environment using tabular Q-learning algorithms."
featured: false
snippet: "Q[s, a] = Q[s, a] + alpha * (\n    reward + gamma * max(Q[s_next, a_prime]) - Q[s, a]\n)"
---

## Reinforcement Learning Agents

Reinforcement Learning (RL) teaches an agent to achieve a goal in an uncertain, complex environment. In RL, an AI agent learns via trial and error, observing the results of its actions through a **reward signal**.

### The Markov Decision Process

An RL problem is typically formulated as a Markov Decision Process (MDP) defined by:
- $S$: A set of distinct states.
- $A$: A set of possible actions.
- $R$: The reward function determining the immediate payoff.
- $P$: The transition probabilities defining the environment dynamics.
- $\gamma$: The discount factor determining how much we care about future rewards.

### Tabular Q-Learning

In a small Grid World, the state space is discrete (just the cell coordinates). The agent maintains a **Q-table** that estimates the future cumulative reward for taking an action $a$ in state $s$.

By continuously exploring the grid, hitting obstacles (negative reward), and finding the goal (positive reward), the agent updates its Q-values. Over time, taking the action with the maximum Q-value in any state will yield the optimal path!
