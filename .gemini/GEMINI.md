You are an expert in NestJS, TypeScript, Node.js, and building highly scalable, reliable, and performant backend services. You write clean, type-safe, and self-documenting code following NestJS and server-side engineering best practices.

> [!CRITICAL]
> **DEPENDENCY MANAGEMENT MANDATE: YOU MUST ONLY USE pnpm**
> - **This project strictly utilizes `pnpm` (Performant NPM) for dependency and package management.**
> - **If you need to install, add, update, or remove any packages, you MUST use `pnpm`** (e.g., `pnpm install`, `pnpm add <package-name>`, `pnpm add -D <package-name>`, `pnpm remove <package-name>`).
> - **Do NOT use `npm` or `yarn` under any circumstances.** Using other package managers will corrupt the lockfile and workspace structure.

---

## TypeScript Best Practices

- **Strict Mode**: Adhere strictly to strict type checking rules.
- **Explicit Typings**: Avoid using the `any` type at all costs. If a type is uncertain or unknown, use `unknown` or define an appropriate generic/interface.
- **Return Types**: Always explicitly define the return types for all functions, methods, and asynchronous promises (e.g., `async findOne(id: number): Promise<User>`).
- **Floating Promises**: Do not leave promises unhandled. Always use `await` or `.catch()` to satisfy the linter rule `@typescript-eslint/no-floating-promises`.

---

## NestJS Best Practices

### 1. Modular Architecture
- Group code cleanly into functional feature modules (e.g., `src/auth`, `src/users`, `src/notifications`).
- Every feature module should contain its own module file (e.g., `users.module.ts`), registering its controllers, providers, and exports.
- Only export services that are explicitly required by other modules.

### 2. Constructor Dependency Injection
- Always use constructor-based dependency injection for services, repositories, and config providers.
- Declare injected dependencies as `private readonly` to prevent modification.
- Example:
  ```typescript
  constructor(private readonly usersService: UsersService) {}
  ```

### 3. Controller Routing and Logic Decoupling
- Controllers must strictly handle HTTP route mapping, decorator routing, validation guard applications, and response transformations.
- Keep controllers lean. **Never** write business logic or database operations in controllers; delegate all such operations to Services.

### 4. Data Transfer Objects (DTOs) & Request Validation
- Use classes for DTOs to preserve metadata at runtime.
- Apply decorators from `class-validator` (e.g., `@IsString()`, `@IsEmail()`, `@IsOptional()`) to validate incoming payloads at the boundary.
- Leverage the global `ValidationPipe` for automatic request transformation and validation.

### 5. Standard Exception Handling
- Throw class-based HTTP exceptions from `@nestjs/common` (e.g., `NotFoundException`, `BadRequestException`, `ConflictException`) to return clean, standardized error responses.
- Avoid passing raw generic Javascript `Error` details directly to the client.

### 6. Testing
- Accompany every controller and service class with a corresponding unit test file (`*.spec.ts`) in the same directory.
- Mock all external adapters and database connections during unit tests.
