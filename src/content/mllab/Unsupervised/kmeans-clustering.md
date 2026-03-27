---
title: K-Means & Voronoi
category: Unsupervised
folder: Clustering
date: 2026-03-24
description: Watch how clusters emerge from chaos. An interactive journey into the heart of unsupervised learning through K-Means and dynamic Voronoi tessellation.
tags: ["Unsupervised", "Clustering", "Geometry"]
featured: true
---

# The Art of Grouping

In unsupervised learning, we often don't have labels. Instead, we look for **patterns** and **structure** inherent in the data. **K-Means Clustering** is a simple but powerful algorithm that groups data points into $K$ distinct clusters based on their proximity to a center point (the centroid).

### The Iterative Loop

The algorithm follows two main steps until convergence:

1.  **Assignment**: Each data point is assigned to its nearest centroid.
2.  **Update**: Each centroid's position is updated to be the mean of all points assigned to it.

Mathematically, we seek to minimize the **Within-Cluster Sum of Squares (WCSS)**:

$$ J = \sum_{i=1}^{K} \sum_{x \in S_i} ||x - \mu_i||^2 $$

Where $S_i$ is the set of points in cluster $i$ and $\mu_i$ is its centroid.

## Voronoi Tessellation

In the visualizer above, the background lines represent a **Voronoi Diagram**. A Voronoi cell for a centroid contains all points in the space that are closer to that centroid than to any other. 

Notice how the boundaries shift and "snap" into place as the centroids move toward the centers of their respective point clouds.

## Interactive Experiment

1.  **Add Points**: Click the canvas to add your own data points and see how the clusters reform.
2.  **Step-by-Step**: Control the iterative process manually to see exactly how centroids migrate.
3.  **Randomize**: Start with a new point cloud or different initial centroid positions.
