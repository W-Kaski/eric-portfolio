# LSTM (Long Short-Term Memory)

**Parent**：[[RNN|循环神经网络 (Recurrent Neural Network, RNN)]]

---

# Long Short-Term Memory (LSTM)

## 1. 为什么要用 LSTM？ (The Motivation)

传统的 RNN 在处理长序列时会遇到 **Vanishing Gradient Problem (梯度消失问题)**。这意味着网络会很快忘记序列开头的信息。

- **Long-term Dependencies (长程依赖)**: LSTM 设计的初衷就是为了记住长距离的信息。
    
- **The "Conveyor Belt" (传送带)**: LSTM 的核心是 **Cell State (细胞状态)**，它像一条传送带，贯穿整个序列，信息可以在上面流传而基本保持不变。
    

---

## 2. LSTM 的核心架构 (Core Architecture)

LSTM 通过三个特殊的“门” (Gates) 来控制信息的流向。每个门都使用 **Sigmoid** 激活函数，输出在 $(0, 1)$ 之间，表示“通过的比例”。

### A. Forget Gate (遗忘门)

决定我们要从之前的细胞状态中丢弃哪些信息。

- **Input**: 上一步的隐藏状态 $h_{t-1}$ 和当前输入 $x_t$。
    
- **Formula**: $f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f)$
    
- **Meaning**: 如果输出接近 0，表示“彻底忘记”；接近 1，表示“完全保留”。
    

### B. Input Gate (输入门)

决定我们要把哪些新信息存入细胞状态中。

1. **Input Gate Layer**: 决定更新哪些值。
    
2. **Candidate Layer**: 使用 **Tanh** 创建一个候选向量 $\tilde{C}_t$。
    

- **Formula**: $i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i)$
    

### C. Cell State Update (细胞状态更新)

这是 LSTM 的灵魂，更新传送带上的信息。

- **Formula**: $C_t = f_t * C_{t-1} + i_t * \tilde{C}_t$
    
- **Insight**: 旧记忆被“遗忘门”过滤，新记忆被“输入门”筛选，两者相加形成新记忆。
    

### D. Output Gate (输出门)

决定我们要输出什么。输出基于细胞状态，但要经过过滤。

- **Formula**: $o_t = \sigma(W_o \cdot [h_{t-1}, x_t] + b_o)$
    
- **Hidden State**: $h_t = o_t * \tanh(C_t)$
    

---

## 3. RNN vs. LSTM 深度对比表

|**特性 (Feature)**|**Simple RNN**|**LSTM**|
|---|---|---|
|**结构复杂度**|简单 (1个 Tanh 层)|复杂 (4个交互层/门)|
|**记忆长度**|短 (容易遗忘)|**Long-term** (长程记忆能力)|
|**梯度问题**|严重的 **Gradient Vanishing**|缓解了梯度消失|
|**计算开销**|低|高 (参数量是 RNN 的 4 倍)|
|**主要用途**|极短序列、简单时序|翻译、语音、复杂文本生成|

---

## 4. 核心术语总结 (Key Terminology)

- **Cell State ($C_t$)**: 细胞状态，保存长期记忆的“传送带”。
    
- **Hidden State ($h_t$)**: 隐藏状态，保存短期记忆和输出。
    
- **Gates**: 门控机制（Forget, Input, Output）。
    
- **Element-wise Multiplication**: 逐元素相乘（用于门控过滤）。
    
- **BPTT (Backpropagation Through Time)**: 随时间反向传播，LSTM 训练时的特殊求导方式。
    
- **Gradient Explosion**: 梯度爆炸。虽然 LSTM 缓解了消失，但如果权重过大，依然可能爆炸（通常用 **Gradient Clipping** 解决）。
    

---

## 5. 教授的工程建议 (Professor's Best Practices)

1. **Initialization**: 遗忘门 (Forget Gate) 的 **Bias ($b_f$)** 初始值通常设为 **1**。这样在训练初期模型倾向于“记住所有”，防止过早丢失信息。
    
2. **GRU (Gated Recurrent Unit)**: 如果你觉得 LSTM 太慢或参数太多，可以试试 **GRU**。它是 LSTM 的简化版，只有两个门，速度更快，效果通常与 LSTM 相当。
    
3. **Overfitting**: LSTM 很容易过拟合，务必配合使用 **Dropout**。注意，在 LSTM 中通常在非循环连接上使用 Dropout。
    
4. **Scaling**: 输入 LSTM 的数据一定要进行 **Normalization / Standardization**，因为 Tanh 和 Sigmoid 对输入数值范围非常敏感。