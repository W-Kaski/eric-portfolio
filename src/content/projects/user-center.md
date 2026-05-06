---
title: user-center
category: Fullstack
color: "#1890FF"
date: 2024-04-14
github: "https://github.com/W-Kaski/user-center"
---


![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Umi Max](https://img.shields.io/badge/Umi_Max-4-fa8c16?style=flat-square)
![Ant Design Pro](https://img.shields.io/badge/Ant_Design_Pro-6-1890ff?style=flat-square&logo=antdesign&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)

---

## Overview

user-center is a foundational full-stack authentication and user management platform designed to serve as the unified account base for internal enterprise systems or new B-end applications.

In microservice or multi-system environments, building authentication, user CRUD, registration, and session management from scratch for every new project is repetitive and error-prone. user-center extracts this common denominator into a standalone service.

At its core, the system provides a robust RESTful API backend communicating with an out-of-the-box Ant Design Pro management dashboard. 

> **Why build this?**
> I wanted to establish a solid "starting template" for my future server-side and web projects. By decoupling the user management module from individual business logic, I can jumpstart new applications in minutes. It also served as a hands-on exercise in enterprise-grade frontend architecture using Ant Design Pro and strict Java MVC layering.

---

## Table of Contents

1. [Core Problem and Design Goals](#1-core-problem-and-design-goals)
2. [Tech Stack Breakdown](#2-tech-stack-breakdown)
3. [System Architecture](#3-system-architecture)
4. [Key Data Flows](#4-key-data-flows)
5. [Core Modules Deep Dive](#5-core-modules-deep-dive)
6. [Design Decisions and Trade-offs](#6-design-decisions-and-trade-offs)
7. [Rebuild Guide & Engineering Lessons](#7-rebuild-guide--engineering-lessons)

---

## 1. Core Problem and Design Goals

If you build 5 web applications, you end up writing 5 login pages, 5 user tables, and 5 password hashing utilities. user-center solves this operational overhead.

**Core design goals:**

| Goal | Implementation |
|------|----------------|
| Centralized Identity | A single, unified `user` table serving as the source of truth for accounts. |
| Enterprise UI | Ant Design Pro v6 with Umi Max provides a fast, production-ready admin dashboard. |
| Global Data Consistency | MyBatis-Plus `@TableLogic` applied for invisible, automated soft deletes. |
| Security Baseline | Salted MD5 hashing for passwords and forced data masking before API responses. |
| Strict API Contracts | Global exception handler wrapping all responses into standard `{code, data, message}`. |

---

## 2. Tech Stack Breakdown

### Frontend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **React 18** | SPA framework | Industry standard for web applications with a massive ecosystem. |
| **Umi Max** | Enterprise framework | Combines routing, request interception, and data flow into one integrated tool. Eliminates Vite/Webpack configuration boilerplate. |
| **Ant Design Pro v6** | UI scaffolding | Heavily optimizes development time for admin CRUD operations (e.g., `ProTable`). Native React components would require immense layout plumbing. |
| **TypeScript** | Type safety | Catch runtime data shape bugs at compile-time when communicating with strict Java JSON models. |

### Backend

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **Spring Boot 3.4.2** | Application framework | Mature, robust, and the absolute standard for enterprise Java backends. |
| **MyBatis Plus 3.5.10** | ORM / data access | Eliminates manual XML SQL mapping for standard CRUD; provides out-of-the-box pagination and soft delete. |
| **Java Servlet Session** | Authentication | Stores `USER_LOGIN_STATE` globally in server memory for zero-config session tracking. |
| **Lombok** | Code generation | `@Data`, `@Slf4j` eliminates Java boilerplate for getters/setters/constructors. |

### Database

| Technology | Role | Why this, not X? |
|-----------|------|-----------------|
| **MySQL** | Primary relational DB | Standard transactional DB, providing ACID properties and strong consistency. |

---

## 3. System Architecture

**Overall style: Frontend/Backend Separation + Spring Boot Monolithic App**

```text
+------------------------------------------------------------------+
|                    Browser (Ant Design Pro SPA)                  |
|                                                                  |
|  +----------------+  +----------------+  +--------------------+  |
|  |  Login Page    |  |  Admin Panel   |  |   User Settings    |  |
|  +----------------+  +----------------+  +--------------------+  |
|                                                                  |
|  State: Umi initialState (Global user state)                     |
|  HTTP: Umi-Request Interceptor (Expects response.code === 0)     |
|  Auth Guard: Umi Runtime Layout (Redirects to /user/login)       |
+------------------------------------------------------------------+
                             |
                    HTTPS / REST API (/api/*)
                             |
+------------------------------------------------------------------+
|            Spring Boot Backend  (port 8080)                      |
|                                                                  |
|  Controller Layer                                                |
|  +- UserController        /api/user/login, /register, /current   |
|                                                                  |
|  Service Layer                                                   |
|  +- UsersServiceImpl      Register logic, session management,    |
|                           data masking (getSafedUser)            |
|                                                                  |
|  Common / DTOs                                                   |
|  +- BaseResponse          Standard JSON Wrapper (code/data/msg)  |
|  +- ErrorCode             Enum for business errors               |
|  +- BusinessException     Custom checked exceptions              |
|                                                                  |
|  Mapper Layer                                                    |
|  +- UserMapper            Extends BaseMapper<User>               |
+------------------------------------------------------------------+
                             |
                             v
                           MySQL
                       (`user` table)       
```

---

## 4. Key Data Flows

### Flow A — User Registration
```text
User submits { account, password, checkPassword, identityCode }
    |
    v
UserController.userRegister() -> UsersServiceImpl.userRegister()
    |
    +-- 1. Format validation: length checks, regex pattern for invalid chars
    |
    +-- 2. Duplicate constraint check:
    |       QueryWrapper: count(userAccount = ?) or count(identityCode = ?)
    |       Exists? -> throw BusinessException(PARAMS_ERROR)
    |
    +-- 3. Password encryption:
    |       digest = MD5( SALT + raw_password )
    |
    +-- 4. INSERT INTO user (...)
    |
    v
Return new User ID to frontend.
```

### Flow B — Application Boot & Session Hydration
```text
User successfully logged in, opens "/admin"
    |
    v
Frontend Umi getInitialState():
    |
    +-- Trigger: GET /api/user/current
    |
    +-- Backend: checks JSESSIONID Cookie against Tomcat memory session
    |       Found? -> Returns masked User object
    |       Not Found? -> Throws BusinessException (Not Logged In)
    |
Frontend Umi Layout Interceptor:
    |
    +-- Is initialState.currentUser present?
    |       YES -> Render requested dashboard view
    |       NO -> Unmount component, trigger history.push('/user/login')
```

---

## 5. Core Modules Deep Dive

### Module 1 — Umi Max InitialState & Layout Guards (`src/app.tsx`)
**Responsibility**: Eliminate duplicate auth-checking code on every React page and manage UI layout seamlessly.
**How it works**:
In `src/app.tsx`, `getInitialState()` acts as the top-level blocker/loader. It fires `queryCurrentUser()`. If successful, user data is vaulted in a global context. The framework's `layout` config then operates as router middleware—if the user navigates randomly but is not logged in (and the route isn't explicitly in `NO_LOGIN_WHITE_LIST`), access is immediately halted with a forced redirect.
**Design assessment**:
- ✅ Extremely centralized and secure. New pages developers add to the project are "protected by default" without them having to write wrapper components or HOCs (Higher Order Components).

### Module 2 — Backend Data Masking (`getSafedUser`)
**Responsibility**: Ensure sensitive database fields (mainly `password`) absolutely never leak to the web client via network devtools.
**How it works**:
In `UserServiceImpl.java`, `getSafedUser(User)` implements a strict allow-list transformation. After a successful query, it copies over only safe fields (id, username, avatarUrl, status, etc.) into a sanitized User instance.
**Design assessment**:
- ✅ "Zero trust" approach to DTO conversion over network layers.
- ⚠️ Manual getter/setter mapping works fine here, but scaling this to dozens of entities usually warrants a library like MapStruct or Dozer to eliminate boilerplate.

---

## 6. Design Decisions and Trade-offs

### Decision 1 — Tomcat Native Session over Stateless JWT
**The problem**: Tracking user authentication context between browser requests.
**The choice**: Native `request.getSession().setAttribute()` using traditional `JSESSIONID` cookies.
**Why**: Dead simple to implement, handles "kicking a user" easily (by invalidating the active session object), and is robust against common XSS vectors when `HttpOnly` is in use compared to placing JWTs locally.
**What was sacrificed**: Horizontal cloud scalability. Since the state lives purely in the RAM of one container instance, spinning up a secondary node behind a load balancer would cause broken authentications (split-brain).

### Decision 2 — Static Salted MD5 String over BCrypt
**The choice**: Code currently hashes via `DigestUtils.md5DigestAsHex` alongside a hardcoded, app-wide generic static salt (`"???///"`).
**Trade-off**: Fast compute times and easy logic structure. However, by modern cyber standards, this is fundamentally insecure. If an attacker dumps both the database and sniffs the source code salt, generating rainbow tables to reverse-engineer passwords remains completely viable because identical passwords will always share the exact same hash output.

---

## 7. Rebuild Guide & Engineering Lessons

If pivoting this core to support a large-scale, high-concurrency enterprise ecosystem, address the following architectural bottlenecks:

**1. Database Level (Critical Issue: Race Conditions)**
The current `userRegister` method performs a `SELECT count(...)` followed immediately by an `INSERT` to prevent duplicate handles. Under concurrent burst load (e.g., API flooding), two web threads will simultaneously read `count = 0` and forcefully proceed to insert, causing completely duplicated user profiles.
- **Fix**: You must delegate this to standard Relational DB rules by creating a `UNIQUE Index` directly onto the `userAccount` schema definition. Application-level "checking" is practically useless against microsecond race conditions.

**2. Distributed Scaling Support**
- To resolve the RAM Session bottleneck, maintain the easy `getSession()` logic but seamlessly swap the backing mechanism by throwing `spring-session-data-redis` into Maven. This turns the application instantly stateless with zero rewriting.

**3. Password Security Upgrades**
- Fully deprecate customized MD5 hashing. Switch natively to Spring Security's `BCryptPasswordEncoder`—it integrates the salt randomized internally within the hash payload guaranteeing two identical passwords generate completely different signatures.
