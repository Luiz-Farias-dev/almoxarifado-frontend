import api from "./axios";

export const login = async (cpf: string, senha: string) => {
  const response = await api.post("/login/", { cpf, senha });
  return response;
};

// Adicionar funcionário
export const addEmployee = async (data: any) => {
  const response = await api.post("/upload-funcionario/", data);
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
// Buscar todos os produtos
interface GetProductsParams {
  skip?: number;
  limit?: number;
  Insumo_Cod?: string;
  Unid_Cod?: string;
  SubInsumo_Especificacao?: string;
  INSUMO_ITEMOBSOLETO?: string;
}
export const getProducts = async (params: GetProductsParams) => {
  const response = await api.get("/catalogo-produtos/", {
    params,
  });
  return response.data;
};

// Lista de Espera
interface WaitingListProps {
  nome_funcionario_1?: string;
  destino: string;
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
  nome_produto?: string;
  centro_custo?: string;
}
export const getWaitingList = async (params: GetWaitingListParams) => {
  const response = await api.get("/lista-espera/", {
    params,
  });
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

// Tabela Final
interface FinalTableProps {
  cpf: string;
  produtos: {
    codigo_pedido: string;
    Insumo_Cod: number;
    SubInsumo_Cod: number;
    SubInsumo_Especificacao: string;
    // centro_custo: string;
    quantidade: number;
    nome_funcionario_1: string;
    Unid_Cod: string;
    destino: string;
  }[];
}
export const addProductToFinalTable = async (data: FinalTableProps) => {
  const response = await api.post("/tabela-final/", data);
  return response.data;
};

// Chegada Produtos
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

// Acurácia de Estoque
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

// Gerar Relatório
export const generateReport = async (
  data_inicio: string,
  data_fim: string,
  tabela: string
) => {
  const response = await api.get("/gerar-relatorio/", {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      data_inicio,
      data_fim,
      tabela,
    },
    responseType: "blob",
  });
  return response;
};
