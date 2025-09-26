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
import { getWaitingList, removeProductFromWaitingList, getAllWorks } from "@/api/endpoints";
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
  const [filterObraId, setFilterObraId] = useState<number | null>(null);

  // NOVO: filtro de centro de custo (para Almoxarife)
  const [filterCentroCusto, setFilterCentroCusto] = useState<string>("");

  // Opções de Centro de Custo (derivadas dos dados carregados)
  const [ccOptions, setCcOptions] = useState<Array<{ cod: string; nome: string }>>([]);

  // Tabela
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Usuário
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loadingObras, setLoadingObras] = useState(false);

  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isAdministrador = userInfo?.tipo === "Administrador";
  const isAlmoxarife = userInfo?.tipo === "Almoxarife";

  // Buscar obras para ADMINISTRADOR
  const fetchObras = useCallback(async () => {
    setLoadingObras(true);
    try {
      const response = await getAllWorks();
      setObras(response);
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

  // Fetch principal (envia work_id quando Admin selecionar obra; envia centro_custo quando almoxarife selecionar)
  const fetchData = useCallback(async (
    newSkip: number,
    append: boolean,
    codigoPedido?: string,
    buscaDestino?: string,
    buscaNomeProduto?: string,
    obraId?: number | null,
    centroCusto?: string
  ) => {
    if (!append) {
      setIsLoading(true);
      setHasMore(true);
    }

    try {
      const actualCodigoPedido = codigoPedido ?? filterCodigoPedido;
      const actualBuscaDestino = buscaDestino ?? filterDestino;
      const actualBuscaNomeProduto = buscaNomeProduto ?? filterNomeProduto;
      const actualObraId = obraId ?? filterObraId;
      const actualCentroCusto = centroCusto ?? filterCentroCusto;

      const response = await getWaitingList({
        skip: newSkip,
        limit,
        codigo_pedido: actualCodigoPedido || undefined,
        destino: actualBuscaDestino || undefined,
        SubInsumo_Especificacao: actualBuscaNomeProduto || undefined,
        work_id: isAdministrador ? actualObraId ?? undefined : undefined,
        // O backend aceita nome OU código para 'centro_custo' (ilike em nome/código)
        centro_custo: actualCentroCusto || undefined,
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
  }, [limit, toast, filterCodigoPedido, filterDestino, filterNomeProduto, filterObraId, filterCentroCusto, isAdministrador]);

  // Colunas memoizadas
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

  const tableData = useMemo(() => data, [data]);

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
  }, []);

  // Carregar obras (apenas admin)
  useEffect(() => {
    if (userInfo?.tipo === "Administrador") {
      fetchObras();
    }
  }, [userInfo, fetchObras]);

  // Primeira carga de dados
  useEffect(() => {
    if (!userInfo) return;
    fetchData(0, false);
  }, [userInfo, fetchData]);

  // ---------- AUTO-APLICAÇÃO DOS FILTROS ----------
  // Código do Pedido: aplicar imediatamente (mín. 1 char) e também ao limpar (0 char)
  useEffect(() => {
    const v = filterCodigoPedido.trim();
    if (v.length >= 1 || v.length === 0) {
      skipRef.current = 0;
      fetchData(0, false);
    }
  }, [filterCodigoPedido, fetchData]);

  // Especificação e Destino: debounce 400ms, mínimo 2 chars (ou 0 para limpar)
  useEffect(() => {
    const handler = setTimeout(() => {
      const nome = filterNomeProduto.trim();
      const dest = filterDestino.trim();

      const okNome = nome.length === 0 || nome.length >= 2;
      const okDest = dest.length === 0 || dest.length >= 2;

      if (okNome && okDest) {
        skipRef.current = 0;
        fetchData(0, false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [filterNomeProduto, filterDestino, fetchData]);

  // Obra (Admin): aplicar imediatamente ao trocar
  useEffect(() => {
    if (!isAdministrador) return;
    skipRef.current = 0;
    fetchData(0, false);
  }, [filterObraId, isAdministrador, fetchData]);

  // NOVO: ao mudar filterCentroCusto (Almoxarife), aplica imediatamente (server-side via centro_custo)
  useEffect(() => {
    if (!isAlmoxarife) return;
    // aplica sempre (quando define valor ou quando limpa)
    skipRef.current = 0;
    fetchData(0, false);
  }, [filterCentroCusto, isAlmoxarife, fetchData]);

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

  // Derivar opções de Centro de Custo (apenas para Almoxarife) a partir dos dados carregados
  useEffect(() => {
    if (!isAlmoxarife) {
      setCcOptions([]);
      return;
    }
    const map = new Map<string, string>();
    data.forEach((item) => {
      const cod = item.centro_custo?.Centro_Negocio_Cod;
      const nome = item.centro_custo?.Centro_Nome;
      if (cod && nome && !map.has(cod)) {
        map.set(cod, nome);
      }
    });
    const list = Array.from(map.entries()).map(([cod, nome]) => ({ cod, nome }));
    // Ordena alfabeticamente pelo nome para UX
    list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    setCcOptions(list);

    // Se o filtro atual apontar para um CC que não veio nessa página (paginado), mantemos o valor;
    // a busca server-side por 'centro_custo' garante consistência.
  }, [data, isAlmoxarife]);

  const handleSendProductsSuccess = useCallback(() => {
    setRowSelection({});
    fetchData(0, false);
  }, [fetchData]);

  const handleClearFilters = useCallback(() => {
    setFilterCodigoPedido("");
    setFilterNomeProduto("");
    setFilterDestino("");
    setFilterObraId(null);
    setFilterCentroCusto("");
    skipRef.current = 0;
    fetchData(0, false);
  }, [fetchData]);

  // ---- UI: filtros ocupando largura total com flex responsivo ----
  const renderFilters = () => (
    <div className="flex flex-wrap items-end gap-3 py-4 w-full">
      {/* Obra (Admin) */}
      {isAdministrador && (
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700 mb-1">Obra</label>
          <select
            value={filterObraId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setFilterObraId(val ? Number(val) : null);
            }}
            className="h-10 w-full border border-input bg-background px-3 py-2 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as obras</option>
            {loadingObras ? (
              <option value="" disabled>Carregando...</option>
            ) : obras.length > 0 ? (
              obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhuma obra</option>
            )}
          </select>
        </div>
      )}

      {/* Centro de Custo (Almoxarife) */}
      {isAlmoxarife && (
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-sm font-medium text-gray-700 mb-1">Centro de Custo</label>
          <select
            value={filterCentroCusto}
            onChange={(e) => setFilterCentroCusto(e.target.value)}
            className="h-10 w-full border border-input bg-background px-3 py-2 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos os CCs permitidos</option>
            {ccOptions.length > 0 ? (
              ccOptions.map((cc) => (
                <option key={cc.cod} value={cc.cod}>
                  {cc.nome}
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhum CC disponível</option>
            )}
          </select>
        </div>
      )}

      {/* Código do Pedido */}
      <div className="flex flex-col flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Código do Pedido</label>
        <Input
          placeholder="Digite o código"
          value={filterCodigoPedido}
          onChange={(e) => setFilterCodigoPedido(e.target.value)}
          className="rounded-2xl w-full h-10"
        />
      </div>

      {/* Especificação */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Especificação</label>
          <span className="text-xs text-gray-500">Mín. 2 caracteres</span>
        </div>
        <Input
          placeholder="Digite a especificação"
          value={filterNomeProduto}
          onChange={(e) => setFilterNomeProduto(e.target.value)}
          className="rounded-2xl w-full h-10"
        />
      </div>

      {/* Destino */}
      <div className="flex flex-col flex-1 min-w-[180px]">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Destino</label>
          <span className="text-xs text-gray-500">Mín. 2 caracteres</span>
        </div>
        <Input
          placeholder="Digite o destino"
          value={filterDestino}
          onChange={(e) => setFilterDestino(e.target.value)}
          className="rounded-2xl w-full h-10"
        />
      </div>

      {/* Botão Limpar Filtros */}
      <div className="flex flex-col flex-shrink-0">
        <label className="text-sm font-medium text-gray-700 mb-1 invisible">Limpar</label>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="rounded-2xl h-10 min-w-[120px] whitespace-nowrap"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full px-5">
      <Header title="Autorização de Requisição" />

      {/* Filtros (flex full width) */}
      {renderFilters()}

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
