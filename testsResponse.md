# Test Results Report

**Date:** 2026-02-27

---

## Frontend (Almoxarifado-Frontend)

**Framework:** Vitest v4.0.18
**Environment:** jsdom

### Summary

| Metric       | Passed | Failed | Total |
|-------------|--------|--------|-------|
| Test Files  | 2      | 5      | 7     |
| Tests       | 22     | 25     | 47    |

### Passing Test Files

- `src/lib/__tests__/utils.test.ts` — 5 tests
- `src/api/__tests__/endpoints.test.ts` — 8 tests

### Failing Test Files & Errors

#### 1. `src/api/__tests__/axios.test.ts` (3 tests failed)

**Error:** `TypeError: localStorage.clear is not a function`
**Location:** `axios.test.ts:33` — `localStorage.clear()` in `beforeEach`
**Root Cause:** The jsdom environment is not providing a full `localStorage` implementation. The `vitest.config.ts` sets `environment: "jsdom"` but `localStorage.clear` is not available.

**Failed tests:**
- `creates axios instance with baseURL from env`
- `request interceptor adds token for non-auth URLs`
- `request interceptor does NOT add token for login URL`

---

#### 2. `src/utils/__tests__/tokenUtils.test.ts` (13 tests failed)

**Error:** `TypeError: localStorage.clear is not a function`
**Location:** `tokenUtils.test.ts:20` — `localStorage.clear()` in `beforeEach`
**Root Cause:** Same `localStorage` issue as above.

**Failed tests:**
- `getUserInfoFromToken > returns null when no token in localStorage`
- `getUserInfoFromToken > reads from 'token' key`
- `getUserInfoFromToken > reads from 'accessToken' key`
- `getUserInfoFromToken > returns null when jwtDecode throws`
- `getUserInfoFromToken > uses fallback field names`
- `getNameFromToken > returns name when token exists`
- `getNameFromToken > returns null when no token`
- `getTypeFromToken > returns type when token exists`
- `getTypeFromToken > returns null when no token`
- `getUserTypeDisplayName > returns 'Administrador' for Administrador type`
- `getUserTypeDisplayName > returns 'Almoxarife' for Almoxarife type`
- `getUserTypeDisplayName > returns 'Usuário' for unknown type`
- `getUserTypeDisplayName > returns 'Usuário' when no token`

---

#### 3. `src/utils/__tests__/validateCpf.test.ts` (1 test failed)

**Error:** `AssertionError: expected false to be true`
**Location:** `validateCpf.test.ts:33`
**Root Cause:** The CPF `"34706612098"` is expected to be valid but `isValidCPF` returns `false`. Either the test data is wrong or the validation logic has a bug.

**Failed test:**
- `isValidCPF > accepts another known valid CPF` — `expect(isValidCPF("34706612098")).toBe(true)`

---

#### 4. `src/components/__tests__/Login.test.tsx` (6 tests failed)

**Error:** `TypeError: localStorage.clear is not a function`
**Location:** `Login.test.tsx:28` — `localStorage.clear()` in `beforeEach`
**Root Cause:** Same `localStorage` issue as above.

**Failed tests:**
- `renders CPF and senha inputs`
- `renders the login button disabled initially`
- `shows CPF error for invalid CPF`
- `stores token and navigates on successful login`
- `shows error on 401 response`
- `shows error on 403 response`

---

#### 5. `src/components/__tests__/PrivateRoute.test.tsx` (2 tests failed)

**Error:** `TypeError: localStorage.clear is not a function`
**Location:** `PrivateRoute.test.tsx:17` — `localStorage.clear()` in `beforeEach`
**Root Cause:** Same `localStorage` issue as above.

**Failed tests:**
- `renders the child element when accessToken exists`
- `redirects to /login when no accessToken`

---

### Frontend Error Summary

| Error | Occurrences | Affected Files |
|-------|-------------|----------------|
| `localStorage.clear is not a function` | 24 tests | 4 files (axios, tokenUtils, Login, PrivateRoute) |
| CPF validation assertion failure | 1 test | 1 file (validateCpf) |

