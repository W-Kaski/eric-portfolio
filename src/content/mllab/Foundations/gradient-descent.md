---
title: Gradient Descent Explorer
category: Foundations
folder: Optimization
date: 2026-03-23
description: Interactive visualization of the backbone of neural network training. Watch how learning rates and momentum affect the path to the global minimum.
tags: ["Optimization", "Gradients", "Loss Functions"]
featured: true
---

# The Geometry of Optimization

Gradient Descent is the iterative optimization algorithm used to find the minimum of a function. In machine learning, this function is our **Loss Function**, which measures the error of our model's predictions.

### How it Works

The algorithm takes steps proportional to the negative of the gradient (or approximate gradient) of the function at the current point. 

$$ \theta_{t+1} = \theta_t - \eta \nabla J(\theta_t) $$

Where:
- $\theta$: The parameters we are optimizing.
- $\eta$: The **Learning Rate**.
- $\nabla J(\theta)$: The direction of steepest increase.

## Key Hyperparameters

### 1. Learning Rate
The most critical parameter. 
- **Too small**: Optimization takes forever and might get stuck in a shallow local minimum.
- **Too large**: The algorithm might overshoot the minimum and diverge (bounce away).

### 2. Momentum
Helps accelerate gradient descent in the relevant direction and dampens oscillations. It acts like a ball rolling down a hill—it gains speed as it goes.

## Interactive Experiment
In the visualizer above, you can:
1. **Change the Surface**: Try different mathematical landscapes (Convex, Non-convex).
2. **Adjust Learning Rate**: See how the path becomes smoother or more chaotic.
3. **Step through**: Take manual steps or let it run automatically.
