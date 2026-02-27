# CLAUDE.md — Almoxarifado Cortez

## Project Overview

Inventory management system (almoxarifado) for construction sites. Monorepo with separate frontend and backend.

## Structure

```
almoxarifado-cortez/
├── Almoxarifado-Frontend/     # React 18 + Vite + TypeScript
└── almoxarifado-typescript/   # Express 5 + Sequelize + TypeScript
```

## Backend (almoxarifado-typescript)

### Commands

```bash
npm run dev            # nodemon + ts-node (hot reload)
npm run build          # tsc
npm start              # nodemon dist/app.js
npm test               # jest (use --config jest.config.ts --forceExit)
npm run migrate        # umzug migrations up
npm run migrate:down   # umzug migrations down
npm run migrate:status # check migration state
```

### Tech Stack

- **Runtime:** Node.js + TypeScript (target es2022, module nodenext, strict mode)
- **Framework:** Express 5
- **ORM:** Sequelize 6 with `sequelize.define()` (functional API, not decorators)
- **Database:** PostgreSQL (config in `src/config/dbConfig.ts`, hardcoded credentials)
- **Validation:** Zod 4 — schemas split into `*.schema.ts` (input) and `*.response.ts` (output), types inferred via `z.infer<>`
- **Auth:** JWT Bearer tokens (12h expiry), bcrypt password hashing
- **Migrations:** Umzug, sequentially numbered (`001-...`, `002-...`)
- **File uploads:** Multer (memory storage, 25MB limit), supports xlsx/csv parsing

### Folder Conventions

```
src/
├── config/        # DB, multer, umzug setup
├── controllers/   # Request handlers (async, named exports)
├── middleware/     # Express middleware (auth: getCurrentUser)
├── migrations/    # Umzug migration files (001-, 002-, ...)
├── models/        # Sequelize models — <name>.model.ts
├── routes/        # Express Router files (one per resource)
├── schemas/       # Zod schemas — <domain>/  with .schema.ts + .response.ts
├── types/         # TypeScript declarations and domain interfaces
└── utils/         # Pure helper functions
```

### API Routes (REST, no versioning prefix)

- `POST /signup`, `POST /login` — Auth (unprotected)
- `GET|POST|DELETE /centroCusto` — Cost centers
- `GET|POST /obra` — Construction sites
- `GET|POST /insumos` — Supplies (file upload)
- `GET|POST|DELETE /lista-espera` — Wait list (auth required)
- `POST /tabela-final` — Final table (auth required)

### Auth & Roles

- JWT payload: `{ id, cpf, tipoFuncionario, nome, obra_id }`
- `req.currentUser` set by `getCurrentUser` middleware (typed in `src/types/auth.d.ts`)
- Roles: `"Administrador"` (full access), `"Almoxarife"` (scoped to obra/centro_custo)
- Default password for new users: `"Padrao#2025"`
- Env var: `JWT_SECRET` (falls back to `"default_secret"`)

### Known Issues (Backend Tests)

- `@types/jest` must be installed and `"jest"` added to tsconfig types
- Duplicate config: both `jest.config.js` and `jest.config.ts` exist — keep only `.ts`
- ts-jest warns about `isolatedModules` with nodenext module

## Frontend (Almoxarifado-Frontend)

### Commands

```bash
npm run dev      # vite dev server (port 5173)
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm test         # vitest (use --run for single run)
```

### Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS 3 + shadcn/ui (Radix UI primitives + CVA + clsx + tailwind-merge)
- **Routing:** react-router-dom 7
- **HTTP:** Axios (interceptors add JWT from localStorage)
- **Tables:** @tanstack/react-table
- **Tests:** Vitest 4 + @testing-library/react + jsdom

### Folder Conventions

```
src/
├── api/          # Axios instance + endpoint functions
├── assets/       # Static assets
├── components/   # React components (shadcn/ui in components/ui/)
├── hooks/        # Custom React hooks
├── lib/          # Utility functions (cn() for tailwind)
├── utils/        # Helper functions (tokenUtils, validateCpf)
├── App.tsx       # Root component with routing
└── main.tsx      # Entry point
```

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig + vite)

### Known Issues (Frontend Tests)

- `localStorage.clear is not a function` in Vitest v4 + jsdom — needs mock in `setupTests.ts`
- CPF test `"34706612098"` may be invalid test data

## Code Style

- **Naming:** camelCase for files/variables/functions, PascalCase for types/interfaces/components
- **Types:** Suffix DTOs with `Dto`, prefix interfaces with `I` (e.g., `ICentroCusto`)
- **Imports:** Relative paths in backend (no aliases), `@/` alias in frontend
- **DB columns:** Mixed snake_case and PascalCase (legacy schema from Python migration)
- **Models:** `timestamps: false` on all Sequelize models
- **Strict TS:** `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` enabled in backend

## Language

The application domain language is **Brazilian Portuguese** (user-facing text, field names, database columns). Code identifiers mix Portuguese domain terms with English programming terms.
