# 世界模型 (World Models)

**Parent**：[[Modern RL Directions|2.3.5. 现代强化学习方向 (Modern RL Directions)]]

---

# 世界模型 (World Models) 核心笔记

### 1. 核心架构：脑内的“三位一体”

根据经典的 Ha & Schmidhuber 定义，一个完整的世界模型通常由三部分组成：

- **视觉感知 (Vision, V)**：将高维的像素输入压缩成低维的**潜变量 (Latent Vector)**。通常使用 VAE 或 GAN。
    
- **记忆模块 (Memory, M)**：预测未来的演化。它根据现在的状态和动作，预测下一个状态。通常使用 RNN 或 Transformer。
    
- **决策控制器 (Controller, C)**：在“梦境”里学习怎么做动作。因为它面对的是精简后的潜变量，所以学习效率极高。
    

### 2. 为什么要让 AI “做梦”？

- **样本效率 (Sample Efficiency)**：现实中动一下可能要 1 秒，但在脑子里“梦”一下只需要几个毫秒。
    
- **安全性**：在脑子里撞车不花钱。
    
- **长程规划**：因为是在压缩后的空间里模拟，AI 可以看清更遥远的未来。
    

---

### 📊 世界模型 vs. 传统强化学习

|**维度**|**Model-Free RL (PPO/SAC)**|**World Models (Dreamer/MuZero)**|
|---|---|---|
|**学习方式**|必须在真实/模拟环境中交互。|在学习到的“环境模型”中进行想象训练。|
|**数据需求**|极大（通常需要数千万步）。|较小（通过“做梦”压榨数据价值）。|
|**对环境的要求**|不需要知道环境规律。|**试图学习环境的动力学方程 $P(s' \\| s, a$**。|
|**计算开销**|采样开销大，训练开销中等。|采样开销小，但模型建模本身非常吃算力。|

---

# 📚 世界模型经典与前沿论文 (2018 - 2026)

作为身处 2026 年的学习者，你的视野应该从早期的 RNN 转向现在的 **生成式视频模型 (Video Generation)** 和 **大规模 Transformer 世界模型**。

### 1. 奠基之作 (Foundations)

- **World Models** (Ha & Schmidhuber, NeurIPS 2018)
    
    - _必读理由_：该领域的命名之作。首次证明了在 VAE+RNN 的“梦境”里练出来的策略可以迁移到物理环境。
        
- **Dreamer 系列 (V1, V2, V3)** (Hafner et al., 2019-2023)
    
    - _必读理由_：Model-Based RL 的巅峰之作。**DreamerV3** 是第一个能用固定超参数在不同领域（Atari, Minecraft）都达到 SOTA 的算法。
        
- **MuZero** (Schrittwieser et al., Nature 2020)
    
    - _必读理由_：DeepMind 的神作。它不预测像素，只预测对决策有用的“价值等价”状态，解决了复杂环境难以建模的问题。
        

### 2. 前沿巅峰 (2022 - 2024)

- **IRIS: Transformers are Sample Efficient World Models** (Micheli et al., ICLR 2023)
    
    - **核心**：用 Transformer 替换了 Dreamer 里的 RNN，证明了在脑子里“长程推理”时，Transformer 的表现更接近人类。
        
- **TD-MPC 系列** (Hansen et al., 2022-2024)
    
    - **核心**：将模型预测与模型自由（Model-Free）的 Q 学习结合，在连续控制任务（机器人）上表现极强。
        

### 3. 2025 - 2026 最新风向

- **"Video as a World Model: Scaling Generative Video Models for RL"** (2025)
    
    - **背景**：随着 Sora 等视频生成技术的成熟，研究者开始直接将高保真视频生成模型作为世界模型。
        
    - **核心**：AI 不再是在抽象的向量里做梦，而是在极其真实的**视频流**里进行推演。
        
- **"DreamerV4: Foundation World Models"** (2026 预期/最新成果)
    
    - **核心**：引入了 **Scaling Laws**。通过在数万个不同的环境数据上进行预训练，得到了一个具有“物理常识”的通用世界模型。
        
- **"Diffusion-based World Models for Real-world Robotics"** (2025/2026)
    
    - **核心**：利用扩散模型（Diffusion）来建模环境的不确定性，解决了复杂物理交互中“概率坍缩”的问题。

