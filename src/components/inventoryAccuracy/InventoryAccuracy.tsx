// import { useState, useEffect, useRef } from "react";
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Camera } from "lucide-react";
// import jsQR from "jsqr";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { getProducts } from "@/api/endpoints";
// import LoadingSpinner from "../LoadingSpinner";
// import { SelectedProducts, SelectedProduct } from "./SelectedProducts"; // Importando o tipo SelectedProduct
// import Header from "../Header";

// // Definindo o tipo Produto completo
// export type Produto = {
//   id: number;
//   Insumo_Cod: number;
//   SubInsumo_Cod: number;
//   Unid_Cod: string;
//   SubInsumo_Especificacao: string;
//   nome_produto: string;
//   INSUMO_ITEMOBSOLETO: string;
//   data_att: string;
// };

// export const columns: ColumnDef<Produto>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "Insumo_Cod",
//     header: "Código do Insumo",
//     cell: ({ row }) => <div>{row.getValue("Insumo_Cod")}</div>,
//   },
//   {
//     accessorKey: "SubInsumo_Cod",
//     header: "Sub Código",
//     cell: ({ row }) => <div>{row.getValue("SubInsumo_Cod")}</div>,
//   },
//   {
//     accessorKey: "nome_produto",
//     header: "Nome do Produto",
//     cell: ({ row }) => <div>{row.getValue("nome_produto")}</div>,
//   },
//   {
//     accessorKey: "Unid_Cod",
//     header: "Unidade",
//     cell: ({ row }) => <div>{row.getValue("Unid_Cod")}</div>,
//   },
//   {
//     accessorKey: "SubInsumo_Especificacao",
//     header: "Especificação",
//     cell: ({ row }) => <div>{row.getValue("SubInsumo_Especificacao")}</div>,
//   },
//   {
//     accessorKey: "INSUMO_ITEMOBSOLETO",
//     header: "Obsoleto",
//     cell: ({ row }) => <div>{row.getValue("INSUMO_ITEMOBSOLETO") === "S" ? "Sim" : "Não"}</div>,
//   },
//   {
//     accessorKey: "data_att",
//     header: "Data de Atualização",
//     cell: ({ row }) => {
//       const date = new Date(row.getValue("data_att"));
//       return <div>{date.toLocaleString()}</div>;
//     },
//   },
// ];

// export function InventoryAccuracyPage() {
//   const [data, setData] = useState<Produto[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [, setSkip] = useState(0);
//   const limit = 100;
  
//   // Estados para os novos filtros
//   const [filterNome, setFilterNome] = useState("");
//   const [filterCodigo, setFilterCodigo] = useState("");
//   const [filterSubCodigo, setFilterSubCodigo] = useState("");
//   const [filterUnidade, setFilterUnidade] = useState("");
//   const [filterEspecificacao, setFilterEspecificacao] = useState("");
//   const [filterObsoleto, setFilterObsoleto] = useState("");
  
//   // Estado para controle do scanner
//   const [showScanner, setShowScanner] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const { toast } = useToast();
  
//   // Estados da tabela
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  
//   // CORREÇÃO: Usando o tipo SelectedProduct importado
//   const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
//   // Referência para o contêiner com scroll
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   // FUNÇÃO PRINCIPAL PARA BUSCAR DADOS
//   async function fetchData(newSkip: number, append: boolean) {
//     setIsLoading(true);
//     try {
//       const response = await getProducts({
//         skip: newSkip,
//         limit,
//         Insumo_Cod: filterCodigo,
//         SubInsumo_Cod: filterSubCodigo,
//         Unid_Cod: filterUnidade,
//         SubInsumo_Especificacao: filterEspecificacao,
//         INSUMO_ITEMOBSOLETO: filterObsoleto,
//         nome_produto: filterNome,
//       });

//       if (append) {
//         setData((prev) => [...prev, ...response]);
//       } else {
//         setData(response);
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         variant: "destructive",
//         title: "Erro",
//         description: "Falha ao carregar produtos",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   // Disparar busca
//   const handleSearch = () => {
//     setSkip(0);
//     setData([]);
//     fetchData(0, false);
//   };

