---
title: Personal Knowledge Agent
category: AI
color: "#3B82F6"
date: 2026-04-01
github: "https://github.com/W-Kaski/personal-knowledge-agent"
tech: [Python, FastAPI, LangGraph, React 19, TypeScript, MySQL, RAG, Docker]
image: /projects/personal-knowledge-agent.png
featured: true
---

Personal knowledge management and reliable RAG question-answering system built with a clean layered architecture, LangGraph workflow orchestration, and authoritative relational storage.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Workflow-orange?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 1. Overview & Architecture

Personal Knowledge Agent organizes knowledge ingestion, persistence, retrieval coordination, model question-answering orchestration, and interactive streaming chat into a clean, maintainable architecture.

Rather than relying on loosely structured RAG scripts, the system strictly enforces a layered Domain-Driven Design (DDD) model:

- **Domain Layer (`domain/`)**: Pure business models and state definitions (`Document`, `Chunk`, `Fact`, `Asset`, `AnswerResult`), completely independent of external frameworks.
- **Application Layer (`application/`)**: High-level use-case coordinators managing document ingestion pipelines, hybrid retrieval orchestration, and LangGraph workflow execution.
- **Infrastructure Layer (`infrastructure/`)**: Concrete implementations for MySQL 8.0 relational persistence, vector search adapters, parser drivers, and model gateways.
- **Interface Layer (`interface/`)**: HTTP endpoints via FastAPI with dependency injection, standard Pydantic request/response validation, and SSE streaming channels.

---

## 2. Core Capabilities

### Multi-Format Knowledge Ingestion
- **Markdown Processing**: Intelligent boundary-aware chunking based on semantic header hierarchies (`h1` - `h3`), preserving parent contextual breadcrumbs.
- **Structured Data (Excel/CSV)**: Standard column-to-field mapping extracting structured tabular rows into relational factual entities.
- **Rich Text & Documents (Word/PDF)**: Robust paragraph extraction and asset metadata indexing.
- **Image & Binary Archival**: Managed storage referencing asset entities with hash deduplication.

### Authoritative Relational Persistence
- MySQL 8.0 acts as the single source of truth (authoritative core), ensuring transactional consistency, document versioning, and auditable ingestion states.
- Flexible retrieval adapters coordinating full-text keyword indexing and embedding vector projections (extensible to pgvector / Elasticsearch).

### Reliable LangGraph Orchestration Loop
The question-answering pipeline avoids brittle single-turn prompts by employing an explicit three-stage LangGraph state machine:

1. **Query Rewriting & Intent Clarification**: Decomposes user queries, expands domain acronyms, and normalizes semantic search terms.
2. **Hybrid Retrieval & Coordinate Ranking**: Fuses keyword hits with vector proximity scores, prioritizing exact factual matches while maintaining semantic recall.
3. **Controlled Fact Verification & Synthesis**: Applies hallucination guards to check model responses against retrieved source passages before emitting streaming tokens.

### Modern Frontend & Streaming Interaction
- Built with **React 19**, **TypeScript**, and **Vite**.
- Real-time token streaming with server-sent events (SSE) and typing animation.
- Visual execution trace drawer inspecting intermediate reasoning steps, retrieved document citations, and retrieval confidence scores.

---

## 3. Engineering Practices & Verification

- **Automated Testing**: Comprehensive test suite with `pytest`, covering ingestion parser edge cases, prompt sanitization, and workflow state transitions.
- **MySQL Smoke Verification**: Automated integration script validating relational schema migrations, connection pooling, and transactional rollbacks.
- **Turnkey Containerization**: Single-command `docker compose up -d` bringing up the Nginx-served React frontend, FastAPI backend, and pre-configured MySQL instance with healthchecks.
