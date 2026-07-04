---
title: Qwen2.5 QLoRA Text-to-SQL Benchmark
category: AI
color: "#2563EB"
date: 2026-07-01
github: "https://github.com/W-Kaski/qwen-qlora-sql-benchmark"
demo: "https://huggingface.co/W-Kaski/qwen25-15b-text2sql-lora-r32"
tech: [Python, PyTorch, Transformers, PEFT, QLoRA, vLLM, FastAPI, sqlglot]
featured: true
---

A reproducible ML engineering benchmark for fine-tuning and evaluating
`Qwen/Qwen2.5-1.5B-Instruct` on schema-conditioned Text-to-SQL generation.

The project covers the full experiment loop: dataset conversion, YAML-managed
QLoRA training, LoRA rank ablation, exact-match evaluation, SQL parse checks,
error analysis, result plotting, a controlled SQLite execution sanity check,
and a local FastAPI demo with SQL validation.

## Why This Project Matters

Text-to-SQL is easy to demo and hard to evaluate honestly. A model can generate
SQL-shaped text while still choosing the wrong columns, filters, aggregations,
or value predicates. This project treats the model as one part of a larger
evaluation and serving pipeline rather than stopping at fine-tuning.

The benchmark intentionally separates:

- syntactic validity from exact-match quality
- exact-match quality from execution correctness
- training results from serving latency
- local full-rank runs from Kaggle environment validation

## Experiment Setup

| Item | Value |
| --- | --- |
| Base model | `Qwen/Qwen2.5-1.5B-Instruct` |
| Dataset | `b-mc2/sql-create-context` |
| Verified source fields | `answer`, `question`, `context` |
| Train split | 5000 rows |
| Eval split | 500 rows |
| Format | prompt-completion JSONL |
| Loss target | completion tokens only |
| Quantization | 4-bit NF4 |
| LoRA ranks | `r=8`, `r=16`, `r=32` |
| Seed | 42 |

## Results

| Model | Exact Match | SQL Parse Valid | Main Error Type |
| --- | ---: | ---: | --- |
| baseline | 0.044 | 0.980 | filter / condition mismatch |
| LoRA rank 8 | 0.684 | 0.992 | filter / condition mismatch |
| LoRA rank 16 | 0.696 | 0.994 | filter / condition mismatch |
| LoRA rank 32 | 0.712 | 0.990 | filter / condition mismatch |

In this single-seed 500-example split, rank 32 achieved the highest Exact
Match. The improvement comes mainly from better column selection, filter
construction, aggregation choice, and dataset-specific SQL formatting.

## Execution Sanity Check

The rank 32 adapter is also tested with a small SQLite-backed execution check.
Generated SQL is parsed, constrained to read-only `SELECT`, executed against
in-memory SQLite databases, and compared against reference SQL execution.

| Cases | Parse Valid | Select-only | Execution Valid | Execution Accuracy | P50 Latency | P95 Latency |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 30 | 1.000 | 1.000 | 1.000 | 0.600 | 0.456s | 1.182s |

This is a controlled sanity check, not a broad Text-to-SQL benchmark. The main
remaining failures are value normalization, wrong projection, string
predicates, `NULL`, `GROUP BY`, and `LIMIT/OFFSET`.

## Serving Check

The project includes a sequential single-request benchmark comparing
Transformers and vLLM on local prompts.

| Backend | Requests | P50 latency | P95 latency | Tokens/s |
| --- | ---: | ---: | ---: | ---: |
| Transformers | 20 | 0.3144s | 0.5359s | 76.18 |
| vLLM | 20 | 0.2156s | 0.4098s | 74.61 |

This measures local single-request latency. It does not claim high-concurrency
serving throughput.

## Engineering Surface

- Config-driven training and evaluation under `configs/`
- Scripted local and Kaggle validation entrypoints under `scripts/`
- Unit tests for data conversion, config validation, SQL parsing, execution
  sandboxing, API behavior, plotting, and packaging
- Technical reports covering reproduction, results, error analysis, execution
  evaluation, serving benchmark, and Hugging Face packaging
- Local FastAPI demo exposing `/generate-sql` with generated SQL, parse status,
  read-only validation, latency, and optional SQLite execution metadata

## Limits

- Exact Match rejects semantically equivalent SQL.
- SQL parse validity does not prove execution correctness.
- The main dataset is mostly single-table SQL.
- The SQLite execution check is small and uses in-memory databases.
- vLLM LoRA serving is not part of this version.
- Generated SQL must be validated and sandboxed before any user-facing use.