//   // Limpar todos os filtros
//   const handleClearFilters = () => {
//     setFilterNome("");
//     setFilterCodigo("");
//     setFilterSubCodigo("");
//     setFilterUnidade("");
//     setFilterEspecificacao("");
//     setFilterObsoleto("");
//     setSkip(0);
//     setData([]);
//     fetchData(0, false);
//   };

//   // BUSCA INICIAL
//   useEffect(() => {
//     fetchData(0, false);
//   }, []);

//   // SCROLL INFINITO
//   useEffect(() => {
//     const container = scrollContainerRef.current;
//     if (!container || data.length < 100) return;

//     const handleScroll = () => {
//       if (
//         container.scrollTop + container.clientHeight >=
//         container.scrollHeight - 10
//       ) {
//         setSkip((prevSkip) => {
//           const newSkip = prevSkip + limit;
//           fetchData(newSkip, true);
//           return newSkip;
//         });
//       }
//     };

//     container.addEventListener("scroll", handleScroll);
//     return () => {
//       container.removeEventListener("scroll", handleScroll);
//     };
//   }, [data.length]);

//   // SELEÇÃO DE PRODUTOS
//   useEffect(() => {
//     const selectedIds = Object.keys(rowSelection)
//       .filter((key) => rowSelection[key])
//       .map((key) => parseInt(key, 10));
  
//     const stillSelected = selectedProducts.filter((p) => selectedIds.includes(p.id));
  
//     const newlySelected = data
//       .filter((produto) => selectedIds.includes(produto.id))
//       .map((produto) => {
//         const existing = stillSelected.find((p) => p.id === produto.id);
        
//         // CORREÇÃO: Criando objeto compatível com SelectedProduct
//         return existing ? existing : { 
//           id: produto.id,
//           Insumo_Cod: produto.Insumo_Cod,
//           SubInsumo_Cod: produto.SubInsumo_Cod,
//           nome_produto: produto.nome_produto,
//           Unid_Cod: produto.Unid_Cod,
//           quantidade: 0 
//         };
//       });
  
//     const combinedSelected = [
//       ...stillSelected,
//       ...newlySelected.filter(
//         (newProd) => !stillSelected.some((oldProd) => oldProd.id === newProd.id)
//       ),
//     ];
  
//     setSelectedProducts(combinedSelected);
//   }, [rowSelection, data]);

//   // SCANNER QR CODE
//   useEffect(() => {
//     if (!showScanner) return;
  
//     let stream: MediaStream;
//     const video = videoRef.current;
  
//     const scanFrame = () => {
//       if (video?.readyState === video?.HAVE_ENOUGH_DATA) {
//         const canvas = document.createElement('canvas');
//         if (video) {
//           canvas.width = video.videoWidth;
//           canvas.height = video.videoHeight;
//         }
//         const context = canvas.getContext('2d');
        
//         if (context) {
//           if (video) {
//             context.drawImage(video, 0, 0, canvas.width, canvas.height);
//           }
//           const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//           const code = jsQR(imageData.data, imageData.width, imageData.height);
          
//           if (code) {
//             const qrData = code.data;
            
//             // Identificar tipo de código pelo padrão
//             if (qrData.startsWith("INSUMO:")) {
//               setFilterCodigo(qrData.split(":")[1]);
//             } 
//             else if (qrData.startsWith("SUBINSUMO:")) {
//               setFilterSubCodigo(qrData.split(":")[1]);
//             }
//             else if (qrData.startsWith("UNIDADE:")) {
//               setFilterUnidade(qrData.split(":")[1]);
//             }
            
//             setShowScanner(false);
//           }
//         }
//       }
//       if (showScanner) {
//         requestAnimationFrame(scanFrame);
//       }
//     };
  
