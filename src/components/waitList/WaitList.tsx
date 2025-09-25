import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { getWaitingList, removeProductFromWaitingList, getAllCostCenter, getAllWorks } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import { SelectedProducts, SelectedProduct } from "./SelectedProducts";
import Header from "../Header";
import { getUserInfoFromToken } from "@/utils/tokenUtils";
import { useToast } from "@/hooks/use-toast";

export type Produto = {
  id: number;
  Insumo_Cod: number;
  SubInsumo_Cod: number;
  Unid_Cod: string;
  SubInsumo_Especificacao: string;
  data_att: string;
  quantidade: number;
  codigo_pedido: string;
  centro_custo: {
    Centro_Negocio_Cod: string;
    Centro_Nome: string;
    work_id?: number;
  };
  almoxarife_nome: string;
  destino: string;
};

type UserInfo = {
  tipo: string;
  obra_id: number | null;
  nome: string;
};

type Obra = {
  id: number;
  name: string;
};

// Função para mapear Produto para SelectedProduct
const mapProdutoToSelectedProduct = (produto: Produto): SelectedProduct => {
  return {
    id: produto.id,
    codigo_pedido: Number(produto.codigo_pedido),
    Insumo_Cod: produto.Insumo_Cod,
    SubInsumo_Cod: produto.SubInsumo_Cod,
    SubInsumo_Especificacao: produto.SubInsumo_Especificacao,
    quantidade: produto.quantidade,
    Unid_Cod: produto.Unid_Cod,
    centro_custo: produto.centro_custo,
    almoxarife_nome: produto.almoxarife_nome,
    destino: produto.destino,
  };
};

interface ActionCellProps {
  row: any;
  setData: React.Dispatch<React.SetStateAction<Produto[]>>;
  setRowSelection: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const ActionCell: React.FC<ActionCellProps> = ({ row, setData, setRowSelection }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    const produto = row.original;
    
    try {
      setIsDeleting(true);
      await removeProductFromWaitingList(
        produto.codigo_pedido,
        produto.Insumo_Cod,
        produto.SubInsumo_Cod,
      );
      
      setData(prevData => prevData.filter(item => item.id !== produto.id));
      
      setRowSelection(prev => {
        const updated = { ...prev };
        delete updated[produto.id.toString()];
        return updated;
      });

      toast({
        title: "Sucesso",
        description: "Item removido da lista de espera",
      });
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao remover item da lista de espera",
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setIsDialogOpen(true);
            setIsDropdownOpen(false);
          }}
          className="text-red-600 focus:text-red-700"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Excluir Item</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente
              este item da lista de espera.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDialogOpen(false);
                setIsDropdownOpen(false);
              }}
              className="rounded-2xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-2xl bg-red-500 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Excluindo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
};

