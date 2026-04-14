
parent:[[Neural Network Foundations]]
# Learning Rate Scheduling (学习率调度)

## 1. 为什么需要调度？ (Motivation)

在训练初期和后期，我们对步长（Step Size）的需求是完全不同的：

- **Early Stages (训练初期)**: 权重是随机初始化的，离最优解很远。我们需要一个 **Large Learning Rate** 来快速跨越损失平面，加速收敛。
    
- **Late Stages (训练后期)**: 模型已经接近最优解（Minimum）。如果步子依然很大，模型会在最小值附近来回 **Oscillate (震荡)** 甚至 **Overshoot (越过)** 最优解，导致无法进入最深的山谷。
    

---

## 2. 常见的调度策略 (Popular Scheduling Strategies)

### A. Step Decay (阶梯式下降)

每隔固定的 **Epochs**，将学习率乘以一个系数（如 0.1）。

- **Logic**: 训练一段时间后，步子迈小一点。
    
- **PyTorch**: `StepLR`
    
- **Visual**: 学习率曲线像楼梯一样下降。
    

### B. Exponential Decay (指数衰减)

学习率按指数级持续下降。

- **Formula**: $\eta_t = \eta_0 \cdot \gamma^t$
    
- **PyTorch**: `ExponentialLR`
    
- **Feature**: 下降更加平滑，没有阶梯式的突变。
    

### C. Cosine Annealing (余弦退火)

这是目前最流行、效果往往也最好的策略之一。

- **Concept**: 学习率按照余弦函数的曲线下降。
    
- **Advantage**: 下降过程非常优雅，先慢后快再慢，能够很好地配合模型进入最优区域。
    
- **PyTorch**: `CosineAnnealingLR`
    

### D. Reduce LR on Plateau (平台减速)

这是一种“监控式”调度。

- **Logic**: 监控 **Validation Loss**。如果损失在若干个 Epoch 内没有下降（即进入了 **Plateau/平台期**），则自动降低学习率。
    
- **Keyword**: **Patience (耐心)**。比如设置耐心为 5，即 Loss 连续 5 次不降就调小 LR。
    

---

## 3. Warm-up (学习率预热) 🚀

这是一个非常关键的技巧，尤其在训练 **Transformer** 或超大规模模型时。

- **How it works**: 在训练的前几个 Batch 或 Epochs，不使用大步长，而是从 0 开始缓慢增加到设定的初始学习率。
    
- **Why**: 刚开始训练时梯度非常不稳定。直接给一个大的学习率可能会让模型瞬间“跑偏”或发生梯度爆炸。**Warm-up** 给模型一个缓冲期来稳定参数。
    

---

## 4. 核心术语总结 (Key Terminology)

|**英文术语 (English Term)**|**中文释义**|**说明**|
|---|---|---|
|**Learning Rate ($\eta$)**|学习率|更新权重的步长。|
|**Decay Rate ($\gamma$)**|衰减率|每次调整时缩小的比例。|
|**Epoch**|轮次|遍历一次完整训练集的过程。|
|**Oscillation**|震荡|学习率过大时，Loss 在最小值附近跳跃。|
|**Plateau**|平台期|Loss 停止下降，进入平坦区域。|
|**Annealing**|退火|模拟金属退火过程，逐渐降低系统的能量（步长）。|
|**Scheduler**|调度器|自动执行学习率调整计划的组件。|

---

## 5. 教授的工程指南 (Professor's Best Practices)

1. **Default Recommendation**: 如果你没有特殊需求，**Cosine Annealing with Warm-up** 是目前工业界和学术界的通用标配。
    
2. **Monitor is Key**: 永远不要盲目相信 Scheduler。一定要观察你的 **Training Curve**。如果发现 Loss 突然不降了或者开始剧烈抖动，说明你的学习率策略需要调整。
    
3. **Combine with Optimizer**: 在代码实现中，Scheduler 必须绑定在一个 Optimizer 上。
    
    - _Step_: `optimizer.step()` 更新参数。
        
    - _Step_: `scheduler.step()` 更新步长。