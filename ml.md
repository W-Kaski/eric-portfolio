### 机器学习与 AI 研究脉络树核心引文节点库
(Comprehensive ML Research Hierarchy Grounded in Papers)

* **I. 经典机器学习 (Classical Machine Learning)**
    * **稀疏与线性模型 (Linear & Sparse Models)**
        * Lasso 回归 ▶ *Regression shrinkage and selection via the lasso* (Tibshirani, 1996)
        * 弹性网络正则化 (Elastic Net) ▶ *Regularization and variable selection via the elastic net* (Zou & Hastie, 2005)
    * **支持向量机与最大间隔 (SVM & Max Margin)**
        * SVM & 核方法 ▶ *Support-vector networks* (Cortes & Vapnik, 1995)
    * **树模型与强集成系统 (Tree Ensembles & Boosting)**
        * Random Forest ▶ *Random Forests* (Breiman, 2001)
        * AdaBoost ▶ *A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting* (Freund & Schapire, 1997)
        * XGBoost ▶ *XGBoost: A Scalable Tree Boosting System* (Chen & Guestrin, 2016)
        * LightGBM ▶ *LightGBM: A Highly Efficient Gradient Boosting Decision Tree* (Ke et al., 2017)
    * **聚类与流形降维 (Clustering & Manifold Learning)**
        * t-SNE 降维 ▶ *Visualizing Data using t-SNE* (van der Maaten & Hinton, 2008)
        * UMAP 降维 ▶ *UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction* (McInnes et al., 2018)
        * 谱聚类 ▶ *A tutorial on spectral clustering* (von Luxburg, 2007)
    * **概率图模型与贝叶斯学习 (Probabilistic & Bayesian)**
        * 隐马尔可夫模型 (HMM) ▶ *A tutorial on hidden Markov models and selected applications in speech recognition* (Rabiner, 1989)
        * 隐狄利克雷分配 (LDA) ▶ *Latent Dirichlet Allocation* (Blei et al., 2003)
        * 高斯过程 ▶ *Gaussian Processes for Machine Learning* (Rasmussen & Williams, 2006)
    * **统计理论与泛化 (Statistical Learning Theory)**
        * VC 维与泛化界 ▶ *The Nature of Statistical Learning Theory* (Vapnik, 1995)

* **II. 深度学习与神经架构 (Deep Learning Architectures)**
    * **前馈网络与基础组件 (Foundations)**
        * 反向传播基础 ▶ *Learning representations by back-propagating errors* (Rumelhart et al., 1986)
        * ReLU 激活 ▶ *Rectified linear units improve restricted boltzmann machines* (Nair & Hinton, 2010)
        * Batch Normalization ▶ *Batch Normalization: Accelerating Deep Network Training* (Ioffe & Szegedy, 2015)
        * Layer Normalization ▶ *Layer Normalization* (Ba et al., 2016)
        * Dropout 正则化 ▶ *Dropout: A Simple Way to Prevent Neural Networks from Overfitting* (Srivastava et al., 2014)
    * **视觉与序列主干网络 (Visual & Sequential Backbones)**
        * 经典 CNN (AlexNet) ▶ *ImageNet Classification with Deep Convolutional Neural Networks* (Krizhevsky et al., 2012)
        * 深度残差网络 (ResNet) ▶ **[基石]** *Deep Residual Learning for Image Recognition* (He et al., 2016)
        * 密集连接架构 (DenseNet) ▶ *Densely Connected Convolutional Networks* (Huang et al., 2017)
        * 现代纯卷积架构 (ConvNeXt) ▶ *A ConvNet for the 2020s* (Liu et al., 2022)
        * 长短期记忆网络 (LSTM) ▶ *Long Short-Term Memory* (Hochreiter & Schmidhuber, 1997)
        * 序列到序列建模 (Seq2Seq) ▶ *Sequence to Sequence Learning with Neural Networks* (Sutskever et al., 2014)
    * **注意力范式与状态空间 (Attention & State Space Models)**
        * NLP 注意力先驱 ▶ *Neural Machine Translation by Jointly Learning to Align and Translate* (Bahdanau et al., 2015)
        * 核心 Transformer 架构 ▶ **[基石]** *Attention Is All You Need* (Vaswani et al., 2017)
        * 选择性状态空间模型 (Mamba) ▶ *Mamba: Linear-Time Sequence Modeling with Selective State Spaces* (Gu & Dao, 2023)
        * 线性状态空间 (S4) ▶ *Efficiently Modeling Long Sequences with Structured State Spaces* (Gu et al., 2022)
    * **优化器 (Optimizers)**
        * Adam 优化器 ▶ *Adam: A Method for Stochastic Optimization* (Kingma & Ba, 2014)
        * 解耦权重衰减 (AdamW) ▶ *Decoupled Weight Decay Regularization* (Loshchilov & Hutter, 2019)
    * **图神经网络 (Graph Neural Networks)**
        * 图卷积网络 (GCN) ▶ *Semi-Supervised Classification with Graph Convolutional Networks* (Kipf & Welling, 2017)
        * 归纳式图表征 (GraphSAGE) ▶ *Inductive Representation Learning on Large Graphs* (Hamilton et al., 2017)
        * 图注意力网络 (GAT) ▶ *Graph Attention Networks* (Veličković et al., 2018)

