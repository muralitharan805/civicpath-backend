---
name: project-operations
description: Practical procedures and exact commands to serve, build, test, lint, and format the civicpath-backend codebase using pnpm.
---

# Project Operations Skill

This skill documents how to execute development tasks, builds, tests, linting, and standard operations in this NestJS backend workspace.

> [!IMPORTANT]
> **This project uses `pnpm` for package and dependency management.**
> - Any agent executing commands or modifying dependencies **MUST** use `pnpm` (e.g., `pnpm install`, `pnpm add`, `pnpm add -D`).
> - Do **NOT** use `npm` or `yarn` under any circumstances to install packages or manage files.

## PNPM Scripts and Command Directory

The project includes standard scripts defined in `package.json` to manage development workflows.

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server (Watch)** | `pnpm run start:dev` | Serves the NestJS application locally on `http://localhost:3000/` with live-reloads on file changes. |
| **Start Server (Normal)** | `pnpm run start` | Runs the NestJS application without watch mode. |
| **Start Debug Server** | `pnpm run start:debug` | Serves the NestJS application in watch mode with the Node.js debugger enabled. |
| **Build Production** | `pnpm run build` | Compiles the TypeScript application into a production-ready JavaScript bundle in the `dist` folder. |
| **Start Production Server** | `pnpm run start:prod` | Runs the compiled production code from the `dist/` directory (`node dist/main`). |
| **Run Unit Tests** | `pnpm run test` | Executes unit tests using Jest. Spec files are named `*.spec.ts`. |
| **Run Unit Tests (Watch)** | `pnpm run test:watch` | Runs Jest in interactive watch mode. |
| **Run E2E Tests** | `pnpm run test:e2e` | Runs end-to-end integration tests using Jest and Supertest (`test/jest-e2e.json`). |
| **Run Code Linting** | `pnpm run lint` | Checks TypeScript source files for style and lint violations using ESLint, auto-fixing when possible. |
| **Run Formatting** | `pnpm run format` | Enforces style guide standards and formats source files via Prettier. |

---

## Technical Details & Specific Operations

### 1. Serving the Application Locally

To start the NestJS v11 development server with hot-reloading:
```bash
pnpm run start:dev
```
By default, the server listens on `http://localhost:3000/` (or the port defined in the `PORT` environment variable). 
If debugging, you can use the debug script which launches on port `9229` for inspector attachment:
```bash
pnpm run start:debug
```

### 2. Compiling and Building for Production

Before code commits, verification, or deployment, compile the TypeScript source files to validate types and output production files:
```bash
pnpm run build
```
This runs the Nest CLI compiler (`nest build`) which produces optimized JavaScript files in the `/dist` directory.

### 3. Testing Strategies

Testing is powered by **Jest** and **ts-jest**.

- **Unit Testing**:
  To execute unit tests:
  ```bash
  pnpm run test
  ```
  This searches for all `*.spec.ts` files inside `src/` and runs them.
  To run unit tests with coverage reporting:
  ```bash
  pnpm run test:cov
  ```

- **End-to-End (E2E) Integration Testing**:
  To execute E2E tests:
  ```bash
  pnpm run test:e2e
  ```
  E2E tests reside in the `test/` directory, are configured in `test/jest-e2e.json`, and verify high-level route request-response flows using `supertest`.

### 4. Linting and Formatting

This project maintains code quality using **ESLint 9+** and **Prettier**.

- **Run Linting**:
  To check the codebase for code quality issues and automatically fix simple errors:
  ```bash
  pnpm run lint
  ```
  
- **Auto-Format Code**:
  To format the TypeScript source and test files using the project's formatting specifications:
  ```bash
  pnpm run format
  ```
  This runs `prettier --write "src/**/*.ts" "test/**/*.ts"`.

---

## Package Installation Cheat Sheet

When adding, updating, or removing dependencies, you must use `pnpm`:

* **Install all current dependencies**:
  ```bash
  pnpm install
  ```
* **Add a runtime dependency**:
  ```bash
  pnpm add <package-name>
  ```
* **Add a development dependency**:
  ```bash
  pnpm add -D <package-name>
  ```
* **Remove a dependency**:
  ```bash
  pnpm remove <package-name>
  ```
