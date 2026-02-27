import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock jwt-decode before importing the module
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

import { jwtDecode } from "jwt-decode";
import {
  getUserInfoFromToken,
  getNameFromToken,
  getTypeFromToken,
  getUserTypeDisplayName,
} from "../tokenUtils";

const mockJwtDecode = jwtDecode as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("getUserInfoFromToken", () => {
  it("returns null when no token in localStorage", () => {
    expect(getUserInfoFromToken()).toBeNull();
  });

  it("reads from 'token' key", () => {
    localStorage.setItem("token", "fake-token");
    mockJwtDecode.mockReturnValue({
      id: 1,
      nome: "User",
      tipoFuncionario: "Administrador",
      obra_id: null,
    });
    const result = getUserInfoFromToken();
    expect(result).toEqual({
      id: 1,
      nome: "User",
      tipo: "Administrador",
      obra_id: null,
    });
  });

  it("reads from 'accessToken' key", () => {
    localStorage.setItem("accessToken", "fake-token");
    mockJwtDecode.mockReturnValue({
      id: 2,
      nome: "Admin",
      tipoFuncionario: "Administrador",
      obra_id: 5,
    });
    const result = getUserInfoFromToken();
    expect(result).toEqual({
      id: 2,
      nome: "Admin",
      tipo: "Administrador",
      obra_id: 5,
    });
  });

  it("returns null when jwtDecode throws", () => {
    localStorage.setItem("token", "bad-token");
    mockJwtDecode.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    expect(getUserInfoFromToken()).toBeNull();
  });

  it("uses fallback field names", () => {
    localStorage.setItem("token", "fake-token");
    mockJwtDecode.mockReturnValue({
      userId: 3,
      sub: "NameFromSub",
      role: "Almoxarife",
      obraId: 10,
    });
    const result = getUserInfoFromToken();
    expect(result).toEqual({
      id: 3,
      nome: "NameFromSub",
      tipo: "Almoxarife",
      obra_id: 10,
    });
  });
});

describe("getNameFromToken", () => {
  it("returns name when token exists", () => {
    localStorage.setItem("token", "fake");
    mockJwtDecode.mockReturnValue({ id: 1, nome: "João", tipoFuncionario: "Admin" });
    expect(getNameFromToken()).toBe("João");
  });

  it("returns null when no token", () => {
    expect(getNameFromToken()).toBeNull();
  });
});

describe("getTypeFromToken", () => {
  it("returns type when token exists", () => {
    localStorage.setItem("token", "fake");
    mockJwtDecode.mockReturnValue({ id: 1, nome: "J", tipoFuncionario: "Almoxarife" });
    expect(getTypeFromToken()).toBe("Almoxarife");
  });

  it("returns null when no token", () => {
    expect(getTypeFromToken()).toBeNull();
  });
});

describe("getUserTypeDisplayName", () => {
  it("returns 'Administrador' for Administrador type", () => {
    localStorage.setItem("token", "fake");
    mockJwtDecode.mockReturnValue({ id: 1, nome: "A", tipoFuncionario: "Administrador" });
    expect(getUserTypeDisplayName()).toBe("Administrador");
  });

  it("returns 'Almoxarife' for Almoxarife type", () => {
    localStorage.setItem("token", "fake");
    mockJwtDecode.mockReturnValue({ id: 1, nome: "A", tipoFuncionario: "Almoxarife" });
    expect(getUserTypeDisplayName()).toBe("Almoxarife");
  });

  it("returns 'Usuário' for unknown type", () => {
    localStorage.setItem("token", "fake");
    mockJwtDecode.mockReturnValue({ id: 1, nome: "A", tipoFuncionario: "Unknown" });
    expect(getUserTypeDisplayName()).toBe("Usuário");
  });

  it("returns 'Usuário' when no token", () => {
    expect(getUserTypeDisplayName()).toBe("Usuário");
  });
});
