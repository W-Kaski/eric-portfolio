---
title: Cloud Gallery
category: Fullstack
color: "#10B981"
date: 2025-03-01
github: "https://github.com/W-Kaski/ek-cloud-gallery-backend"
demo: "https://gallery.ek-flowity.site/"
---
A Full-Stack Cloud Image Management Platform

![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.7.6-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-11-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-session_store-DC382D?style=flat-square&logo=redis&logoColor=white)
![Tencent COS](https://img.shields.io/badge/Tencent_COS-object_storage-006EFF?style=flat-square)
![WebSocket](https://img.shields.io/badge/WebSocket-collaborative_editing-brightgreen?style=flat-square)
![Sa-Token](https://img.shields.io/badge/Sa--Token-RBAC_auth-orange?style=flat-square)

---

## Overview

EK Cloud Gallery is a full-stack cloud image management platform I built to explore what it actually takes to architect a system that goes far beyond a simple image hosting service.

At its core, the platform manages image assets organized into **Spaces** — isolated storage units with configurable quotas, fine-grained role-based access control, and real-time collaborative editing. Both a public gallery (with a content review workflow) and private/team spaces are supported.

The platform ships several capabilities that required non-trivial engineering decisions:

- **Multi-tier permission system** — system-level roles (user/admin) and space-level roles (viewer/editor/admin) running in parallel via a dual-token Sa-Token setup
- **Tencent COS image pipeline** — upload once, automatically generate a WebP-compressed version, a thumbnail, and extract the dominant color — all via COS CI rules
- **Real-time collaborative editing** — WebSocket-based multi-user image editing with a Disruptor-backed message queue and a lock-editor model
- **Color similarity search** — search for images within a space by dominant color using custom RGB similarity scoring
- **Batch image import** — auto-scrape and import images from Bing Images using Jsoup
- **Space analytics** — 5 dimensions of usage data (storage usage, category breakdown, tag cloud, size distribution, upload trends) rendered with ECharts

> **Why build this?**
> I wanted to understand the full complexity behind a cloud storage product that real teams use: quota management, permission isolation, content moderation, collaborative workflows, and analytics — all in one codebase, from database schema to frontend components.

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

A simple image host answers one question: *"Where do I store this file?"*

This project answers a harder set of questions that emerge when teams actually use such a system:

- **Isolation**: How do I ensure that User A's private images are never visible to User B?
- **Quota**: How do I enforce that a space can only consume 100MB and 500 images — atomically, without race conditions?
- **Permissions**: How do I let a team space have viewers who can browse, editors who can upload, and admins who can invite members — all with different capabilities on the same resource?
- **Content Governance**: How do I allow public image uploads while preventing inappropriate content from going live without review?
- **Collaboration**: How do multiple users coordinate editing the same image without stepping on each other?
- **Discoverability**: How do I help users find images they barely remember — by color, by tag, by category?

**Core design goals:**

| Goal | Implementation |
|------|---------------|
| Storage isolation | `Space` entity as the unit of isolation; `picture.spaceId IS NULL` = public gallery |
| Quota enforcement | `space.totalSize` + `space.totalCount` counters updated atomically with image uploads/deletes |
| Fine-grained permissions | Dual Sa-Token StpLogic: system role (user/admin) + space role (viewer/editor/admin) |
| Content moderation | Review workflow on public gallery images; admins auto-approve their own uploads |
| Real-time collaboration | WebSocket with Disruptor queue + lock-editor protocol |
| Image intelligence | COS CI pipeline: WebP compression, thumbnail generation, dominant color extraction |
| Semantic search | HSL-normalized color similarity search ranked by RGB distance |
| Analytics | 5-dimension space analytics via SQL aggregation + ECharts visualization |

---

## 2. Tech Stack Breakdown

### Frontend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Vue 3** (Composition API + `<script setup>`) | SPA framework | `<script setup>` keeps business logic colocated with the template; TypeScript integration is first-class; reactive `ref` maps cleanly to API state |
| **Vite 6** | Build tool | Near-instant HMR; native ESM avoids Webpack bundle overhead; fastest possible dev iteration |
| **Ant Design Vue 4** | UI component library | Enterprise-grade components (Table, Form, Modal, Descriptions, Progress) — the management console UI needs these out of the box, not hand-rolled |
| **Pinia 2** | State management | Official Vue 3 recommendation; TypeScript-friendly; stores the global login user (`useLoginUserStore`) with a one-time fetch-on-first-navigation pattern |
| **Axios 1** | HTTP client | Interceptor at response level catches `code === 40100` (not logged in) globally and redirects to `/user/login` — no per-component error handling needed |
| **ECharts + vue-echarts** | Data visualization | Powers the Space Analytics page: pie charts for categories, bar charts for size distribution, tag word cloud (`echarts-wordcloud`), line chart for upload trends |
| **vue-cropper** | Image cropping | Client-side image crop before upload — reduces wasted bandwidth on unwanted image regions |
| **vue3-colorpicker** | Color picker input | Drives the "Search by Color" feature; emits hex color strings on change |
| **@umijs/openapi** | API client code generation | Generates TypeScript function stubs and type definitions directly from the backend's Knife4j OpenAPI JSON — eliminates manual API synchronization errors |

### Backend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Spring Boot 2.7.6** (Java 11) | Application framework | Mature, stable ecosystem; 2.7.x is the last major 2.x LTS release — chosen for compatibility with the full dependency set without requiring Java 17+ |
| **MyBatis-Plus 3.5.9** | ORM / data access | Provides `ServiceImpl` CRUD abstraction, pagination plugin, and `@TableLogic` soft delete — dramatically reduces SQL boilerplate while keeping SQL fully readable when needed |
| **Sa-Token 1.39.0** | Authentication and authorization | Lightweight session-based auth with Redis storage (distributable), a pluggable `StpInterface` for custom permission logic, and multi-type token support — significantly simpler than Spring Security for RBAC |
| **Tencent COS SDK** | Object storage | Chosen for COS CI (Cloud Infinity): a single upload triggers a processing pipeline that generates a WebP version, a thumbnail, and returns the dominant color average — features not available in basic S3-compatible APIs |
| **Redis** | Session store | Sa-Token stores sessions in Redis, making the application horizontally scalable; also pre-wired for caching via Caffeine L1 + Redis L2 |
| **Caffeine 3** | Local L1 cache | Declared in `pom.xml`; provides a local in-process cache layer in front of Redis for hot-path reads |
| **Spring WebSocket** | Real-time messaging | Enables the collaborative image editing feature; bidirectional communication between multiple clients on the same image |
| **LMAX Disruptor 3.4.2** | High-performance message queue | Decouples WebSocket IO thread (receives messages) from business processing thread (validates, routes, broadcasts); prevents slow business logic from blocking the WebSocket handler |
| **Jsoup 1.15.3** | HTML parser | Scrapes Bing Images search result pages to batch-import images from the web |
| **Knife4j 4.4.0** | API documentation | Enhanced Swagger UI; generates the OpenAPI JSON consumed by `@umijs/openapi` on the frontend |
| **Hutool 5.8.26** | Java utility library | Covers JSON, HTTP, Bean copy, reflection, file utilities in one dependency — reduces boilerplate throughout |
| **Lombok 1.18.30** | Code generation | Eliminates getter/setter/constructor for domain entities and DTOs |

### Database

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **MySQL 8** | Primary relational database | Strong ACID transactions are critical for atomic quota updates (image insert + space counter must commit or roll back together); `DATE_FORMAT` and `YEARWEEK` functions used directly in analytics queries |

**Schema design highlights:**
- `picture.spaceId IS NULL` signals public gallery membership (no explicit "public gallery" table)
- `picture.tags` stored as a JSON string (`VARCHAR(512)`) — avoids join tables but prevents efficient SQL-level tag aggregation
- `space.totalSize` and `space.totalCount` are pre-computed counters updated transactionally — O(1) quota reads instead of `COUNT(*)`/`SUM()` on the picture table
- `isDelete` on every entity (`@TableLogic`) enables soft delete globally without explicit `WHERE isDelete = 0` in every query

### Infrastructure

| Layer | Technology |
|-------|-----------|
| Object Storage | Tencent Cloud COS (with CI image processing pipeline) |
| Session Store | Redis (Sa-Token integration via `sa-token-redis-jackson`) |
| API Documentation | Knife4j (OpenAPI 2, `/swagger-ui.html`) |
| Build | Maven (backend) + Vite (frontend) |
| Frontend Dev Server | `npm run dev` (port 3000) |
| Backend Port | 8123 (context path: `/api`) |

---

## 3. System Architecture

**Overall style: Frontend/Backend Separation + Spring Boot Monolith**

```
+------------------------------------------------------------------------+
|                        Browser (Vue 3 SPA)                             |
|                                                                        |
|  +-----------+  +------------------+  +----------------------------+   |
|  |  Home     |  |  Public Gallery  |  |  Space Detail              |   |
|  |  (search  |  |  (review status) |  |  (quota progress,          |   |
|  |   tags)   |  +------------------+  |   color search,            |   |
|  +-----------+                        |   batch edit,              |   |
|                                       |   member management)       |   |
|  +------------------+  +----------------------------+              |   |
|  |  Picture Detail  |  |  Space Analytics           |              |   |
|  |  (download,      |  |  (ECharts: category, tags, |              |   |
|  |   share, edit)   |  |   size dist, trends)       |              |   |
|  +------------------+  +----------------------------+              |   |
|                   REST (Axios) / WebSocket                          |   |
+------------------------------------------------------------------------+
                              |
                     HTTP / WebSocket
                              |
+------------------------------------------------------------------------+
|           Spring Boot Backend  (port 8123, context: /api)              |
|                                                                        |
|  Controller Layer                                                      |
|  +- UserController          /user/*                                    |
|  +- PictureController       /picture/*  (largest: upload, review,      |
|  |                                        batch import, color search)  |
|  +- SpaceController         /space/*                                   |
|  +- SpaceUserController     /spaceUser/*                               |
|  +- SpaceAnalyzeController  /space/analyze/*                           |
|  +- FileController          /file/*  (legacy/test only)                |
|                    direct method call                                  |
|  Service Layer                                                         |
|  +- PictureServiceImpl     (629 lines — core business logic)           |
|  +- SpaceServiceImpl       (quota enforcement, creation lock)          |
|  +- SpaceAnalyzeServiceImpl (5-dimension analytics)                    |
|  +- SpaceUserServiceImpl   (team membership management)                |
|  +- UserServiceImpl        (login, session, role check)                |
|                    direct method call                                  |
|  Manage Layer (Infrastructure Abstraction)                             |
|  +- CosManager             (COS SDK wrapper: upload, delete, CI)       |
|  +- upload/                (PictureUploadTemplate: File + URL modes)   |
|  +- auth/                  (StpInterfaceImpl: dynamic permission)      |
|  +- websocket/             (PictureEditHandler + Disruptor pipeline)   |
|                                                                        |
|  AOP Layer                                                             |
|  +- AuthInterceptor         (@AuthCheck annotation → role gate)        |
|                                                                        |
+------------------------------------------------------------------------+
          |                          |
          v                          v
       MySQL                      Tencent COS
  (4 tables: user,            (images, WebP versions,
   picture, space,             thumbnails, stored at
   space_user)                 public/{userId}/ or
                               space/{spaceId}/)
          |
          v
        Redis
  (Sa-Token sessions,
   distributed lock ready)
```

### Backend Package Structure

```
com.eric.ekcloudgallerybackend/
|
+-- controller/          <- HTTP boundary: request parsing, auth annotations
|   +-- UserController
|   +-- PictureController
|   +-- SpaceController
|   +-- SpaceUserController
|   +-- SpaceAnalyzeController
|   +-- FileController   (@Deprecated path, kept for testing)
|
+-- service/             <- Business logic interfaces + implementations
|   +-- impl/
|       +-- PictureServiceImpl    (upload, review, batch import, color search)
|       +-- SpaceServiceImpl      (creation lock, quota fill)
|       +-- SpaceAnalyzeServiceImpl
|       +-- SpaceUserServiceImpl
|       +-- UserServiceImpl
|
+-- manage/              <- Infrastructure abstraction
|   +-- CosManager               COS API wrapper
|   +-- FileManager              (@Deprecated — replaced by upload templates)
|   +-- upload/
|   |   +-- PictureUploadTemplate  (abstract: validate + upload + build result)
|   |   +-- FilePictureUpload      (MultipartFile subclass)
|   |   +-- UrlPictureUpload       (URL download subclass)
|   +-- auth/
|   |   +-- StpInterfaceImpl       (Sa-Token custom permission resolver)
|   |   +-- SpaceUserAuthManager   (role → permission set mapping)
|   |   +-- StpKit                 (dual StpLogic instances)
|   +-- websocket/
|       +-- PictureEditHandler      (WS lifecycle: connect/message/close)
|       +-- WsHandshakeInterceptor  (Sa-Token verification at handshake)
|       +-- disruptor/
|           +-- PictureEditEventProducer    (publishes to RingBuffer)
|           +-- PictureEditEventWorkHandler (consumes from RingBuffer)
|
+-- model/
|   +-- entity/          User, Picture, Space, SpaceUser
|   +-- dto/             Request objects per controller
|   +-- vo/              View objects (safe data for API responses)
|   +-- enums/           SpaceTypeEnum, SpaceLevelEnum, SpaceRoleEnum, ...
|
+-- mapper/              MyBatis-Plus mappers (auto-generated CRUD)
+-- aop/                 AuthInterceptor (@AuthCheck annotation processing)
+-- annotation/          @AuthCheck definition
+-- config/              CosClientConfig, CorsConfig, JsonConfig, MybatisPlusConfig
+-- exception/           ErrorCode enum, BusinessException, ThrowUtils
+-- constant/            UserConstant
```

---

## 4. Key Data Flows

### Flow A — Uploading a Picture to a Private Space

```
User selects a file on AddPicturePage.vue
    |
    | uploadPictureUsingPost(formData, { spaceId })
    v
[POST /api/picture/upload]
    |
    v
PictureController.uploadPicture()
    Sa-Token: @SaSpaceCheckPermission("picture:upload")
    StpInterfaceImpl.getPermissionList()
      -> queries SpaceUser by (spaceId, userId) -> returns role -> maps to permissions
    |
    v
PictureServiceImpl.uploadPicture(file, request, loginUser)
    |
    +-- 1. Load Space, check quota:
    |      space.totalCount >= space.maxCount  -> throw "quota exceeded"
    |      space.totalSize  >= space.maxSize   -> throw "storage full"
    |
    +-- 2. Determine upload strategy:
    |      instanceof String -> UrlPictureUpload
    |      MultipartFile    -> FilePictureUpload
    |
    v
PictureUploadTemplate.uploadPicture(inputSource, "space/{spaceId}")
    |
    +-- validPicture()       -> size check, format check (jpeg/png/jpg/webp)
    +-- getOriginFilename()  -> original file name
    +-- processFile()        -> write input to local temp file
    |
    v
CosManager.putPictureObject(uploadPath, tempFile)
    |
    | PicOperations (COS CI):
    |   Rule 1: imageMogr2/format/webp  -> generates {name}.webp (compressed)
    |   Rule 2: imageMogr2/thumbnail/256x256>  -> generates {name}_thumbnail.{ext}
    |
    <- PutObjectResult:
         ImageInfo  { width, height, format, Ave (dominant color hex) }
         CIObject[] { compressedCiObject, thumbnailCiObject }
    |
    v
PictureUploadTemplate.buildResult()
    -> url           = COS host + compressedCiObject.key  (WebP version)
    -> thumbnailUrl  = COS host + thumbnailCiObject.key
    -> picColor      = ColorTransformUtils.getStandardColor(Ave)
       (maps raw Ave color to nearest standard color for grouping)
    |
    v
PictureServiceImpl (continues)
    |
    +-- fillReviewParams():
    |      isAdmin -> reviewStatus = PASS  (auto-approved)
    |      else    -> reviewStatus = REVIEWING
    |
    +-- TransactionTemplate.execute():
    |      picture.saveOrUpdate()                 [INSERT picture row]
    |      space.lambdaUpdate()
    |           .setSql("totalSize = totalSize + " + picSize)
    |           .setSql("totalCount = totalCount + 1")
    |           .update()                         [UPDATE space row]
    |      -- atomic: both commit or both roll back --
    |
    v
return PictureVO -> Controller -> HTTP 200 JSON
    |
    v
Frontend: message.success("Upload succeeded")
```

---

### Flow B — Color Similarity Search

```
User picks a color in the color picker on SpaceDetailPage.vue
    |
    | onColorChange(hexColor)
    | searchPictureByColorUsingPost({ picColor: "#3A7BD5", spaceId })
    v
[POST /api/picture/search/color]
    |
    v
PictureServiceImpl.searchPictureByColor(spaceId, "#3A7BD5", loginUser)
    |
    +-- 1. Verify caller owns the space
    +-- 2. Load ALL pictures in the space that have a picColor field:
    |         SELECT * FROM picture WHERE spaceId = ? AND picColor IS NOT NULL
    |         (⚠ full in-memory load — performance concern at scale)
    |
    +-- 3. Color.decode("#3A7BD5") -> target Color object
    +-- 4. Stream.sorted(by ColorSimilarUtils.calculateSimilarity(target, picture.picColor))
    |         -> higher similarity = closer to top
    +-- 5. .limit(12)  -> top 12 most visually similar
    |
    v
return List<PictureVO> (12 items) -> frontend replaces dataList
```

---

### Flow C — Real-Time Collaborative Picture Editing

```
User A opens PictureEditPage for pictureId=123
    |
    | WebSocket: ws://api/ws/picture/edit/123?token=...
    v
WsHandshakeInterceptor.beforeHandshake()
    -> Validates Sa-Token from ?token= query param
    -> Queries User from DB, stores in session attributes { user, pictureId }
    |
    v
PictureEditHandler.afterConnectionEstablished(session)
    -> pictureSessions[123].add(session)
    -> broadcast to all: "User A joined editing"

User A sends: { "type": "ENTER_EDIT" }
    |
    v
handleTextMessage(session, message)
    -> JSON parse -> PictureEditRequestMessage
    -> pictureEditEventProducer.publishEvent(msg, session, user, pictureId=123)
       [publishes to Disruptor RingBuffer -- non-blocking]
    |
    v
PictureEditEventWorkHandler.onEvent(event)  [async worker thread]
    -> type = ENTER_EDIT
    -> PictureEditHandler.handleEnterEditMessage()
         if !pictureEditingUsers.containsKey(123):
             pictureEditingUsers[123] = userId_A
             broadcast: "User A started editing"
             (all observers now know A holds the edit lock)

User A sends: { "type": "EDIT_ACTION", "editAction": "ROTATE_LEFT" }
    |
    v
handleEditActionMessage()
    -> editingUserId = pictureEditingUsers[123]   // must be userId_A
    -> broadcast to ALL EXCEPT User A's session:
       { type: "EDIT_ACTION", editAction: "ROTATE_LEFT", user: UserVO_A }
       (User A already applied it locally; others mirror the action)

User A sends: { "type": "EXIT_EDIT" }
    |
    v
handleExitEditMessage()
    -> pictureEditingUsers.remove(123)
    -> broadcast: "User A exited editing"
    (edit lock released; any other user can now claim it)

Connection closed (browser tab closed / network drop)
    |
    v
afterConnectionClosed()
    -> auto-triggers handleExitEditMessage() to release edit lock
    -> removes session from pictureSessions[123]
    -> broadcast: "User A left editing"
```

---

### Flow D — Space Analytics (Tag Dimension)

```
User opens SpaceAnalyzePage for spaceId=42
    |
    | getSpaceTagAnalyzeUsingPost({ spaceId: 42 })
    v
[POST /api/space/analyze/tag]
    |
    v
SpaceAnalyzeServiceImpl.getSpaceTagAnalyze()
    |
    +-- checkSpaceAnalyzeAuth() -> space owner or admin only
    +-- fillAnalyzeQueryWrapper() -> WHERE spaceId = 42
    +-- SELECT tags FROM picture WHERE spaceId = 42
    |       returns: ['["landscape","nature"]', '["nature","travel"]', ...]
    |
    +-- Java Stream processing:
    |       .flatMap(tagsJson -> JSONUtil.toList(tagsJson, String.class).stream())
    |       -> flattens all tag arrays: ["landscape","nature","nature","travel",...]
    |       .collect(groupingBy(tag -> tag, counting()))
    |       -> { "nature": 2, "landscape": 1, "travel": 1 }
    |       .sorted(by count DESC)
    |
    v
return List<SpaceTagAnalyzeResponse>
    -> frontend renders as ECharts word cloud (size ∝ count)
```

---

## 5. Core Modules Deep Dive

### Module 1 — PictureUploadTemplate (Template Method Pattern)

**Responsibility**: Abstract the complete picture upload pipeline so that file-based and URL-based uploads share identical processing, differing only in how the source is acquired.

**Core logic:**

```
PictureUploadTemplate (abstract)
|
|  uploadPicture(inputSource, uploadPathPrefix)  <- fixed skeleton
|    1. validPicture(inputSource)     <-- abstract
|    2. getOriginFilename(inputSource) <-- abstract
|    3. processFile(inputSource, tempFile) <-- abstract
|    4. CosManager.putPictureObject(path, tempFile)
|    5. buildResult(CIObject, imageInfo)
|    6. finally: deleteTempFile()
|
+-- FilePictureUpload  (MultipartFile)
|    validPicture()   -> size <= 10MB, suffix in {jpeg,png,jpg,webp}
|    processFile()    -> multipartFile.transferTo(tempFile)
|
+-- UrlPictureUpload  (URL string)
     validPicture()   -> Hutool HttpUtil.head() to verify URL is reachable,
                         Content-Type must be image/*, Content-Length <= 10MB
     processFile()    -> HttpUtil.downloadFile(url, tempFile)
```

**Why Template Method here?**
- The upload pipeline steps are identical for both sources; only data acquisition differs
- Adding a new source (e.g., Base64, cloud-to-cloud copy) requires only a new subclass — zero changes to the shared pipeline
- `FileManager` was the original flat implementation; it is now `@Deprecated` but still exists as dead code — a visible signal of the refactoring history

**Design assessment:**
- ✅ Correctly applied; extension is straightforward
- ✅ `finally` block guarantees temp file cleanup even on exception
- ⚠️ `FileManager.java` is annotated `@Deprecated` but not deleted — creates confusion for anyone reading the codebase for the first time

---

### Module 2 — Dual Sa-Token Authorization System

**Responsibility**: Enforce two independent permission dimensions simultaneously — system-level user roles and space-level member roles — using Sa-Token's multi-type token architecture.

**How it works:**

```
Two independent StpLogic instances (via StpKit):
  StpKit.USER  (loginType = "user")   -> tracks login/logout, roles: user/admin
  StpKit.SPACE (loginType = "space")  -> tracks space-scoped permissions

StpInterfaceImpl (implements StpInterface, called by Sa-Token on every @SaCheckPermission)
|
|  getPermissionList(loginId, loginType="space"):
|
|    Step 1 — Parse request context
|      HTTP body (JSON) or query params -> SpaceUserAuthContext { spaceId?, pictureId?, spaceUserId? }
|      Request URI prefix ("picture" / "space" / "spaceUser") disambiguates generic "id" field
|
|    Step 2 — Determine identity
|      loginUser = StpKit.SPACE.getSessionByLoginId(loginId).get(USER_LOGIN_STATE)
|
|    Step 3 — Permission resolution waterfall
|      if no context fields -> public gallery access -> ADMIN_PERMISSIONS (full access)
|      if spaceUser object in context -> getPermissionsByRole(spaceUser.spaceRole)
|      if spaceUserId -> query SpaceUser table -> get role -> map permissions
|      if spaceId only -> load Space
|        if PRIVATE space: owner or admin -> ADMIN_PERMISSIONS; else -> []
|        if TEAM space: query SpaceUser -> getPermissionsByRole
|      if pictureId only -> load Picture -> derive spaceId -> recurse above

SpaceUserAuthManager: role -> permissions mapping
  "admin"  -> [picture:view, picture:upload, picture:edit, picture:delete, spaceUser:manage]
  "editor" -> [picture:view, picture:upload, picture:edit]
  "viewer" -> [picture:view]
```

**Controller annotation usage:**

```java
// System-level: only admin users can batch-import pictures
@AuthCheck(necessaryRole = "admin")
public BaseResponse<Integer> uploadPictureByBatch(...)

// Space-level: must have picture:upload permission in the request's space context
@SaSpaceCheckPermission(SpaceUserPermissionConstant.PICTURE_UPLOAD)
public BaseResponse<PictureVO> uploadPicture(...)
```

**Design assessment:**
- ✅ Clean separation of concerns: system role vs. space role never interfere
- ✅ The request-context parsing approach means controllers need zero boilerplate permission code
- ✅ `SpaceUserAuthManager` makes the role→permission mapping easy to audit and extend
- ⚠️ **Known bug** (cited in the code itself, line 107 of `StpInterfaceImpl`): *"This will cause admins to have no permissions in private spaces — can query the DB again to handle"* — a TODO that was never fixed
- ⚠️ URI path parsing via string splitting (`StrUtil.subBefore`) is fragile — any URL restructuring breaks permission resolution silently
- ⚠️ Each permission check can trigger 2–3 DB queries; no caching on the permission resolution path

---

### Module 3 — WebSocket + Disruptor Collaborative Editing

**Responsibility**: Enable multiple users to observe and mirror each other's editing actions on the same picture in real time, with low latency and without blocking the WebSocket I/O thread.

**Core state (single-node, in-memory):**

```java
// In PictureEditHandler (@Component singleton):
Map<Long, Long>                pictureEditingUsers  // pictureId -> userId of current editor
Map<Long, Set<WebSocketSession>> pictureSessions    // pictureId -> all connected sessions
```

**Message protocol:**

| Client → Server | Server → All Clients | Purpose |
|----------------|---------------------|---------|
| `{ type: "ENTER_EDIT" }` | `{ type: "ENTER_EDIT", user: ... }` | Claim exclusive edit lock |
| `{ type: "EDIT_ACTION", editAction: "ROTATE_LEFT" }` | broadcast to others | Mirror action on observer screens |
| `{ type: "EXIT_EDIT" }` | `{ type: "EXIT_EDIT", user: ... }` | Release edit lock |

**Disruptor pipeline:**

```
WebSocket IO thread
    |
    | session.onMessage() -> handleTextMessage()
    |   [non-blocking: just publish to ring buffer]
    v
Disruptor RingBuffer (size=1024, ProducerType.MULTI)
    |
    v
PictureEditEventWorkHandler.onEvent()  [dedicated worker thread]
    -> switch(type):
         ENTER_EDIT  -> handleEnterEditMessage()
         EDIT_ACTION -> handleEditActionMessage()
         EXIT_EDIT   -> handleExitEditMessage()
```

**Why Disruptor over a simple BlockingQueue?**
Disruptor uses a lock-free ring buffer with mechanical-sympathy optimizations (cache line padding, memory barriers). For a WebSocket application where an I/O thread receives messages at high frequency, even brief lock contention on a BlockingQueue degrades tail latency. Disruptor eliminates this at the cost of slightly more configuration complexity.

**Design assessment:**
- ✅ Disruptor decoupling means a slow business handler never blocks incoming WebSocket messages
- ✅ Lock-editor model (`pictureEditingUsers`) is simple and correct for the use case (image editing operations are coarse-grained, not character-level)
- ✅ `afterConnectionClosed()` auto-releases the edit lock on disconnect — no orphaned locks
- ⚠️ **Critical scalability issue**: All session state lives in the JVM heap. Deploying two backend instances means `pictureSessions` and `pictureEditingUsers` diverge immediately — collaborative editing breaks under horizontal scaling. Fix requires Redis Pub/Sub for cross-instance broadcast
- ⚠️ `broadcastToPicture()` instantiates a `new ObjectMapper()` on every call — should be an injected singleton bean; this is a measurable performance regression under load
- ⚠️ Edit actions are intent-only (`"ROTATE_LEFT"`) — the client is responsible for applying the same transformation. If frontend state diverges, there is no reconciliation mechanism

---

### Module 4 — SpaceServiceImpl (Quota and Creation Lock)

**Responsibility**: Create spaces with correct quota defaults, enforce one-space-per-type-per-user, and update quota atomically alongside image operations.

**Creation flow with distributed-unsafe lock:**

```java
// SpaceServiceImpl.addSpace()
String lock = String.valueOf(userId).intern();  // JVM string pool "lock"
synchronized (lock) {
    transactionTemplate.execute(status -> {
        boolean exists = this.lambdaQuery()
                .eq(Space::getUserId, userId)
                .eq(Space::getSpaceType, space.getSpaceType())
                .exists();
        ThrowUtils.throwIf(exists, OPERATION_ERROR, "One space per type per user");
        this.save(space);
        if (TEAM type) {
            spaceUserService.save(new SpaceUser(spaceId, userId, ADMIN));
        }
        return space.getId();
    });
}
```

**Space level → quota mapping:**

```
SpaceLevelEnum:
  COMMON (0) -> maxSize = 100MB,  maxCount = 100
  PLUS   (1) -> maxSize = 1GB,    maxCount = 1000
  PRO    (2) -> maxSize = 10GB,   maxCount = 10000
```

**Quota update (transactional):**

```java
transactionTemplate.execute(status -> {
    picture.saveOrUpdate();
    spaceService.lambdaUpdate()
        .eq(Space::getId, spaceId)
        .setSql("totalSize = totalSize + " + picSize)
        .setSql("totalCount = totalCount + 1")
        .update();
    return picture;
});
```

**Design assessment:**
- ✅ Pre-computed `totalSize`/`totalCount` counters give O(1) quota reads
- ✅ Transactional coupling of image insert + quota update prevents counter drift
- ✅ `SpaceLevelEnum` centralizes quota configuration cleanly
- ⚠️ `String.intern()` + `synchronized` is a single-JVM lock — invalid for multi-instance deployments; a distributed Redisson lock is the correct fix
- ⚠️ Atomically deleting a picture and decrementing quota has the same pattern — correct, but there is dead code left from commented-out COS file cleanup calls

---

### Module 5 — SpaceAnalyzeServiceImpl (5-Dimension Analytics)

**Responsibility**: Produce five types of space analytics for visualization on the dashboard.

| Analytics Type | SQL Strategy | Java Post-Processing |
|---------------|-------------|---------------------|
| **Usage** (specific space) | Read `space.totalSize`, `space.totalCount` directly | Calculate usage ratios |
| **Usage** (public/all) | `SELECT picSize FROM picture WHERE ...` | `sum()`, `count()` in stream |
| **Category** | `GROUP BY category, COUNT(*), SUM(picSize)` | Map to response VO |
| **Tags** | `SELECT tags FROM picture` (full load) | `flatMap` JSON arrays, `groupingBy`, sort by count |
| **Size distribution** | `SELECT picSize FROM picture` (full load) | Java-side bucketing into <100KB / 100-500KB / 500KB-1MB / >1MB |
| **Upload trends** | `DATE_FORMAT(createTime, '%Y-%m-%d') GROUP BY period` | Map to response VO |
| **Space ranking** | `ORDER BY totalSize DESC LIMIT N` | Direct list return |

**Design assessment:**
- ✅ Usage analytics for specific spaces reads the pre-computed counter (O(1)) — very fast
- ✅ Upload trend query pushes all grouping to the DB engine — efficient
- ⚠️ Tag analytics loads all `tags` values into Java heap and processes in-stream — unscalable beyond ~10K images; correct fix is MySQL 8's `JSON_TABLE` or a dedicated tag table
- ⚠️ Size distribution also loads all `picSize` values into memory — same issue; a `CASE WHEN` expression in SQL would solve this entirely

---

## 6. Design Decisions and Trade-offs

### Decision 1 — `space.totalSize / totalCount` Counters vs. Aggregate Queries

**The problem**: Every picture list page needs to show the current space quota usage. If computed via `COUNT(*)`/`SUM(picSize)` on the picture table, this is an expensive query on every page load.

**The choice**: The `space` table maintains `totalSize` and `totalCount` columns that are updated atomically (same transaction) on every image upload and delete.

**Trade-off**: Every write operation has an extra `UPDATE space SET totalSize = totalSize ± picSize`. If a transaction fails midway, the counter could drift from reality. This is mitigated by wrapping image + quota operations in the same `TransactionTemplate`.

**If rebuilding**: Keep this pattern. The read performance gain is real. Add a periodic reconciliation job (once daily, `UPDATE space SET totalSize = (SELECT SUM(picSize) FROM picture WHERE spaceId = space.id)`) as a safety net against potential drift.

---

### Decision 2 — Tags as JSON String `VARCHAR(512)`, Not a Join Table

**The problem**: Tags are optional, variable-count metadata per image. A proper normalized design would be `picture_tag(pictureId, tag)`.

**The choice**: Store tags as a JSON array string in `picture.tags`. Writing: `JSONUtil.toJsonStr(["landscape", "nature"])`. Reading: reverse. Querying by tag: `WHERE tags LIKE "%\"landscape\"%"`.

**Trade-off**:
- Fast to implement; no schema changes needed to add new tags
- Cannot do efficient `GROUP BY tag` in SQL — the analytics service loads all rows into memory and processes in Java
- The `LIKE` query for tag filtering does not use an index effectively on large datasets

**If rebuilding**: Start with the JSON approach for speed, but plan to migrate to a `picture_tag` join table once analytics requirements solidify or the picture count crosses 50K.

---

### Decision 3 — Sa-Token Over Spring Security for RBAC

**The problem**: The permission model is two-dimensional — system roles (user/admin) and space roles (viewer/editor/admin). Spring Security is designed for flat role hierarchies and requires significant customization for context-dependent permissions.

**The choice**: Sa-Token with a custom `StpInterface`. The `getPermissionList()` callback receives every permission check and can execute arbitrary logic — loading the space role from the DB based on the current request's `spaceId` or `pictureId`.

**Trade-off**:
- Sa-Token is far less standard than Spring Security; any engineer joining the project needs to learn its conventions
- The current implementation triggers 2–3 DB queries per permission check — adding Redis-level caching of `(userId, spaceId) -> spaceRole` would significantly reduce load
- The known `StpInterfaceImpl` bug (admin permissions in private spaces, line 107) remains open

**If rebuilding**: Sa-Token is a reasonable choice for this project scale. Fix the known bug before shipping. Add `@SaCheckLogin` as a first-pass guard on every authenticated endpoint, then `@SaSpaceCheckPermission` for granular space-level checks.

---

### Decision 4 — Lock-Editor Model for Collaborative Editing, Not OT/CRDT

**The problem**: Multiple users want to see each other's edits in real time.

**The choice**: Only one user holds the edit lock at a time (`pictureEditingUsers[pictureId] = userId`). All other connected users are observers who receive and mirror the editor's actions. The lock is transferred when the editor exits.

**Why not Operational Transformation or CRDT?**
OT (used by Google Docs) requires a server-side transformation engine to resolve conflicting concurrent edits — implementation complexity is very high. CRDTs (used by Figma) are similarly non-trivial to implement correctly. For image editing (rotate, crop, adjust brightness — coarse-grained operations where conflicts are rare), a lock-editor model is semantically correct and orders-of-magnitude simpler to implement.

**Trade-off**: Only one user can edit at a time. Observers can watch but not act. This is acceptable for the "shared review + one editor" workflow but would frustrate users expecting collaborative editing similar to Figma.

**If rebuilding**: Keep the lock-editor model unless the core use case shifts to simultaneous multi-user text editing. Move session state to Redis immediately to avoid the single-node limitation.

---

### Decision 5 — COS CI Pipeline for Image Processing

**The problem**: Images need to be compressed (bandwidth), thumbnailed (list views), and color-analyzed (color search feature) — on every upload.

**The choice**: Delegate all three to the Tencent COS CI (Cloud Infinity) processing pipeline via `PicOperations` rules attached to the `PutObjectRequest`:

```java
// Rule 1: transcode to WebP
// Rule 2: generate 256x256 thumbnail
// Rule 3: return ImageInfo.Ave (dominant color average in hex)
```

All three happen server-side at COS — no image processing library dependency in the backend, no additional compute cost on the application server.

**Trade-off**: Deeply coupled to Tencent COS. Migrating to AWS S3 would require replacing the CI pipeline with a Lambda or an in-process image library (e.g., Thumbnailator, ImageIO). The WebP and thumbnail are stored as separate objects in the bucket — remember to clean them up when the original is deleted (the `clearPictureFile()` method handles this asynchronously).

---

### Decision 6 — OpenAPI Code Generation for Frontend Type Safety

**The problem**: With 6 controllers and dozens of DTOs/VOs, keeping the frontend TypeScript types in sync with backend request/response shapes is error-prone if done manually.

**The choice**: The backend exposes an OpenAPI 2 JSON document via Knife4j. Running `npm run openapi` in the frontend calls `@umijs/openapi`, which generates a complete set of TypeScript function stubs and type definitions from the spec.

```typescript
// Auto-generated — never touch manually:
// src/api/pictureController.ts
// src/api/spaceController.ts
// src/api/typings.d.ts  (all DTO/VO types as TypeScript interfaces)
```

**Trade-off**: Regeneration is a manual step — if a developer changes a backend DTO and forgets to run `npm run openapi`, the frontend silently calls the wrong shape. Automating this in a pre-commit hook or CI step would eliminate the gap.

---

## 7. Engineering Lessons and Key Challenges

### Challenge 1 — Atomic Quota Enforcement

**The problem**: If picture insert and quota update are separate operations, a partial failure leaves the quota counter wrong. A failed transaction that only committed the picture insert would inflate `totalCount` without a record. A committed quota update with a failed picture insert would deflate available quota unnecessarily.

**Solution**: Wrap both operations in a single `TransactionTemplate.execute()` block. MySQL's row-level locking on the `space` row serializes concurrent uploads to the same space automatically.

**Lesson**: Whenever you maintain a denormalized counter (totalSize, totalCount) that must stay consistent with a related table, couple both updates in the same transaction from day one. Retrofitting atomicity later is painful.

---

### Challenge 2 — WebSocket Authentication Without Cookies

**The problem**: Browser WebSocket upgrade requests do not send cookies by default across origins. Sa-Token's default session validation reads the token from the `Authorization` header or session cookie — neither is reliably available on WS handshake.

**Solution**: Pass the Sa-Token token as a query parameter in the WebSocket URL: `ws://api/ws/picture/edit/{pictureId}?token=xxx`. `WsHandshakeInterceptor.beforeHandshake()` extracts this token, validates it against Sa-Token, fetches the `User` entity, and injects both into the session attributes so downstream handlers can access them without additional DB calls.

**Lesson**: Always design WebSocket authentication before implementing the WebSocket feature. Retrofitting auth onto an existing WS endpoint is significantly harder than building it in from the first connection.

---

### Challenge 3 — Bing Image Scraper Fragility

**The problem**: The batch import feature scrapes Bing Images search result pages using CSS selectors (`div.dgControl img.mimg`). These selectors are hard-coded against Bing's current HTML structure.

```java
String fetchUrl = String.format("https://cn.bing.com/images/async?q=%s&mmasync=1", searchText);
Document document = Jsoup.connect(fetchUrl).get();
Elements imgElementList = div.select("img.mimg");
```

**Current state**: This approach works until Bing changes its page structure. There is no fallback API, no error budget, and no monitoring if the scraper silently starts returning 0 results.

**Lesson**: Any feature depending on scraping a third-party website's HTML should be treated as inherently unstable. The correct replacement is the Bing Image Search API (or any image search API). For a portfolio project this is acceptable; for production this is a ticking clock.

---

### Challenge 4 — Long ID Precision Loss Over WebSocket

**The problem**: MySQL `bigint` IDs use Snowflake-generated 64-bit integers. JavaScript's `Number` type can only represent integers up to `2^53 - 1` safely. A 64-bit Snowflake ID serialized as a JSON number loses precision when parsed by the browser — users receive corrupted IDs.

**Solution**: In `PictureEditHandler.broadcastToPicture()`, a custom Jackson `SimpleModule` serializes all `Long` fields as JSON strings:

```java
SimpleModule module = new SimpleModule();
module.addSerializer(Long.class, ToStringSerializer.instance);
module.addSerializer(Long.TYPE, ToStringSerializer.instance);
objectMapper.registerModule(module);
```

**A secondary issue**: A new `ObjectMapper` is instantiated on every call to `broadcastToPicture()`. This should be a Spring-managed singleton bean. The fix is one line of `@Resource` injection.

**Lesson**: Any API that passes 64-bit integer IDs to a JavaScript client must serialize them as strings. Configure this globally in `JsonConfig.java` — the `broadcastToPicture()` workaround is a localized patch that shouldn't exist if the global config handles it.

---

### Challenge 5 — Color Search Scalability Ceiling

**The problem**: The "search by dominant color" feature loads all pictures in a space into memory, computes `ColorSimilarUtils.calculateSimilarity()` for each, sorts, and takes the top 12.

```java
List<Picture> pictureList = this.lambdaQuery()
    .eq(Picture::getSpaceId, spaceId)
    .isNotNull(Picture::getPicColor)
    .list();  // full load into JVM heap
```

**Current behavior**: Works fine for spaces with hundreds of images. Degraded for thousands. OOM risk for tens of thousands.

**The correct fix**: Pre-compute the color bucket (`picColor` is already normalized to a standard color via `ColorTransformUtils.getStandardColor()`). Add an index on `(spaceId, picColor)` and filter at the DB level. For exact similarity ranking within a narrowed color family, the in-memory sort is acceptable.

**Lesson**: Any feature that loads an unbounded collection into memory for computation is a time bomb. Make the data set bounded at the DB query layer, not the Java layer.

---

## 8. Rebuild Guide

If you want to implement a similar system from scratch, here is the build order and the gotchas worth knowing upfront.

### Step-by-Step Build Order

**Step 1 — Database Schema (Day 1)**

Design all four tables before writing any Java:

```sql
user       (id, userAccount, userPassword, userName, userRole, isDelete)
picture    (id, url, thumbnailUrl, name, tags, category, picSize, picWidth,
            picHeight, picScale, picColor, userId, spaceId,
            reviewStatus, reviewerId, isDelete)
space      (id, spaceName, spaceLevel, spaceType, maxSize, maxCount,
            totalSize, totalCount, userId, isDelete)
space_user (id, spaceId, userId, spaceRole)
```

**Critical decisions at this stage:**
- `picture.spaceId IS NULL` = public gallery (no separate table needed)
- `space.totalSize/totalCount` = pre-computed counters (not derived on read)
- `isDelete` on every entity from the start (retrofit is painful)
- Index: `(spaceId, picColor)` on picture for color search

---

**Step 2 — COS Integration + Basic Upload (Day 2–3)**

Get a file upload to COS working before adding any business logic:

```bash
# Minimum viable:
PutObjectRequest -> COSClient.putObject() -> URL back
```

Then layer in the CI pipeline (`PicOperations`):
1. WebP compression
2. Thumbnail generation
3. Verify `ImageInfo.getAve()` returns the dominant color

Test this thoroughly — COS CI results (compressed file location, thumbnail key naming) are what the rest of the system depends on.

---

**Step 3 — Space + Quota Logic (Day 4–5)**

```
1. Space CRUD with SpaceLevelEnum quota defaults
2. fillSpaceBySpaceLevel() -> populate maxSize/maxCount from enum
3. addSpace() with synchronized + TransactionTemplate
   (even if single-node, practice the pattern)
4. Upload: check quota BEFORE calling COS
5. Commit picture INSERT + space UPDATE atomically
6. Delete: commit picture DELETE + space decrement atomically
```

**Key pitfall**: If you forget to couple the quota update with the picture operation in the same transaction, your counters will drift under any error condition.

---

**Step 4 — Permission System (Day 6–8)**

This is the hardest module to get right. Build in this order:

1. **System roles first** — `@AuthCheck` AOP interceptor for `user`/`admin`, backed by session
2. **Space roles second** — `StpKit` with two `StpLogic` instances, `SpaceUserAuthManager` for role→permissions
3. **`StpInterfaceImpl` last** — the dynamic request-context resolver

**The biggest gotcha**: `StpInterfaceImpl.getPermissionList()` is called on every request that has a `@SaCheckPermission` annotation. If it makes 3 DB queries per call and you have 10 concurrent users each making 5 requests per second, you have 150 DB queries per second just for permission resolution. Add `StpKit.SPACE.getSession().set(key, value)` caching from the start.

**Fix the known bug before launch**: When an admin user accesses a private space they don't own, the current code returns empty permissions. The fix is to add an `isAdmin` check in the `PRIVATE` space branch:
```java
if (space.getUserId().equals(userId) || userService.isAdmin(loginUser)) {
    return ADMIN_PERMISSIONS;
}
```

---

**Step 5 — WebSocket Collaborative Editing (Day 9–11)**

```
1. Spring WebSocket config (WebSocketConfig, map /ws/picture/edit/{pictureId})
2. WsHandshakeInterceptor — token from query param, inject user + pictureId
3. PictureEditHandler — connect/message/close lifecycle
4. Message protocol: ENTER_EDIT / EDIT_ACTION / EXIT_EDIT + INFO/ERROR responses
5. pictureSessions + pictureEditingUsers (in-memory for now)
6. Basic broadcast works: test with two browser tabs
7. Add Disruptor: PictureEditEventProducer + PictureEditEventWorkHandler
8. Inject ObjectMapper as a Spring bean — do NOT new ObjectMapper() per broadcast
```

**The single most important gotcha**: Move session state to Redis before the feature goes to production with multiple backend instances. `ConcurrentHashMap` in the JVM heap is invisible to other nodes.

---

**Step 6 — Analytics (Day 12)**

Build analytics last — it has no dependencies on other features and is purely read-side. Push as much computation as possible to SQL:

```sql
-- Good: DB handles grouping
SELECT category, COUNT(*) as count, SUM(picSize) as totalSize
FROM picture WHERE spaceId = ? GROUP BY category

-- Avoid: loading all rows into Java for bucketing
SELECT picSize FROM picture WHERE spaceId = ?  -- then Java stream filter
-- Fix: use CASE WHEN in SQL
SELECT
  SUM(CASE WHEN picSize < 102400 THEN 1 ELSE 0 END) as lt100kb,
  ...
FROM picture WHERE spaceId = ?
```

---

### Critical Decisions to Make Upfront

| Decision | Recommendation |
|----------|---------------|
| Counter vs. aggregate for quotas | Pre-computed counters — always update transactionally |
| Tags storage | JSON string is fine to start; plan a migration if analytics are a day-1 requirement |
| WebSocket session store | Redis Pub/Sub from day one, not in-memory Map |
| Color search data bound | Add SQL-level filter by color family before in-memory sort |
| Permission check caching | Cache `(userId, spaceId) -> spaceRole` in Sa-Token session |
| Long ID serialization | Global Jackson config: `Long.class -> ToStringSerializer`; not per-endpoint |
| COS object key naming | `{datePrefix}_{uuid}.{suffix}` — never use the original filename in the COS key |

---

### Common Pitfalls

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| Quota update not in same transaction as image insert | Counter drifts under any error; space fills up without images | Always use `TransactionTemplate` wrapping both operations |
| WS session state in JVM heap | Two backend nodes → different users can claim the same edit lock simultaneously | Redis Pub/Sub + distributed lock for `pictureEditingUsers` |
| `new ObjectMapper()` in broadcast | Object allocation on every broadcast call → GC pressure under load | Inject `@Resource ObjectMapper objectMapper` |
| Tag analytics full-load | OOM for large spaces | Push to DB: use `JSON_TABLE` (MySQL 8) or a tag join table |
| Admin in private space bug | System admins cannot manage spaces they don't own | Add `userService.isAdmin(loginUser)` check in private space branch |
| Bing scraper class selector changes | `uploadPictureByBatch` returns 0 uploaded silently | Switch to an official image search API |
| Color search full-load | Slow / OOM for large spaces | Filter by color bucket at DB level, sort in-memory on bounded set |
| Token precision in WS messages | Snowflake IDs silently corrupted in browser | Serialize `Long` as `String` globally in `JsonConfig` |
| `String.intern()` creation lock | Single-node only; concurrent requests on different nodes create duplicate spaces | Replace with Redisson distributed lock on `"user:" + userId + ":space:create"` |

---

## Running Locally

### Backend

```bash
cd ek-cloud-gallery-backend

# Configure your environment (do not commit secrets)
# Edit src/main/resources/application-prod.yml with:
#   spring.datasource.url / username / password
#   spring.redis.host / port / password
#   cos.client.secretId / secretKey / region / bucket / host

./mvnw spring-boot:run
# API at http://localhost:8123/api
# Swagger UI: http://localhost:8123/api/doc.html
```

### Frontend

```bash
cd ek-cloud-gallery-frontend

npm install

# For local development, edit src/request.ts:
# Change PROD_BASE_URL to "http://localhost:8123"

npm run dev
# Dev server at http://localhost:3000

# To regenerate API client after backend changes:
npm run openapi
```

---

## Project Structure

```
cloud-gallery/
|
+-- ek-cloud-gallery-backend/           Spring Boot 2.7.6 backend (Java 11)
|   +-- pom.xml
|   +-- sql/
|   |   +-- create_table.sql            Full schema DDL with ALTER TABLE history
|   +-- src/main/
|       +-- java/com/eric/ekcloudgallerybackend/
|       |   +-- annotation/             @AuthCheck
|       |   +-- aop/                    AuthInterceptor (system role gate)
|       |   +-- common/                 BaseResponse, PageRequest, DeleteRequest
|       |   +-- config/                 CorsConfig, CosClientConfig, JsonConfig, MybatisPlusConfig
|       |   +-- constant/               UserConstant
|       |   +-- controller/             UserController, PictureController, SpaceController,
|       |   |                           SpaceUserController, SpaceAnalyzeController, FileController
|       |   +-- exception/              ErrorCode, BusinessException, ThrowUtils
|       |   +-- manage/
|       |   |   +-- CosManager          COS SDK wrapper (upload, delete, CI pipeline)
|       |   |   +-- FileManager         @Deprecated — replaced by upload templates
|       |   |   +-- upload/             PictureUploadTemplate, FilePictureUpload, UrlPictureUpload
|       |   |   +-- auth/               StpInterfaceImpl, StpKit, SpaceUserAuthManager
|       |   |   +-- websocket/          PictureEditHandler, WsHandshakeInterceptor
|       |   |                           disruptor/ (Producer, WorkHandler, Event, Config)
|       |   +-- mapper/                 MyBatis-Plus mapper interfaces
|       |   +-- model/
|       |   |   +-- entity/             User, Picture, Space, SpaceUser
|       |   |   +-- dto/                Request objects per feature
|       |   |   +-- vo/                 View objects (PictureVO, SpaceVO, UserVO, ...)
|       |   |   +-- enums/              SpaceTypeEnum, SpaceLevelEnum, SpaceRoleEnum, ...
|       |   +-- service/                Service interfaces
|       |       +-- impl/               PictureServiceImpl, SpaceServiceImpl,
|       |                               SpaceAnalyzeServiceImpl, SpaceUserServiceImpl,
|       |                               UserServiceImpl
|       +-- resources/
|           +-- application.yml         Server config, MyBatis-Plus, Knife4j
|           +-- biz/                    Space-level permission configs
|           +-- mapper/                 MyBatis XML mappers
|
+-- ek-cloud-gallery-frontend/          Vue 3 + Vite frontend
    +-- package.json
    +-- vite.config.ts
    +-- openapi.config.js               @umijs/openapi generation config
    +-- src/
        +-- main.ts                     App entry, Pinia, Ant Design Vue, router
        +-- App.vue                     Root component
        +-- access.ts                   Global navigation guard (admin route protection)
        +-- request.ts                  Axios instance (baseURL, 401 redirect)
        +-- api/                        @umijs/openapi generated clients
        |   +-- pictureController.ts
        |   +-- spaceController.ts
        |   +-- spaceUserController.ts
        |   +-- spaceAnalyzeController.ts
        |   +-- userController.ts
        |   +-- fileController.ts
        |   +-- typings.d.ts            All API types (API.PictureVO, API.SpaceVO, ...)
        +-- pages/
        |   +-- HomePage.vue            Public gallery with search/filter
        |   +-- picture/
        |   |   +-- AddPicturePage.vue      Upload form (file or URL)
        |   |   +-- AddPictureBatchPage.vue Batch import from Bing
        |   |   +-- PictureDetailPage.vue   Image detail, download, share
        |   +-- space/
        |   |   +-- AddSpacePage.vue        Create space form
        |   |   +-- MySpacePage.vue         List user's own spaces
        |   |   +-- SpaceDetailPage.vue     Space browser with color search + batch edit
        |   |   +-- SpaceAnalyzePage.vue    ECharts analytics dashboard
        |   +-- user/
        |       +-- UserLoginPage.vue
        |       +-- UserRegisterPage.vue
        +-- components/                 Reusable components
        +-- stores/                     Pinia stores (useLoginUserStore)
        +-- router/                     Vue Router config
        +-- constants/                  Space permission enums, type maps
        +-- utils/                      formatSize, downloadImage, toHexColor
```

---

## References

- [LMAX Disruptor — Martin Thompson](https://lmax-exchange.github.io/disruptor/) — the high-performance inter-thread messaging library used in the WebSocket pipeline
- [Sa-Token Documentation](https://sa-token.cc/) — the auth framework powering the dual-token permission system
- [Tencent COS CI Documentation](https://cloud.tencent.com/document/product/460) — image processing pipeline (WebP compression, thumbnail, color analysis)
- [MyBatis-Plus Documentation](https://baomidou.com/) — the ORM layer
- [Knife4j Documentation](https://doc.xiaominfo.com/) — API documentation and OpenAPI JSON endpoint

---
