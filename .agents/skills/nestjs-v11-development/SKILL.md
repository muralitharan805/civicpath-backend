---
name: nestjs-v11-development
description: Guidelines and strict coding standards for writing modules, controllers, providers, guards, interceptors, and DTOs in NestJS v11.
---

# NestJS v11 Development Skill

This skill defines the development standards, architectural patterns, and strict guidelines for writing TypeScript and NestJS code in this backend workspace. Any agent modifying or adding code to this project **must** adhere to these rules.

## Core Architectural Pillars

### 1. Strict Modular Architecture
- Organize your code into highly cohesive feature modules. Avoid flat, massive structures.
- Group all related files (controllers, services, DTOs, interfaces, and testing specs) under a single feature folder (e.g., `src/users/`, `src/auth/`).
- Each feature folder must contain a `.module.ts` class decorated with `@Module()`, which orchestrates imports, controllers, exports, and providers.
- Import feature modules into the root `AppModule` (`src/app.module.ts`).
- Example module definition:
  ```typescript
  import { Module } from '@nestjs/common';
  import { UsersController } from './users.controller';
  import { UsersService } from './users.service';

  @Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // Export if other modules need to inject UsersService
  })
  export class UsersModule {}
  ```

### 2. Controllers & Route Handlers
- **Single Responsibility**: Controllers are strictly responsible for handling incoming HTTP requests, routing, applying guards/interceptors, and invoking the appropriate services. Business logic must **never** be placed inside controllers.
- Use explicit route paths: `@Controller('users')` or `@Controller('auth')`.
- Map incoming requests to clean DTO (Data Transfer Object) classes.
- Decorate parameters using standard NestJS decorators: `@Body()`, `@Param('id')`, `@Query('search')`, `@Headers()`, `@Res()`, `@Req()`.
- Example controller:
  ```typescript
  import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto } from './dto/create-user.dto';

  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
      return this.usersService.create(createUserDto);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.findOne(id);
    }
  }
  ```

### 3. Providers & Services
- Contain all business logic, database queries, computations, and third-party API integrations inside Services decorated with `@Injectable()`.
- **Constructor Injection**: Always use constructor-based dependency injection for services, helpers, and configurations.
- Declare injected dependencies as `private readonly` to prevent reassignment.
- Example service:
  ```typescript
  import { Injectable, NotFoundException } from '@nestjs/common';
  import { CreateUserDto } from './dto/create-user.dto';

  @Injectable()
  export class UsersService {
    private readonly users = [];

    async create(createUserDto: CreateUserDto) {
      const newUser = { id: Date.now(), ...createUserDto };
      this.users.push(newUser);
      return newUser;
    }

    async findOne(id: number) {
      const user = this.users.find((u) => u.id === id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    }
  }
  ```

---

## Data Validation & Transformation

### 1. Data Transfer Objects (DTOs)
- Always write DTOs as **Classes** rather than TypeScript interfaces. TypeScript interfaces are erased during compilation, whereas classes remain available at runtime, which is required for automatic validation.
- Decorate properties using standard validators from `class-validator` (e.g., `@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsInt()`).
- Annotate with type transformation decorators from `class-transformer` (e.g., `@Type()`, `@Transform()`) if parsing numbers or dates.
- Example DTO:
  ```typescript
  import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

  export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
  }
  ```

### 2. Pipes & Global Validation
- To enable automatic DTO validation globally, instantiate the global `ValidationPipe` in the application's entry point (`src/main.ts`):
  ```typescript
  import { ValidationPipe } from '@nestjs/common';
  import { NestFactory } from '@nestjs/core';
  import { AppModule } from './app.module';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strips away non-decorated fields automatically
        transform: true, // Automatically converts payloads to matching DTO class instances
        forbidNonWhitelisted: true, // Throws an error if unknown payload fields are sent
      }),
    );

    await app.listen(process.env.PORT ?? 3000);
  }
  bootstrap();
  ```

---

## Exception & Error Handling

- **Never** throw raw JavaScript errors or return raw error response objects directly.
- **Throw NestJS Built-in HTTP Exceptions**: Always raise class-based exceptions from `@nestjs/common` inside your controllers and services.
- Available Exceptions:
  - `BadRequestException` (400)
  - `UnauthorizedException` (401)
  - `ForbiddenException` (403)
  - `NotFoundException` (404)
  - `ConflictException` (409)
  - `InternalServerErrorException` (500)
- Example exception:
  ```typescript
  throw new BadRequestException('The email address is already in use.');
  ```

---

## TypeScript Style & Configuration

This project enforces specific compilation and coding styles through ESLint and Prettier.

1. **Formatting Standards**:
   - Single Quotes: Always use single quotes (`'`) for TS files.
   - Trailing Commas: Always include trailing commas (`all`) for arrays, objects, and function parameters.
   - End of Line: Configured to auto (`"endOfLine": "auto"`).

2. **Linting Rules**:
   - **`@typescript-eslint/no-explicit-any`**: Currently set to `'off'`. However, explicit `any` types are highly discouraged. Strive to use strongly typed objects, generics, or `unknown` where applicable.
   - **`@typescript-eslint/no-floating-promises`**: Configured as `'warn'`. Every promise returning operation must be properly handled (using `await` or `.catch()`).
   - **`@typescript-eslint/no-unsafe-argument`**: Configured as `'warn'`. Keep payloads strictly typed to prevent passing unsafe or unvalidated references to functions.

---

## Testing Guidelines

- Every controller and service class should be accompanied by a companion spec file (`*.spec.ts`) in the same folder.
- Mock external dependencies (like databases, Prisma services, mailers, or REST clients) in your unit tests to isolate classes.
- Use NestJS `@nestjs/testing` custom utility builders (`Test.createTestingModule()`) to configure DI containers in tests.
- Example unit test:
  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';
  import { UsersService } from './users.service';

  describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [UsersService],
      }).compile();

      service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
  ```
