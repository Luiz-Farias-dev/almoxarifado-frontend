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
import { getWaitingList, removeProductFromWaitingList } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import { SelectedProducts, SelectedProduct } from "./SelectedProducts"; // Importando o tipo exportado
import Header from "../Header";

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
  };
  almoxarife_nome: string;
  destino: string;
};

// Removido o tipo SelectedProduct local (usaremos o importado)

const ActionCell = ({
  row,
  setData,
  setRowSelection
}: {
  row: any;
  setData: React.Dispatch<React.SetStateAction<Produto[]>>;
  setRowSelection: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const produto = row.original;
    
    try {
      setIsDeleting(true);
      await removeProductFromWaitingList(
        produto.codigo_pedido,
        produto.Insumo_Cod,
        produto.SubInsumo_Cod,
      );
      
      setData(prevData => 
        prevData.filter(item => item.id !== produto.id)
      );
      
      setRowSelection(prev => {
        const updated = { ...prev };
        delete updated[produto.id.toString()];
        return updated;
      });
    } catch (error) {
      console.error("Erro ao remover produto:", error);
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
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setIsDialogOpen(true);
            setIsDropdownOpen(false);
          }}
        >
          <div className="flex items-center gap-2">
            <Trash2 color="red" size={10}/>
            <span className="text-red-500 hover:text-red-700">Excluir Item</span>
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

export const columns = (
  setData: React.Dispatch<React.SetStateAction<Produto[]>>,
  setRowSelection: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
): ColumnDef<Produto>[] => [
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
      return <div>{date.toLocaleString()}</div>;
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
];

export function WaitListPage() {
  const [data, setData] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setSkip] = useState(0);
  const limit = 100;
  const [filterNomeProduto, setFilterNomeProduto] = useState("");
  const [filterDestino, setFilterDestino] = useState("");
  const [filterCodigoPedido, setFilterCodigoPedido] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function fetchData(newSkip: number, append: boolean) {
    setIsLoading(true);
    try {
      const response = await getWaitingList({
        skip: newSkip,
        limit,
        codigo_pedido: filterCodigoPedido || undefined,
        destino: filterDestino || undefined,
        nome_produto: filterNomeProduto || undefined,
      });
      console.log("Dados da API:", response);
      if (append) {
        setData((prev) => [...prev, ...response]);
      } else {
        setData(response);
      }
    } catch (error) {
      console.error("Erro ao buscar lista de espera:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearchByProductName = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  
  const handleSearchByDestiny = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  
  const handleSearchByOrderNumber = () => {
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  
  const handleClearProductNameFilter = () => {
    setFilterNomeProduto("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  
  const handleClearDestinyFilter = () => {
    setFilterDestino("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };
  
  const handleClearOrderCodeFilter = () => {
    setFilterCodigoPedido("");
    setSkip(0);
    setData([]);
    fetchData(0, false);
  };

  const handleRemoveProductFromTable = (removedProducts: number[]) => {
    setData(prevData =>
      prevData.filter(produto => !removedProducts.includes(produto.id))
    );
  };

  useEffect(() => {
    fetchData(0, false);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || data.length < 100) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        setSkip(prevSkip => {
          const newSkip = prevSkip + limit;
          fetchData(newSkip, true);
          return newSkip;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [data.length]);

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(key => parseInt(key, 10));

    const stillSelected = selectedProducts.filter(p => 
      selectedIds.includes(p.id)
    );

    const newlySelected = data
      .filter(produto => selectedIds.includes(produto.id))
      .map(produto => {
        const existing = stillSelected.find(p => p.id === produto.id);
        
        return existing || {
          id: produto.id,
          almoxarife_nome: produto.almoxarife_nome,
          Unid_Cod: produto.Unid_Cod,
          SubInsumo_Especificacao: produto.SubInsumo_Especificacao,
          // Convertendo para number para compatibilidade
          codigo_pedido: Number(produto.codigo_pedido),
          centro_custo: produto.centro_custo,
          Insumo_Cod: produto.Insumo_Cod,
          SubInsumo_Cod: produto.SubInsumo_Cod,
          quantidade: produto.quantidade,
          destino: produto.destino,
        };
      });

    const combinedSelected = [
      ...stillSelected,
      ...newlySelected.filter(
        newProd => !stillSelected.some(oldProd => oldProd.id === newProd.id)
      ),
    ];

    setSelectedProducts(combinedSelected);
  }, [rowSelection, data]);

  const table = useReactTable({
    data,
    columns: columns(setData, setRowSelection),
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
      <Header title="Lista de Espera" />
      <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por código do pedido
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o código do pedido"
                value={filterCodigoPedido}
                onChange={(e) => setFilterCodigoPedido(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchByOrderNumber()}
                className="rounded-2xl w-full pr-10"
              />
              {filterCodigoPedido && (
                <button
                  onClick={handleClearOrderCodeFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              onClick={handleSearchByOrderNumber}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por nome do produto
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o nome do produto"
                value={filterNomeProduto}
                onChange={(e) => setFilterNomeProduto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchByProductName()}
                className="rounded-2xl w-full pr-10"
              />
              {filterNomeProduto && (
                <button
                  onClick={handleClearProductNameFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              onClick={handleSearchByProductName}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar destino
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite o destino"
                value={filterDestino}
                onChange={(e) => setFilterDestino(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchByDestiny()}
                className="rounded-2xl w-full pr-10"
              />
              {filterDestino && (
                <button
                  onClick={handleClearDestinyFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              onClick={handleSearchByDestiny}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Buscar
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="rounded-2xl border h-[600px] overflow-auto relative"
      >
        <Table>
          <TableHeader>
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
                <TableCell colSpan={columns.length} className="h-22 text-center">
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
          onSendProductsSuccess={handleRemoveProductFromTable}
        />
      )}
    </div>
  );
}