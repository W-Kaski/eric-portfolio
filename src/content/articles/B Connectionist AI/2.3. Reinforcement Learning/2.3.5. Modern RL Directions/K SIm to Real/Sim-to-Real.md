parent:[[Modern RL Directions]]


# 仿真到现实 (Sim-to-Real) 核心笔记

### 1. 核心障碍：现实鸿沟 (The Reality Gap)

为什么在模拟器里跑得完美的模型，到了真机上就废了？

- **物理建模误差**：模拟器很难精准模拟接触力（Contact Physics）、流体阻力、电机的非线性摩擦以及电池电压波动。
    
- **视觉渲染偏差**：模拟器的光影、纹理和真实的摄像头画面存在巨大的像素级差异。
    
- **硬件延迟 (Latency)**：模拟器里的指令是瞬时的，现实中从信号发出到电机转动有几十毫秒的延迟。
    

---

### 2. 三大核心技术流派

目前解决“落地难”主要靠以下三招：

|**技术手段**|**核心思想**|**形象比喻**|
|---|---|---|
|**域随机化 (Domain Randomization, DR)**|在模拟器里把摩擦力、重力、光照、质量全部乱调。|**“抗挫折教育”**：让孩子在暴雨、大雪、狂风中都练过，到了现实晴天就觉得太简单了。|
|**系统辨识 (System Identification, SysID)**|利用真实数据去反推模拟器里的物理参数。|**“量体裁衣”**：精准测量现实的数据，把模拟器调得跟现实一模一样。|
|**残差学习 (Residual Learning)**|传统的经典控制（PID）负责底薪，RL 负责拿提成。|**“老带新”**：传统的稳定算法负责不摔倒，RL 负责微调那些难以建模的灵活动作。|

---

### 3. 2026 年的范式转移：生成式世界模型

在 2026 年，我们不再仅仅依赖手动调节物理参数。最新的趋势是利用 **生成式 AI (Generative AI)**：

- **神经渲染 (Neural Rendering)**：利用 NeRF 或 3D Gaussian Splatting 将真实的物理场景完美还原到仿真中。
    
- **扩散模型模拟 (Diffusion-based Simulation)**：直接用生成式视频模型来替代传统的物理引擎。
    

---

# 📚 Sim-to-Real 经典与前沿论文 (2017 - 2026)

### 1. 奠基之作 (Foundations)

- **Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World** (Tobin et al., 2017)
    
    - _必读理由_：域随机化的开山之作，证明了“乱搞”物理参数能增强鲁棒性。
        
- **Learning Dexterous In-Hand Manipulation (OpenAI Rubik's Cube)** (Andrychowicz et al., 2020)
    
    - _必读理由_：Sim-to-Real 的封神之战。展示了如何通过极大规模的随机化，让机器人手学会解魔方。
        

### 2. 2024 - 2025 工业级突破

- **"DROID: A Large-Scale In-the-Wild Robot Dataset for Generalist Policies"** (2024)
    
    - **核心**：通过大规模真实数据与仿真数据的混合训练，打破了单一场景的局限性。
        
- **"Real-to-Sim-to-Real: Self-Correcting World Models"** (2025)
    
    - **核心**：不再是单向迁移。机器人每天在现实中摔跤的数据会自动传回云端，更新模拟器的参数，实现闭环进化。
        

### 3. 2026 最新前沿

- **"Foundation Models for Generalizable Sim-to-Real"** (2026)
    
    - **核心**：利用在数百万小时物理视频上预训练的**物理大模型 (Physical Foundation Models)**。这些模型具备“物理直觉”，能够直接预测真实世界的动力学响应，无需手动调参。
        
- **"Gaussian Splatting for Zero-shot Visual Sim-to-Real"** (2026)
    
    - **核心**：利用 3D 高斯泼溅技术，只需要手机拍几张照片，就能瞬间生成一个像素级真实的仿真环境，实现零样本迁移。
        

---

### 🧠 教授的深度解读

Sim-to-Real 本质上是一个**泛化 (Generalization)** 问题。

> **教授的洞察**：很多人以为 Sim-to-Real 是要把仿真做得“像”真实。但 2026 年的共识是：**完美的仿真是不存在的。** 我们真正的目标是让策略变得“顿感”——即对环境参数的细微变化不敏感。
> 
> 最强的算法不是那个在 1.0 摩擦力下跑得最快的，而是那个在 0.5 到 2.0 摩擦力下都能跑得差不多的。