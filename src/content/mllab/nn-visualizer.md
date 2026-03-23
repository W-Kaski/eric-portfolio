---
title: "Neural Vision"
date: "2026-03-18"
folder: "Deep Learning"
category: "Machine Learning"
tags: ["Neural Networks", "Activations", "Architecture"]
description: "A deep dive into neural network architectures, visualizing how inputs transform through hidden layers to produce an output."
featured: true
snippet: "def relu(x):\n    return max(0, x)\n\ndef forward_pass(x, w, b):\n    return relu(np.dot(w, x) + b)"
---

## Exploring Neural Architecture

Neural networks are the backbone of modern deep learning. By stacking multiple layers of simple operations (linear transformations followed by non-linear activations), neural networks can model highly complex functions.

### The Forward Pass

1. **Input Layer**: The raw data (e.g., pixel values, embedding vectors).
2. **Hidden Layers**: Neurons that apply weights and biases.
   $$ z_i = \sum_{j} W_{ij} x_j + b_i $$
3. **Activation**: We apply non-linearities like `ReLU`, `Sigmoid`, or `Tanh` so the network can learn non-linear patterns.
   $$ a_i = \sigma(z_i) $$
4. **Output Layer**: Yields the final predictions (e.g., class probabilities).

### Why Non-Linearity Matters

Without activation functions, no matter how many layers a neural network has, it would still act exactly like a single-layer perceptron (a linear transform). The non-linear activation breaks this, allowing the network to fold and warp the input space to separate complex data manifolds.
