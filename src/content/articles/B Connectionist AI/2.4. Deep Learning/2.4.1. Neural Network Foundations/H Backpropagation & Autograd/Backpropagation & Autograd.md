---
title: "Backpropagation & Autograd"
date: "2025-04-10"
---

parent:[[Neural Network Foundations]]

# Backpropagation & Autograd


## 1. 核心定义 (Definitions)

- **Backpropagation (反向传播)**: 一种通过高效计算复合函数偏导数的算法，本质上是 **Chain Rule (链式法则)** 在神经网络中的应用。
    
- **Autograd (自动求导)**: 现代深度学习框架（如 PyTorch）提供的引擎，它能自动记录计算过程并计算梯度，让你无需手动推导复杂的数学公式。
    

---

## 2. 计算图 (The Computational Graph)

在执行反向传播之前，框架会将你的数学表达式转化为一个 **Directed Acyclic Graph (DAG, 有向无环图)**。

- **Node (节点)**: 代表变量（Tensor）或算子（Operator，如加法、乘法）。
    
- **Edge (边)**: 代表数据的流向。
    

通过计算图，复杂的神经网络被拆解为一系列简单的、可导的基础运算。

---

## 3. 数学基石：链式法则 (The Chain Rule)

假设我们有一个复合函数 $L = f(g(x))$。我们要计算 $L$ 对 $x$ 的偏导数。

根据链式法则：

$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial g} \cdot \frac{\partial g}{\partial x}$$

在神经网络中，这意味着：**Global Gradient (全局梯度) = Incoming Gradient (传回来的梯度) $\times$ Local Gradient (本地梯度)**。

---

## 4. 训练的两大步 (The Two-Pass Process)

### Step 1: Forward Pass (前向传播)

- **动作**: 数据从输入层流向输出层。
    
- **目的**: 计算每一层的输出值以及最终的 **Loss (损失)**。
    
- **存储**: 框架会保存中间结果（Activations），因为反向传播时需要用到它们。
    

### Step 2: Backward Pass (反向传播)

- **动作**: 从 Loss 开始，沿着计算图**逆向**回传。
    
- **目的**: 计算 Loss 对每个参数（Weights/Biases）的 **Gradient (梯度)**。
    
- **逻辑**: 每一个节点接收到上游传来的梯度，乘上自己的局部梯度，再传给下游。
    

---

## 5. 自动求导 (Autograd) 的运作机制

在 PyTorch 等框架中，Autograd 就像一个录音机：

1. **Dynamic Graph (动态图)**: 当你执行前向传播时，它会实时构建计算图。
    
2. **Gradient Storage**: 每个张量都有一个 `.grad` 属性来存储其梯度。
    
3. **Leaf Tensors (叶子张量)**: 通常指权重 $W$ 和偏置 $b$，它们是我们需要优化（更新）的终端节点。
    

---

## 6. 核心术语总结 (Key Terminology)

|**英文术语 (English Term)**|**中文释义**|**在 BP 中的意义**|
|---|---|---|
|**Partial Derivative**|偏导数|衡量单个参数对 Loss 的影响程度。|
|**Local Gradient**|本地梯度|当前操作（如 ReLU）对输入值的导数。|
|**Jacobian Matrix**|雅可比矩阵|多维向量求导时的导数矩阵。|
|**Vanishing Gradient**|梯度消失|梯度在回传中因连乘而变得趋近于 0。|
|**Exploding Gradient**|梯度爆炸|梯度因权重过大连乘而变得无穷大。|
|**Gradient Accumulation**|梯度累加|将多个 batch 的梯度叠加后再更新参数。|

---

## 7. 教授的工程要点 (Professor's Practical Tips)

1. **Stop Gradient (`detach`)**: 有时我们不希望某些层参与学习，可以使用 `detach()` 将张量从计算图中剥离，阻断梯度的回传。
    
2. **Memory Management**: 记住，前向传播保存了大量的中间变量。如果你不需要训练（比如测试时），务必使用 `with torch.no_grad()` 来节省显存，它会关闭 Autograd 的录音机。
    
3. **Numerical Stability**: 某些函数（如 $\log$ 或 $\exp$）在计算局部梯度时容易溢出。现代框架通常会将 `Softmax` 和 `CrossEntropy` 合并计算，以确保 **Numerical Stability (数值稳定性)**。