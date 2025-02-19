import { useState, useEffect, useRef } from "react";
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
import { Camera } from "lucide-react";
import jsQR from "jsqr";
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import { SelectedProducts } from "./SelectedProducts";
import Header from "../Header";

export type Produto = {
  id: number;
  codigo_produto: string;
  nome_produto: string;
  unidade: string | null;
  centro_custo: string;
  data_att: string;
};

export const columns: ColumnDef<Produto>[] = [
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
    accessorKey: "codigo_produto",
    header: "Código do Produto",
    cell: ({ row }) => <div>{row.getValue("codigo_produto")}</div>,
  },
  {
    accessorKey: "nome_produto",
    header: "Nome do Produto",
    cell: ({ row }) => <div>{row.getValue("nome_produto")}</div>,
  },
  {
    accessorKey: "unidade",
    header: "Unidade",
    cell: ({ row }) => <div>{row.getValue("unidade")}</div>,
  },
  {
    accessorKey: "centro_custo",
    header: "Centro de Custo",
    cell: ({ row }) => <div>{row.getValue("centro_custo")}</div>,
  },
  {
    accessorKey: "data_att",
    header: "Data de Atualização",
    cell: ({ row }) => {
      const date = new Date(row.getValue("data_att"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
];

export function InventoryAccuracyPage() {
  const [data, setData] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estados para paginação e filtros
  const [, setSkip] = useState(0);
  const limit = 100;
  // Estados para busca
  const [filterNome, setFilterNome] = useState("");
  const [filterCodigo, setFilterCodigo] = useState("");
  const [filterCentroCusto, setFilterCentroCusto] = useState("");
  // Estado para controle do scanner
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  // Estados da tabela
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: number;
      codigo_produto: string;
      nome_produto: string;
      centro_custo: string;
      quantidade: number;
      unidade: string | null;
    }[]
  >([]);
  // Referência para o contêiner com scroll (infinite scroll)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // FUNÇÃO PRINCIPAL PARA BUSCAR DADOS
  async function fetchData(newSkip: number, append: boolean) {
    setIsLoading(true);
    try {
      const response = await getProducts({
        skip: newSkip,
        limit,
        nome_produto: filterNome,
        codigo_produto: filterCodigo,
        centro_custo: filterCentroCusto,
      });

      if (append) {
        setData((prev) => [...prev, ...response]);
      } else {
        setData(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // DISPARAR BUSCA MANUALMENTE (botões de busca)
  const handleSearchByName = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  const handleSearchByCode = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  const handleSearchByCentroCusto = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };

  const handleClearProductNameFilter = () => {
    setFilterNome("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  const handleClearProductCodeFilter = () => {
    setFilterCodigo("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  const handleClearProductCentroCustoFilter = () => {
    setFilterCentroCusto("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };

  // BUSCA INICIAL
  useEffect(() => {
    fetchData(0, false);
  }, []);

  // SCROLL INFINITO
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || data.length < 100) return;

    const handleScroll = () => {
      // Se chegou próximo do fim, carrega mais
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        // Próxima página
        setSkip((prevSkip) => {
          const newSkip = prevSkip + limit;
          fetchData(newSkip, true);
          return newSkip;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [data.length]);

  //SELEÇÃO DE PRODUTOS: mantém atualizada a lista de selecionados
  useEffect(() => {
    // Obtemos IDs que estão marcados atualmente no rowSelection
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => parseInt(key, 10));
  
    // Primeiro, removemos do selectedProducts qualquer produto que não esteja mais selecionado
    const stillSelected = selectedProducts.filter((p) => selectedIds.includes(p.id));
  
    // Agora, achamos os produtos que estão no "data" atual e foram marcados,
    // mas ainda não estão no selectedProducts
    const newlySelected = data
      .filter((produto) => selectedIds.includes(produto.id))
      .map((produto) => {
        const existing = stillSelected.find((p) => p.id === produto.id);
        return existing ? existing : { ...produto, quantidade: 0 };
      });
  
    // Unificamos ambas as listas (removidos + adicionados)
    const combinedSelected = [
      ...stillSelected,
      ...newlySelected.filter(
        (newProd) => !stillSelected.some((oldProd) => oldProd.id === newProd.id)
      ),
    ];
  
    setSelectedProducts(combinedSelected);
  }, [rowSelection, data]);

  useEffect(() => {
    if (!showScanner) return;
  
    let stream: MediaStream;
    const video = videoRef.current;
  
    const scanFrame = () => {
      if (video?.readyState === video?.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        if (video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const context = canvas.getContext('2d');
        
        if (context) {
          if (video) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            setFilterCodigo(code.data);
            setShowScanner(false);
          }
        }
      }
      if (showScanner) {
        requestAnimationFrame(scanFrame);
      }
    };
  
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        stream = mediaStream;
        if (video) {
          video.srcObject = mediaStream;
          video.play().then(() => requestAnimationFrame(scanFrame));
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Permissão para usar a câmera é necessária para escanear QR codes",
        });
      });
  
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
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

  return (
    <div className="w-full px-5">
      <Header title="Acurácia de Estoque" />
      <div className="flex flex-col sm:flex-row items-center py-4 gap-4">

        {/* Filtro por nome */}
        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por nome do produto
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o nome do produto"
                value={filterNome}
                onChange={(event) => setFilterNome(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchByName();
                  }
                }}
                className="rounded-2xl w-full pr-10"
              />
              {filterNome !== "" && (
                <button
                  type="button"
                  onClick={handleClearProductNameFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Limpar campo de texto"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleSearchByName}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Filtro por código */}
        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por código do produto
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite ou escaneie o código do produto"
                value={filterCodigo}
                onChange={(event) => setFilterCodigo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchByCode();
                  }
                }}
                className="rounded-2xl w-full pr-10"
              />
              {filterCodigo !== "" ? (
                <button
                  type="button"
                  onClick={handleClearProductCodeFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Limpar campo de texto"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Camera className="text-gray-500"/>
                </button>
              )}
            </div>
            <button
              onClick={handleSearchByCode}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Filtro por centro de custo */}
        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por centro de custo
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o centro de custo"
                value={filterCentroCusto}
                onChange={(event) => setFilterCentroCusto(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchByCentroCusto();
                  }
                }}
                className="rounded-2xl w-full pr-10"
              />
              {filterCentroCusto !== "" && (
                <button
                  type="button"
                  onClick={handleClearProductCentroCustoFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Limpar campo de texto"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleSearchByCentroCusto}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Contêiner com scroll infinito */}
      <div
        ref={scrollContainerRef}
        className="rounded-2xl border h-[600px] overflow-auto relative"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
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
      </div>
      {selectedProducts.length === 0 && (
        <div className="my-4 text-center text-gray-500">
          Selecione produtos para adicionar à lista de acurácia de estoque.
        </div>
      )}
      {selectedProducts.length > 0 && (
        <SelectedProducts
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          onRemoveProduct={(id) => {
            setRowSelection((prev) => {
              const updated = { ...prev };
              delete updated[id.toString()];
              return updated;
            });
          }}
        />
      )}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <video 
              ref={videoRef}
              className="w-full rounded-lg"
              playsInline
            />
            <p className="text-center text-gray-600 text-sm mt-2">
              Escaneie o QR Code do Código do produto, assim que o código for lido a câmera será fechada.
            </p>
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
            >
              Fechar Câmera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
