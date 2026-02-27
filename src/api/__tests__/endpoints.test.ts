import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the axios module used by endpoints
vi.mock("../axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../axios";
import {
  login,
  getProducts,
  addProductToWaitingList,
  getWaitingList,
  removeProductFromWaitingList,
  addProductToFinalTable,
} from "../endpoints";

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("login", () => {
  it("calls POST /login with cpf and senha", async () => {
    mockPost.mockResolvedValue({ data: { token: "jwt" } });
    const result = await login("12345678901", "senha123");
    expect(mockPost).toHaveBeenCalledWith("/login", {
      cpf: "12345678901",
      senha: "senha123",
    });
    expect(result.data.token).toBe("jwt");
  });
});

describe("getProducts", () => {
  it("calls GET /insumos and returns array", async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 1, Insumo_Cod: "123" }],
    });
    const result = await getProducts();
    expect(mockGet).toHaveBeenCalledWith("/insumos");
    expect(result).toEqual([{ id: 1, Insumo_Cod: "123" }]);
  });

  it("handles response with data wrapper", async () => {
    mockGet.mockResolvedValue({
      data: { data: [{ id: 1 }] },
    });
    const result = await getProducts();
    expect(result).toEqual([{ id: 1 }]);
  });
});

describe("addProductToWaitingList", () => {
  it("calls POST /lista-espera with data", async () => {
    mockPost.mockResolvedValue({ data: { codigo_pedido: 42 } });
    const data = {
      almoxarife_nome: "João",
      destino: "Obra A",
      centro_custo: { Centro_Negocio_Cod: "CC01", Centro_Nome: "Centro 1" },
      produtos: [
        {
          Insumo_Cod: 1,
          SubInsumo_Cod: 2,
          SubInsumo_Especificacao: "Cimento",
          quantidade: 5,
          Unid_Cod: "KG",
        },
      ],
    };
    const result = await addProductToWaitingList(data);
    expect(mockPost).toHaveBeenCalledWith("/lista-espera", data);
    expect(result.codigo_pedido).toBe(42);
  });
});

describe("getWaitingList", () => {
  it("calls GET /lista-espera with params", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await getWaitingList({ skip: 0, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith("/lista-espera", {
      params: expect.objectContaining({ skip: 0, limit: 10 }),
    });
  });

  it("converts string codigo_pedido to number", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await getWaitingList({ codigo_pedido: "42" });
    expect(mockGet).toHaveBeenCalledWith("/lista-espera", {
      params: expect.objectContaining({ codigo_pedido: 42 }),
    });
  });
});

describe("removeProductFromWaitingList", () => {
  it("calls DELETE with correct URL", async () => {
    mockDelete.mockResolvedValue({ data: { detail: "ok" } });
    const result = await removeProductFromWaitingList("1", 2, 3);
    expect(mockDelete).toHaveBeenCalledWith("/lista-espera/1/2/3");
    expect(result.detail).toBe("ok");
  });
});

describe("addProductToFinalTable", () => {
  it("calls POST /tabela-final with data", async () => {
    mockPost.mockResolvedValue({ data: { detail: "ok" } });
    const data = {
      cpf: "12345678901",
      produtos: [
        {
          Centro_Negocio_Cod: "CC01",
          Insumo_e_SubInsumo_Cod: "123-456",
          codigo_pedido: 1,
          quantidade: 10,
          destino: "Obra A",
          almoxarife_nome: "João",
        },
      ],
    };
    const result = await addProductToFinalTable(data);
    expect(mockPost).toHaveBeenCalledWith("/tabela-final", data);
    expect(result.detail).toBe("ok");
  });
});
