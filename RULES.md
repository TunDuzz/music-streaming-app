# PROJECT RULES & GUIDELINES

## 1. LANGUAGE RULES (MANDATORY)
*   **Source Code**: ENGLISH ONLY
    *   Class names, methods, variables, DTOs
    *   API routes, request/response fields
    *   Code comments, commit messages
*   **Communication & Discussion**: VIETNAMESE
    *   Chat, discussion, explanation, internal notes

## 2. TECHNOLOGY STACK
*   **Backend Framework**: .NET 9 (ASP.NET Core Web API)
*   **Frontend Framework**: React 19+ (Vite 7)
*   **Database**: MySQL 8.0+
*   **ORM**: Entity Framework Core 9.0 (Pomelo.EntityFrameworkCore.MySql)
*   **Storage**: MinIO
*   **Styling**:
    *   **Primary**: Tailwind CSS 3.4 (with `clsx`, `tailwind-merge`)
    *   **Secondary**: Vanilla CSS (Modern CSS3 variables) where needed.

## 3. ARCHITECTURE: CLEAN ARCHITECTURE
### 3.1 Layer Responsibilities
1.  **Domain** (`MusicApp.Domain`):
    *   Entities, Enums, Value Objects.
    *   **No dependencies** on other layers or frameworks (pure C#).
2.  **Application** (`MusicApp.Application`):
    *   DTOs, Interfaces (Services & Repositories), Services.
    *   Business logic and validation.
    *   Depends ONLY on **Domain**.
3.  **Infrastructure** (`MusicApp.Infrastructure`):
    *   DbContext, Repositories, External services (MinIO, Email).
    *   Implements interfaces from Application.
    *   Depends on **Application** & **Domain**.
4.  **API** (`MusicApp.API`):
    *   Controllers, Filters, Middleware.
    *   Entry point, dependency injection configuration.
    *   **No business logic**.
    *   Depends on **Application** & **Infrastructure**.

### 3.2 Folder Structure
```
MusicStreamingApp/
├── BE/                                     # Backend (.NET 9)
│   ├── src/
│   │   ├── MusicApp.API/
│   │   ├── MusicApp.Application/
│   │   ├── MusicApp.Domain/
│   │   └── MusicApp.Infrastructure/
│
└── FE/                                     # Frontend (React 19)
    ├── src/
    │   ├── components/                     # Reusable UI
    │   ├── pages/                          # Application Views
    │   ├── contexts/                       # Global State
    │   └── services/                       # API Integration
```

## 4. DATABASE RULES (MYSQL)
*   **Primary Key**: GUID (stored as `char(36)`).
*   **Naming**:
    *   C# Code: `PascalCase`
    *   Database Columns: Follow EF Core default mapping (usually PascalCase).
*   **Relationships**: Many-to-Many must use Junction Tables explicitly if carrying payload.
*   **Soft Delete**: Use `IsDeleted` flag where required.
*   **Migrations**:
    *   One migration per significant feature.
    *   Name must describe purpose (e.g., `AddPlaylistCoverColumn`).

## 5. BACKEND CODING STANDARDS (C#)
### 5.1 Naming Convention
*   Class / Method / Property: `PascalCase`
*   Variable / Parameter: `camelCase`
*   Private Field: `_camelCase`
*   Interface: `IPascalCase` (Prefix with 'I')

### 5.2 Async Rules
*   All I/O operations (DB, File, Network) **MUST** use `async/await`.
*   **Never** use `.Result` or `.Wait()` (to avoid deadlocks).

### 5.3 Controller Rules
*   Return `ActionResult<T>`.
*   **No business logic** inside Controller; delegate to Services.
*   Attributes: `[ApiController]`, `[Route("api/[controller]")]`.

## 6. REPOSITORY & SERVICE RULES
*   **Repository**:
    *   Only handle database operations (CRUD, Query).
    *   **No business logic**.
*   **Service**:
    *   Handle business logic, validations, DTO mapping.
    *   Can combine multiple repositories.
*   **Controller**:
    *   Call service layer only.
    *   Handle HTTP concerns (Status Codes, Request Parsing).

## 7. FRONTEND RULES (REACT)
*   **Components**: Functional Components with Hooks only.
*   **Naming**:
    *   Components: `PascalCase` (e.g., `SongCard.jsx`)
    *   Functions/Variables: `camelCase`
*   **API**: Centralize logic in `src/lib/api.js` or `src/services/`.
*   **Icons**: Use `lucide-react`.

## 8. GIT WORKFLOW
*   **Commit Format**: `type(scope): message`
*   **Examples**:
    *   `feat(auth): add login api`
    *   `fix(user): fix null profile bug`
    *   `refactor(song): optimize query logic`
    *   `docs(readme): update installation guide`
*   **Workflow**: Code -> Test -> Commit

## 9. FEATURE DOCUMENTATION RULE (MANDATORY)
### 9.1 Requirement
After **EVERY** completed feature, a documentation file **MUST** be created or updated.

### 9.2 Location
`docs/features/`

### 9.3 File Naming
`YYYY-MM-DD-feature-name.md`

### 9.4 Template
```markdown
# Feature Name: [Name]
**Date**: YYYY-MM-DD

## Description
[Brief description of what was implemented]

## Affected Modules
*   [Module A]
*   [Module B]

## APIs
*   `METHOD /path/to/endpoint`

## Notes
[Any special logic, constraints, or commands to run]
```