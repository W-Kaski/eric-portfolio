# 批归一化 (Batch Normalization)

**Parent**：[[Neural Network Foundations|2.4.1. 神经网络基础 (Neural Network Foundations)]]

---

# Batch Normalization (BN)

## 1. 为什么需要 BN？ (Motivation)

在深度网络中，每一层的参数更新都会导致下一层输入的分布发生变化。随着网络层数的增加，这种分布的微小变化会被层层放大。

- **Internal Covariate Shift (内部协变量偏移)**: 这是一个核心概念，指网络内部参数变化导致层与层之间输入分布不稳定的现象。
    
- **Training Difficulty**: 分布的不稳定迫使网络使用极小的 **Learning Rate (学习率)**，并且对 **Weight Initialization (权重初始化)** 非常敏感，导致训练极其缓慢。
    

---

## 2. BN 的数学原理 (Mathematical Mechanism)

BN 的核心思想是：对每一层神经元的输出（在进入激活函数之前）进行 **Normalization (归一化)**，使其均值为 0，方差为 1。

假设一个 **Mini-batch (小批量)** 的输入为 $\mathcal{B} = \{x_1, ..., x_m\}$，BN 包含以下四个步骤：

1. **Batch Mean (均值)**: $\mu_{\mathcal{B}} = \frac{1}{m} \sum_{i=1}^{m} x_i$
    
2. **Batch Variance (方差)**: $\sigma_{\mathcal{B}}^2 = \frac{1}{m} \sum_{i=1}^{m} (x_i - \mu_{\mathcal{B}})^2$
    
3. **Normalize (归一化)**: $\hat{x}_i = \frac{x_i - \mu_{\mathcal{B}}}{\sqrt{\sigma_{\mathcal{B}}^2 + \epsilon}}$
    
    - _Note: $\epsilon$ (Epsilon) 是一个极小的常数，用于保证 **Numerical Stability (数值稳定性)**，防止除以 0。_
        
4. **Scale and Shift (缩放与偏移)**: $y_i = \gamma \hat{x}_i + \beta$
    
    - **$\gamma$ (Gamma)** 和 **$\beta$ (Beta)** 是 **Learnable Parameters (可学习参数)**。
        
    - **Why?** 如果只做归一化，可能会破坏层已经学到的特征表达能力。引入这两个参数可以让模型自主决定是否要恢复原来的分布。
        

---

## 3. BN 的放置位置 (Placement)

在经典的 MLP 或 CNN 结构中，BN 通常放置在 **Linear Layer (全连接层)** 或 **Convolutional Layer (卷积层)** 之后，但在 **Activation Function (激活函数)** 之前。

**结构顺序：**

`Linear/Conv Layer` $\rightarrow$ `Batch Norm` $\rightarrow$ `Activation (e.g., ReLU)`

---

## 4. BN 的巨大优势 (Key Benefits)

- **Accelerate Convergence (加速收敛)**: 允许使用更大的 **Learning Rate**，从而大幅缩短训练时间。
    
- **Reduce Sensitivity to Initialization (降低对初始化的敏感度)**: 你不再需要极其精细地调整权重初始值。
    
- **Mitigate Gradient Vanishing (缓解梯度消失)**: 通过将输入拉回到激活函数（如 Sigmoid 或 Tanh）的非饱和区，确保梯度能够正常流过。
    
- **Regularization Effect (正则化效果)**: 因为 BN 使用了 Mini-batch 的均值和方差，引入了一些微小的噪声，这在某种程度上起到了类似 **Dropout** 的效果，可以减少 **Overfitting (过拟合)**。
    

---

## 5. 训练 vs. 推理 (Training vs. Inference)

这是一个重要的工程细节：

- **During Training (训练期间)**: 使用当前 Mini-batch 的均值和方差。
    
- **During Inference/Testing (推理/测试期间)**: 我们通常没有“批次”的概念（可能只有一个输入）。此时，我们使用训练阶段记录的 **Running Average (移动平均值)** 或 **Exponential Moving Average (EMA, 指数移动平均)** 得到的全局均值和方差。
    

---

## 6. 核心术语对比表 (Terminology Summary)

|**英文术语 (English Term)**|**中文释义**|**在 BN 中的作用**|
|---|---|---|
|**Internal Covariate Shift**|内部协变量偏移|BN 试图解决的根本问题|
|**Mini-batch**|小批量|计算均值和方差的基础单位|
|**Learnable Parameters**|可学习参数|即 $\gamma$ 和 $\beta$，增强模型的灵活性|
|**Numerical Stability**|数值稳定性|通过 $\epsilon$ 防止数学计算出错|
|**Running Mean/Variance**|运行时均值/方差|用于推理阶段的全局统计量|
|**Standardization**|标准化|将数据处理为均值 0 方差 1 的过程|

---

### 教授的深度思考 (Professor's Insights)

虽然 BN 非常强大，但它也有局限性：

1. **Batch Size Dependence**: 如果你的 **Batch Size** 设置得非常小（比如 1 或 2），BN 的效果会很差，因为小样本的均值和方差不能代表整体。
    
2. **RNN Challenges**: BN 在处理序列数据（如 RNN）时比较复杂。在这些场景下，人们通常会使用 **Layer Normalization (LN, 层归一化)**。