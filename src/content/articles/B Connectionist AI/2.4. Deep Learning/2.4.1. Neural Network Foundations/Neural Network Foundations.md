# 2.4.1. 神经网络基础 (Neural Network Foundations)

**Parent**：[[Deep Learning|2.4. 深度学习 (Deep Learning, DL)]]

**Children**：
- [[A MLP/MLP|A. 多层感知机 (MLP)]]
- [[B Activation Functions/Activation Functions|B. 激活函数 (Activation Functions)]]
- [[C Batch Normalization/Batch Normalization|C. 批归一化 (Batch Normalization)]]
- [[D Dropout/Dropout|D. Dropout]]
- [[E Initialization Methods/Initialization Methods|E. 参数初始化 (Initialization Methods)]]

---

神经网络的学习可以概括为：**在特定的架构上（Architecture），通过动力系统（Optimization）的驱动，寻找最小化目标（Loss）的路径，并利用调优工具（Tuning & Regularization）确保模型既能跑得快，又能跑得稳。**

## 1. 核心组件对比表 (Structural Components)

这组组件决定了神经网络的“形状”和“表达能力”。

|**组件 (Component)**|**常用技术 (Common Tech)**|**核心作用 (Role)**|**英文关键词 (Key Terms)**|
|---|---|---|---|
|**基本单元**|**MLP / Fully Connected**|提取特征的数学载体|Layers, Weights, Biases|
|**激活函数**|**ReLU**, Sigmoid, Tanh|引入**非线性**，让网络能拟合复杂函数|Non-linearity, Saturation|
|**参数初始化**|**He / Xavier Init**|打破对称性，确保信号在深层传递|Symmetry Breaking, Variance|
|**归一化**|**Batch Normalization**|稳定数据分布，加速收敛，缓解梯度消失|Internal Covariate Shift|

---

## 2. 训练与动力系统对比表 (Training & Dynamics)

这组组件决定了模型如何“进化”。

|**组件 (Component)**|**常用技术 (Common Tech)**|**核心作用 (Role)**|**英文关键词 (Key Terms)**|
|---|---|---|---|
|**损失函数**|**Cross-Entropy**, MSE|衡量预测值与真实值的差距（评分标准）|Objective, Ground Truth|
|**求导引擎**|**Backpropagation / Autograd**|利用链式法则计算每个参数的梯度|Chain Rule, Computational Graph|
|**优化器**|**Adam**, SGD, Momentum|根据梯度更新参数的“策略”|Optimizer, Convergence, Step|
|**学习率调度**|**Cosine Annealing**, Warm-up|动态调整步长，确保平滑进入最优解|LR Scheduling, Decay, Oscillation|

---

## 3. 泛化与约束对比表 (Regularization & Generalization)

这组组件确保模型不“死记硬背”，具备处理新数据的能力。

|**组件 (Component)**|**常用技术 (Common Tech)**|**核心作用 (Role)**|**英文关键词 (Key Terms)**|
|---|---|---|---|
|**随机失活**|**Dropout**|随机让神经元休息，防止过度的协同适应|Co-adaptation, Ensemble|
|**权重衰减**|**L2 Regularization**|惩罚过大的权重，让模型更平滑简单|Penalty, Weight Decay, Sparsity|
|**训练控制**|**Early Stopping**|在过拟合发生前及时止损|Validation Loss, Overfitting|


---

## 4. 教授总结：基础模块的“协同效应” (The Synergy)

在实际工程中，这些零件是这样配合的：

1. **Start**: 使用 **He Initialization** 初始化一个带有 **ReLU** 激活的 **MLP**。
    
2. **Forward**: 数据通过 **Batch Normalization** 变得稳定，通过 **Dropout** 增强韧性。
    
3. **Loss**: 计算 **Cross-Entropy**，看预测得有多准。
    
4. **Backward**: **Autograd** 引擎顺着计算图把梯度传回每一个参数。
    
5. **Update**: **Adam** 优化器根据梯度更新权重，而 **LR Scheduler** 确保更新的节奏刚刚好。
    
6. **Loop**: 重复数次，直到模型在测试集上表现优异。



|**架构名称 (Architecture)**|**缩写**|**核心机制 (Core Mechanism)**|**擅长的数据类型 (Best for...)**|**核心优势 (Key Advantage)**|
|---|---|---|---|---|
|**Feedforward**|**FNN/MLP**|**Dense Connections** (全连接)|Tabular Data (结构化表格)|简单、通用，是所有网络的基础|
|**Recurrent**|**RNN/LSTM**|**Hidden State** (隐藏状态循环)|Sequential Data (时间序列)|具有“记忆”，适合处理变长序列|
|**Convolutional**|**CNN**|**Convolution** (局部卷积)|Spatial Data (图像、医学影像)|**Feature Extraction** (自动特征提取)|
|**Transformer**|**Attention**|**Self-Attention** (自注意力)|Text, Multi-modal (长文本、多模态)|**Parallel Computing** (并行计算能力极强)|
|**Graph**|**GNN**|**Message Passing** (消息传递)|Non-Euclidean Data (社交、知识图谱)|能够处理复杂的节点拓扑关系|
|**Generative**|**GAN**|**Adversarial Loss** (对抗损失)|Data Synthesis (生成图片、音视频)|能创造出训练集中不存在的新数据|
