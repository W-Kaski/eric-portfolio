---
title: "Advanced Inference & Reasoning Knowledge Outline"
date: "2025-04-27"
---
---
mindmap-plugin: basic
---

# Advanced Inference & Reasoning Knowledge Outline (高级推理与推理知识大纲)

## 1. Prompt Engineering & In-Context Learning (提示工程与上下文学习)

- In-Context Learning / ICL (上下文学习)
    
    - Definition (定义): The ability of a model to learn a task from a few examples in the prompt without parameter updates
        
    - Few-Shot Prompting (少样本提示): Providing example pairs (Input, Output) before the actual query
        
    - Zero-Shot Prompting (零样本提示): Asking the model to perform a task without any examples
        
- Chain-of-Thought / CoT (思维链)
    
    - Concept (概念): Encouraging the model to generate intermediate reasoning steps before the final answer
        
    - Zero-Shot CoT (零样本思维链): Adding "Let's think step by step" to the prompt to trigger reasoning
        
    - Manual CoT (人工思维链): Providing few-shot examples that explicitly show the reasoning process
        
- Tree of Thoughts / ToT (思维树)
    
    - Mechanism (机制): Exploring multiple reasoning paths (branches) and evaluating them via lookahead or backtracking
        
    - Search Algorithms (搜索算法): Uses BFS (Breadth-First Search) or DFS (Depth-First Search) to navigate the tree of possibilities
        

## 2. Retrieval-Augmented Generation / RAG (检索增强生成)

- Core Workflow (核心流程)
    
    - Retrieval (检索): Finding relevant documents from an external knowledge base using the user query
        
    - Augmentation (增强): Inserting the retrieved content into the prompt context window
        
    - Generation (生成): The LLM answers the query based on the augmented context
        
- Vector Search (向量搜索)
    
    - Embeddings (嵌入): Converting text chunks into dense vectors
        
    - Similarity Metric (相似度度量): Cosine Similarity or Dot Product to find nearest neighbors
        
    - Vector Database (向量数据库): Specialized storage (e.g., Pinecone, Milvus, Chroma) for fast retrieval
        
- Advanced RAG Techniques (高级RAG技术)
    
    - Re-ranking (重排序): Using a high-precision Cross-Encoder to re-score top-N retrieved documents
        
    - Hybrid Search (混合搜索): Combining Keyword Search (BM25) with Semantic Vector Search
        
    - Query Expansion (查询扩展): Generating synonyms or sub-questions to broaden the search scope
        

## 3. Agents & Tool Use (智能体与工具使用)

- Agentic Frameworks (智能体框架)
    
    - ReAct / Reason + Act (ReAct框架): A loop of Thought -> Action -> Observation -> Thought
        
    - Reflexion (反思): An agent that critiques its own past outputs to improve future performance
        
    - AutoGPT (AutoGPT): Autonomous agents that break down high-level goals into sub-tasks and execute them
        
- Function Calling / Tool Use (函数调用/工具使用)
    
    - API Integration (API集成): The model outputs structured JSON to call external code (calculator, weather API, database)
        
    - Execution (执行): The system executes the code and feeds the result back to the model as an observation
        
- Planning (规划)
    
    - Decomposition (分解): Breaking complex problems into manageable steps
        
    - Self-Correction (自修正): Detecting errors in execution and attempting a different approach
        

## 4. Decoding Strategies (解码策略)

- Deterministic Methods (确定性方法)
    
    - Greedy Decoding (贪婪解码): Always selecting the token with the highest probability
        
    - Beam Search (束搜索): Keeping the top-k most probable sequences (beams) at each step
        
- Stochastic Methods / Sampling (随机方法/采样)
    
    - Temperature (温度): Scaling the logits; High temperature increases diversity (randomness), low temperature makes it focused (peaked)
        
    - Top-k Sampling (Top-k采样): Restricting sampling to the k most probable tokens
        
    - Top-p / Nucleus Sampling (Top-p/核采样): Sampling from the smallest set of tokens whose cumulative probability exceeds p (dynamic vocabulary size)
        
- Constrained Decoding (受限解码)
    
    - Grammar-Guided (语法引导): Forcing output to follow a specific syntax (e.g., valid JSON or Python code)
        

## 5. System 2 Reasoning / Test-Time Compute (系统2推理/测试时计算)

- Concept (概念)
    
    - System 1 vs System 2 (系统1与系统2): System 1 is fast/intuitive (standard LLM generation), System 2 is slow/deliberate (reasoning models)
        
    - Test-Time Compute (测试时计算): Trading more inference time for higher accuracy (thinking longer)
        
- Search & Verification (搜索与验证)
    
    - Best-of-N (N选一): Generating N solutions and using a verifier to pick the best one
        
    - MCTS / Monte Carlo Tree Search (蒙特卡洛树搜索): Used in AlphaGo, now applied to LLM reasoning paths
        
- Process Reward Models / PRM (过程奖励模型)
    
    - Dense Supervision (密集监督): Scoring every step of the reasoning chain, not just the final answer
        
    - Models (模型): OpenAI o1 (Strawberry), DeepSeek-R1 (using RL to optimize reasoning chains)
        

## 6. Inference Optimization (推理优化)

- KV Cache (键值缓存)
    
    - Mechanism (机制): Caching the Key and Value matrices of previous tokens to avoid redundant computation
        
    - PagedAttention (分页注意力): Managing KV cache in non-contiguous memory blocks (like OS paging) to reduce fragmentation (vLLM)
        
- Speculative Decoding (投机解码)
    
    - Draft Model (草稿模型): A small, fast model generates a draft sequence
        
    - Verification (验证): The large model checks the draft in parallel; accepted tokens are kept, rejected ones are corrected
        
- Context Management (上下文管理)
    
    - Context Window (上下文窗口): The maximum number of tokens the model can process (e.g., 128k, 1M)
        
    - Sliding Window (滑动窗口): Only attending to the most recent N tokens to save memory