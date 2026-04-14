---
mindmap-plugin: basic
---

# Diffusion Models Knowledge Outline (扩散模型知识大纲)

## 1. Fundamental Concepts (基本概念)

- Physics Inspiration (物理灵感)
    
    - Non-Equilibrium Thermodynamics (非平衡热力学): Modeling the diffusion of ink into water until it becomes uniform distribution
        
    - Reversibility (可逆性): If we can model the microscopic rules of diffusion, we can reverse time to reconstruct the ink drop from colored water
        
- Two Processes (两个过程)
    
    - Forward Process / Diffusion Process (前向过程/扩散过程): Gradually adding Gaussian noise to data until it becomes pure noise
        
    - Reverse Process / Denoising Process (逆向过程/去噪过程): Learning a neural network to predict and remove noise step-by-step to generate data
        

## 2. Mathematical Formulation (数学公式化)

- The Forward Pass (前向传递)
    
    - Markov Chain (马尔可夫链): The state at time t depends only on the state at time t-1
        
    - Noise Schedule (噪声调度): Pre-defined variance schedule beta_t controlling how much noise is added at each step
        
    - Reparameterization Trick (重参数化技巧): Sampling x_t directly from x_0 without iterating t steps: x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * epsilon
        
- The Reverse Pass (逆向传递)
    
    - Objective (目标): Predicting the noise epsilon added at time t (Denoising Score Matching)
        
    - Loss Function (损失函数): Simple Mean Squared Error (MSE) between the actual noise and the predicted noise
        
    - Neural Network (神经网络): Usually a U-Net trained to approximate the mean of the posterior distribution
        

## 3. Key Model Architectures (关键模型架构)

- DDPM / Denoising Diffusion Probabilistic Models (去噪扩散概率模型)
    
    - The Baseline (基线): The foundational paper establishing the modern diffusion framework
        
    - Sampling Speed (采样速度): Very slow, requiring hundreds or thousands of steps (e.g., 1000 steps) to generate one image
        
- LDM / Latent Diffusion Models (潜在扩散模型)
    
    - Perceptual Compression (感知压缩): Using a VAE (Variational Autoencoder) to compress images into a low-dimensional Latent Space
        
    - Efficiency (效率): Performing diffusion in the smaller latent space instead of high-dimensional pixel space (standard in Stable Diffusion)
        
    - Cross-Attention (交叉注意力): Injecting text prompts or other conditions into the U-Net via attention layers
        
- Score-Based Generative Models (基于分数的生成模型)
    
    - SDE / Stochastic Differential Equations (随机微分方程): Generalizing diffusion to continuous time steps
        
    - Gradient of Log-Density (对数密度梯度): The model learns the "score function" (direction pointing towards high data density)
        

## 4. Sampling & Acceleration (采样与加速)

- DDIM / Denoising Diffusion Implicit Models (去噪扩散隐式模型)
    
    - Deterministic Sampling (确定性采样): Making the reverse process non-Markovian to jump steps
        
    - Acceleration (加速): Can generate high-quality images in 50 steps instead of 1000
        
- Classifier-Free Guidance / CFG (无分类器引导)
    
    - Problem (问题): Standard models might ignore the text prompt to satisfy image realism
        
    - Solution (方案): Computing two noise predictions (one with prompt, one empty/unconditional) and extrapolating between them
        
    - Effect (效果): Higher CFG scale forces the image to follow the prompt more closely but may reduce image diversity or quality (burn effects)
        
- Flow Matching (流匹配)
    
    - New Paradigm (新范式): Modeling the vector field that transforms noise distribution to data distribution along a straight path
        
    - Use Case (用例): Used in Stable Diffusion 3, offering better performance and simpler training than standard diffusion
        

## 5. Network Backbone (网络骨干)

- U-Net (U-Net架构)
    
    - Structure (结构): Encoder-Decoder with skip connections, preserving spatial information
        
    - ResNet Blocks (残差块): Processing features at different resolutions
        
    - Time Embeddings (时间嵌入): Telling the network which timestep t it is currently denoising (e.g., t=900 is very noisy, t=10 is clean)
        
- DiT / Diffusion Transformer (扩散Transformer)
    
    - Innovation (创新): Replacing the U-Net backbone with a standard Transformer architecture
        
    - Scalability (可扩展性): Scales better with compute and data (used in Sora and Stable Diffusion 3)
        
    - Patchification (分块): Treating latent patches as tokens similar to ViT
        

## 6. Controllability & Adaptation (可控性与适配)

- ControlNet (控制网)
    
    - Mechanism (机制): Locking the weights of a pre-trained diffusion model and creating a trainable copy
        
    - Input (输入): Accepting additional spatial conditions like Canny edges, Depth maps, or Pose skeletons
        
    - Result (结果): Generating images that strictly follow the spatial layout of the control image
        
- LoRA / Low-Rank Adaptation (低秩适配)
    
    - Fine-Tuning (微调): Training small rank-decomposition matrices to inject specific styles, characters, or objects into the model
        
    - Portability (便携性): Tiny file size (MBs) compared to the full model (GBs)
        
- IP-Adapter (图像提示适配器)
    
    - Image Prompting (图像提示): Using an image (reference) as a prompt instead of or alongside text to control style and content