---
title: Circuit Agent
category: AI
color: "#8B5CF6"
date: 2025-09-01
github: "https://github.com/W-Kaski/circuit-agent"
demo: ""
---
Building a Full-Stack AI Agent Platform with Spring AI

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.7-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Spring AI](https://img.shields.io/badge/Spring_AI-1.0.0-6DB33F?style=flat-square&logo=spring&logoColor=white)
![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_PgVector-blue?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Alibaba DashScope](https://img.shields.io/badge/Alibaba_DashScope-qwen--plus-FF6A00?style=flat-square)
![MCP](https://img.shields.io/badge/MCP_Protocol-supported-blueviolet?style=flat-square)

---

## Overview

Circuit Agent is a full-stack AI Agent platform I built to deeply explore how modern AI Agent patterns work under the hood — specifically **Retrieval-Augmented Generation (RAG)** and **Agentic ReAct loops** — using the Java/Spring ecosystem.

The project ships two distinct AI applications:

- **AI Algorithm Master** — A domain-specific conversational assistant with a private knowledge base (RAG), capable of answering algorithm and data structure questions with retrieved context from curated Markdown documents.
- **AI Super Agent (EkManus)** — An autonomous agent that reasons, selects tools, acts on the real world (web search, file operations, web scraping, terminal commands, PDF generation), and loops until the task is complete.

The entire platform — from backend to frontend — is built and wired end-to-end, with Server-Sent Events (SSE) streaming responses to the browser in real time.

> **Why build this?**
> I wanted to go beyond calling LLM APIs and actually understand what it takes to architect a production-oriented AI Agent system: manual context management, tool execution control, RAG pipelines, streaming, and the design trade-offs each component demands.

---

## Table of Contents

1. [Core Problem and Design Goals](#1-core-problem-and-design-goals)
2. [Tech Stack Breakdown](#2-tech-stack-breakdown)
3. [System Architecture](#3-system-architecture)
4. [Key Data Flows](#4-key-data-flows)
5. [Core Modules Deep Dive](#5-core-modules-deep-dive)
6. [Design Decisions and Trade-offs](#6-design-decisions-and-trade-offs)
7. [Engineering Lessons and Key Challenges](#7-engineering-lessons-and-key-challenges)
8. [Rebuild Guide](#8-rebuild-guide)

---

## 1. Core Problem and Design Goals

Most developer tutorials show you how to call an LLM API. Very few walk you through what happens when you need the model to:

- **Remember** context across a multi-turn conversation
- **Retrieve** relevant knowledge from a private corpus rather than relying on its training data
- **Plan** a multi-step task, select tools, observe results, and adapt
- **Stream** the output token-by-token to the browser

This project answers all four questions in a unified codebase, using the Java ecosystem instead of the Python-centric tooling that dominates this space.

**Core design goals:**

| Goal | Implementation |
|------|---------------|
| Private knowledge base | RAG pipeline over Markdown docs using PgVector |
| Multi-turn memory | `MessageWindowChatMemory` (in-process) or `FileBasedChatMemory` (disk) |
| Autonomous tool use | ReAct loop: `BaseAgent -> ReActAgent -> ToolCallAgent` |
| Real-time streaming | SSE (`SseEmitter` / Reactor `Flux`) + browser `EventSource` |
| Extensible tool system | `@Tool`-annotated beans registered via `ToolRegistration` config |
| External tool protocols | MCP (Model Context Protocol) client + custom MCP server |

---

## 2. Tech Stack Breakdown

### Frontend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Vue 3** (Composition API) | SPA framework | Composition API's reactive refs map cleanly to SSE streaming data — each token chunk updates a reactive `ref`, no extra state management overhead needed |
| **Vite 4** | Build tool | Near-instant HMR during development; native ESM avoids Webpack bundle overhead |
| **Vue Router 4** | Client-side routing | Official Vue 3 router; lazy-loaded routes keep the initial bundle small |
| **@vueuse/head** | `<head>` metadata management | Declarative, reactive page titles and meta tags per route — essential for SEO on a portfolio-facing app |
| **Axios** | HTTP client | Interceptor support for request/response transforms; SSE connections use the browser-native `EventSource` API directly |
| **Nginx** (production) | Static file serving + reverse proxy | Handles SPA routing fallback (`try_files`) and correctly proxies SSE streams with `proxy_buffering off` |
| **Docker** (multi-stage build) | Containerization | Build stage on `node:20-alpine`, runtime on `nginx:alpine` — minimized image footprint |

### Backend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Spring Boot 3.4.7** | Application framework | Mature DI container, auto-configuration, and production-hardened HTTP layer |
| **Spring AI 1.0.0** | LLM abstraction layer | Unified `ChatClient`, `VectorStore`, and `Advisor` abstraction across different LLM providers — swap the model without rewriting business logic |
| **Spring AI Alibaba / DashScope** | LLM provider adapter | Enables `qwen-plus` and DashScope embedding models; chosen for reliable domestic access and cost efficiency |
| **Ollama** (configured) | Local model runtime | Allows running open-source models offline — configured but inactive in default profile |
| **LangChain4j (DashScope community)** | Supplementary LLM integration | Covers DashScope features not yet supported by the Spring AI adapter |
| **Spring AI PgVector Store** | Persistent vector store | PostgreSQL + `pgvector` extension with HNSW indexing and cosine distance — production-grade |
| **Spring AI SimpleVectorStore** | In-memory vector store (dev) | Zero-dependency option for rapid prototyping; the RAG pipeline is identical — storage backend is swappable |
| **Kryo 5** | Binary serialization | Used by `FileBasedChatMemory` to serialize polymorphic Spring AI `Message` objects to disk; JSON serializers struggle with interface-typed Message hierarchies |
| **Hutool** | Java utility library | Covers HTTP, JSON, file operations in one dependency — reduces boilerplate for tool implementations |
| **Jsoup** | HTML parser | Powers `WebScrapingTool`; clean API for extracting text from arbitrary URLs |
| **iTextPDF 9** | PDF generation | Backs `PDFGenerationTool` — allows the Agent to produce downloadable reports |
| **Knife4j** | API docs (Swagger enhanced) | Richer UI than the default Springdoc interface; useful for testing streaming endpoints |
| **Lombok** | Code generation | Eliminates getter/setter/constructor boilerplate on Agent classes |
| **Java 21 LTS** | Runtime | Latest LTS with Virtual Thread support — future-proofing for high-concurrency SSE scenarios |

### Storage

| Store | Role | Status |
|-------|------|--------|
| `InMemoryChatMemoryRepository` | Conversation memory (Algorithm App) | Active (default profile) |
| `FileBasedChatMemory` (Kryo) | Persistent conversation memory | Implemented, profile-switchable |
| `SimpleVectorStore` | RAG vector index | Active (dev/demo profile) |
| `PostgreSQL + PgVector` | Production RAG vector index | Implemented, activate by enabling `PgVectorVectorStoreConfig` |

### Infrastructure

| Layer | Technology |
|-------|-----------|
| Containerization | Docker (multi-stage, frontend) |
| Build | Maven Wrapper (backend) + Vite (frontend) |
| MCP Integration | Spring AI MCP Client (SSE + stdio modes) |
| API Documentation | Knife4j (OpenAPI 3, `/swagger-ui.html`) |

---

## 3. System Architecture

**Overall style: Frontend/Backend Separation + Spring Boot Monolith, with an optional sidecar MCP process**

```
+-----------------------------------------------------------------------+
|                        Browser (Vue 3 SPA)                            |
|                                                                       |
|  +------------+  +----------------------+  +----------------------+   |
|  |   Home     |  |  Algorithm Master    |  |    Super Agent       |   |
|  | (animated  |  |  (RAG Chat / SSE)    |  |  (Agent Chat / SSE)  |   |
|  |  landing)  |  +----------------------+  +----------------------+   |
|  +------------+                                                       |
|                    EventSource (SSE) / REST                           |
+-----------------------------------------------------------------------+
                              |
                         HTTP / SSE
                              |
+-----------------------------------------------------------------------+
|          Spring Boot Backend  (port 8123, context: /api)              |
|                                                                       |
|  +-------------------------------------------------------------+      |
|  |  AiController  (/ai/*)                                      |      |
|  |  |-- /algorithm_app/chat/sse    ->  AlgorithmApp            |      |
|  |  +-- /manus/chat               ->  EkManus (Agent)          |      |
|  +-------------------------------------------------------------+      |
|                       direct method call                              |
|  +--------------------------+  +----------------------------------+   |
|  |  AlgorithmApp            |  |  EkManus (Agent)                |   |
|  |  |- ChatClient           |  |  |- ToolCallAgent (ReAct)       |   |
|  |  |- ChatMemory           |  |  |- 7 Tools                     |   |
|  |  |- VectorStore (RAG)    |  |  +- messageList (manual ctx)    |   |
|  |  +- QueryRewriter        |  +---------|------------------------+   |
|  +--------------------------+            | MCP Client                 |
|                                          |                            |
|  +-------------------------------------------------------------+      |
|  |  External Services & Tools                                  |      |
|  |  |- Alibaba DashScope API  (qwen-plus + Embedding)          |      |
|  |  |- SearchAPI.io            (Baidu web search)              |      |
|  |  |- Jsoup                   (web scraping)                  |      |
|  |  +- MCP Servers (stdio / SSE):                              |      |
|  |       |- @amap/amap-maps-mcp-server (map tools)            |      |
|  |       +- ek-image-search-mcp-server (Pexels images)        |      |
|  +-------------------------------------------------------------+      |
|                                                                       |
|  +-------------------------------------------------------------+      |
|  |  Storage Layer                                              |      |
|  |  |- SimpleVectorStore      (in-memory RAG, default)         |      |
|  |  |- PgVector + PostgreSQL  (persistent RAG, production)     |      |
|  |  |- InMemoryChatMemory     (session memory, default)        |      |
|  |  +- FileBasedChatMemory    (Kryo disk persistence)          |      |
|  +-------------------------------------------------------------+      |
+-----------------------------------------------------------------------+
                    |
             stdio / SSE (MCP Protocol)
                    |
+-----------------------------------------------------------------------+
|  ek-image-search-mcp-server  (standalone JAR, stdio mode)             |
|  +- ImageSearchTool  ->  Pexels API                                   |
+-----------------------------------------------------------------------+
```

### Module Breakdown

```
src/main/java/com.eric.circuitagent/
|
+-- agent/            <- Core Agent execution engine
|   +-- BaseAgent          State machine + step-loop controller
|   +-- ReActAgent         Abstract Think / Act split
|   +-- ToolCallAgent      LLM -> tool dispatch -> context update
|   +-- EkManus            Concrete Agent: system prompt + tool binding
|
+-- app/              <- Application layer (scenario-specific)
|   +-- AlgorithmApp       RAG + memory + streaming entry point
|
+-- controller/       <- HTTP boundary
|   +-- AiController       REST + SSE routing
|
+-- tools/            <- Agent Tool implementations
|   +-- WebSearchTool
|   +-- WebScrapingTool
|   +-- FileOperationTool
|   +-- TerminalOperationTool
|   +-- ResourceDownloadTool
|   +-- PDFGenerationTool
|   +-- TerminateTool
|
+-- rag/              <- RAG pipeline components
|   +-- AlgorithmAppDocumentLoader      Markdown -> Document
|   +-- AlgorithmAppVectorStoreConfig   VectorStore initialization
|   +-- PgVectorVectorStoreConfig       Production PgVector variant
|   +-- MyKeywordEnricher               LLM-powered keyword metadata
|   +-- MyTokenTextSplitter             Custom chunking strategy
|   +-- QueryRewriter                   Pre-retrieval query rewriting
|   +-- AlgorithmAppRagCustomAdvisorFactory
|
+-- advisors/         <- Cross-cutting concerns (Spring AI Advisor chain)
|   +-- MyLoggerAdvisor    Request/response logging
|   +-- ReReadingAdvisor   Re-reading prompt augmentation
|
+-- chatmemory/       <- Custom memory backend
|   +-- FileBasedChatMemory   Kryo-serialized per-conversation disk files
|
+-- config/
    +-- CorsConfig
    +-- tools/ToolRegistration   Centralized tool bean registration
```

---

## 4. Key Data Flows

### Flow A — Algorithm Master (RAG Conversation)

```
User types: "What is quicksort and how does it work?"
|
v
[AlgorithmMaster.vue]
  sendMessage(message)
  -> EventSource: GET /api/ai/algorithm_app/chat/sse?message=...&chatId=love_xxx
|
v
[AiController.doChatWithAlgorithmAppSSE()]
  -> algorithmApp.doChatByStream(message, chatId)
|
v
[AlgorithmApp]
  1. QueryRewriter.doQueryRewrite(message)
     Calls LLM to produce a more retrieval-optimized query:
     "quicksort algorithm principle implementation steps complexity"
  |
  2. ChatClient.prompt()
       .advisors(
         MessageChatMemoryAdvisor   <- injects previous N messages
         MyLoggerAdvisor            <- logs request + response
         QuestionAnswerAdvisor      <- RAG retrieval
       )
       .stream()
  |
  [QuestionAnswerAdvisor -- internal]
    -> EmbeddingModel.embed(rewritten query)   calls DashScope Embedding API
    -> SimpleVectorStore.similaritySearch()    Top-K relevant document chunks
    -> Injects chunks into system prompt:
       "Use the following context to answer: ..."
  |
  3. LLM call -> DashScope qwen-plus
     Messages: [System(role + RAG context), ...history..., User(question)]
  |
  4. Flux<String> token stream
|
v
[HTTP Response: text/event-stream]
  data: Q\n
  data: uick\n
  data: sort\n ...
|
v
[Frontend EventSource.onmessage]
  messages.value[aiMessageIndex].content += data   <- reactive streaming
|
v
User sees the answer rendered in real time
```

---

### Flow B — Super Agent (EkManus ReAct Loop)

```
User types: "Search for the latest Spring Boot release and write a summary file"
|
v
[AiController.doChatWithManus(message)]
  new EkManus(allTools, dashscopeChatModel)
  -> ekManus.runStream(message)
|
v
[BaseAgent.runStream()]
  state = RUNNING
  CompletableFuture.runAsync(() -> {
  |
    +------- LOOP (step 1..20, or until FINISHED) -------+
    |                                                      |
    |  -- THINK ------------------------------------------  |
    |  ToolCallAgent.think()                               |
    |    Append nextStepPrompt to messageList              |
    |    Call LLM with full messageList + all tool schemas |
    |    Parse AssistantMessage.getToolCalls()             |
    |                                                      |
    |    LLM decides: "call searchWeb(Spring Boot latest)" |
    |    -> toolCallList is non-empty -> return true       |
    |                                                      |
    |  -- ACT --------------------------------------------  |
    |  ToolCallAgent.act()                                 |
    |    toolCallingManager.executeToolCalls()             |
    |    -> WebSearchTool.searchWeb(...)                   |
    |    -> returns Top-5 results as JSON string           |
    |    Update messageList with tool response             |
    |    sseEmitter.send("Step 1: Tool searchWeb returned")|
    |                                                      |
    |  -- NEXT THINK -------------------------------------  |
    |    LLM sees results -> decides to call writeFile()   |
    |    FileOperationTool writes summary to disk          |
    |    sseEmitter.send("Step 2: Tool writeFile returned")|
    |                                                      |
    |  -- NEXT THINK -------------------------------------  |
    |    LLM sees task complete -> calls doTerminate()     |
    |    TerminateTool returns "Task finished"             |
    |    state = FINISHED  -> loop exits                   |
    |                                                      |
    +------------------------------------------------------+
    sseEmitter.complete()
  })
|
v
[Frontend SSE -- SuperAgent.vue]
  Groups SSE chunks into message bubbles by sentence boundaries
  First response displays immediately; subsequent bubbles throttled
```

---

## 5. Core Modules Deep Dive

### Module 1 — Agent Hierarchy (`BaseAgent -> ReActAgent -> ToolCallAgent -> EkManus`)

This four-level inheritance chain implements the [ReAct pattern](https://arxiv.org/abs/2210.03629) (Reasoning + Acting) as a clean, extensible Java abstraction.

```
BaseAgent
|  - name, systemPrompt, nextStepPrompt
|  - state: AgentState (IDLE -> RUNNING -> FINISHED / ERROR)
|  - messageList: List<Message>   <- manually maintained context window
|  - maxSteps: int                <- prevents runaway loops
|  + run(userPrompt): String      <- blocking execution
|  + runStream(userPrompt): SseEmitter  <- async SSE execution
|  # abstract step(): String
|
+-- ReActAgent
|   # abstract think(): boolean   <- should we act?
|   # abstract act(): String      <- perform the action
|   + step() { return think() ? act() : "No action needed" }
|
+-- ToolCallAgent
|   - availableTools: ToolCallback[]
|   - toolCallingManager: ToolCallingManager
|   - chatOptions: ChatOptions  (internal tool execution DISABLED)
|   + think(): queries LLM, stores ChatResponse, returns hasToolCalls
|   + act(): executes tools, updates messageList, detects terminate signal
|
+-- EkManus   (@Component)
    - Injects all tools + DashScope ChatModel
    - Configures system prompt ("You are EkManus, an all-capable assistant...")
    - Sets maxSteps = 20
```

**Key design insight**: Internal tool execution is explicitly disabled in Spring AI (`withInternalToolExecutionEnabled(false)`). This gives the Agent full control over *when* tools run — essential for the ReAct pattern where we need to inspect tool calls before executing them, update context after each one, and decide whether to continue the loop.

---

### Module 2 — RAG Pipeline

The RAG pipeline follows the standard four-stage pattern with two enhancements: **query rewriting** (pre-retrieval) and **keyword metadata enrichment** (at indexing time).

```
INDEXING (at startup)
-----------------------------------------------------------------
classpath:documents/*.md
    |
    v  AlgorithmAppDocumentLoader
    MarkdownDocumentReader
    -> splits on horizontal rules (---)
    -> attaches filename + status metadata per chunk
    |
    v  MyKeywordEnricher
    KeywordMetadataEnricher (Spring AI)
    -> calls LLM to extract Top-5 keywords per chunk
    -> appends as metadata (enables hybrid search later)
    |
    v  SimpleVectorStore / PgVectorStore
    DashScope EmbeddingModel -> float[] vector per chunk
    Stored with metadata for retrieval

QUERY (per request)
-----------------------------------------------------------------
User question
    |
    v  QueryRewriter
    RewriteQueryTransformer (Spring AI RAG)
    -> LLM rewrites query to maximize retrieval recall
    |
    v  QuestionAnswerAdvisor (Spring AI)
    -> Embeds rewritten query
    -> VectorStore.similaritySearch(topK=4)
    -> Injects retrieved chunks into system prompt
    |
    v  LLM generates answer grounded in retrieved context
```

**Why query rewriting?**
Natural language questions often contain pronouns, colloquialisms, or incomplete phrasing that degrades vector search precision. The `RewriteQueryTransformer` rephrases the question into a form optimized for semantic similarity search *before* hitting the vector store.

**Why keyword enrichment?**
Embedding-only retrieval can miss exact-match terms (algorithm names, complexity notation). By extracting keywords at index time and storing them as metadata, we enable future hybrid search strategies (vector similarity + keyword filter) without re-indexing.

---

### Module 3 — Tool System

Tools are declared as Spring-managed beans annotated with `@Tool`. Spring AI automatically generates JSON schemas for each tool and passes them to the LLM as the function-calling schema.

```java
// Example: how a tool is declared
@Tool(description = "Search for information from Baidu Search Engine")
public String searchWeb(
    @ToolParam(description = "Search query keyword") String query) { ... }
```

All tools are centrally registered in `ToolRegistration.java` and exposed as a single `ToolCallback[]` bean (`allTools`), injected into both `EkManus` and `AlgorithmApp`:

| Tool | Capability |
|------|-----------|
| `WebSearchTool` | Baidu search via SearchAPI.io — returns Top-5 organic results |
| `WebScrapingTool` | Fetches and parses the HTML of any URL using Jsoup |
| `FileOperationTool` | Read/write files within a sandboxed working directory |
| `TerminalOperationTool` | Execute shell commands and capture stdout |
| `ResourceDownloadTool` | Download remote resources to local disk |
| `PDFGenerationTool` | Generate formatted PDF documents using iTextPDF |
| `TerminateTool` | Signals the Agent to exit the ReAct loop gracefully |

**The Terminate signal mechanism**: `TerminateTool.doTerminate()` returns `"Task finished"`. Inside `ToolCallAgent.act()`, after every tool execution batch, the code scans the `ToolResponseMessage` for any response whose tool name equals `"doTerminate"`. If found, `state` is set to `FINISHED` and the loop exits on the next iteration check. This gives the LLM a clean, protocol-defined way to end the Agent run rather than relying on the max-step limit.

---

### Module 4 — FileBasedChatMemory (Kryo Serialization)

Spring AI's `ChatMemory` interface requires persisting a `List<Message>` where `Message` is a sealed interface with multiple concrete implementations (`UserMessage`, `AssistantMessage`, `ToolResponseMessage`, etc.).

Standard JSON serializers struggle with this polymorphic hierarchy without significant type-registry overhead. The solution uses **Kryo 5** — a high-performance binary serializer that handles interface polymorphism natively:

```java
static {
    kryo.setRegistrationRequired(false);
    kryo.setInstantiatorStrategy(new StdInstantiatorStrategy());
}

// Each conversation -> one .kryo file
// File path: {BASE_DIR}/{conversationId}.kryo
```

This implementation is profile-switchable, making it easy to toggle between in-memory (fast, ephemeral) and disk-backed (persistent) memory without changing any application logic.

---

### Module 5 — MCP Server (`ek-image-search-mcp-server`)

The project includes a standalone Spring Boot application that acts as an **MCP (Model Context Protocol) server**, exposing a Pexels image search capability to the main backend via the MCP protocol.

```
Main backend (MCP Client)
        |
        |  stdio or SSE (MCP protocol)
        v
ek-image-search-mcp-server (standalone JAR)
        |
        v  ImageSearchTool.searchImage(query)
        -> GET https://api.pexels.com/v1/search
        -> returns list of medium-size image URLs
```

The MCP server is configured via `mcp-servers.json`:

```json
{
  "mcpServers": {
    "ek-image-search-mcp-server": {
      "command": "java",
      "args": [
        "-Dspring.ai.mcp.server.stdio=true",
        "-jar", "ek-image-search-mcp-server/target/...jar"
      ]
    }
  }
}
```

The main application launches the MCP server as a **child process** (stdio mode) and communicates via `ToolCallbackProvider`, meaning the image search capability is available to any LLM call without the main application knowing the implementation details.

---

## 6. Design Decisions and Trade-offs

### Decision 1 — Manual Message Context Management

**The problem**: The ReAct loop needs to accumulate conversation history *within a single HTTP request* — user message, then LLM tool-call decision, then tool response, then LLM re-reasoning. Spring AI's `ChatMemory` Advisor is designed for *cross-request* persistence keyed by `conversationId`. The granularity doesn't match.

**The choice**: `ToolCallAgent` maintains its own `List<Message> messageList` as an instance variable. After each `think()` / `act()` cycle, the list is extended with the new assistant message + tool response. The LLM always sees the full accumulated history.

**Trade-off**: No cross-request persistence for the Agent's working memory. A page refresh starts a fresh Agent. This is acceptable for a single-session demo; a production system would bind Agent instances to session IDs in a distributed cache.

---

### Decision 2 — Disable Spring AI's Built-in Tool Execution

**The problem**: Spring AI's `ChatClient` defaults to executing tool calls transparently and continuing the conversation automatically. For a ReAct Agent, this breaks the loop — we need full control over *when* tools run, the ability to *observe* results, *update context*, and *decide* whether to continue.

**The choice**:

```java
this.chatOptions = DashScopeChatOptions.builder()
    .withInternalToolExecutionEnabled(false)
    .build();
```

With internal execution disabled, `think()` retrieves the tool-call *intent* from the LLM without executing anything. `act()` then calls `ToolCallingManager.executeToolCalls()` explicitly, giving full observability into tool results before the next reasoning step.

**Trade-off**: More manual wiring code in `ToolCallAgent`. The gain is complete control over the ReAct loop — a necessary requirement for this pattern.

---

### Decision 3 — SimpleVectorStore for Development, PgVector for Production

**The problem**: Setting up PostgreSQL + pgvector for every development iteration adds friction during the exploration phase.

**The choice**: Two `VectorStore` configurations exist side-by-side:
- `AlgorithmAppVectorStoreConfig` -> `SimpleVectorStore` (active)
- `PgVectorVectorStoreConfig` -> `PgVectorStore` (ready, activation is a one-line change)

Both share the same document loading and enrichment pipeline. The PgVector configuration uses HNSW indexing with cosine distance for production-grade performance.

**Trade-off**: In-memory store re-embeds all documents on every startup. Acceptable for development; PgVector persists embeddings across restarts for production.

---

### Decision 4 — SSE over WebSocket for Streaming

**The problem**: Streaming LLM output and Agent step results to the browser in real time.

**The choice**: Server-Sent Events via `SseEmitter` (Spring MVC) for Agent streaming and `Flux<String>` (Project Reactor) for the RAG chat. The browser uses the native `EventSource` API — no library required, no handshake overhead.

**Why not WebSocket?** The communication is inherently unidirectional: server pushes, client only initiates. SSE is semantically correct for this pattern and significantly simpler to implement and proxy.

**Trade-off**: No in-flight cancellation from the client. A production system would need a `DELETE /ai/manus/chat/{sessionId}` endpoint paired with a cooperative interrupt mechanism in `BaseAgent`.

---

### Decision 5 — Kryo over JSON for Chat Memory Persistence

**The problem**: `FileBasedChatMemory` needs to serialize `List<Message>` where `Message` is a Spring AI interface with multiple concrete implementations. Jackson requires explicit `@JsonTypeInfo` configurations to handle polymorphic hierarchies correctly.

**The choice**: Kryo with `setRegistrationRequired(false)` serializes any object graph, including interface-typed collections, without annotation changes on the Spring AI model classes. It is also significantly faster than Jackson for this workload.

**Trade-off**: Kryo's binary format is not human-readable. Debugging conversation history requires programmatic deserialization. For a backend memory store that is read/written frequently but rarely inspected directly, this is an acceptable trade-off.

---

## 7. Engineering Lessons and Key Challenges

### Challenge 1 — Spring AI Version Matrix

Spring AI went through significant API changes between milestone releases. Code written against `1.0.0-M7` compiles but behaves differently than `1.0.0`. Strict version pinning via the BOM in `dependencyManagement` is essential.

**Lesson**: Use the `spring-ai-bom` and never mix Spring AI artifact versions manually. Always review the Spring AI changelog before upgrading.

---

### Challenge 2 — Embedding Cost at Startup

`SimpleVectorStore` calls the DashScope Embedding API for every document chunk at application startup. With a non-trivial knowledge base, this adds latency and real API costs on every restart.

**Lesson**: For development, keep the document corpus small. For production, switch to PgVector — once embedded, vectors survive restarts. Consider a background-init strategy for the vector store to avoid blocking application startup.

---

### Challenge 3 — SSE and Nginx Buffering

By default, Nginx buffers proxy responses. This causes SSE chunks to be held and flushed in batches, creating a "stutter" effect where large blocks of text appear at once instead of a smooth stream.

**Solution** in `nginx.conf`:

```nginx
location ^~ /api/ {
    proxy_buffering off;
    proxy_cache off;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    chunked_transfer_encoding off;
    proxy_read_timeout 600s;
}
```

**Lesson**: Any reverse proxy in front of an SSE backend needs explicit buffer-disabling configuration. This applies equally to AWS ALB, Cloudflare, and other proxies.

---

### Challenge 4 — Agent Context Window Growth

In the ReAct loop, `messageList` grows with every `think()` + `act()` cycle. A 20-step Agent run with verbose tool responses can accumulate thousands of tokens, potentially exceeding the model's context window.

**Solution applied**: `maxSteps = 20` as a hard safety limit. A more robust approach applies a sliding-window strategy — summarizing older steps into compressed context before they are dropped.

---

### Challenge 5 — Graceful Agent Termination

Early iterations of the Agent simply ran until `maxSteps` was reached, even when the task was functionally done. This wastes API quota and produces unnecessary output steps.

**Solution**: `TerminateTool` — the LLM can call `doTerminate()` at any point to signal completion. The `act()` method scans tool response names for `"doTerminate"` and flips `state = FINISHED`, which breaks the loop on the next iteration:

```java
boolean terminateToolCalled = toolResponseMessage.getResponses().stream()
    .anyMatch(response -> response.name().equals("doTerminate"));
if (terminateToolCalled) {
    setState(AgentState.FINISHED);
}
```

**Lesson**: Always give your Agent an explicit exit mechanism. Relying solely on step limits leads to over-running completed tasks and pollutes the output with unnecessary steps.

---

## 8. Rebuild Guide

If you want to implement a similar system from scratch, here is the build order and the decisions worth making upfront.

### Step-by-Step Build Order

**Step 1 — Minimal skeleton (verify LLM connectivity)**

```
CircuitAgentApplication.java
AiController.java          GET /ai/chat -> return LLM response string
application.yml            dashscope.api-key, server.port=8123
```

Make a single ChatClient call work before adding anything else.

**Step 2 — Add streaming (SSE)**

Switch the endpoint to return `Flux<String>` and verify the browser `EventSource` receives token-by-token output. This is the hardest integration point to debug if skipped.

**Step 3 — Add RAG (Algorithm App)**

```
1. Write .md documents in src/main/resources/documents/
2. AlgorithmAppDocumentLoader  (Markdown -> Document chunks)
3. AlgorithmAppVectorStoreConfig  (PgVector preferred)
4. QueryRewriter  (optional but improves recall meaningfully)
5. Wire QuestionAnswerAdvisor into ChatClient
6. Expose /algorithm_app/chat/sse endpoint
```

**Step 4 — Build the Agent layer (EkManus)**

```
1. BaseAgent  (state machine + step loop + SSE emitter)
2. ReActAgent  (think/act template)
3. ToolCallAgent  (LLM call -> tool dispatch -> context update)
   Set withInternalToolExecutionEnabled(false) -- critical
4. Start with 2 tools: WebSearchTool + TerminateTool
5. Verify the loop terminates correctly on small tasks
6. Add remaining tools one at a time
7. EkManus (system prompt + tool binding)
8. Expose /manus/chat SSE endpoint
```

**Step 5 — Frontend**

```
Vue 3 + Vite + Vue Router
Views: AlgorithmMaster.vue (streaming into a single expanding bubble)
       SuperAgent.vue      (streaming into per-step message bubbles)
api/index.js: wrap EventSource, expose chatWithManus() chatWithLoveApp()
```

**Step 6 — MCP (optional, add last)**

Build `ek-image-search-mcp-server` as a separate Spring Boot project with `spring-ai-starter-mcp-server`. Verify it works standalone, then integrate via `mcp-servers.json`.

---

### Critical Decisions to Make Upfront

| Decision | Recommendation |
|----------|---------------|
| Vector store | Start with PgVector (Docker: `ankane/pgvector`), not SimpleVectorStore |
| Tool execution control | Always set `withInternalToolExecutionEnabled(false)` for ReAct |
| Agent session model | Bind Agent instances to sessionId in a `ConcurrentHashMap` or Redis from day one |
| SSE timeout | Set `SseEmitter(300_000L)` (5 min) to handle long Agent runs |
| Context window | Implement a max-token check or sliding window before passing messageList to LLM |

---

### Common Pitfalls

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| Spring AI version mismatch | Compile errors or silent behavioral changes | Use the BOM; lock all spring-ai versions to one release |
| Nginx SSE buffering | Stutter / batched output instead of smooth streaming | `proxy_buffering off` + `proxy_cache off` |
| Context window overrun | LLM error or mid-response truncation | Bound `messageList` with a sliding window or token count check |
| SimpleVectorStore at scale | Slow startup + repeated embedding API costs | Switch to PgVector for any persistent corpus |
| Agent never terminates | Runs to maxSteps every time, even on trivial tasks | Always include `TerminateTool` in the tool set |
| Missing terminate check | Loop exits only on maxSteps — wasteful | Scan `ToolResponseMessage` names for `"doTerminate"` in `act()` |

---

## Running Locally

### Backend

```bash
# Configure keys (do not commit to version control)
# spring.ai.dashscope.api-key: <your-key>
# search-api.api-key: <your-searchapi.io-key>

./mvnw spring-boot:run
# API at http://localhost:8123/api
# Swagger UI: http://localhost:8123/api/swagger-ui.html
```

### Frontend

```bash
cd ek-ai-agent-frontedend
npm install
npm run dev
# Dev server at http://localhost:5173
```

### MCP Image Search Server (optional)

```bash
cd ek-image-search-mcp-server
./mvnw package -DskipTests
# Launched automatically by the main app via mcp-servers.json
# Requires spring.pexels.api-key in application.yml
```

---

## Project Structure

```
Circuit Agent/
+-- pom.xml                          Spring Boot 3 backend
+-- src/
|   +-- main/
|       +-- java/com.eric.circuitagent/
|       |   +-- agent/               ReAct Agent engine
|       |   +-- app/                 Application scenarios
|       |   +-- controller/          HTTP endpoints
|       |   +-- tools/               Agent tool set (7 tools)
|       |   +-- rag/                 RAG pipeline components
|       |   +-- advisors/            Spring AI Advisor chain
|       |   +-- chatmemory/          Custom memory backends
|       |   +-- config/              CORS + tool registration
|       +-- resources/
|           +-- application.yml
|           +-- documents/           Algorithm knowledge base (.md)
|           +-- mcp-servers.json     MCP server configuration
|
+-- ek-ai-agent-frontedend/          Vue 3 + Vite frontend
|   +-- src/
|   |   +-- views/                   Home, AlgorithmMaster, SuperAgent
|   |   +-- components/              ChatRoom, AppFooter
|   |   +-- api/index.js             SSE + REST client
|   |   +-- router/index.js          Vue Router configuration
|   +-- Dockerfile                   Multi-stage build (node -> nginx)
|   +-- nginx.conf                   SPA routing + SSE proxy config
|
+-- ek-image-search-mcp-server/      Standalone MCP server
    +-- src/main/java/.../
        +-- tools/ImageSearchTool.java   Pexels API integration
```

---

## References

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — the academic paper behind the ReAct pattern
- [Spring AI Reference Documentation](https://docs.spring.io/spring-ai/reference/) — official Spring AI guides
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) — Anthropic's open tool protocol standard
- [OpenManus](https://github.com/mannaandpoem/OpenManus) — open-source Agent framework that inspired the Agent hierarchy design

