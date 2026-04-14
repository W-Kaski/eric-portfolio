
parent:[[Attention Mechanism]]

# Self-Attention (自注意力机制)

## 1. 核心定义 (What is Self-Attention?)

**Self-Attention**，有时也称为 **Intra-Attention**。

- **Concept**: 它衡量的是一个序列中不同位置之间的相关性，从而计算出该序列的一个新表征（Representation）。
    
- **Intuition**: 当模型处理一个词时，自注意力允许它查看句子中所有其他的词，以寻找能帮助更好地编码这个词的线索。
    

> **Example**: "The **animal** didn't cross the **street** because **it** was too tired."
> 
> 当模型处理 "**it**" 这个词时，Self-attention 机制会使其对 "**animal**" 的注意力权重高于对 "**street**" 的权重。

---

## 2. 三剑客：Query, Key, and Value

在 Self-Attention 中，每个输入向量（Input Embedding）都会通过三个不同的 **Weight Matrices** ($W^Q, W^K, W^V$) 线性投影（Linear Projection）出三个向量：

1. **Query ($Q$)**: “查询”向量。代表当前词正在寻找什么。
    
2. **Key ($K$)**: “键”向量。代表当前词能提供什么，作为被查询的索引。
    
3. **Value ($V$)**: “值”向量。代表当前词包含的实际信息。
    

---

## 3. 计算步骤 (The 5-Step Calculation)

假设我们要计算第一个词的输出：

### Step 1: Linear Projection

将输入 $X$ 乘以权重矩阵得到 $Q, K, V$。

$$Q = XW^Q, \quad K = XW^K, \quad V = XW^V$$

### Step 2: Calculate Scores

计算当前词的 $Q$ 与序列中所有词的 $K$ 之间的 **Dot-product (点积)**。

$$\text{Score} = Q \cdot K^T$$

### Step 3: Scale Scores

为了 **Numerical Stability (数值稳定性)**，将得分除以 $\sqrt{d_k}$（$d_k$ 是向量维度）。这就是 **Scaled Dot-product**。

$$\text{Scaled Score} = \frac{Q \cdot K^T}{\sqrt{d_k}}$$

### Step 4: Softmax

通过 **Softmax** 函数将得分转化为 **Probability Distribution (概率分布)**，即 **Attention Weights**。

$$\alpha = \text{Softmax}(\frac{Q \cdot K^T}{\sqrt{d_k}})$$

### Step 5: Weighted Sum

将权重 $\alpha$ 与对应的 **Value ($V$)** 相乘并求和，得到最终的 **Context-aware representation**。

$$Z = \alpha \cdot V$$

---

## 4. 为什么 Self-Attention 改变了游戏规则？

### A. Parallelization (并行化)

与 RNN 必须从左到右串行计算不同，Self-Attention 的矩阵运算可以**一次性**完成。这极大地提高了大规模数据的训练效率。

### B. Long-Range Dependencies (长程依赖)

在 RNN 中，信息需要经过很多步才能从序列开头传到末尾（容易丢失）。在 Self-Attention 中，任何两个词之间的“距离”都是 **1**，无论它们离得有多远。

[Image comparing sequential RNN processing vs parallel Self-Attention processing]

---

## 5. 核心术语总结 (Key Terminology)

|**英文术语 (English Term)**|**中文释义**|**在 Self-Attention 中的作用**|
|---|---|---|
|**Inductive Bias**|归纳偏置|Self-attention 的归纳偏置很弱，使其更灵活，但也更依赖大数据。|
|**Dot-product**|点积|衡量向量相似度的核心数学手段。|
|**Scaling Factor**|缩放因子|即 $\sqrt{d_k}$，防止 Softmax 进入梯度平坦区。|
|**Contextual Embedding**|上下文嵌入|经过注意力计算后的向量，它包含了周围词的信息。|
|**Permutation Invariant**|置换不变性|自注意力本身分不清顺序，所以需要 **Positional Encoding**。|

---

## 6. 教授的工程建议 (Professor's Best Practices)

1. **Multi-Head is Essential**: 单个 Self-attention 可能只能捕捉到一种关系（比如语法关系）。使用 **Multi-Head Attention** 可以让模型在不同的 **Subspaces (子空间)** 同时关注语义、语法、指代等多种关系。
    
2. **Complexity**: 注意，Self-attention 的计算复杂度是 $O(n^2)$（$n$ 是序列长度）。这意味着当序列非常长（如几万个词）时，内存开销会爆炸。这也是为什么现在有很多“高效注意力（Efficient Attention）”变体的原因。
    
3. **Masking**: 在训练语言模型（如 GPT）时，我们使用 **Masked Self-Attention**，确保模型在预测下一个词时“看不见”未来的词。