export function WaitListPage() {
  const [data, setData] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const skipRef = useRef(0);
  const limit = 100;

  // Filtros
  const [filterNomeProduto, setFilterNomeProduto] = useState("");
  const [filterDestino, setFilterDestino] = useState("");
  const [filterCodigoPedido, setFilterCodigoPedido] = useState("");
  const [filterCentroCustoObra, setFilterCentroCustoObra] = useState<string>("");

  // Tabela
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Usuário
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [centrosCustoObra, setCentrosCustoObra] = useState<Produto["centro_custo"][]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [loadingObras, setLoadingObras] = useState(false);
  const [centrosCustoPorObra, setCentrosCustoPorObra] = useState<{[obraId: number]: Produto["centro_custo"][]}>({});
  const [loadingCentrosCustoPorObra, setLoadingCentrosCustoPorObra] = useState<{[obraId: number]: boolean}>({});

  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determinar tipo de usuário e label do filtro - CORRIGIDO
  const isAlmoxarife = userInfo?.tipo === "Almoxarife";
  const isAdministrador = userInfo?.tipo === "Administrador";
  const filterLabel = isAdministrador ? "Obra" : isAlmoxarife ? "Centro de Custo" : "";

  // Memoizar fetchCentrosCustoObra - PARA ALMOXARIFE
  const fetchCentrosCustoObra = useCallback(async (obraId: number) => {
    setLoadingCentrosCusto(true);
    try {
      const response = await getAllCostCenter(obraId);
      setCentrosCustoObra(response);
      console.log('Centros de custo carregados para almoxarife:', response);
    } catch (error) {
      console.error("Erro ao buscar centros de custo da obra:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar centros de custo da obra",
      });
    } finally {
      setLoadingCentrosCusto(false);
    }
  }, [toast]);

  // Buscar obras para ADMINISTRADOR
  const fetchObras = useCallback(async () => {
    setLoadingObras(true);
    try {
      const response = await getAllWorks();
      setObras(response);
      console.log('Obras carregadas para administrador:', response);
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar obras",
      });
    } finally {
      setLoadingObras(false);
    }
  }, [toast]);

  // Função para buscar centros de custo por obra
  const fetchCentrosCustoPorObra = useCallback(async (obraId: number) => {
    if (centrosCustoPorObra[obraId]) {
      return centrosCustoPorObra[obraId]; // Já tem em cache
    }
    
    setLoadingCentrosCustoPorObra(prev => ({ ...prev, [obraId]: true }));
    
    try {
      const response = await getAllCostCenter(obraId);
      setCentrosCustoPorObra(prev => ({
        ...prev,
        [obraId]: response
      }));
      return response;
    } catch (error) {
      console.error("Erro ao buscar centros de custo da obra:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar centros de custo da obra",
      });
      return [];
    } finally {
      setLoadingCentrosCustoPorObra(prev => ({ ...prev, [obraId]: false }));
    }
  }, [centrosCustoPorObra, toast]);

  // Memoizar fetchData com dependências fixas
  const fetchData = useCallback(async (
    newSkip: number,
    append: boolean,
    codigoPedido?: string,
    buscaDestino?: string,
    buscaNomeProduto?: string,
    centroCustoObra?: string
  ) => {
    if (!append) {
      setIsLoading(true);
      setHasMore(true);
    }
    
    try {
      const actualCodigoPedido = codigoPedido ?? filterCodigoPedido;
      const actualBuscaDestino = buscaDestino ?? filterDestino;
      const actualBuscaNomeProduto = buscaNomeProduto ?? filterNomeProduto;
      const actualCentroCustoObra = centroCustoObra ?? filterCentroCustoObra;

      const response = await getWaitingList({
        skip: newSkip,
        limit,
        codigo_pedido: actualCodigoPedido || undefined,
        destino: actualBuscaDestino || undefined,
        SubInsumo_Especificacao: actualBuscaNomeProduto || undefined,
        centro_custo: actualCentroCustoObra || undefined,
      });

      if (append) {
        setData((prev) => [...prev, ...response]);
      } else {
        setData(response);
        skipRef.current = 0;
      }

      setHasMore(response.length === limit);
    } catch (error) {
      console.error("Erro ao buscar lista de espera:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar lista de espera",
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, toast, filterCodigoPedido, filterDestino, filterNomeProduto, filterCentroCustoObra]);

  // Colunas memoizadas - CRÍTICO para evitar loops
  const tableColumns = useMemo((): ColumnDef<Produto>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "codigo_pedido",
      header: "Código do Pedido",
      cell: ({ row }) => <div>{row.getValue("codigo_pedido")}</div>,
    },
    {
      accessorKey: "Insumo_Cod",
      header: "Código do Insumo",
      cell: ({ row }) => (
        <div>
          {row.original.Insumo_Cod}-{row.original.SubInsumo_Cod}
        </div>
      ),
    },
    {
      accessorKey: "SubInsumo_Especificacao",
      header: "Especificação",
      cell: ({ row }) => <div>{row.getValue("SubInsumo_Especificacao")}</div>,
    },
    {
      accessorKey: "centro_custo",
      header: "Centro de Custo",
      cell: ({ row }) => {
        const centroCusto = row.getValue("centro_custo") as Produto["centro_custo"];
        return <div>{centroCusto.Centro_Nome}</div>;
      },
    },
    {
      accessorKey: "almoxarife_nome",
      header: "Nome do Almoxarife",
      cell: ({ row }) => <div>{row.getValue("almoxarife_nome")}</div>,
    },
    {
      accessorKey: "Unid_Cod",
      header: "Unidade",
      cell: ({ row }) => <div>{row.getValue("Unid_Cod")}</div>,
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ row }) => <div>{row.getValue("quantidade")}</div>,
    },
    {
      accessorKey: "destino",
      header: "Destino",
      cell: ({ row }) => <div>{row.getValue("destino")}</div>,
    },
    {
      accessorKey: "data_att",
      header: "Data de Atualização",
      cell: ({ row }) => {
        const date = new Date(row.getValue("data_att"));
        return <div>{date.toLocaleString('pt-BR')}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ActionCell
          row={row}
          setData={setData}
          setRowSelection={setRowSelection}
        />
      ),
    }
  ], [setData, setRowSelection]);

  // Dados filtrados - CORRIGIDO
  const filteredData = useMemo(() => {
    // Para administrador: filtrar por obra selecionada
    if (isAdministrador && filterCentroCustoObra) {
      const obraSelecionada = obras.find(obra => obra.name === filterCentroCustoObra);
      if (obraSelecionada) {
        // Buscar centros de custo desta obra de forma síncrona (já deve estar pré-carregada)
        const centrosDaObra = centrosCustoPorObra[obraSelecionada.id] || [];
        
        // Filtrar produtos que pertencem a centros de custo desta obra
        return data.filter((produto: Produto) => {
          return centrosDaObra.some(centro => 
            centro.Centro_Negocio_Cod === produto.centro_custo.Centro_Negocio_Cod
          );
        });
      }
      return data;
    }
    
    // Para almoxarife: filtrar por centro de custo selecionado
    if (isAlmoxarife && filterCentroCustoObra) {
      return data.filter((produto: Produto) => 
        produto.centro_custo.Centro_Nome === filterCentroCustoObra
      );
    }
    
    return data;
  }, [data, obras, centrosCustoPorObra, isAdministrador, isAlmoxarife, filterCentroCustoObra]);

  // Dados finais para a tabela
  const tableData = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  // Tabela com dados memoizados
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Carregar info do usuário
  useEffect(() => {
    const user = getUserInfoFromToken();
    setUserInfo(user);
    console.log('User info carregado:', user);
  }, []);

  // Pré-carregar centros de custo para todas as obras (para administrador)
  useEffect(() => {
    if (isAdministrador && obras.length > 0) {
      const loadCentrosCustoParaTodasObras = async () => {
        for (const obra of obras) {
          // Só carrega se ainda não tiver carregado
          if (!centrosCustoPorObra[obra.id] && !loadingCentrosCustoPorObra[obra.id]) {
            try {
              await fetchCentrosCustoPorObra(obra.id);
            } catch (error) {
              console.error(`Erro ao carregar centros de custo da obra ${obra.name}:`, error);
            }
          }
        }
      };
      
      loadCentrosCustoParaTodasObras();
    }
  }, [obras, isAdministrador, centrosCustoPorObra, loadingCentrosCustoPorObra, fetchCentrosCustoPorObra]);

  // Carregar dados baseado no tipo de usuário - CORRIGIDO
  useEffect(() => {
    if (userInfo) {
      console.log('Tipo de usuário detectado:', userInfo.tipo);
      
      if (userInfo.tipo === "Administrador") {
        console.log('Carregando obras para administrador');
        fetchObras();
      } else if (userInfo.tipo === "Almoxarife" && userInfo.obra_id) {
        console.log('Carregando centros de custo para almoxarife');
        fetchCentrosCustoObra(userInfo.obra_id);
      } else {
        console.log('Carregando dados para usuário comum');
        fetchData(0, false);
      }
    }
  }, [userInfo, fetchObras, fetchCentrosCustoObra, fetchData]);

  // Carregar dados quando obras mudarem (para administrador) - CORRIGIDO
  useEffect(() => {
    if (userInfo?.tipo === "Administrador" && obras.length > 0) {
      console.log('Obras carregadas, buscando dados da lista de espera para administrador');
      fetchData(0, false);
    }
  }, [obras, userInfo, fetchData]);

  // Carregar dados quando centros de custo mudarem (para almoxarife) - CORRIGIDO
  useEffect(() => {
    if (userInfo?.tipo === "Almoxarife" && centrosCustoObra.length > 0) {
      console.log('Centros de custo carregados, buscando dados da lista de espera para almoxarife');
      fetchData(0, false);
    }
  }, [centrosCustoObra, userInfo, fetchData]);

  // Recarregar dados quando filtros mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      skipRef.current = 0;
      fetchData(0, false);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filterCodigoPedido, filterDestino, filterNomeProduto, filterCentroCustoObra, fetchData]);

  // Scroll infinito
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoading) return;

    let isFetching = false;

    const handleScroll = () => {
      if (isFetching) return;

      const { scrollTop, clientHeight, scrollHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isNearBottom) {
        isFetching = true;
        const newSkip = skipRef.current + limit;
        skipRef.current = newSkip;
        
        fetchData(newSkip, true).finally(() => {
          isFetching = false;
        });
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, fetchData, limit]);

  // Atualizar produtos selecionados
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const products: SelectedProduct[] = selectedRows.map(row => 
      mapProdutoToSelectedProduct(row.original)
    );
    setSelectedProducts(products);
  }, [rowSelection, table]);

  const handleSendProductsSuccess = useCallback(() => {
    setRowSelection({});
    fetchData(0, false);
  }, [fetchData]);

  const handleClearFilters = useCallback(() => {
    setFilterCodigoPedido("");
    setFilterNomeProduto("");
    setFilterDestino("");
    setFilterCentroCustoObra("");
  }, []);

  const handleSearch = useCallback(() => {
    skipRef.current = 0;
    fetchData(0, false);
  }, [fetchData]);

  // Renderizar select dinâmico baseado no tipo de usuário - CORRIGIDO
  const renderDynamicFilter = () => {
    if (!isAlmoxarife && !isAdministrador) return null;

    const obraSelecionada = obras.find(obra => obra.name === filterCentroCustoObra);
    const isLoadingCentros = obraSelecionada && loadingCentrosCustoPorObra[obraSelecionada.id];

    return (
      <div className="flex flex-col w-full sm:w-1/4">
        <label className="text-sm font-medium text-gray-700 mb-1">{filterLabel}</label>
        <div className="flex gap-2">
          <select 
            value={filterCentroCustoObra} 
            onChange={(e) => setFilterCentroCustoObra(e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl"
          >
            <option value="">Selecione {filterLabel.toLowerCase()}</option>
            
            {isAdministrador ? (
              <>
                {loadingObras ? (
                  <option value="" disabled>Carregando obras...</option>
                ) : obras.length > 0 ? (
                  obras.map((obra) => (
                    <option key={obra.id} value={obra.name}>
                      {obra.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhuma obra disponível</option>
                )}
              </>
            ) : isAlmoxarife ? (
              <>
                {loadingCentrosCusto ? (
                  <option value="" disabled>Carregando centros de custo...</option>
                ) : centrosCustoObra.length > 0 ? (
                  centrosCustoObra.map((centro) => (
                    <option key={centro.Centro_Negocio_Cod} value={centro.Centro_Nome}>
                      {centro.Centro_Nome}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum centro de custo disponível</option>
                )}
              </>
            ) : null}
          </select>
          <Button 
            onClick={handleSearch}
            disabled={isLoadingCentros}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            {isLoadingCentros ? "Carregando..." : "Buscar"}
          </Button>
        </div>
        {isLoadingCentros && (
          <div className="text-xs text-blue-600 mt-1">
            Carregando centros de custo da obra...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full px-5">
      <Header title="Autorização de Requisição" />

      {/* Filtros de Busca */}
      <div className="flex flex-wrap gap-4 py-4">
        {/* Filtro Dinâmico (Obra para Admin, Centro de Custo para Almoxarife) */}
        {renderDynamicFilter()}

        {/* Código do Pedido */}
        <div className="flex flex-col w-full sm:w-1/4">
          <label className="text-sm font-medium text-gray-700 mb-1">Código do Pedido</label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código do pedido"
              value={filterCodigoPedido}
              onChange={(e) => setFilterCodigoPedido(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-2xl w-full"
            />
            <Button 
              onClick={handleSearch}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Especificação do Insumo */}
        <div className="flex flex-col w-full sm:w-1/4">
          <label className="text-sm font-medium text-gray-700 mb-1">Especificação do Insumo</label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite a especificação do insumo"
              value={filterNomeProduto}
              onChange={(e) => setFilterNomeProduto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-2xl w-full"
            />
            <Button 
              onClick={handleSearch}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Destino */}
        <div className="flex flex-col w-full sm:w-1/4">
          <label className="text-sm font-medium text-gray-700 mb-1">Destino</label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o destino"
              value={filterDestino}
              onChange={(e) => setFilterDestino(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-2xl w-full"
            />
            <Button 
              onClick={handleSearch}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-end gap-2 w-full sm:w-auto mt-6">
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            className="rounded-2xl"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div
        ref={scrollContainerRef}
        className="rounded-2xl border h-[600px] overflow-auto relative"
      >
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={tableColumns.length} 
                  className="h-24 text-center"
                >
                  {isLoading ? "Carregando..." : "Nenhum resultado encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <LoadingSpinner message="Carregando..." />
          </div>
        )}

        {!isLoading && hasMore && (
          <div className="p-4 text-center text-gray-500">
            Role para baixo para carregar mais itens...
          </div>
        )}
      </div>
      
      {/* Informações de seleção */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s)
        </div>
        
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="outline"
            onClick={() => table.resetRowSelection()}
            className="rounded-2xl"
          >
            Limpar Seleção
          </Button>
        )}
      </div>
      
      {selectedProducts.length === 0 && (
        <div className="my-4 text-center text-gray-500">
          Selecione produtos para dar baixa
        </div>
      )}
      
      {selectedProducts.length > 0 && (
        <SelectedProducts
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onRemoveProduct={(id) => {
            setRowSelection(prev => {
              const updated = { ...prev };
              delete updated[id.toString()];
              return updated;
            });
          }}
          onSendProductsSuccess={handleSendProductsSuccess}
        />
      )}
    </div>
  );
}