//     navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
//       .then((mediaStream) => {
//         stream = mediaStream;
//         if (video) {
//           video.srcObject = mediaStream;
//           video.play().then(() => requestAnimationFrame(scanFrame));
//         }
//       })
//       .catch(() => {
//         toast({
//           variant: "destructive",
//           title: "Erro",
//           description: "Permissão para usar a câmera é necessária para escanear QR codes",
//         });
//       });
  
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [showScanner, toast]);

//   const table = useReactTable({
//     data,
//     columns,
//     getRowId: (row) => String(row.id),
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   return (
//     <div className="w-full px-5">
//       <Header title="Acurácia de Estoque" />
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
//         {/* Filtro por código principal */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Código Insumo (QR)
//           </label>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <Input
//                 placeholder="Código principal"
//                 value={filterCodigo}
//                 onChange={(e) => setFilterCodigo(e.target.value)}
//                 className="rounded-2xl w-full pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowScanner(true)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 <Camera className="text-gray-500" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Filtro por subcódigo */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Sub Código
//           </label>
//           <Input
//             placeholder="Código secundário"
//             value={filterSubCodigo}
//             onChange={(e) => setFilterSubCodigo(e.target.value)}
//             className="rounded-2xl"
//           />
//         </div>

//         {/* Filtro por unidade */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Código Unidade
//           </label>
//           <Input
//             placeholder="Código unidade"
//             value={filterUnidade}
//             onChange={(e) => setFilterUnidade(e.target.value)}
//             className="rounded-2xl"
//           />
//         </div>

//         {/* Filtro por nome */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Nome do Produto
//           </label>
//           <Input
//             placeholder="Nome do produto"
//             value={filterNome}
//             onChange={(e) => setFilterNome(e.target.value)}
//             className="rounded-2xl"
//           />
//         </div>

//         {/* Filtro por especificação */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Especificação
//           </label>
//           <Input
//             placeholder="Especificações"
//             value={filterEspecificacao}
//             onChange={(e) => setFilterEspecificacao(e.target.value)}
//             className="rounded-2xl"
//           />
//         </div>

//         {/* Filtro por status obsoleto */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Status Obsoleto
//           </label>
//           <select 
//             value={filterObsoleto}
//             onChange={(e) => setFilterObsoleto(e.target.value)}
//             className="rounded-2xl border p-2"
//           >
//             <option value="">Todos</option>
//             <option value="S">Sim</option>
//             <option value="N">Não</option>
//           </select>
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <Button
//           onClick={handleSearch}
//           className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600"
//         >
//           Buscar Produtos
//         </Button>
//         <Button
//           onClick={handleClearFilters}
//           className="bg-gray-300 px-4 py-2 rounded-2xl hover:bg-gray-400"
//         >
//           Limpar Filtros
//         </Button>
//       </div>

//       {/* Contêiner com scroll infinito */}
//       <div
//         ref={scrollContainerRef}
//         className="rounded-2xl border h-[600px] overflow-auto relative mt-4"
//       >
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   {isLoading ? "Carregando..." : "Nenhum resultado encontrado."}
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         {isLoading && (
//           <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
//             <LoadingSpinner message="Carregando..." />
//           </div>
//         )}
//       </div>
      
//       {selectedProducts.length === 0 && (
//         <div className="my-4 text-center text-gray-500">
//           Selecione produtos para adicionar à lista de acurácia de estoque.
//         </div>
//       )}
      
//       {selectedProducts.length > 0 && (
//         <SelectedProducts
//           selectedProducts={selectedProducts}
//           setSelectedProducts={setSelectedProducts}
//           onRemoveProduct={(id) => {
//             setRowSelection((prev) => {
//               const updated = { ...prev };
//               delete updated[id.toString()];
//               return updated;
//             });
//           }}
//         />
//       )}
      
//       {showScanner && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-4 rounded-lg max-w-md w-full">
//             <video 
//               ref={videoRef}
//               className="w-full rounded-lg"
//               playsInline
//             />
//             <p className="text-center text-gray-600 text-sm mt-2">
//               Escaneie o QR Code do produto
//             </p>
//             <button
//               onClick={() => setShowScanner(false)}
//               className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
//             >
//               Fechar Câmera
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }