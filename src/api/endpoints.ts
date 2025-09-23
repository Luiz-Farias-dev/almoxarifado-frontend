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
 * Autenticação / Funcionários / Produtos (sem alterações funcionais)
 * ======================================================================== */
export const login = async (cpf: string, senha: string) => {
  const response = await api.post("/login/", { cpf, senha });
  return response;
};

// Adicionar funcionário individual
export const addEmployee = async (data: any) => {
  const response = await api.post("/upload-funcionario/", data);
  return response.data;
};

// Adicionar arquivo com vários funcionários
export const addEmployeesFile = async (file: FormData) => {
  const response = await api.post("/upload-funcionarios/", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Adicionar arquivo com vários produtos
export const addProductsFile = async (file: FormData) => {
  const response = await api.post("/upload-produtos-catalogo/", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Adicionar produto unitário
export const addProduct = async (data: any) => {
  const response = await api.post("/upload-produto-catalogo/", data);
  return response.data;
};

/** ========================================================================
 * Catálogo de Produtos
 * ======================================================================== */
interface GetProductsParams {
  skip?: number;
  limit?: number;
  Insumo_Cod?: number;
  SubInsumo_Cod?: number;
  Unid_Cod?: string;
  SubInsumo_Especificacao?: string;
  INSUMO_ITEMOBSOLETO?: string;
  nome_produto?: string;
}
export const getProducts = async (params: GetProductsParams) => {
  const response = await api.get("/catalogo-produtos/", { params });
  return response.data;
};

/** ========================================================================
 * Lista de Espera
 * ======================================================================== */
interface WaitingListProps {
  almoxarife_nome: string | undefined;
  destino: string;
  centro_custo: CostCenterProps; // JSONB com código e nome (work_id opcional)
  produtos: {
    Insumo_Cod: number;
    SubInsumo_Cod: number;
    SubInsumo_Especificacao: string;
    quantidade: number;
    Unid_Cod: string;
  }[];
}
export const addProductToWaitingList = async (data: WaitingListProps) => {
  const response = await api.post("/lista-espera/", data);
  return response.data;
};

interface GetWaitingListParams {
  skip?: number;
  limit?: number;
  codigo_pedido?: string;
  destino?: string;
  SubInsumo_Especificacao?: string;
  centro_custo?: string;
}
export const getWaitingList = async (params: GetWaitingListParams) => {
  const response = await api.get("/lista-espera/", { params });
  return response.data;
};

// Remove produto da lista de espera (versão atualizada)
export const removeProductFromWaitingList = async (
  codigo_pedido: string,
  Insumo_Cod: number,
  SubInsumo_Cod: number
) => {
  const response = await api.delete(
    `/lista-espera/${codigo_pedido}/${Insumo_Cod}/${SubInsumo_Cod}`
  );
  return response.data;
};

/** ========================================================================
 * Tabela Final (Movimentação de Saída)
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
  const response = await api.post("/tabela-final/", data);
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
  data: ArrivalProductstProps
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
  data: InventoryAccuracyProps
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
  tabela: string
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
  obraId?: number
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
  obraId?: number
): Promise<CostCenterProps[]> => {
  const params: Record<string, any> = {};
  if (obraId) params.obra_id = obraId;
  const response = await api.get(
    `/funcionarios/${funcionarioId}/centros-custo`,
    {
      params,
    }
  );
  return response.data;
};

/**
 * Remover centro de custo de um funcionário (opcional obra como query)
 */
export const removerCentroCustoFuncionario = async (
  funcionarioId: number,
  centroCod: string,
  obraId?: number
): Promise<void> => {
  const params: Record<string, any> = {};
  if (obraId) params.obra_id = obraId;
  await api.delete(
    `/funcionarios/${funcionarioId}/centros-custo/${centroCod}`,
    {
      params,
    }
  );
};

/** ========================================================================
 * Obras e Centros de Custo (atualizado para novo modelo)
 * ======================================================================== */

/**
 * NOVO: Centros de Custo disponíveis ao usuário logado (Almoxarife),
 * já filtrados pela associação many-to-many com obra.
 * Backend recomendado: GET /me/cost-centers
 */
export const getUserCostCenters = async (): Promise<CentrosCustoProps[]> => {
  try {
    const response = await api.get("/me/cost-centers");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar centros de custo do usuário:", error);
    throw new Error("Falha ao carregar centros de custo do usuário");
  }
};

/**
 * (Admin) Buscar centros de custo por obra (usa query param work_id)
 */
export const getCostCentersByWork = async (workId: number) => {
  const { data } = await api.get(`/work/${workId}/cost-centers`);
  return data as { Centro_Negocio_Cod: string; Centro_Nome: string }[];
};

/**
 * (Compat) Pegar todos os centros de custo.
 * OBS: Para Almoxarife, prefira `getUserCostCenters()`.
 * Para Admin, pode filtrar por work_id.
 */
export const getAllCostCenter = async (
  obraId?: number | null
): Promise<CentrosCustoProps[]> => {
  const params: Record<string, any> = {};
  if (obraId) params.work_id = obraId; // atualizado: backend espera work_id
  try {
    const response = await api.get("/cost-center", { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar centros de custo:", error);
    throw new Error("Falha ao carregar centros de custo");
  }
};

// Criar um novo centro de custo
export const addCostCenter = async (data: {
  code: string;
  name: string;
  workId: string;
}) => {
  const response = await api.post("/cost-center/", {
    code: data.code,
    name: data.name,
    workId: data.workId,
  });
  return response.data;
};

// Pegar um centro de custo por código
export const getCostCenterByCode = async (centroCod: string) => {
  const response = await api.get(`/cost-center/${centroCod}`);
  return response.data;
};

// Deletar um centro de custo
export const deleteCostCenter = async (centroCod: string) => {
  const response = await api.delete(`/cost-center/${centroCod}`);
  return response.data;
};

// Criar uma nova obra
export const addWork = async (data: { initials: string }) => {
  const response = await api.post("/work/", { initials: data.initials });
  return response.data;
};

// Pegar todas as obras
export const getAllWorks = async () => {
  const response = await api.get("/work/");
  return response.data;
};

// Pegar uma obra por ID
export const getWorkById = async (workId: number) => {
  const response = await api.get(`/work/${workId}`);
  return response.data;
};
