---
name: workspace-overview
description: Architectural map, key configuration files, and technology stack of the civicpath-backend project.
---

# Workspace Overview Skill

This skill acts as the master guide to the architectural structure, entrypoints, and technology stack of the `civicpath-backend` project.

## Directory Structure

```
civicpath-backend/
├── .agent/
│   └── skills/                   # Reusable workspace skills for agentic AI
│       ├── nestjs-v11-development/
│       │   └── SKILL.md          # NestJS v11 coding standards and DTO guidelines
│       ├── project-operations/
│       │   └── SKILL.md          # PNPM scripts, testing, formatting, and operations
│       └── workspace-overview/
│           └── SKILL.md          # Master architecture and project layout map
├── .gemini/
│   └── GEMINI.md                 # Root agent instructions (strictly enforces pnpm usage)
├── src/                          # NestJS application source code
│   ├── app.controller.spec.ts    # Unit test for AppController
│   ├── app.controller.ts         # Controller defining root-level application routes
│   ├── app.module.ts             # App root module integrating all feature modules
│   ├── app.service.ts            # Root service provider containing app-level logic
│   └── main.ts                   # Bootstrapping script (sets up NestFactory and port)
├── test/                         # End-to-end (E2E) integration test suites
│   ├── app.e2e-spec.ts           # E2E test for root endpoints using Supertest
│   └── jest-e2e.json             # Dedicated Jest configuration for E2E suites
├── nest-cli.json                 # NestJS Command Line Interface (CLI) configurations
├── tsconfig.json                 # Base strict-mode TypeScript compilation options
├── tsconfig.build.json           # TS compiler options used specifically during build time
├── eslint.config.mjs             # ESLint config defining type-checked rules and rulesets
├── .prettierrc                   # Prettier formatting specifications (single quotes, trailing commas)
├── AGENTS.md                     # Root agent guidelines (strictly enforces pnpm usage)
├── package.json                  # PNPM scripts, core framework (NestJS 11), dev dependencies
├── pnpm-lock.yaml                # Lockfile locking exact package versions
├── pnpm-workspace.yaml           # PNPM workspace configurations for workspace build permissions
└── README.md                     # General developer documentation and startup guide
```

---

## Core Technologies and Setup

- **Core Framework**: NestJS v11.0.1 (harnessing decorators, dependency injection, and express platform adapters).
- **Runtime Environment**: Node.js 20+ executing with TypeScript v5.7.3.
- **Dependency Management**: Standardized on `pnpm` for blazing-fast, workspace-optimized package storage.
- **Code Quality**: Structured around **ESLint 9+** and **Prettier 3+**, enforcing automated lint checking and auto-formatting rules to ensure a flawless and clean source tree.
- **Testing Engine**: Built around **Jest** and **ts-jest** for fully-typed unit and E2E testing capabilities.

---

## Backend Architectural Philosophy

When expanding this backend project, agents and developers must prioritize high-quality, scalable API designs:

1. **RESTful Resource Design**
   - Design clean and descriptive API routes (e.g. `/api/v1/users`, `/api/v1/notifications`).
   - Adhere to standard HTTP request methods (`GET` to fetch, `POST` to create, `PUT`/`PATCH` to update, `DELETE` to remove).
   - Return appropriate HTTP status codes (e.g., `201 Created` for POST creation, `200 OK` for successful fetches, `204 No Content` for successful deletes).

2. **Strict Type Safety & Interfaces**
   - Avoid generic `any` structures. Use TypeScript's rich interfaces, classes, generics, and custom types.
   - Every service method must clearly declare parameter types and return values, including wrapping asynchronous methods in `Promise<Type>`.

3. **Secure & Scalable Data Operations**
   - Ensure all input payloads are automatically validated at the controller boundary using DTO class-validators.
   - Handle edge-cases gracefully at the service layer by raising explicit NestJS HTTP exceptions.
