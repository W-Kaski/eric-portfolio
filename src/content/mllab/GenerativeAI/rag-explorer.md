---
title: "RAG & Vector Search Explorer"
date: "2026-04-11"
folder: "GenerativeAI"
category: "Generative AI"
tags: ["RAG", "Embeddings", "Semantic Search", "LLM"]
description: "A step-by-step visualizer of Retrieval-Augmented Generation, mapping queries to vector spaces and retrieving semantic neighbors."
featured: true
---

## Retrieval-Augmented Generation (RAG)

Large Language Models (LLMs) are powerful generalists, but they hallucinate when queried about private, proprietary, or highly recent information. RAG solves this by providing context!

### The Pipeline

1. **Embedding**: The user's query is transformed into a high-dimensional vector (e.g., 1536 dimensions for OpenAI's `text-embedding-3-small`). 
2. **Vector Space Search**: The vector is compared against a database (like PGVector) containing pre-embedded knowledge fragments. We usually calculate the **Cosine Similarity**:
   $$ \text{similarity} = \frac{A \cdot B}{\|A\|_2 \|B\|_2} $$
3. **Retrieval**: The top-K most similar text chunks are retrieved.
4. **Augmented Prompting**: The retrieved contextual chunks are bundled together with the original user query, and fed into the LLM logic engine.

Use the interactive visualizer above to simulate a query mapping to 2D vector space and fetching its nearest neighbors.
