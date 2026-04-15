---
title: "Loss Functions"
date: "2025-05-17"
---

parent:[[Neural Network Foundations]]

# Loss Functions (损失函数)

## 1. 基本概念 (Basic Concepts)

- **Loss Function (损失函数)**: 通常指单个样本（Single Instance）的预测误差。
    
- **Cost Function (代价函数)**: 通常指整个训练集（Total Dataset）上所有样本损失的平均值。
    
- **Objective Function (目标函数)**: 最广泛的概念，指训练过程中需要优化的任何函数（可能包含 Loss 和 Regularization 项）。
    
- **Ground Truth ($y$)**: 真实标签或真实值。
    
- **Prediction ($\hat{y}$)**: 模型输出的预测值。
    

---

## 2. 回归任务的损失函数 (Loss Functions for Regression)

回归任务的目标是预测连续的数值（如房价、股票价格）。

### A. Mean Squared Error (MSE / L2 Loss)

最常用的回归损失函数。

- **Formula**: $L = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$
    
- **Features**: 对较大的误差（Outliers）非常敏感，因为平方会放大这些误差。
    
- **Pros**: 数学性质好，处处可导，收敛平滑。
    
- **Cons**: 如果数据中有很多 **Outliers（异常值）**，模型会被这些异常值带偏。
    

### B. Mean Absolute Error (MAE / L1 Loss)

- **Formula**: $L = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$
    
- **Features**: 误差与损失是线性关系。
    
- **Pros**: 对 **Outliers** 具有更强的 **Robustness（鲁棒性）**。
    
- **Cons**: 在 0 点处不可导，且在误差很小时梯度依然很大，不容易达到极细微的最优解。
    

### C. Huber Loss

它是 MSE 和 MAE 的结合体，通过一个超参数 $\delta$ 进行切换。

- **Insight**: 当误差小时使用 MSE（平滑收敛），当误差大时使用 MAE（对异常值不敏感）。
    

---

## 3. 分类任务的损失函数 (Loss Functions for Classification)

分类任务的目标是预测类别概率。

### A. Binary Cross-Entropy (BCE / Log Loss)

用于 **Binary Classification（二分类）**。

- **Formula**: $L = -[y \log(\hat{y}) + (1-y) \log(1-\hat{y})]$
    
- **Insight**: 如果 $y=1$ 且 $\hat{y}$ 接近 0，损失会趋向于正无穷。它严厉惩罚错误的自信。
    

### B. Categorical Cross-Entropy (CCE)

用于 **Multi-class Classification（多分类）**。通常与 **Softmax** 激活函数配合使用。

- **Formula**: $L = -\sum_{i=1}^{C} y_i \log(\hat{y}_i)$（其中 $C$ 为类别总数）。
    
- **Note**: 在实际编程中（如 PyTorch 的 `nn.CrossEntropyLoss`），通常会将 Softmax 和 Cross-Entropy 结合在一起计算以提高 **Numerical Stability（数值稳定性）**。
    

---

## 4. 损失函数对比表 (Comparison Table)

|**损失函数 (English Name)**|**任务类型 (Task)**|**对异常值敏感度 (Outlier Sensitivity)**|**常用输出层激活函数 (Activation)**|
|---|---|---|---|
|**MSE (Mean Squared Error)**|**Regression**|High (敏感)|None / Linear|
|**MAE (Mean Absolute Error)**|**Regression**|Low (鲁棒)|None / Linear|
|**BCE (Binary Cross-Entropy)**|**Binary Class**|Medium|**Sigmoid**|
|**CCE (Categorical Cross-Entropy)**|**Multi-class**|Medium|**Softmax**|
|**Hinge Loss**|**SVM / Classification**|Low|None / Tanh|

---

## 5. 核心术语总结 (Key Terminology)

- **Convergence (收敛)**: 模型找到使损失函数最小化的参数过程。
    
- **Differentiable (可微/可导)**: 损失函数必须是可微的，否则无法进行 **Backpropagation**。
    
- **Vanishing Gradient (梯度消失)**: 如果损失函数或激活函数在某些区域太“平”，梯度会变得极小，导致训练停滞。
    
- **One-hot Encoding**: 在分类任务中，真实标签 $y$ 通常被编码为 $[0, 0, 1, 0]$ 这样的向量。
    
- **Logits**: 指进入 Softmax 之前的原始神经元输出值。
    
- **Entropy (熵)**: 衡量信息的不确定性，交叉熵衡量的是预测分布与真实分布的差异。
    

---

## 6. 教授的工程建议 (Professor's Best Practices)

1. **Don't reinvent the wheel**: 绝大多数时候，回归选 **MSE**，分类选 **Cross-Entropy**。
    
2. **Smooth vs. Robust**: 如果你的数据非常干净，选 MSE ；如果数据中有很多脏数据或极端噪声，考虑 **MAE** 或 **Huber Loss**。
    
3. **Class Imbalance (类别不平衡)**: 如果某个类别样本极少，普通的 Cross-Entropy 效果可能不好。此时可以考虑 **Weighted Cross-Entropy** 或 **Focal Loss**。