**Recommended Fixes:**
1. **localStorage issue:** Vitest v4 with jsdom may require explicit localStorage polyfill. Add a proper `localStorage` mock in `setupTests.ts` or ensure the jsdom environment provides a full `Storage` implementation.
2. **CPF validation:** Verify the CPF `34706612098` using a known validator. If invalid, fix the test data; if valid, fix the `isValidCPF` function.

---

## Backend (almoxarifado-typescript)

**Framework:** Jest with ts-jest preset
**Environment:** node

### Summary

| Metric       | Passed | Failed | Total |
|-------------|--------|--------|-------|
| Test Suites | 0      | 16     | 16    |
| Tests       | 0      | 0      | 0     |

> **All 16 test suites failed to compile** — no tests were executed.

### Root Cause

**Error:** `TS2304: Cannot find name 'jest'` / `TS2593: Cannot find name 'it'`
**Message:** _"Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest`"_

The `@types/jest` package is **not installed**, so TypeScript cannot recognize Jest globals (`jest`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`).

Additionally, there is a **configuration conflict**: both `jest.config.js` and `jest.config.ts` exist. Jest refuses implicit resolution with multiple config files.

### Failing Test Suites

#### Controllers (6 files)
| File | Error |
|------|-------|
| `src/controllers/__tests__/auth.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |
| `src/controllers/__tests__/centroCustoController.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |
| `src/controllers/__tests__/insumos.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |
| `src/controllers/__tests__/listaEspera.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |
| `src/controllers/__tests__/obra.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |
| `src/controllers/__tests__/tabelaFinal.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |

#### Middleware (1 file)
| File | Error |
|------|-------|
| `src/middleware/__tests__/auth.test.ts` | TS2304: Cannot find name 'jest', 'describe', 'it', 'expect', 'beforeEach' |

#### Schemas (7 files)
| File | Error |
|------|-------|
| `src/schemas/__tests__/auth.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |
| `src/schemas/__tests__/centroCusto.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |
| `src/schemas/__tests__/insumos.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |
| `src/schemas/__tests__/listaEspera.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |
| `src/schemas/__tests__/obra.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |
| `src/schemas/__tests__/tabelaFinal.schema.test.ts` | TS2304: Cannot find name 'describe', 'it', 'expect' |

#### Utils (3 files — includes additional TS errors)
| File | Error |
|------|-------|
| `src/utils/__tests__/insumosHelpers.test.ts` | TS2304 + additional type errors |
| `src/utils/__tests__/listaEsperaHelpers.test.ts` | TS2304 + additional type errors |
| `src/utils/__tests__/signupHelpers.test.ts` | TS2304 + additional type errors |

### Backend Error Summary

| Error | Occurrences |
|-------|-------------|
| `TS2304: Cannot find name 'jest'` | All 16 test files |
| `TS2593: Cannot find name 'it'/'describe'` | All 16 test files |
| `TS2304: Cannot find name 'expect'/'beforeEach'` | All 16 test files |
| Dual config conflict (`jest.config.js` + `jest.config.ts`) | Project-level |

**Recommended Fixes:**
1. **Install `@types/jest`:** `npm install -D @types/jest`
2. **Add `jest` to tsconfig types:** In `tsconfig.json`, add `"types": ["jest"]` under `compilerOptions`
3. **Remove duplicate config:** Delete either `jest.config.js` or `jest.config.ts` (keep one)
4. **ts-jest warning:** Add `"isolatedModules": true` to `tsconfig.json` or add `151002` to `diagnostics.ignoreCodes` in ts-jest config

---

## Overall Summary

| Project   | Test Files | Passed | Failed | Pass Rate |
|-----------|-----------|--------|--------|-----------|
| Frontend  | 7         | 2      | 5      | 28.6%     |
| Backend   | 16        | 0      | 16     | 0%        |
| **Total** | **23**    | **2**  | **21** | **8.7%**  |

### Priority Fixes

1. **[Backend - Critical]** Install `@types/jest` and fix tsconfig to unblock all 16 test suites
2. **[Backend - Critical]** Remove duplicate jest config file (`jest.config.js` or `jest.config.ts`)
3. **[Frontend - High]** Fix `localStorage` mock/polyfill for Vitest v4 + jsdom (unblocks 24 tests)
4. **[Frontend - Low]** Verify CPF test data `34706612098` (1 test)