* **III. 大规模系统与运行时基础设施 (MLSys & MLOps)**
    * **分布式与并行训练 (Distributed Training)**
        * 极致内存优化 ZeRO ▶ *ZeRO: Memory Optimizations Toward Training Trillion Parameter Models* (Rajbhandari et al., 2020)
        * 大语言模型高效张量并行 ▶ *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism* (Shoeybi et al., 2019)
        * 混合精度训练 ▶ *Mixed Precision Training* (Micikevicius et al., 2018)
    * **高效计算与注意力加速 (Efficient Computation)**
        * 硬件感知注意力加速 (FlashAttention) ▶ *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness* (Dao et al., 2022)
        * FlashAttention-2 ▶ *FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning* (Dao, 2023)
    * **极限推理与内存管理 (Inference Engine)**
        * PagedAttention (vLLM) ▶ *Efficient Memory Management for Large Language Model Serving with PagedAttention* (Kwon et al., 2023)
        * 极低比特量化 (AWQ) ▶ *AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration* (Lin et al., 2023)
        * 量化微调 (QLoRA) ▶ *QLoRA: Efficient Finetuning of Quantized LLMs* (Dettmers et al., 2023)
    * **模型压缩与蒸馏 (Compression & Distillation)**
        * 知识蒸馏 ▶ *Distilling the Knowledge in a Neural Network* (Hinton et al., 2015)
        * 彩票假设与剪枝 ▶ *The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks* (Frankle & Carlin, 2019)

* **IV. 自然语言处理 (Natural Language Processing)**
    * **词表征与自编码语境 (Embeddings & Masked LMs)**
        * 高效词嵌入库 (Word2Vec) ▶ *Distributed Representations of Words and Phrases and their Compositionality* (Mikolov et al., 2013)
        * 语境化表征 (ELMo) ▶ *Deep contextualized word representations* (Peters et al., 2018)
        * 掩码双向语言模型 (BERT) ▶ *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding* (Devlin et al., 2018)
    * **大语言模型与稀疏架构 (Large Language Models & MoE)**
        * In-Context 涌现能力 (GPT-3) ▶ **[基石]** *Language Models are Few-Shot Learners* (Brown et al., 2020)
        * 开源底座革命 (LLaMA) ▶ *LLaMA: Open and Efficient Foundation Language Models* (Touvron et al., 2023)
        * 混合专家网络拓展 (Mixtral) ▶ *Mixtral of Experts* (Jiang et al., 2024)
        * 缩放定律 (Scaling Laws) ▶ *Scaling Laws for Neural Language Models* (Kaplan et al., 2020)
    * **微调、对齐与人类偏好 (Alignment & PEFT)**
        * 低秩适应参数微调 (LoRA) ▶ *LoRA: Low-Rank Adaptation of Large Language Models* (Hu et al., 2021)
        * 基于人类反馈指导 (InstructGPT/RLHF) ▶ *Training language models to follow instructions with human feedback* (Ouyang et al., 2022)
        * 直接偏好优化 (DPO) ▶ *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* (Rafailov et al., 2023)
        * 宪法 AI 自对齐 (CAI) ▶ *Constitutional AI: Harmlessness from AI Feedback* (Bai et al., 2022)
    * **推理、检索与自主智能体 (Reasoning & Agents)**
        * 思维链推理 (CoT) ▶ *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (Wei et al., 2022)
        * 思维树推理 (ToT) ▶ *Tree of Thoughts: Deliberate Problem Solving with Large Language Models* (Yao et al., 2023)
        * 规划与行动协同 (ReAct) ▶ *ReAct: Synergizing Reasoning and Acting in Language Models* (Yao et al., 2023)
        * 知识检索增强 (RAG) ▶ *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (Lewis et al., 2020)

