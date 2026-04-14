---
title: What2Do
category: Fullstack
# image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop"
color: "#F59E0B"
date: 2026-03-01
# demo: "ek-flowity.site"
---


![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Caffeine](https://img.shields.io/badge/Caffeine-multi--tier_cache-brightgreen?style=flat-square)
![Sa-Token](https://img.shields.io/badge/Sa--Token-RBAC_auth-orange?style=flat-square)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-object_storage-F38020?style=flat-square&logo=cloudflare&logoColor=white)

---

## Overview

UTM What2Do is a full-stack campus activity platform I built for the University of Toronto Mississauga (UTM) student community, targeting the core problem of fragmented campus information.

Events at UTM are scattered across emails, physical boards, Instagram pages, and dozens of individual club websites. There is no single place where a student can answer the question: *"What's happening on campus right now?"* This platform is that place.

At its core, the system aggregates campus events and clubs into a unified, mobile-first interface with a geo-anchored campus map. But the engineering complexity lives underneath:

- **Three-tier RBAC system** — platform roles (`USER`, `CLUB_MANAGER`, `ADMIN`) enforced via Sa-Token with AOP, route guards on both frontend and backend
- **Multi-tier Caffeine cache** — three independently configured `CacheManager` instances with different TTL policies for static geo data (24h), dynamic event data (10min), and brute-force lockout counters (15min)
- **Cloudflare R2 file pipeline** — SHA-256 hash-based deduplication, presigned URL support for direct browser-to-R2 uploads, with a local filesystem fallback for development
- **Multi-layer backend security** — IP blacklist filter → Sa-Token session validation → three-dimensional rate limiting (IP / user / endpoint) → AOP role enforcement → OWASP XSS sanitization
- **Real-time campus heatmap** — building activity counts aggregated across a 45-day sliding window, cached and rendered as interactive Leaflet bubble markers

> **Why build this?**
> I wanted to work through what it actually takes to architect a platform with meaningful access control, caching strategy, and security depth — not just a CRUD app with a login page. Every major feature in this codebase involved a non-trivial engineering decision.

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

A bulletin board answers one question: *"What events are happening?"*

This platform answers a harder set of questions that only emerge once you think about who runs an active campus community platform:

- **Information authority**: How do I let club managers publish and manage their own events without giving them access to other clubs' data?
- **Access control scoping**: How do I differentiate between a user browsing events, a club manager editing their club's profile, and an admin moderating content — all on the same platform?
- **Geo-awareness**: How do I show students which buildings are active right now, without querying the full events table on every map load?
- **File integrity**: How do I prevent the same image from being uploaded 50 times by 50 different users and wasting storage?
- **Security baseline**: How do I protect the platform from brute-force login attacks, XSS injections, and API abuse without building a dedicated security service?

**Core design goals:**

| Goal | Implementation |
|------|----------------|
| Information aggregation | Unified event + club + building data model under one API |
| Role-based content control | Sa-Token RBAC: `USER` / `CLUB_MANAGER` / `ADMIN` with AOP enforcement |
| Geo-anchored discovery | Leaflet.js map with building activity heatmap (Caffeine-cached, 10-min TTL) |
| File deduplication | SHA-256 hash check before every upload; identical files reuse existing record |
| Multi-layer security | IP blacklist → token validation → rate limiting → role check → XSS sanitize |
| Responsive performance | TanStack Query for server state + Zustand for client state; lazy-loaded routes |
| Admin operability | Full CRUD admin dashboard for all entities; club manager scoped sub-dashboard |

---

## 2. Tech Stack Breakdown

### Frontend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **React 19** | SPA framework | Latest concurrent rendering features; `Suspense` + `lazy()` for route-level code splitting; large ecosystem for the component patterns needed |
| **TypeScript 5.9** | Type safety | Catches API contract mismatches at compile time; `Zod` runtime validation adds a second safety layer on API responses |
| **Vite 5.4** | Build tool | Near-instant HMR for a codebase with 50+ components; native ESM; no Webpack configuration overhead |
| **React Router v7** | Client-side routing | `createBrowserRouter` with `ProtectedRoute` wrappers enforces auth + role checks at the route level |
| **TanStack Query v5** | Server state management | Handles caching, background refetching, loading/error states for all API calls; eliminates `useEffect` + `useState` data-fetching patterns that leak state |
| **Zustand v5** | Global client state | Auth store (`useAuthStore`), schools store, theme — lightweight with no boilerplate; avoids Redux overhead for the app's scale |
| **Tailwind CSS v3.4** | Utility-first styling | Consistent design system across 50+ components without writing CSS files; `tailwind-merge` prevents class conflicts |
| **Framer Motion v12** | Animations | Page transitions, drawer animations, hover effects — declarative API that composites cleanly with React's rendering model |
| **React Leaflet v5** | Interactive map | Open-source, no API key required (OpenStreetMap tiles), lightweight; `react-leaflet` provides React component wrappers for the Leaflet.js primitives |
| **Zod v3** | Runtime validation | Validates API response shapes at runtime — catches backend contract changes before they silently corrupt UI state |
| **Axios v1.7** | HTTP client | Request/response interceptors: injects `satoken: Bearer <token>` header on every request, handles 401 → logout redirect globally |
| **DOMPurify v3** | XSS sanitization | Client-side sanitization of any user-generated content rendered as HTML; mirrors server-side OWASP sanitization |
| **Lucide React** | Icon library | Consistent, tree-shakable icon set; no custom icon management needed |

All page components are **lazy-loaded** via `React.lazy()` + `Suspense`. The router uses `createBrowserRouter` with a flat main layout (`RootLayout`) and nested profile sub-routes, giving each profile section its own URL (`/profile/events`, `/profile/clubs`, `/profile/schedule`).

### Backend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Spring Boot 3.2.5** (Java 17) | Application framework | Mature ecosystem with first-class support for AOP, caching, validation, actuator metrics; Java 17 virtual threads-compatible for future performance work |
| **MyBatis Plus 3.5.6** | ORM / data access | `LambdaQueryWrapper` provides type-safe query construction without XML; `@TableLogic` auto-applies soft delete on every query; pagination plugin eliminates manual `LIMIT/OFFSET` |
| **Sa-Token 1.37.0** | Authentication & authorization | Lightweight session-based auth significantly simpler than Spring Security for RBAC; `StpUtil` provides a clean API for login/logout/role-check; custom `@CheckRole` AOP annotation for declarative access control |
| **Caffeine 3.1.8** | In-process caching | Zero network latency (same JVM); three independent `CacheManager` beans with different TTL policies for different data categories; `recordStats()` enables Actuator metrics visibility |
| **Spring Security Crypto** | Password hashing | BCrypt implementation; `work factor = 12` balances security (~250ms) and usability; imported without bringing in the full Spring Security stack |
| **OWASP HTML Sanitizer** | Server-side XSS protection | Allowlist-based HTML sanitization with `sanitize()` for rich text fields and `sanitizePlainText()` for plain text fields; trusted security library vs. hand-rolled regex |
| **Guava 32.1** | Rate limiting primitives | `InMemoryRateLimiter` built on Guava token bucket; three-dimensional limiting: per-IP, per-user, per-endpoint |
| **AWS S3 SDK v2** | Cloudflare R2 storage | R2 is S3-compatible; SDK v2 bundles `S3Presigner` for generating presigned upload URLs; local filesystem fallback when R2 credentials are absent |
| **Resend SDK 3.0** | Transactional email | Modern email API for verification code delivery; simpler integration than JavaMailSender |
| **Knife4j 4.5** | API documentation | Enhanced Swagger UI at `/doc.html` with request testing; auto-generates OpenAPI 3 spec consumed by the frontend |
| **Hutool 5.8.25** | Java utility library | SHA-256 hashing (file deduplication), UUID generation, file extension extraction — reduces boilerplate throughout the service layer |
| **Lombok 1.18.36** | Code generation | `@Data`, `@Builder`, `@RequiredArgsConstructor` eliminate getter/setter/constructor boilerplate for entities, DTOs, and VOs |
| **Spring Actuator + Micrometer** | Observability | `/actuator/health` for Railway health checks; `/actuator/prometheus` for metrics scraping |

### Database

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **PostgreSQL 16** | Primary relational database | Strong ACID guarantees for transactional counter updates; Railway-native managed hosting; `pg` driver is the only JDBC driver in `pom.xml` |
| **HikariCP** | Connection pooling | Spring Boot default; configured at max 20, min 5 connections for Railway's connection limits |

**Schema design highlights:**
- All 17 entities use a `deleted` flag (`0` = active, `1` = deleted) for soft delete — MyBatis Plus `@TableLogic` auto-filters without explicit `WHERE deleted = 0` in every query
- Denormalized counters on `clubs` (`members_count`, `events_count`, `posts_count`) avoid expensive aggregate queries; updated via atomic `SET count = count ± 1` SQL
- `follows.target_type` is a polymorphic enum (`USER`, `CLUB`) — one table handles all follow relationships
- `club_members.status` enum (`PENDING`, `ACTIVE`) enables a membership approval workflow
- `media_assets.hash` (SHA-256) is the deduplication key — identical files are redirected to the existing record without a second upload

### Infrastructure

| Layer | Technology |
|-------|-----------| 
| Backend hosting | Railway (with managed PostgreSQL) |
| Frontend hosting | Vercel (static SPA) |
| Reverse proxy | Nginx (`nginx.conf` provided) |
| Object storage | Cloudflare R2 (S3-compatible, free egress) |
| Local dev database | Docker (PostgreSQL container) |

---

## 3. System Architecture

**Overall style: Frontend/Backend Separation + Spring Boot Monolith**

```
+------------------------------------------------------------------+
|                    Browser (React 19 SPA)                        |
|                                                                  |
|  +----------+  +----------+  +----------+  +-----------------+  |
|  |  Home    |  |  Map     |  |  Clubs   |  |  Profile        |  |
|  |  (event  |  |  (Leaflet|  |  (filter |  |  /events        |  |
|  |   feed)  |  |   heat-  |  |   by cat)|  |  /clubs         |  |
|  +----------+  |   map)   |  +----------+  |  /schedule       |  |
|                +----------+               |  /settings       |  |
|  +----------+                            +-----------------+  |
|  |  Search  |  +----------+              +-------------------+  |
|  | (filter  |  |  Event   |              |  Admin Dashboard   |  |
|  |  events) |  |  Detail  |              |  (full CRUD)       |  |
|  +----------+  +----------+              +-------------------+  |
|                                                                  |
|  State: TanStack Query (server) + Zustand (client auth/theme)    |
|  HTTP: Axios (Bearer token interceptor, 401 redirect)            |
|  Routing: React Router v7 (ProtectedRoute, lazy-loaded pages)    |
+------------------------------------------------------------------+
                             |
                    HTTPS / REST /api/v1
                             |
+------------------------------------------------------------------+
|            Spring Boot Backend  (port 8232)                      |
|                                                                  |
|  Filter Chain (every request)                                    |
|  +-- IPBlacklistFilter          in-memory IP blacklist/whitelist |
|  +-- SaServletFilter            Sa-Token: token validation,      |
|  |                              public route exclusions          |
|  +-- RequestLimitInterceptor    3D rate limiting:                |
|                                 IP (60/min) + User (60/min)     |
|                                 + Endpoint (3000/min)           |
|                                                                  |
|  Controller Layer                                                |
|  +- UserController        /api/v1/users/*                        |
|  +- EventController       /api/v1/events/*                       |
|  +- ClubsController       /api/v1/clubs/*                        |
|  +- MapController         /api/v1/map/*                          |
|  +- PostController        /api/v1/posts/*                        |
|  +- FileController        /api/v1/files/*                        |
|  +- AdminController       /api/v1/admin/*  (ADMIN only)          |
|  +- ManagerController     /api/v1/manager/* (CLUB_MANAGER+)     |
|  +- TagController, FollowController, SchoolController, ...       |
|                                                                  |
|  AOP Layer                                                       |
|  +- AuthCheckAspect        @CheckRole annotation enforcement     |
|                                                                  |
|  Service Layer (21 interfaces + 23 implementations)             |
|  +- UsersServiceImpl       login, register, BCrypt, lockout      |
|  +- ClubsServiceImpl       CRUD, membership, follow, cache evict |
|  +- AdminServiceImpl       cross-entity management               |
|  +- FileServiceImpl        R2 upload, dedup, presigned URL       |
|  +- BuildingsServiceImpl   geo data, heatmap aggregation         |
|  +- PostsServiceImpl       feed, comments, XSS sanitize          |
|  +-- ... (18 more service implementations)                       |
|                                                                  |
|  Caffeine Cache (in-JVM)                                         |
|  +- Primary CacheManager   events, clubs, tags (10min TTL)       |
|  +- buildingCache          geo data (24h TTL)                    |
|  +- loginAttemptsCache     brute-force counter (15min TTL)       |
|                                                                  |
|  Mapper Layer (17 MyBatis Plus mappers)                          |
+------------------------------------------------------------------+
                   |                       |
                   v                       v
           PostgreSQL                Cloudflare R2
         (17 tables,              (images, avatars,
          Railway hosted)          covers, deduped by SHA-256)
```

### Backend Package Structure

```
com.utm.what2do/
|
+-- controller/         <- HTTP boundary: request parsing, @CheckRole annotations
|   +-- UserController          (login, register, profile)
|   +-- EventController         (CRUD, filter, favorites, schedule)
|   +-- ClubsController         (CRUD, membership, follow)
|   +-- MapController           (building heatmap data)
|   +-- PostController          (feed, comments)
|   +-- FileController          (upload, presigned URL)
|   +-- AdminController         (ADMIN: all entity management)
|   +-- ManagerController       (CLUB_MANAGER: scoped club management)
|   +-- TagController, FollowController, SchoolController, ...
|
+-- service/            <- Business logic interfaces
|   +-- impl/
|       +-- UsersServiceImpl      (BCrypt, dual-identifier login, lockout)
|       +-- ClubsServiceImpl      (membership states, follow, cache evict)
|       +-- AdminServiceImpl      (cross-entity CRUD, IP blacklist)
|       +-- FileServiceImpl       (R2/local upload, SHA-256 dedup, presigned)
|       +-- BuildingsServiceImpl  (geo data, heatmap aggregation, 24h cache)
|       +-- PostsServiceImpl      (feed, nested comments, XSS sanitization)
|       +-- InMemoryRateLimiter   (Guava token bucket, 3 dimensions)
|       +-- ... (16 more implementations)
|
+-- mapper/             <- MyBatis Plus mappers (17 files, auto CRUD)
|
+-- model/
|   +-- entity/         Users, Events, Clubs, ClubMembers, Posts, Buildings, ...
|   +-- dto/            Request objects (UserLoginDTO, ClubUpdateDTO, ...)
|   +-- vo/             Response objects (UserInfoVO, EventCardVO, ClubDetailVO, ...)
|   +-- enums/          ClubCategory, BuildingCategory, MembershipStatus, TargetType
|
+-- config/
|   +-- CaffeineCacheConfig       3 CacheManager beans with independent TTL
|   +-- SaTokenConfig             Filter chain, public route exclusions
|   +-- CorsConfig                Allowed origins list (prod + dev)
|   +-- RequestLimitInterceptor   3D rate limiting interceptor
|   +-- IPBlacklistFilter         In-memory IP blacklist/whitelist
|   +-- SlowQueryInterceptor      MyBatis slow query logging
|
+-- aop/                AuthCheckAspect (@CheckRole annotation processing)
+-- annotation/         @CheckRole definition
+-- common/             R<T> response wrapper, GlobalExceptionHandler, BusinessException
+-- constant/           RoleConstants, UpdateConstants (atomic SQL snippets)
+-- task/               Scheduled jobs (club stats sync)
+-- utils/              HtmlSanitizer (OWASP wrapper)
```

---

## 4. Key Data Flows

### Flow A — User Login with Brute-Force Protection

```
User submits credentials on LoginPage
    |
    | POST /api/v1/users/login  { username: "john" | email: "john@mail.com", password: "..." }
    v
[Filter chain]
    IPBlacklistFilter  -> IP in blacklist? -> 403
    SaServletFilter    -> /users/login is in public exclusions -> pass
    RateLimitInterceptor -> IP 60/min + endpoint 3000/min check
    |
    v
UserController.login()  ->  UsersService.login(UserLoginDTO)
    |
    v
UsersServiceImpl.login()
    |
    +-- 1. checkLoginAttempts(identifier):
    |       Caffeine loginAttemptsCache.get(identifier)
    |       >= 5 attempts? -> throw "Account locked (15 min)"
    |
    +-- 2. Dual-identifier lookup:
    |       SELECT * FROM users WHERE username = ? AND deleted = 0
    |       null result? -> SELECT * FROM users WHERE email = ? AND deleted = 0
    |       still null? -> recordFailedLogin(identifier); throw PASSWORD_ERROR
    |
    +-- 3. BCrypt.checkpw(rawPassword, user.passwordHash)
    |       false? -> recordFailedLogin(identifier); throw PASSWORD_ERROR
    |
    +-- 4. clearFailedLoginAttempts(identifier)  // reset counter on success
    |
    +-- 5. StpUtil.login(user.getId())
    |       StpUtil.getSession().set("role", user.getRole())
    |
    +-- 6. user.setLastLoginAt(now); updateById(user)
    |
    +-- 7. return { token: StpUtil.getTokenValue(), user: UserInfoVO }
    |
    v
Frontend authService receives response:
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_info", JSON.stringify(user))
    useAuthStore.setUser(userData)
    -> loadFavorites() + loadScheduled() triggered in parallel
    |
    v
React Router navigates to redirect target (or home)
```

---

### Flow B — Campus Map Heatmap Load

```
User opens /map (MapPage)
    |
    | GET /api/v1/buildings/stats
    v
MapController.getBuildingStats()  ->  BuildingsService.getBuildingEventCounts()
    |
    v
@Cacheable("building_stats", key="event_counts")
    Cache HIT?  -> return cached List<BuildingCountVO> immediately
    Cache MISS? -> calculateBuildingEventCounts():
    |
    +-- 1. getAllBuildings()  [also @Cacheable("buildings","all"), 24h TTL]
    |       SELECT * FROM buildings WHERE deleted = 0 ORDER BY name
    |
    +-- 2. SELECT * FROM events
    |         WHERE deleted = 0
    |         AND end_time >= NOW() - INTERVAL '15 days'
    |         (includes past 15 days + all future events)
    |
    +-- 3. Group events by building_id in Java stream:
    |       Map<Long, Long> eventCountMap = events.stream()
    |           .collect(groupingBy(e -> e.buildingId != null ? e.buildingId : -1L, counting()))
    |
    +-- 4. Build BuildingCountVO list:
    |       { buildingId, buildingName, latitude, longitude, eventCount }
    |       Filter: only buildings with eventCount > 0
    |       Always append: { buildingId: -1, buildingName: "Online / Virtual" }
    |
    +-- 5. Write to Caffeine cache (10min TTL)
    |
    v
Frontend React Leaflet:
    Renders a CircleMarker per BuildingCountVO
    Circle radius ∝ eventCount
    Click -> navigate to /map?building=<buildingId>
```

---

### Flow C — File Upload with Deduplication

```
User selects an image (avatar, event cover, club logo)
    |
    | POST /api/v1/files/upload  (multipart/form-data, requires auth)
    v
FileController.uploadFile()
    Sa-Token: StpUtil.checkLogin()
    userId = StpUtil.getLoginIdAsLong()
    |
    v
FileServiceImpl.uploadFile(file, userId)
    |
    +-- 1. validateFile():
    |       file.isEmpty()? -> throw
    |       file.size > 10MB? -> throw
    |       contentType not in {image/jpeg,image/png,image/gif,image/webp}? -> throw
    |
    +-- 2. Compute SHA-256 hash:
    |       hash = DigestUtil.sha256Hex(file.getInputStream())
    |
    +-- 3. Dedup check:
    |       SELECT * FROM media_assets WHERE hash = ?
    |       EXISTS? -> return existing MediaAssetVO immediately (zero upload)
    |
    +-- 4. Generate filename: IdUtil.simpleUUID() + "." + extension
    |
    +-- 5. Upload decision:
    |       useR2 = true?
    |         -> s3Client.putObject(bucket, "uploads/" + filename, stream)
    |         -> finalUrl = r2PublicUrl + "uploads/" + filename
    |       useR2 = false?  (dev fallback)
    |         -> file.transferTo(Paths.get(uploadPath, filename))
    |         -> finalUrl = "/uploads/" + filename
    |
    +-- 6. Extract image dimensions (ImageIO.read for images)
    |
    +-- 7. INSERT media_assets (hash, url, mimeType, sizeBytes, width, height, ...)
    |
    v
return MediaAssetVO { id, url, mimeType, sizeBytes, width, height }
    |
    v
Frontend stores the returned url in the form field
(e.g., event.coverUrl = response.data.url)
```

---

### Flow D — Club Manager Creates an Event

```
Club Manager navigates to /manager/events -> "Create Event"
    |
    | POST /api/v1/events  { title, description, startTime, buildingId, ... }
    |  Header: satoken: Bearer <token>
    v
[Filter chain]
    SaServletFilter: validate token -> userId from session
    RateLimitInterceptor: user 60/min check
    |
    v
EventController.createEvent()
    @CheckRole -> AuthCheckAspect:
        StpUtil.getSession().get("role")  -> must be CLUB_MANAGER or ADMIN
        unauthorized? -> throw FORBIDDEN
    |
    v
EventsService.createEvent(dto, userId)
    |
    +-- 1. Validate: startTime < endTime, buildingId exists
    +-- 2. XSS sanitize: HtmlSanitizer.sanitize(dto.getDescription())
    +-- 3. INSERT events (title, description, clubId, buildingId, startTime, endTime, ...)
    +-- 4. @CacheEvict on "eventList" + "eventSearch" (clear stale lists)
    +-- 5. Atomic counter increment:
    |       UPDATE clubs SET events_count = events_count + 1 WHERE id = ?
    |
    v
return EventVO
    |
    v
Frontend: toast "Event created!" -> navigate to /manager/events
```

---

## 5. Core Modules Deep Dive

### Module 1 — Multi-Tier Caffeine Cache (CaffeineCacheConfig)

**Responsibility**: Reduce database load for high-frequency reads without introducing a Redis dependency for the current single-instance deployment.

**Three independent CacheManager beans:**

```
CaffeineCacheConfig
|
+-- @Primary  defaultCacheManager
|   caches: eventList, eventDetail, eventSearch, eventsByDate,
|            clubList, clubDetail, clubDetailBySlug,
|            tags, userRole, clubManagerPermission
|   TTL: expireAfterWrite=10min, expireAfterAccess=30min
|   max: 1000 entries
|
+-- @Bean("buildingCache")  buildingCacheManager
|   caches: buildings
|   TTL: expireAfterWrite=24h        <- static geo data, rarely changes
|   max: 100 entries
|
+-- @Bean("loginAttemptsCache")  loginAttemptsCacheManager
    caches: loginAttempts
    TTL: expireAfterWrite=15min      <- auto-resets lockout window
    max: 1000 entries
```

**Usage pattern** — annotations drive all cache interactions:

```java
// Service layer — cache on read
@Cacheable(value = "buildings", key = "'all'")
public List<Buildings> getAllBuildings() { ... }

// Cache invalidate on write (multiple caches simultaneously)
@Caching(evict = {
    @CacheEvict(value = "clubDetail", key = "#clubId"),
    @CacheEvict(value = "clubDetailBySlug", allEntries = true),
    @CacheEvict(value = "clubList", allEntries = true)
})
public ClubDetailVO updateClub(Long clubId, ClubUpdateDTO dto, Long userId) { ... }

// loginAttempts uses cacheManager directly (not @Cacheable) for programmatic gets/puts
Cache cache = cacheManager.getCache("loginAttempts");
Integer attempts = cache.get(username, Integer.class);
cache.put(username, newAttempts);
```

**Design assessment:**
- ✅ Separate `CacheManager` per data tier — static geo data (24h) vs. dynamic event data (10min) vs. security counter (15min) — is the correct approach
- ✅ `recordStats()` on all caches exposes hit/miss rates via Actuator at `/actuator/metrics/cache.*`
- ✅ Brute-force lockout using Caffeine TTL is elegant — no explicit "unlock" operation needed; the entry expires on its own
- ⚠️ Caffeine is in-process; cache state is not shared across backend instances. The commented-out Redis dependency in `pom.xml` shows this was planned and deprioritized — it becomes a correctness issue the moment a second backend instance is added
- ⚠️ `clearEventCache()` and `clearPostCache()` in `AdminServiceImpl` are **No-op methods** — cache eviction after admin actions is not implemented, so cached data can remain stale after admin modifications

---

### Module 2 — Authentication and RBAC System (Sa-Token + AOP)

**Responsibility**: Session management, login/logout/token lifecycle, and role-gated access control at both the route level (frontend) and API level (backend).

**How it works end-to-end:**

```
Backend: SaTokenConfig
    SaServletFilter
    |
    +-- addExclude():  /users/register, /users/login, /events/**, /clubs/**,
    |                  /buildings/**, /posts/**, /tags/**, /actuator/**
    |   (all read-only public routes are excluded — no token required)
    |
    +-- addInclude("/**")  <-- all other routes require a valid session
    |
    +-- setAuth(): OPTIONS requests excluded (CORS preflight)
    |
    +-- setError(): returns { code: 401, message: "...", data: null }
                    (sanitized to prevent info leakage)

Controller annotation:
    @CheckRole("ADMIN")           <- posts to /admin endpoints
    @CheckRole("CLUB_MANAGER")    <- posts to /manager endpoints
    @CheckRole({"ADMIN", "CLUB_MANAGER"})

AOP enforcement (AuthCheckAspect):
    @Around("@annotation(CheckRole)")
    -> StpUtil.getSession().get("role")  // role stored at login time
    -> not in requiredRoles? -> throw BusinessException(FORBIDDEN)

Frontend: React Router ProtectedRoute
    <ProtectedRoute requiresAdmin={true}>
        <Suspense><AdminDashboard /></Suspense>
    </ProtectedRoute>
    |
    -> useAuthStore().user.role === "ADMIN" ?
       render children : navigate("/login")
```

**Token flow:**

```
Login -> StpUtil.login(userId) + session.set("role", role)
      -> token = StpUtil.getTokenValue()
      -> returned to frontend in response body

Frontend -> localStorage.setItem("auth_token", token)
         -> Axios interceptor injects: headers["satoken"] = "Bearer " + token
         -> Sa-Token reads: sa-token.is-read-header=true, token-name="satoken", token-prefix="Bearer"
         -> token timeout=30d (absolute), active-timeout=30min (inactivity)

Auto-refresh -> Axios response interceptor reads "token-expires-in" header
             -> < 300 seconds remaining? -> authService.refreshToken()
```

**Design assessment:**
- ✅ Role stored in session at login time means no DB query on every role check — O(1) permission validation
- ✅ Dual exclusion strategy: Sa-Token globally passes public routes, AOP enforces role on specific endpoints — defense in depth
- ✅ Token prefix `Bearer` in header is standard; `satoken` header name is non-standard but consistent across the system
- ⚠️ The frontend route guard uses `userStore.role` from Pinia/Zustand which is loaded at login; if an admin downgrades a user's role via the admin panel, the user's frontend session still shows the old role until they log out and back in — there is no active session invalidation mechanism
- ⚠️ `@Lazy` annotation on `UsersServiceImpl` constructor resolves a circular dependency between `UsersService`, `FollowsService`, and `ClubsService` — a symptom of cross-service coupling that should be resolved through dependency inversion

---

### Module 3 — File Upload System with Cloudflare R2 (FileServiceImpl)

**Responsibility**: Accept file uploads, deduplicate by content hash, store to Cloudflare R2 (or local fallback), and support presigned URL generation for direct browser-to-R2 uploads.

**Core deduplication logic:**

```
uploadFile(file, userId)
    |
    hash = SHA-256(file.getInputStream())   <- Hutool DigestUtil.sha256Hex()
    |
    SELECT * FROM media_assets WHERE hash = ?
    |
    EXISTS? -> return existing MediaAssetVO  <- zero bytes uploaded, database hit only
    |
    NOT EXISTS?
    |
    useR2 = (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY configured)?
    |
    YES (production):
        objectKey = "uploads/" + UUID + "." + ext
        s3Client.putObject(PutObjectRequest{bucket, key, contentType}, RequestBody.fromInputStream())
        finalUrl = r2PublicUrl + "/" + objectKey
    |
    NO (development fallback):
        file.transferTo(Paths.get(uploadPath, filename))
        finalUrl = "/uploads/" + filename
    |
    INSERT media_assets {hash, url, mimeType, sizeBytes, width, height, originalName, uploadedByUserId}
    return MediaAssetVO
```

**Presigned URL flow (direct browser upload):**

```
Client: POST /api/v1/files/presign  { fileName, contentType, purpose }
    |
    v
FileServiceImpl.generatePresignedUrl()
    |
    +-- Validate: contentType in allowedTypes, useR2 must be true
    +-- objectKey = purpose + "/" + userId + "-" + UUID + "." + ext
    |   (backend controls the key — prevents path traversal attacks)
    |
    +-- S3Presigner.presignPutObject(duration=10min)
    |
    return { uploadUrl, fileUrl, objectKey }
    |
    v
Client: PUT <uploadUrl> (file bytes directly to R2, no backend involved)
Client: stores fileUrl in form data for later submission
```

**Design assessment:**
- ✅ SHA-256 deduplication is the correct approach for media platforms — identical content never stored twice regardless of filename
- ✅ Presigned URL pattern eliminates backend bandwidth cost for large files — the correct architecture for file uploads at scale
- ✅ Backend generates the object key (not the client) — prevents path traversal, namespace collisions, and key predictability attacks
- ⚠️ `deleteFile()` extracts the object key via `url.indexOf("uploads/")` — a fragile string operation that silently breaks if the R2 URL structure changes
- ⚠️ `ImageIO.read(file.getInputStream())` for dimension extraction reads the entire file into memory again after hashing it — two full-stream reads per non-deduplicated image
- ⚠️ No virus or malware scanning — any file passing the MIME type check is stored

---

### Module 4 — Club System with Membership State Machine (ClubsServiceImpl)

**Responsibility**: Club CRUD, membership lifecycle (apply → approve → leave), follow relationships (separate from membership), and denormalized stat counters.

**Membership state machine:**

```
User applies to join:
    POST /api/v1/clubs/{id}/apply
    |
    ClubsServiceImpl.applyToJoin(clubId, userId)
        |
        +-- CHECK: existing ClubMembers record?
        |       YES -> return current status (idempotent)
        |       NO  -> INSERT club_members { status: PENDING, role: USER_ID }
        |
    return MembershipStatusVO { status: "PENDING", isMember: false }

Manager approves:
    PATCH /api/v1/manager/clubs/{id}/members/{memberId}/approve
    |
    UPDATE club_members SET status = ACTIVE WHERE id = ?
    UPDATE clubs SET members_count = members_count + 1 WHERE id = ?
    return MembershipStatusVO { status: "ACTIVE", isMember: true }

User leaves:
    DELETE /api/v1/clubs/{id}/members/me
    |
    UPDATE club_members SET deleted = 1 WHERE clubId = ? AND userId = ?  <- soft delete
    UPDATE clubs SET members_count = members_count - 1 WHERE id = ?
```

**Follow vs. Membership:**

```
follows table (polymorphic):
    follower_user_id, target_id, target_type=CLUB
    |
    Any user can follow any club (public action, no approval)
    |
    ClubDetailVO.followersCount = SELECT COUNT(*) FROM follows
                                  WHERE target_id = ? AND target_type = 'CLUB'
                                  (queried live in convertToDetailVO — not cached)

club_members table:
    user_id, club_id, role (MEMBER/MANAGER), status (PENDING/ACTIVE)
    |
    Requires approval workflow; grants access to club-scoped features
```

**Design assessment:**
- ✅ Separating follow (lightweight public interest) from membership (approved participation) is the correct domain model — mirrors how real campus clubs work
- ✅ `MembershipStatus.PENDING` enables an approval workflow without additional tables
- ✅ `updateClubCounts()` recomputes all 4 counters from source tables and reconciles the denormalized values — useful for data consistency repair
- ⚠️ `convertToDetailVO()` queries the `follows` table live on every club detail fetch to compute `followersCount` — this bypasses the cache and adds a DB query to every club detail API call
- ⚠️ Member role comparisons use raw integer constants (`RoleConstants.CLUB_MANAGER_ID = 2`) instead of an enum — easy to introduce off-by-one bugs

---

### Module 5 — Admin Service (AdminServiceImpl)

**Responsibility**: Cross-entity management for platform admins — user lifecycle, role assignment, content moderation, system health monitoring, and in-memory IP security management.

**Key capabilities:**

```
User management:
    updateUserRole(userId, "CLUB_MANAGER", adminId)
        -> validates adminId is an ADMIN-role user in DB
        -> targetUser.setRole(RoleConstants.getValueByName(role))
        -> usersMapper.updateById(targetUser)
        -> NOTE: does NOT force-logout the user; role visible on next login

    updateUserStatus(userId, deleted=1, adminId)
        -> prevents self-ban (userId == adminId check)
        -> if StpUtil.isLogin(userId): StpUtil.logout(userId) [active kick]

Club/Event management:
    deleteEvent(eventId, adminId)
        -> soft delete: UPDATE events SET deleted=1
        -> atomic counter decrement: UPDATE clubs SET events_count = events_count - 1
           WHERE id = ? AND events_count >= 1  <- prevents negative
        -> clearEventCache() [currently No-op]

    deleteClub(clubId, adminId)
        -> soft delete club
        -> cascade soft delete: events WHERE club_id = ?
        -> cascade soft delete: club_members WHERE club_id = ?

IP Security (in-memory, resets on restart):
    addToBlacklist(ip) -> IPBlacklistFilter.addBlacklist(ip)
    removeFromBlacklist(ip) -> IPBlacklistFilter.removeBlacklist(ip)
    addToWhitelist(ip) -> IPBlacklistFilter.addWhitelist(ip)

Dashboard stats (direct count queries, not cached):
    SELECT COUNT(*) FROM users WHERE deleted = 0
    SELECT COUNT(*) FROM events WHERE deleted = 0
    SELECT COUNT(*) FROM clubs WHERE deleted = 0
    SELECT COUNT(*) FROM posts WHERE deleted = 0
```

**Design assessment:**
- ✅ Active session kick (`StpUtil.logout(userId)`) when banning a user is a critical security correctness detail — banned user cannot finish their current session
- ✅ Atomic decrement with `AND events_count >= 1` guard prevents negative counter values under concurrent deletes
- ⚠️ Role update does NOT invalidate the user's active session — a user demoted from `CLUB_MANAGER` to `USER` retains their manager UI until they log out. Fix: `StpUtil.logout(userId)` on role downgrade
- ⚠️ IP blacklist is in-memory — any backend restart or new deployment instance loses the blacklist state. For a production system, persist to database and load on startup
- ⚠️ `clearEventCache()`, `clearPostCache()`, `clearClubCache()` are all No-op methods — stale cached data is not cleared after admin edit operations

---

## 6. Design Decisions and Trade-offs

### Decision 1 — Caffeine Over Redis for Caching

**The problem**: The platform needs caching to handle high-frequency reads (building data, event lists, club lists) without hammering the database.

**The choice**: Caffeine in-process cache with three `CacheManager` beans, instead of Redis.

The commented-out Redis dependencies in `pom.xml` tell the story:
```xml
<!-- Sa-Token Redis integration (Removed) -->
<!-- spring-boot-starter-data-redis (Removed) -->
<!-- commons-pool2 connection pool (Removed) -->
```

Redis was the original plan. It was removed in favor of Caffeine.

**Why**: Railway's free/small tier adds latency and cost for an additional Redis instance. For a single-instance deployment serving a university campus (hundreds of concurrent users, not millions), in-process Caffeine is faster (zero network hop) and simpler.

**What was sacrificed**: Horizontal scalability. Adding a second backend instance means two independent Caffeine caches that diverge on every write. The login lockout counter becomes per-instance, rate limiting per-instance, and cached events can differ between instances.

**If rebuilding**: Keep Caffeine for the performance properties. Add Redis as a second-tier distributed cache for session storage and rate limiting state. Cache building data in Caffeine (truly static, fine for instance-local) but put event lists in Redis (updated frequently, must be consistent across instances).

---

### Decision 2 — Sa-Token Over Spring Security

**The problem**: The RBAC model has three platform roles. Spring Security is powerful but requires significant configuration for custom role logic, and its `UserDetailsService` pattern does not map cleanly to Sa-Token's session model.

**The choice**: Sa-Token 1.37.0 with a custom `@CheckRole` AOP annotation and session-stored roles.

```java
// Role stored at login, not decoded from JWT on every request
StpUtil.login(user.getId());
StpUtil.getSession().set("role", user.getRole());

// Permission check — reads from session (no DB call)
// AuthCheckAspect:
String role = (String) StpUtil.getSession().get("role");
if (!Arrays.asList(requiredRoles).contains(role)) throw FORBIDDEN;
```

**Trade-off**: Spring Security is the industry standard; engineers expect it. Sa-Token is common in Chinese-ecosystem Java projects. The session-stored role means role changes are not reflected until the user re-authenticates — a correctness gap in operational scenarios.

**If rebuilding**: For a team project, Spring Security is worth the setup cost for its ecosystem familiarity. For a solo portfolio project, Sa-Token's simpler API is justified. Either way, add session invalidation on role change from day one.

---

### Decision 3 — Dual-Identifier Login (Username OR Email)

**The problem**: Different users remember their accounts by different identifiers. Forcing username-only login causes unnecessary friction and support requests.

**The choice**: A sequential two-query fallback:

```java
// Try username first
Users user = selectOne(WHERE username = ? AND deleted = 0);

// Fall back to email if no match
if (user == null) {
    user = selectOne(WHERE email = ? AND deleted = 0);
}
```

**Trade-off**: Two potential DB queries per failed login (e.g., a user who always logs in by email pays for a username-miss on every login). This is mitigated because the username query is resolved by an index and takes microseconds.

**Alternative**: A single query with `WHERE username = ? OR email = ?` would work but risks returning multiple rows if the data has an edge case where a username equals another user's email. The sequential approach is safer.

**If rebuilding**: Keep the sequential approach with proper indexes on both `username` and `email` columns.

---

### Decision 4 — SHA-256 Hash Deduplication for Media Files

**The problem**: Multiple users uploading the same image (club logo, stock photo, popular event poster) waste storage and bandwidth.

**The choice**: Compute SHA-256 of the file stream before any upload decision. Check `media_assets.hash` for collision. Return existing record if found — zero bytes uploaded.

```java
String hash = DigestUtil.sha256Hex(file.getInputStream());
MediaAssets existing = selectOne(WHERE hash = ?);
if (existing != null) return convertToVO(existing); // immediate return
```

**Trade-off**: SHA-256 requires reading the entire file stream once before upload. For a 10MB file, this is a full 10MB memory read as a "tax" on non-deduplicated uploads. On cache hits, it's very cheap (just a hash computation + one DB lookup).

**Important caveat**: The `file.getInputStream()` is consumed by the hash. The service then calls `file.getInputStream()` again for the upload. Spring's `MultipartFile` allows re-reading from the underlying temp file, but this is implementation-dependent. If stream behavior changes, the upload would fail silently or upload corrupted content.

**If rebuilding**: Keep this model — it's the correct approach for media deduplication. Consider storing the presigned URL flow as the primary upload path (hash client-side, check server-side, presign only if new) to eliminate the double-read issue.

---

### Decision 5 — Soft Delete Everywhere

**The problem**: Hard deletes make data recovery impossible and break foreign key references in audit trails.

**The choice**: Every entity has a `deleted` field (`0` = active, `1` = soft-deleted). MyBatis Plus `@TableLogic` defined globally:

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

**Trade-off**: The `deleted` column adds overhead to every index. Tables grow indefinitely without a hard-delete cleanup job. The database eventually contains a large proportion of logically-deleted rows that slow down full scans.

**What's missing**: No retention policy, no scheduled cleanup job, no `deleted_at` timestamp for time-based garbage collection.

**If rebuilding**: Keep soft delete, but add `deleted_at TIMESTAMP` to every entity and a scheduled job (monthly) that hard-deletes records soft-deleted more than 90 days ago. This keeps the safety properties while managing table growth.

---

## 7. Engineering Lessons and Key Challenges

### Challenge 1 — Circular Dependency Between Core Services

**The problem**: `UsersService` needs to call `FollowsService` (to follow/unfollow clubs). `FollowsService` needs `ClubsService` (to update club follow counts). `ClubsService` needs `UsersService` (to resolve user information). Spring detects the cycle and throws `BeanCurrentlyInCreationException`.

**Solution**: `@Lazy` annotation on the constructor injection in `UsersServiceImpl`:

```java
@Lazy FollowsService followsService,
@Lazy ClubsService clubsService
```

This defers the full initialization of the injected beans until first use, breaking the initialization cycle.

**The real problem with this fix**: `@Lazy` is a symptom treatment, not a cure. The underlying design issue is that `UsersService`, `FollowsService`, and `ClubsService` have bidirectional dependencies — a sign that the responsibility boundaries between them are unclear.

**Lesson**: When three services form a dependency cycle, extract the shared behavior into a fourth service. In this case, a `SocialGraphService` that owns all follow/member relationship operations would eliminate the cycle. Do not ship `@Lazy` as a permanent fix.

---

### Challenge 2 — Token Precision Over HTTP Headers

**The problem**: MyBatis Plus uses Snowflake-generated 64-bit `Long` IDs. JavaScript's `Number` type can safely represent integers up to `2^53 - 1` (≈ 9 quadrillion). Snowflake IDs can exceed this bound. When serialized as a JSON number, the frontend silently receives a corrupted ID.

**Solution**: Jackson global configuration to serialize all `Long` values as JSON strings:

```java
// JacksonConfig.java
SimpleModule module = new SimpleModule();
module.addSerializer(Long.class, ToStringSerializer.instance);
module.addSerializer(Long.TYPE, ToStringSerializer.instance);
objectMapper.registerModule(module);
```

This is why event IDs, club IDs, and user IDs appear as strings (`"1234567890123456789"`) in the API response rather than numbers.

**Lesson**: Configure `Long → String` serialization globally as the first thing you do when building a Java API consumed by a JavaScript client. There is no circumstance where a JS client needs a 64-bit integer as a number type.

---

### Challenge 3 — CORS and Sa-Token Filter Interaction

**The problem**: Sa-Token's `SaServletFilter` intercepts all requests before Spring's CORS filter runs. If an OPTIONS preflight request arrives, Sa-Token validates it as an authenticated request and returns 401 before the CORS headers are set — causing all cross-origin requests to fail with a CORS error that masks the real auth error.

**Solution**: Explicit exclusion of OPTIONS method in the Sa-Token filter:

```java
// SaTokenConfig.java
.setAuth(obj -> {
    SaRouter.match("/**")
        .notMatch(SaHttpMethod.OPTIONS)  // <- exclude CORS preflight
        .check(r -> { /* auth logic */ });
})
```

And ensuring the `CorsConfig` bean is registered with the highest precedence (before Sa-Token's filter).

**Lesson**: Always test CORS before layering in auth middleware. The interaction between CORS preflight and any request-intercepting filter is a frequent and confusing failure mode. Verify with a browser network tab, not just curl.

---

### Challenge 4 — Rate Limiter Precision on Multi-Instance Deployments

**The problem**: The `InMemoryRateLimiter` stores all token buckets in a `ConcurrentHashMap` in the JVM heap. If two backend instances are running, a user who makes 30 requests to instance A and 30 requests to instance B has effectively bypassed the 60-request-per-minute per-user limit — each instance sees only 30.

**Current state**: This is accepted as a known limitation for the current single-instance Railway deployment.

**The correct fix**: Move rate limiting state to Redis. Each increment/check becomes `REDIS INCR ip:<ip>` with a TTL-based expiry. The state is shared across all instances. Alternatively, push rate limiting to the Nginx layer entirely — more operationally correct for a reverse proxy setup.

**Lesson**: Any in-memory state (rate limits, session locks, blacklists) that must be consistent across multiple server processes is a distributed state management problem. While a single instance validates the design, always document the scaling limitation explicitly so it does not become a production incident.

---

## 8. Rebuild Guide

If you want to implement a similar campus platform from scratch, here is the build order and the gotchas worth knowing upfront.

### Step-by-Step Build Order

**Step 1 — Database Schema (Day 1)**

Design all core tables before writing any Java or React:

```sql
users       (id, username, email, password_hash, display_name, role,
             avatar_url, cover_url, bio, following_count, favorites_count,
             deleted, created_at, last_login_at)

clubs       (id, name, slug, description, category, logo_url, cover_url,
             members_count, events_count, posts_count, followers_count,
             deleted, created_at, updated_at)

clubs       → club_members (club_id, user_id, role, status, joined_at, deleted)

buildings   (id, name, school_id, lat, lng, category, deleted)
schools     (id, name, ...)
events      (id, title, description, club_id, building_id, start_time, end_time,
             cover_url, is_official, view_count, deleted)
tags        (id, name)
event_tags  (event_id, tag_id)

posts       (id, title, content, author_user_id, author_club_id, cover_url,
             comments_count, likes_count, deleted)
post_comments (id, post_id, author_user_id, content, parent_id, deleted)

follows     (follower_user_id, target_id, target_type)           <- polymorphic
event_favorites  (user_id, event_id)
event_schedules  (user_id, event_id)
media_assets (id, hash, url, mime_type, size_bytes, width, height)
```

**Critical decisions at this stage:**
- Add `deleted` to every entity from the start — retrofitting soft delete is painful
- Use `BIGINT` IDs with a Snowflake strategy — and configure Jackson to serialize them as strings to JavaScript immediately
- Add `slug` to `clubs` from day one — URL-friendly identifiers are harder to add later
- Index `(username)`, `(email)` on users; `(club_id, deleted)` on events; `(hash)` on media_assets

---

**Step 2 — Backend Infrastructure (Day 2–3)**

Wire up the skeleton before any domain logic:

```
1. Spring Boot project + PostgreSQL connection (verify HikariCP pool)
2. R<T> unified response wrapper + GlobalExceptionHandler + BusinessException
3. @TableLogic soft delete configured in MyBatis Plus global config
4. Sa-Token: SaServletFilter with public route exclusions
   Test: /users/login excluded, /admin/** requires auth
5. CORS config: add all origins (prod + localhost + vite port)
6. Caffeine CacheManager: 3 beans with different TTLs
7. Actuator: health + prometheus exposed
8. Knife4j: verify /doc.html loads
```

**The biggest gotcha**: CORS and Sa-Token filter ordering. Configure `CorsConfig` with `@Order(Ordered.HIGHEST_PRECEDENCE)` before writing any authenticated endpoints, then verify with a browser OPTIONS preflight from a different port.

---

**Step 3 — User Auth + BCrypt (Day 4–5)**

```
1. BCrypt Spring Security Crypto (no full Spring Security stack)
   work factor = 12: balance of security vs. login latency
2. Register endpoint: validate username/email uniqueness, hash password,
   force role = USER (never trust client-supplied role)
3. Login endpoint: dual-identifier lookup, BCrypt.checkpw(),
   Caffeine lockout cache (5 attempts → 15min block)
4. Sa-Token session: StpUtil.login(userId) + session.set("role", role)
5. Frontend: Axios interceptor injects satoken header; 401 handler clears storage
```

**Fix Snowflake ID serialization immediately after login works:**

```java
// JacksonConfig.java — do this on day 1, not as a later hotfix
module.addSerializer(Long.class, ToStringSerializer.instance);
module.addSerializer(Long.TYPE, ToStringSerializer.instance);
```

---

**Step 4 — File Upload + Deduplication (Day 6–7)**

```
1. Cloudflare R2: create bucket, get account-id + access/secret keys
2. Configure S3Client with R2 endpoint (region = "auto")
3. SHA-256 hash -> check media_assets -> early return if duplicate
4. Upload to R2: PutObjectRequest + RequestBody.fromInputStream()
5. Fallback: if R2 credentials absent, save to ./uploads (dev only)
6. Presigned URL: S3Presigner.presignPutObject(10min)
   Backend generates object key (never let client specify the path)
7. Store result in media_assets table
```

**Common pitfall**: `file.getInputStream()` is consumed by the hash computation. Verify that `MultipartFile.getInputStream()` can be called twice in your Spring Boot version — if not, copy to a `ByteArrayOutputStream` first and use that for both operations.

---

**Step 5 — Core Domain: Clubs + Events (Day 8–11)**

Build clubs before events (events depend on clubs):

```
Clubs:
    1. CRUD with slug auto-generation (SlugUtils)
    2. @Cacheable clubList + clubDetail; @CacheEvict on write
    3. Membership: INSERT club_members {status: PENDING}
       Approval: UPDATE status = ACTIVE; clubs.members_count + 1
    4. Follow: INSERT follows {target_type: CLUB}; clubs.followers_count + 1

Events:
    1. CRUD with @CheckRole("CLUB_MANAGER")
    2. @CacheEvict "eventList" + "eventSearch" on create/update/delete
    3. Atomic counter: UPDATE clubs SET events_count = events_count ± 1
       Always: AND events_count >= 1 guard on decrement
    4. Favorites: INSERT event_favorites; @CacheEvict eventDetail
```

**Critical pitfall**: Counter updates must be atomic SQL (`UPDATE ... SET count = count + 1`), not read-modify-write in Java. Under concurrent requests, a Java-side increment reads stale data and loses updates.

---

**Step 6 — Map Heatmap + Building Cache (Day 12)**

```
1. Buildings seeded from CSV or admin panel
2. BuildingsServiceImpl.getBuildingEventCounts():
   - fetch all buildings (24h Caffeine cache)
   - fetch events WHERE end_time >= NOW() - 15 days (sliding window)
   - GROUP BY building_id in Java stream (small dataset, acceptable)
   - add { buildingId: -1, name: "Online / Virtual" } always
   - cache result (building_stats, 10min TTL)
3. Frontend: React Leaflet CircleMarker per building
   radius = Math.sqrt(eventCount) * baseRadius (non-linear feels better)
   onClick: navigate("/search?building=" + buildingId)
```

---

**Step 7 — Admin Dashboard (Day 13–14)**

Build admin last — it depends on all other modules:

```
1. AdminController: @CheckRole("ADMIN") on all endpoints
2. User management: role update, account ban (+ StpUtil.logout on ban)
3. Content moderation: soft delete events, posts, clubs with cascade
4. Dashboard stats: 6 COUNT queries (not cached — admin sees live data)
5. Frontend: lazy-loaded AdminDashboard behind ProtectedRoute{requiresAdmin}
```

---

### Critical Decisions to Make Upfront

| Decision | Recommendation |
|----------|----------------|
| Counter vs. aggregate for club stats | Pre-computed counters with atomic SQL — always |
| Token ID precision | Configure `Long → String` Jackson serializer globally on day 1 |
| Soft delete | Add `deleted` + `@TableLogic` to every entity from the start |
| Cache topology | Caffeine for single-instance; Redis when adding a second instance |
| Rate limiting scope | Start in-process; migrate to Redis or Nginx before multi-instance |
| File deduplication | SHA-256 hash check before every upload |
| CORS + auth filter order | Verify with browser preflight before building any auth logic |
| Role change propagation | Force re-login on role downgrade; don't rely on cached role in session |

---

### Common Pitfalls

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| No `@Lazy` on circular dependencies | Spring startup fails with `BeanCurrentlyInCreationException` | Extract shared logic into a new service; don't ship `@Lazy` permanently |
| `Long` ID as JSON number | JavaScript silently corrupts IDs > 2^53 | Global Jackson `Long → ToStringSerializer` |
| CORS blocked before auth | OPTIONS preflight hits Sa-Token filter, returns 401, browser shows CORS error | Configure `CorsConfig` with highest precedence; exclude OPTIONS from auth |
| Quota decrement without guard | `events_count` goes negative under concurrent deletes | `UPDATE ... SET count = count - 1 WHERE id = ? AND count >= 1` |
| `file.getInputStream()` double-read | Second read returns empty stream; upload corrupts or fails silently | Buffer to `byte[]` or `ByteArrayOutputStream` before hashing |
| Admin role update without session invalidation | Demoted user retains elevated access until voluntary logout | Call `StpUtil.logout(userId)` on role downgrade |
| IP blacklist in-memory | Blacklist cleared on every deploy or restart | Persist to database; load on startup |
| Follower count live query in detail view | Every club detail API call hits the database for a count | Cache follower count in `clubs.followers_count`; evict on follow/unfollow |
| `clearEventCache()` is No-op | Stale event data served from cache after admin edits | Implement actual `@CacheEvict` calls in admin write operations |
| Rate limit state per-instance | Multi-instance deployment bypasses per-user/IP limits | Move rate limit counters to Redis; or delegate to Nginx |

---

## Running Locally

### Backend

```bash
cd utm-what2do-backend

# Create .env file with your config:
cat > .env << 'EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/postgres
PG_USERNAME=postgres
PG_PASSWORD=123456
# Optional: leave empty to use local ./uploads fallback
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=utm-what2do-files
R2_PUBLIC_URL=
RESEND_API_KEY=re_dummy_key_for_development
EOF

# Start PostgreSQL (Docker)
docker run -d --name utm-pg \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 postgres:16-alpine

# Initialize schema
psql -h localhost -U postgres -d postgres \
  -f src/main/resources/init-postgres.sql

mvn spring-boot:run
# API: http://localhost:8232/api/v1
# Swagger: http://localhost:8232/doc.html
```

### Frontend

```bash
cd utm-what2do-frontend-react

# Create local env
echo "VITE_API_BASE_URL=http://localhost:8232/api/v1" > .env.local

npm install
npm run dev
# App: http://localhost:5173
```

---

## Project Structure

```
utm-what2do/
|
+-- utm-what2do-backend/              Spring Boot 3.2.5 (Java 17)
|   +-- pom.xml
|   +-- src/main/
|       +-- java/com/utm/what2do/
|       |   +-- annotation/           @CheckRole definition
|       |   +-- aop/                  AuthCheckAspect (role gate)
|       |   +-- common/               R<T>, GlobalExceptionHandler, BusinessException
|       |   +-- config/               Caffeine, SaToken, CORS, RateLimit, IPBlacklist
|       |   +-- constant/             RoleConstants, UpdateConstants (atomic SQL)
|       |   +-- controller/           13 REST controllers
|       |   +-- mapper/               17 MyBatis Plus mapper interfaces
|       |   +-- model/
|       |   |   +-- entity/           17 entity classes
|       |   |   +-- dto/              Request objects per feature
|       |   |   +-- vo/               Response objects (UserInfoVO, EventCardVO, ...)
|       |   |   +-- enums/            ClubCategory, MembershipStatus, TargetType, ...
|       |   +-- service/              21 service interfaces
|       |       +-- impl/             23 implementations
|       |           +-- UsersServiceImpl        (auth, BCrypt, lockout)
|       |           +-- ClubsServiceImpl        (membership, follow, cache)
|       |           +-- AdminServiceImpl        (cross-entity management)
|       |           +-- FileServiceImpl         (R2, dedup, presigned URL)
|       |           +-- BuildingsServiceImpl    (geo, heatmap aggregation)
|       |           +-- InMemoryRateLimiter     (Guava token bucket, 3D)
|       |           +-- ... (17 more)
|       +-- resources/
|           +-- application.yml       Full config with env var defaults
|           +-- init-postgres.sql     Schema DDL
|           +-- mapper/               MyBatis XML mappers (complex queries)
|
+-- utm-what2do-frontend-react/       React 19 + TypeScript + Vite (active)
|   +-- package.json
|   +-- vite.config.ts
|   +-- src/
|       +-- App.tsx                   Root + TanStack Query provider
|       +-- main.tsx                  Entry point
|       +-- router.tsx                createBrowserRouter, all lazy routes
|       +-- types.ts                  Shared TypeScript types
|       +-- components/               Shared + page-level components
|       |   +-- ProtectedRoute.tsx    Auth + role gate component
|       |   +-- RouteErrorBoundary.tsx
|       |   +-- LoginPage/
|       |   +-- MapPage/
|       |   +-- EventDetailPage/
|       |   +-- ClubDetailPage/
|       |   +-- profile/              ProfileMainView, ProfileSavedEvents, ...
|       +-- pages/
|       |   +-- HomePage.tsx
|       |   +-- AdminDashboard.tsx
|       +-- stores/
|       |   +-- useAuthStore.ts       Zustand: current user + auth actions
|       |   +-- useSchoolsStore.ts    Zustand: current school context
|       +-- hooks/
|       |   +-- useEventsQuery.ts     TanStack Query: event CRUD hooks
|       |   +-- useFilteredEvents.ts  Client-side event filter logic
|       +-- services/                 Axios API service modules
|       +-- config/                   API endpoint constants
|       +-- utils/                    Format, date, string utilities
|
+-- database/                         Seed data (CSV: clubs, events, buildings)
+-- nginx.conf                         Reference reverse proxy config
+-- docs/                             Additional documentation
```

---

## References

- [Sa-Token Documentation](https://sa-token.cc/) — the auth framework powering the session + RBAC system
- [MyBatis-Plus Documentation](https://baomidou.com/) — ORM with `@TableLogic`, `LambdaQueryWrapper`, and pagination
- [Caffeine Cache Documentation](https://github.com/ben-manes/caffeine) — the in-process cache library
- [TanStack Query v5 Documentation](https://tanstack.com/query/latest) — server state management for the React frontend
- [Cloudflare R2 + AWS S3 SDK v2](https://developers.cloudflare.com/r2/api/s3/) — S3-compatible object storage with presigned URL support
- [OWASP HTML Sanitizer](https://github.com/OWASP/java-html-sanitizer) — allowlist-based XSS protection
- [React Leaflet Documentation](https://react-leaflet.js.org/) — React components for Leaflet.js maps
- [Knife4j Documentation](https://doc.xiaominfo.com/) — enhanced Swagger UI and OpenAPI spec generation

---
