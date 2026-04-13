---
title: "Self-Attention Visualizer"
date: "2026-04-10"
folder: "DeepLearning"
category: "Transformers"
tags: ["Transformers", "Attention", "LLM", "NLP"]
description: "Interactive visualization of the Self-Attention mechanism, showing how Query, Key, and Value matrices compute contextual weights."
featured: true
---

## The Core of Transformers: Self-Attention

Self-attention is a mechanism that allows a neural network to weigh the importance of different words in a sentence relative to a specific target word. Instead of reading sequentially like a RNN, it looks at the entire sequence simultaneously.

$$ \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V $$

### 1. Queries (Q), Keys (K), and Values (V)
Each word in the input is linearly transformed into three vectors:
- **Query**: What the current word is "looking for".
- **Key**: What the current word "offers" to other words.
- **Value**: The actual content/meaning of the word.

### 2. Attention Matrix Computation
By computing the dot product of every Query with every Key, the model generates an **Attention Matrix**. If a query matches a key well, the dot product is high, meaning strong attention. 

In the interactive example above, try hovering or clicking on different words to see their attention weights distributed across the sentence!