* **V. 强化学习 (Reinforcement Learning)**
    * **理论基础 (Theoretical Foundations)**
        * 强化学习教科书 ▶ *Reinforcement Learning: An Introduction* (Sutton & Barto, 2nd Ed., 2018)
        * 策略梯度定理 ▶ *Policy Gradient Methods for Reinforcement Learning with Function Approximation* (Sutton et al., 2000)
    * **深度价值网络与策略梯度 (Deep Value & Policy Gradient)**
        * 深度Q网络突破 (DQN) ▶ *Human-level control through deep reinforcement learning* (Mnih et al., 2015)
        * 近端策略优化标杆 (PPO) ▶ **[基石]** *Proximal Policy Optimization Algorithms* (Schulman et al., 2017)
        * 最大熵柔性 Actor-Critic (SAC) ▶ *Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor* (Haarnoja et al., 2018)
        * 信赖域策略优化 (TRPO) ▶ *Trust Region Policy Optimization* (Schulman et al., 2015)
    * **脱机策略与离线强化学习 (Offline RL)**
        * 保守Q学习 (CQL) ▶ *Conservative Q-Learning for Offline Reinforcement Learning* (Kumar et al., 2020)
        * 序列建模视角 (Decision Transformer) ▶ *Decision Transformer: Reinforcement Learning via Sequence Modeling* (Chen et al., 2021)
    * **探索与好奇心驱动 (Exploration & Curiosity)**
        * 内在好奇心模块 (ICM) ▶ *Curiosity-driven Exploration by Self-Supervised Prediction* (Pathak et al., 2017)
        * 随机网络蒸馏探索 (RND) ▶ *Exploration by Random Network Distillation* (Burda et al., 2019)
    * **通用世界模型系统 (World Models)**
        * 世界模型原型 ▶ *World Models* (Ha & Schmidhuber, 2018)
        * 梦境中预测与控制 (DreamerV3) ▶ *Mastering Diverse Domains through World Models* (Hafner et al., 2023)
    * **模仿学习与多智能体 (Imitation & MARL)**
        * 生成对抗模仿 (GAIL) ▶ *Generative Adversarial Imitation Learning* (Ho & Ermon, 2016)
        * 协作多智能体网络 (QMIX) ▶ *QMIX: Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning* (Rashid et al., 2018)
        * 多智能体竞技场 (AlphaStar) ▶ *Grandmaster level in StarCraft II using multi-agent reinforcement learning* (Vinyals et al., 2019)

* **VI. 计算机视觉 (Computer Vision)**
    * **视觉感知基柱 (Visual Perception)**
        * 经典一阶段检测架构 (YOLO) ▶ *You Only Look Once: Unified, Real-Time Object Detection* (Redmon et al., 2016)
        * 极致语义切割 (Mask R-CNN) ▶ *Mask R-CNN* (He et al., 2017)
        * 普适分段大模型 (SAM) ▶ *Segment Anything* (Kirillov et al., 2023)
        * 基于锚框的特征金字塔 (FPN) ▶ *Feature Pyramid Networks for Object Detection* (Lin et al., 2017)
    * **自监督与视觉 Transformer (Visual SSL & ViT)**
        * 彻底改变范式的无卷积架构 (ViT) ▶ **[基石]** *An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale* (Dosovitskiy et al., 2020)
        * 层级视觉 Transformer (Swin) ▶ *Swin Transformer: Hierarchical Vision Transformer using Shifted Windows* (Liu et al., 2021)
        * 掩码像素自编码学习 (MAE) ▶ *Masked Autoencoders Are Scalable Vision Learners* (He et al., 2022)
        * 视觉对比表征增强 (SimCLR) ▶ *A Simple Framework for Contrastive Learning of Visual Representations* (Chen et al., 2020)
        * 动量对比学习 (MoCo) ▶ *Momentum Contrast for Unsupervised Visual Representation Learning* (He et al., 2020)
        * 自蒸馏无监督表征 (DINO) ▶ *Emerging Properties in Self-Supervised Vision Transformers* (Caron et al., 2021)
    * **三维渲染基石 (3D Vision)**
        * 隐式神经辐射场 (NeRF) ▶ *NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis* (Mildenhall et al., 2020)
        * 显式高斯渲染引擎 (3D GS) ▶ *3D Gaussian Splatting for Real-Time Radiance Field Rendering* (Kerbl et al., 2023)
        * 点云深度学习 (PointNet) ▶ *PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation* (Qi et al., 2017)
    * **视频理解与时空建模 (Video Understanding)**
        * 光流预测网络 (FlowNet) ▶ *FlowNet: Learning Optical Flow with Convolutional Networks* (Dosovitskiy et al., 2015)
        * 视频分类双流架构 (Two-Stream) ▶ *Two-Stream Convolutional Networks for Action Recognition in Videos* (Simonyan & Zisserman, 2014)

