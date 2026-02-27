import api from "./axios";

/** ========================================================================
 * Tipos/Interfaces
 * ======================================================================== */
export interface CostCenterProps {
  Centro_Negocio_Cod: string;
  Centro_Nome: string;
  work_id?: number; // pode não vir em algumas respostas (ex.: JSONB minimal no envio)
}

export interface CentrosCustoProps {
  Centro_Negocio_Cod: string;
  Centro_Nome: string;
  work_id: number;
}

/** ========================================================================
 * Autenticação (backend TypeScript: POST /login → { token })
 * ======================================================================== */
export const login = async (cpf: string, senha: string) => {
  const response = await api.post("/login", { cpf, senha });
  return response;
};

// Backend não expõe estes endpoints; mantidos para quando forem implementados
export const addEmployee = async (data: any) => {
  const response = await api.post("/upload-funcionario/", data);
  return response.data;
};

export const addEmployeesFile = async (file: FormData) => {
  const response = await api.post("/upload-funcionarios/", file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** ========================================================================
 * Catálogo de Produtos (backend: GET /insumos, POST /insumo, POST /insumos)
 * ======================================================================== */
export const addProductsFile = async (file: FormData) => {
  const response = await api.post("/insumos", file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const addProduct = async (data: {
  Insumo_Cod: string; // Alterado para string
  SubInsumo_Cod: string; // Alterado para string
  Unid_Cod: string;
  SubInsumo_Especificacao: string;
  INSUMO_ITEMOBSOLETO?: string;
  descricao?: string;
}) => {
  const response = await api.post("/insumo", data);
  return response.data;
};

interface GetProductsParams {
  skip?: number;
  limit?: number;
  Insumo_Cod?: string; // Alterado para string
  SubInsumo_Cod?: string; // Alterado para string
  Unid_Cod?: string;
  SubInsumo_Especificacao?: string;
  INSUMO_ITEMOBSOLETO?: string;
  nome_produto?: string;
}

export const getProducts = async (_params?: GetProductsParams) => {
  const response = await api.get("/insumos");
  const data = response.data;
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  return list;
};

/** ========================================================================
 * Lista de Espera (backend: POST/GET/DELETE /lista-espera, auth obrigatória)
 * ======================================================================== */
interface WaitingListProps {
  almoxarife_nome: string | undefined;
  destino: string;
  centro_custo: CostCenterProps;
  produtos: {
    Insumo_Cod: number; // Mantido como number (consistente com o uso)
    SubInsumo_Cod: number;
    SubInsumo_Especificacao: string;
    quantidade: number;
    Unid_Cod: string;
  }[];
}
export const addProductToWaitingList = async (data: WaitingListProps) => {
  const response = await api.post("/lista-espera", data);
  return response.data;
};

interface GetWaitingListParams {
  skip?: number;
  limit?: number;
  codigo_pedido?: string | number;
  destino?: string;
  SubInsumo_Especificacao?: string;
  centro_custo?: string;
  work_id?: number;
}
export const getWaitingList = async (params: GetWaitingListParams) => {
  const query: Record<string, string | number | undefined> = { ...params };
  if (params.codigo_pedido !== undefined) {
    query.codigo_pedido =
      typeof params.codigo_pedido === "string"
        ? parseInt(params.codigo_pedido, 10)
        : params.codigo_pedido;
  }
  const response = await api.get("/lista-espera", { params: query });
  return response.data;
};

export const removeProductFromWaitingList = async (
  codigo_pedido: string,
  Insumo_Cod: number,
  SubInsumo_Cod: number,
) => {
  const response = await api.delete(
    `/lista-espera/${codigo_pedido}/${Insumo_Cod}/${SubInsumo_Cod}`,
  );
  return response.data;
};

/** ========================================================================
 * Tabela Final (backend: POST /tabela-final, auth obrigatória)
 * ======================================================================== */
interface FinalTableProps {
  cpf: string;
  produtos: {
    Centro_Negocio_Cod: string;
    Insumo_e_SubInsumo_Cod: string;
    codigo_pedido: number;
    quantidade: number;
    destino: string;
    Observacao?: string;
    almoxarife_nome: string;
  }[];
}
export const addProductToFinalTable = async (data: FinalTableProps) => {
  const response = await api.post("/tabela-final", data);
  return response.data;
};

/** ========================================================================
 * Chegada de Produtos (Entrada) / Acurácia de Estoque
 * ======================================================================== */
interface ArrivalProductstProps {
  nome_funcionario?: string;
  observacao?: string | null;
  produtos: {
    codigo_produto: string;
    nome_produto: string;
    centro_custo: string;
    quantidade: number;
    unidade: string | null;
  }[];
}
export const addProductToArrivalProducts = async (
  data: ArrivalProductstProps,
) => {
  const response = await api.post("/chegada-produtos/", data);
  return response.data;
};

interface InventoryAccuracyProps {
  nome_funcionario?: string;
  produtos: {
    codigo_produto: string;
    nome_produto: string;
    centro_custo: string;
    quantidade: number;
    unidade: string | null;
  }[];
}
export const addProductToInventoryAccuracy = async (
  data: InventoryAccuracyProps,
) => {
  const response = await api.post("/acuracia-estoque/", data);
  return response.data;
};

/** ========================================================================
 * Relatórios
 * ======================================================================== */
export const generateReport = async (
  data_inicio: string,
  data_fim: string,
  tabela: string,
) => {
  const response = await api.get("/gerar-relatorio/", {
    headers: { "Content-Type": "application/json" },
    params: { data_inicio, data_fim, tabela },
    responseType: "blob",
  });
  return response;
};

/** ========================================================================
 * Associação Funcionário ↔ Centros de Custo (admin/config)
 * ======================================================================== */
interface FuncionarioCentroCustoCreate {
  centros_custo_cod: string[];
  // compatível com novo modelo: obra na associação (opcional para manter retrocompatibilidade)
  obra_id?: number;
}

/**
 * Associar centros de custo a um funcionário (opcionalmente para uma obra específica)
 */
export const associarCentrosCustoFuncionario = async (
  funcionarioId: number,
  centrosCustoCod: string[],
  obraId?: number,
): Promise<void> => {
  const data: FuncionarioCentroCustoCreate = {
    centros_custo_cod: centrosCustoCod,
    ...(obraId ? { obra_id: obraId } : {}),
  };
  await api.post(`/funcionarios/${funcionarioId}/centros-custo`, data);
};

/**
 * Listar centros de custo associados a um funcionário (opcional filtro por obra)
 */
export const listarCentrosCustoFuncionario = async (
  funcionarioId: number,
  obraId?: number,
): Promise<CostCenterProps[]> => {
  const params: Record<string, any> = {};
  if (obraId) params.obra_id = obraId;
  const response = await api.get(
    `/funcionarios/${funcionarioId}/centros-custo`,
    {
      params,
    },
  );
  return response.data;
};

/**
 * Remover centro de custo de um funcionário (opcional obra como query)
 */
export const removerCentroCustoFuncionario = async (
  funcionarioId: number,
  centroCod: string,
  obraId?: number,
): Promise<void> => {
  const params: Record<string, any> = {};
  if (obraId) params.obra_id = obraId;
  await api.delete(
    `/funcionarios/${funcionarioId}/centros-custo/${centroCod}`,
    {
      params,
    },
  );
};

/** ========================================================================
 * Obras e Centros de Custo (backend: /centroCusto, /obra)
 * ======================================================================== */

type BackendCentroCustoItem = {
  id: number;
  nome: string;
  Centro_Negocio_Cod?: string;
  Centro_Nome?: string;
  work_id?: number;
};

function normalizeCentroCusto(item: BackendCentroCustoItem): CentrosCustoProps {
  return {
    Centro_Negocio_Cod: item.Centro_Negocio_Cod ?? String(item.id),
    Centro_Nome: item.Centro_Nome ?? item.nome,
    work_id: item.work_id ?? 0,
  };
}

export const getUserCostCenters = async (): Promise<CentrosCustoProps[]> => {
  try {
    const list = await getAllCostCenter();
    return list;
  } catch (error) {
    console.error("Erro ao buscar centros de custo do usuário:", error);
    throw new Error("Falha ao carregar centros de custo do usuário");
  }
};

export const getCostCentersByWork = async () => {
  const list = await getAllCostCenter();
  return list as { Centro_Negocio_Cod: string; Centro_Nome: string }[];
};

export const getAllCostCenter = async (): Promise<CentrosCustoProps[]> => {
  const response = await api.get("/centroCusto");
  const raw = Array.isArray(response.data) ? response.data : [];
  return raw.map((item: BackendCentroCustoItem) => normalizeCentroCusto(item));
};

/**
 * Adiciona um novo centro de custo.
 * @param data Objeto com os campos obrigatórios. work_id deve ser um número (convertido no frontend).
 */
export const addCostCenter = async (data: {
  Centro_Negocio_Cod: string;
  Centro_Nome: string;
  work_id: number; // ajustado para number, pois no componente convertemos para número
}) => {
  const response = await api.post("/centroCusto", {
    Centro_Negocio_Cod: data.Centro_Negocio_Cod,
    Centro_Nome: data.Centro_Nome,
    work_id: data.work_id,
  });
  return response.data;
};

export const getCostCenterByCode = async (centroCod: string) => {
  const list = await getAllCostCenter();
  const found = list.find((c) => c.Centro_Negocio_Cod === centroCod);
  if (!found) throw new Error("Centro de custo não encontrado");
  return found;
};

export const deleteCostCenter = async (centroId: number) => {
  const response = await api.delete(`/centroCusto/${centroId}`);
  return response.data;
};

type BackendObraItem = {
  id: number;
  nome?: string;
  initials?: string | null;
  name?: string;
};

function normalizeObra(item: BackendObraItem) {
  return {
    id: item.id,
    name: item.name ?? item.nome ?? String(item.id),
    initials: item.initials ?? null,
  };
}

export const addWork = async (data: { name: string }) => {
  const response = await api.post("/obra", { name: data.name });
  return normalizeObra(
    (response.data as BackendObraItem) ?? { id: 0, name: data.name },
  );
};

export const getAllWorks = async () => {
  const response = await api.get("/obra");
  const raw = Array.isArray(response.data) ? response.data : [];
  return raw.map((item: BackendObraItem) => normalizeObra(item));
};

export const getWorkById = async (workId: number) => {
  const response = await api.get(`/obra/${workId}`);
  return normalizeObra(response.data as BackendObraItem);
};
