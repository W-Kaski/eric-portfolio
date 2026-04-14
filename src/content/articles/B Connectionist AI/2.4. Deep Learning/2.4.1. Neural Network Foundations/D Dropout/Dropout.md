# Dropout

**Parent**：[[Neural Network Foundations|2.4.1. 神经网络基础 (Neural Network Foundations)]]

---

# Dropout (随机失活)

## 1. 什么是 Dropout？ (Definition)

**Dropout** 是由 Geoffrey Hinton 等人在 2012 年提出的一种 **Regularization（正则化）** 技术。其核心思想是在训练过程中，按照一定的概率 $p$ 暂时将网络中的某些神经元从网络中丢弃（其输出设为 0）。

- **Training Phase（训练阶段）**: 对于每一个 **Iteration（迭代）**，系统会随机选择一部分神经元让它们“罢工”。这迫使网络不能过度依赖某几个特定的神经元。
    
- **Testing/Inference Phase（测试/推理阶段）**: 所有的神经元都是“激活”状态，不进行随机丢弃。
    

---

## 2. 为什么 Dropout 有效？ (Intuition & Motivation)

### A. Preventing Co-adaptation (防止协同适应)

在普通网络中，某些神经元可能会演变成专门修正其他神经元错误的“补丁”。通过 Dropout，每个神经元都必须学会独立提取有用的特征，因为它的“搭档”随时可能不在场。

### B. Ensemble Learning (集成学习)

你可以把 Dropout 看作是在训练无数个精简版的子网络。在测试时，我们使用完整的网络，这在数学上相当于对这些所有可能的子网络进行了一种 **Averaging（平均）**，从而显著提高了模型的 **Generalization（泛化能力）**。

---

## 3. 数学实现 (Mathematical Implementation)

在训练阶段，假设一个层的输出向量是 $h$，我们应用一个二进制掩码（Mask）向量 $m$：

$$h_{dropout} = h \odot m$$

其中 $m$ 向量中的元素以概率 $1-p$ 为 1（保持），以概率 $p$ 为 0（丢弃）。

### 重要细节：Inverted Dropout (反向随机失活)

由于在训练时我们丢弃了部分神经元，输出的 **Expected Value（期望值）** 会变小。为了保证在测试阶段（不丢弃神经元时）输出的量级一致，现代框架（如 PyTorch/TensorFlow）通常使用 **Inverted Dropout**：

- **训练时**：将存活的神经元输出除以 $(1-p)$ 进行缩放。
    
- **测试时**：保持原样，无需额外操作。
    

---

## 4. Dropout 的常用词汇对比 (Terminology)

|**英文术语 (English Term)**|**中文释义**|**在 Dropout 中的含义**|
|---|---|---|
|**Overfitting**|过拟合|模型在训练集表现好，测试集表现差。Dropout 的天敌。|
|**Generalization**|泛化能力|模型处理未见过数据的能力。Dropout 的终极目标。|
|**Dropout Rate ($p$)**|丢弃率|神经元被设为 0 的概率。通常设为 0.2 到 0.5。|
|**Bernoulli Distribution**|伯努利分布|决定神经元是否失活的随机过程。|
|**Inference**|推理|模型在测试/生产环境运行的过程，此时不使用 Dropout。|
|**Robustness**|鲁棒性/健壮性|通过 Dropout 训练出来的模型通常具有更强的鲁棒性。|

---

## 5. 教授的工程指南 (Professor's Best Practices)

1. **Placement（放置位置）**:
    
    - 通常放在 **Fully Connected Layers（全连接层/MLP）** 之后。
        
    - 在 **Convolutional Layers（卷积层）** 中较少使用 Dropout（因为卷积层参数较少且特征具有空间相关性），但在 CNN 的最后几层全连接层中使用非常有效。
        
2. **Probability Setting（概率设置）**:
    
    - 输入层（Input Layer）的丢弃率通常设置得很低（如 0.1-0.2），或者不设。
        
    - 隐藏层（Hidden Layers）通常设为 0.5。
        
3. **Training Time（训练时间）**: 注意，使用 Dropout 会使模型收敛变慢，你需要更多的 **Epochs（迭代轮数）** 才能达到最优状态。
    
4. **Model Evaluation（模型评估）**: 在评估模型性能（Validation）时，一定要记得调用 `model.eval()`。这会告诉框架“关闭” Dropout，否则你的测试结果会因为随机性而不准确。