* **VII. 生成式建模 (Generative Modeling)**
    * **经典生成祖师 (Classical Generative)**
        * 变分推理与自编码 (VAE) ▶ *Auto-Encoding Variational Bayes* (Kingma & Welling, 2014)
        * 深度生成对抗系统 (GAN) ▶ **[基石]** *Generative Adversarial Nets* (Goodfellow et al., 2014)
        * 高保真人脸生成 (StyleGAN) ▶ *A Style-Based Generator Architecture for Generative Adversarial Networks* (Karras et al., 2019)
        * 流体映射模型 (Normalizing Flows) ▶ *Variational Inference with Normalizing Flows* (Rezende & Mohamed, 2015)
    * **降噪扩散革命 (Diffusion Models)**
        * 基础扩散概率模型 (DDPM) ▶ **[基石]** *Denoising Diffusion Probabilistic Models* (Ho et al., 2020)
        * 确定性加速采样 (DDIM) ▶ *Denoising Diffusion Implicit Models* (Song et al., 2021)
        * 隐空间高质量生成合成 (Stable Diffusion) ▶ *High-Resolution Image Synthesis with Latent Diffusion Models* (Rombach et al., 2022)
        * 最优流动匹配架构 (Flow Matching) ▶ *Flow Matching for Generative Modeling* (Lipman et al., 2023)
    * **跨模态生成 (Cross-Modal Generation)**
        * 文本引导图像生成 (DALL·E 2) ▶ *Hierarchical Text-Conditional Image Generation with CLIP Latents* (Ramesh et al., 2022)
        * 文本到视频生成 (Sora 相关) ▶ *Scalable Diffusion Models with Transformers (DiT)* (Peebles & Xie, 2023)
        * 语音合成 (WaveNet) ▶ *WaveNet: A Generative Model for Raw Audio* (van den Oord et al., 2016)
        * 音频/音乐生成 (AudioLM) ▶ *AudioLM: a Language Modeling Approach to Audio Generation* (Borsos et al., 2023)

* **VIII. 跨领域深度融合 (Interdisciplinary & Embodied AI)**
    * **多模态图文对齐模型 (Vision-Language LLMs)**
        * 破界规模对比图文学习 (CLIP) ▶ **[基石]** *Learning Transferable Visual Models From Natural Language Supervision* (Radford et al., 2021)
        * 视觉指令微调框架 (LLaVA) ▶ *Visual Instruction Tuning* (Liu et al., 2023)
        * 统一视觉推理 (Flamingo) ▶ *Flamingo: a Visual Language Model for Few-Shot Learning* (Alayrac et al., 2022)
    * **具身智能与机器人策略 (Embodied AI)**
        * 双臂协同操作与分块动作 (ACT) ▶ *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (Zhao et al., 2023)
        * 通用机器人视觉语言动作模型 (RT-1) ▶ *RT-1: Robotics Transformer for Real-World Control at Scale* (Brohan et al., 2022)
        * 视觉-语言-动作模型 (RT-2) ▶ *RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control* (Brohan et al., 2023)
    * **AI 驱动科学突破 (AI for Science)**
        * 原子级极高精度蛋白质折叠 (AlphaFold2) ▶ *Highly accurate protein structure prediction with AlphaFold* (Jumper et al., 2021)
        * 分子与复杂配体预测系统 (AlphaFold3) ▶ *Accurate structure prediction of biomolecular interactions with AlphaFold 3* (Abramson et al., 2024)
        * 全球中期天气预报 (GraphCast) ▶ *Learning skillful medium-range global weather forecasting* (Lam et al., 2023)
    * **联邦学习与隐私 (Federated Learning & Privacy)**
        * 联邦学习原始框架 ▶ *Communication-Efficient Learning of Deep Networks from Decentralized Data* (McMahan et al., 2017)
        * 差分隐私下的深度学习 ▶ *Deep Learning with Differential Privacy* (Abadi et al., 2016)
    * **可解释性与归因分析 (Explainability / XAI)**
        * 梯度加权注意力 (Grad-CAM) ▶ *Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization* (Selvaraju et al., 2017)
        * 模型无关可解释性 (LIME) ▶ *"Why Should I Trust You?": Explaining the Predictions of Any Classifier* (Ribeiro et al., 2016)
        * 博弈论归因 (SHAP) ▶ *A Unified Approach to Interpreting Model Predictions* (Lundberg & Lee, 2017)
