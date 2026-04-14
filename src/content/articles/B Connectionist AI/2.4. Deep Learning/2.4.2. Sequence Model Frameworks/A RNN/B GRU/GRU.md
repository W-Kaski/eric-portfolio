# GRU (Gated Recurrent Unit)

**Parent**：[[RNN|循环神经网络 (Recurrent Neural Network, RNN)]]

---

# Gated Recurrent Unit (GRU)

## 1. 什么是 GRU？ (Definition)

**GRU** 是 LSTM 的一种变体，它将 LSTM 的复杂结构进行了精简。

- **Simplified Architecture (简化架构)**: GRU 把 LSTM 的 **Forget Gate** 和 **Input Gate** 合并为一个 **Update Gate**。
    
- **No Cell State**: 相比 LSTM 拥有 $h_t$ (Hidden State) 和 $C_t$ (Cell State)，GRU 只有唯一的一个状态 —— **Hidden State ($h_t$)**。
    

---

## 2. GRU 的核心机制 (Core Mechanism)

GRU 主要依靠两个门来调节信息的流动，这两个门决定了哪些信息需要保留，哪些需要丢弃。

### A. Reset Gate (重置门, $r_t$)

决定了**过去的信息**对当前候选状态的影响程度。

- **Formula**: $r_t = \sigma(W_r \cdot [h_{t-1}, x_t])$
    
- **Insight**: 如果 $r_t$ 接近 0，意味着模型会忽略之前的隐藏状态，仿佛刚刚开始处理序列一样。这对于捕捉**短时依赖 (Short-term Dependencies)** 非常有用。
    

### B. Update Gate (更新门, $z_t$)

决定了**有多少旧信息**要被保留到当前时刻，以及**有多少新信息**要被加入。

- **Formula**: $z_t = \sigma(W_z \cdot [h_{t-1}, x_t])$
    
- **Insight**: 它相当于 LSTM 中遗忘门和输入门的结合体。它在“保留旧记忆”和“接受新知识”之间做 **Trade-off (权衡)**。
    

### C. Candidate Hidden State (候选隐藏状态, $\tilde{h}_t$)

这是当前时刻潜在的“新记忆”。

- **Formula**: $\tilde{h}_t = \tanh(W \cdot [r_t * h_{t-1}, x_t])$
    
- **Note**: 这里使用了重置门 $r_t$。如果重置门为 0，那么之前的记忆将无法进入候选状态。
    

### D. Final Hidden State (最终隐藏状态, $h_t$)

这是 GRU 的输出。

- **Formula**: $h_t = (1 - z_t) * h_{t-1} + z_t * \tilde{h}_t$
    
- **Insight**: 这是一个 **Linear Interpolation (线性插值)** 过程。$z_t$ 控制了新旧信息的比例。
    

---

## 3. GRU vs. LSTM 深度对比表

|**特性 (Feature)**|**LSTM**|**GRU**|
|---|---|---|
|**门数 (Number of Gates)**|3 个 (Forget, Input, Output)|**2 个 (Reset, Update)**|
|**内部状态 (Internal States)**|2 个 ($h_t$ 和 $C_t$)|**1 个 ($h_t$)**|
|**参数量 (Parameters)**|较多|**较少 (约少 1/3)**|
|**计算速度 (Computation Speed)**|较慢|**较快**|
|**收敛速度 (Convergence)**|相对稳定但慢|**在小数据集上收敛更快**|
|**性能 (Performance)**|在超长序列上可能略优|**两者通常不分伯仲**|

---

## 4. 核心术语总结 (Key Terminology)

- **Gating Mechanism (门控机制)**: 使用 Sigmoid 函数控制信息通过量的机制。
    
- **Vanishing Gradient**: 梯度消失。和 LSTM 一样，GRU 通过这种结构有效缓解了长序列中的梯度消失。
    
- **Computational Overhead (计算开销)**: 相比 LSTM，GRU 的开销更小。
    
- **Temporal Patterns (时间模式)**: GRU 擅长从时间序列中提取动态模式。
    
- **Information Bottleneck (信息瓶颈)**: GRU 强制将所有信息压缩在隐藏状态中，这是一种有效的信息筛选。
    

---

## 5. 教授的工程建议 (Professor's Best Practices)

1. **Which one to choose?**:
    
    - 如果你的数据集较小，或者计算资源有限，**优先选 GRU**，因为它参数更少，更不容易过拟合。
        
    - 如果你处理的是极度复杂的长文本任务，或者有充足的算力，可以尝试 **LSTM**。
        
2. **Implementation**: 在 PyTorch 中使用 `nn.GRU` 时，要注意它的输入形状通常是 `(seq_len, batch, input_size)`。
    
3. **Hidden Size**: 调整隐藏层维度（Hidden Size）是提升 GRU 表现最直接的方法。