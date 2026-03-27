---
title: "Dimensionality Auto-Reduction"
date: "2026-03-15"
folder: "Unsupervised"
category: "Machine Learning"
tags: ["PCA", "t-SNE", "UMAP", "Latent Space"]
description: "Compressing high-dimensional data into low-dimensional visualizable spaces using PCA, t-SNE, and UMAP."
featured: false
snippet: "from sklearn.decomposition import PCA\n\npca = PCA(n_components=2)\nreduced = pca.fit_transform(X)"
---

## Exploring the Latent Space

When dealing with images, text embeddings, or extensive feature matrices, working in hundreds or thousands of dimensions is the norm. The **curse of dimensionality** makes it impossible to visualize these spaces directly.

Dimensionality reduction algorithms solve this by mapping points to a lower-dimensional manifold (often 2D or 3D) while preserving the underlying structure.

### PCA (Principal Component Analysis)
PCA is a linear technique. It finds orthogonal axes (principal components) that maximize the variance in the data. While fast and interpretable, it often fails to capture complex, non-linear manifolds.

### t-SNE (t-Distributed Stochastic Neighbor Embedding)
Unlike PCA, t-SNE is a non-linear approach explicitly designed for visualizing high-dimensional data. It converts Euclidean distances into conditional probabilities that represent similarities.

### UMAP (Uniform Manifold Approximation and Projection)
A modern alternative to t-SNE, UMAP preserves both local and global structure of the data and is significantly faster for large datasets. It relies on topological data analysis.
