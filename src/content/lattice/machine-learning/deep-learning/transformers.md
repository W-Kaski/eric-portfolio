---
title: "Understanding Transformers: Attention as Soft Memory Access"
date: "2025-11-20"
tags: ["transformers", "attention", "nlp"]
related:
  - id: latent-navigation
    relation: "INFORMS"
---

# Understanding Transformers: Attention as Soft Memory Access

## Abstract

We present a unifying view of the Transformer architecture through the lens of differentiable memory systems. Self-attention can be interpreted as a content-addressable soft read from a key-value memory bank — a view that naturally explains multi-head attention, causal masking, and positional encodings.

## Attention as Memory Read

Given queries $Q$, keys $K$, and values $V$:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

Each query retrieves a convex combination of values, weighted by key similarity — precisely a soft memory lookup.

## Multi-Head Attention

$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1, ..., \text{head}_h) W^O$$

Multiple projection subspaces enable the model to attend to complementary information simultaneously.

## Implications

This memory-centric view connects directly to Hopfield networks, Neural Turing Machines, and retrieval-augmented generation architectures.

## References

- Vaswani et al., 2017 — Attention Is All You Need
- Ramsauer et al., 2020 — Hopfield Networks Is All You Need
