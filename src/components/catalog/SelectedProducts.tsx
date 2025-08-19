import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "../LoadingSpinner";
import { addProductToWaitingList, getAllCostCenter } from "@/api/endpoints";
import { getUserInfoFromToken } from "@/utils/tokenUtils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type SelectedProduct = {
  id: number;
  Insumo_Cod: number;
  SubInsumo_Cod: number;
  Unid_Cod: string;
  SubInsumo_Especificacao: string;
  quantidade: number;
};

type SelectedProductsProps = {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<SelectedProduct[]>>;
  onRemoveProduct: (id: number) => void;
};

type CentrosCustoProps = {
  Centro_Negocio_Cod: string;
  Centro_Nome: string;
  work_id: number;
};

export const SelectedProducts = ({
  selectedProducts,
  setSelectedProducts,
  onRemoveProduct,
}: SelectedProductsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [destino, setDestino] = useState("");
  const [centroCustoSelected, setCentroCustoSelected] = useState<CentrosCustoProps | null>(null);
  const [centrosCusto, setCentrosCusto] = useState<CentrosCustoProps[]>([]);
  const [loadingSendProducts, setLoadingSendProducts] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isDestinoModalOpen, setIsDestinoModalOpen] = useState(false);
  const [isCentroCustoModalOpen, setIsCentroCustoModalOpen] = useState(false);
  const [filterDestino, setFilterDestino] = useState("");

  const destinos = [
    "Civil",
    "Terraplenagem",
    "Drenagem Superficial",
    "Edificações",
    "RMT",
    "SOLAR",
    "Mecânica",
    "Meio Ambiente",
    "Segurança e Saúde Ocupacional (SSO)",
    "Administrativo",
    "Departamento Pessoal",
    "Sala Técnica",
    "Qualidade e Laboratórios",
    "Gestor de Contratos, Planejamento e Custos",
    "Eng. Produção e Enc. Gerais",
    "Almoxarifado",
    "Compras",
    "RMT - Mecânica",
    "RMT - Meio Ambiente",
    "RMT - Segurança e Saúde Ocupacional (SSO)",
    "RMT - Administrativo",
    "RMT - Departamento Pessoal",
    "RMT - Sala Técnica",
    "RMT - Qualidade e Laboratórios",
    "RMT - Gestor de Contratos, Planejamento e Custos",
    "RMT - Eng. Produção e Enc. Gerais",
    "RMT - Almoxarifado",
    "RMT - Compras",
    "Solar - Mecânica",
    "Solar - Meio Ambiente",
    "Solar - Segurança e Saúde Ocupacional (SSO)",
    "Solar - Administrativo",
    "Solar - Departamento Pessoal",
    "Solar - Sala Técnica",
    "Solar - Qualidade e Laboratórios",
    "Solar - Gestor de Contratos, Planejamento e Custos",
    "Solar - Eng. Produção e Enc. Gerais",
    "Solar - Almoxarifado",
    "Solar - Compras"
  ];

  useEffect(() => {
    const user = getUserInfoFromToken();
    setUserInfo(user);
    setNome(user?.nome || null);
    
     // Converter possíveis valores null para undefined
    let obraId: number | undefined = undefined;
    
    if (user?.tipo === 'Almoxarife' && user.obra_id !== null) {
      obraId = user.obra_id;
    }
  
    fetchAllCostCenter(obraId);
  }, []);

  const handleInputChange = (
    id: number,
    field: "quantidade",
    value: string | number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [field]: typeof value === 'string' ? parseInt(value, 10) : value } : product
      )
    );
  };

  const fetchAllCostCenter = async (obraId?: number) => {
    try {
      const response = await getAllCostCenter(obraId);
      setCentrosCusto(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar os centros de custo",
      });
    } 
  };

  const handleRemove = (id: number) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
    onRemoveProduct(id);
    setSuccessMessage(null);
  };

  const handleSend = async () => {
    setLoadingSendProducts(true);
    
    if (!centroCustoSelected) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um centro de custo",
      });
      setLoadingSendProducts(false);
      return;
    }

    const dataToSend = {
      almoxarife_nome: nome || undefined,
      destino: destino,
      centro_custo: centroCustoSelected || undefined,
      produtos: selectedProducts.map((product) => ({
        Insumo_Cod: product.Insumo_Cod,
        SubInsumo_Cod: product.SubInsumo_Cod,
        Unid_Cod: product.Unid_Cod.trim(),
        SubInsumo_Especificacao: product.SubInsumo_Especificacao.trim(),
        quantidade: product.quantidade,
      })),
    };

    try {
      const response = await addProductToWaitingList(dataToSend);
      setOrderCode(response.codigo_pedido);
      setSuccessMessage("Envio realizado com sucesso!");
      setErrorMessage(null);
      setDestino("");
      setCentroCustoSelected(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Erro ao enviar dados. Tente novamente.";
      setErrorMessage(errorMessage);
      setSuccessMessage(null);
    } finally {
      setLoadingSendProducts(false);
    }
  };

  const isSendButtonDisabled = !(
    selectedProducts.length > 0 &&
    nome &&
    destino &&
    centroCustoSelected && 
    selectedProducts.every((p) => p.quantidade > 0)
  );

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(orderCode || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 5000);
  };

  const handleSelectDestino = (destinoSelecionado: string) => {
    setDestino(destinoSelecionado);
    setIsDestinoModalOpen(false);
  };

  const handleClearDestino = () => {
    setDestino("");
  };

  const handleSelectCentroCusto = (centro: CentrosCustoProps) => {
    setCentroCustoSelected(centro);
    setIsCentroCustoModalOpen(false);
  };

  const handleClearCentroCusto = () => {
    setCentroCustoSelected(null);
  };

  return (
    <div className="mt-4 border-t p-4">
      <h2 className="font-semibold text-lg mb-3 text-center sm:text-left">
        Produtos Selecionados
      </h2>
      {successMessage && (
        <>
          <p className="text-green-500 mb-1">{successMessage}</p>
          <div className="flex items-center text-gray-800 mb-2">
            <p className="mr-2">Código do pedido: {orderCode}</p>
            <button onClick={handleCopyOrderCode} aria-label="Copiar número do pedido">
              {isCopied ? (
                <Check size={15} className="text-gray-500" />
              ) : (
                <Copy size={15} className="text-gray-500 hover:text-gray-700" />
              )}
            </button>
          </div>
        </>
      )}
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      
      {/* Área rolável para os produtos */}
      <div className="max-h-60 overflow-y-auto border rounded-2xl p-2">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center mb-3 border-b pb-2 relative"
          >
            {/* Código do produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código do Produto
              </label>
              <div className="mt-1 text-gray-900">{product.Insumo_Cod}-{product.SubInsumo_Cod}</div>
            </div>
            
            {/* Nome do produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Especificação do Insumo
              </label>
              <div className="mt-1 text-gray-900">{product.SubInsumo_Especificacao}</div>
            </div>
            
            {/* Unidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unidade
              </label>
              <div className="mt-1 text-gray-900">{product.Unid_Cod || "-"}</div>
            </div>
            
            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantidade
              </label>
              <div className="flex flex-row items-center">
                <Input
                  type="number"
                  value={product.quantidade}
                  placeholder="Quantidade"
                  onChange={(e) =>
                    handleInputChange(product.id, "quantidade", parseInt(e.target.value))
                  }
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="mt-1 rounded-2xl"
                />
                <button
                  className="pl-2 mr-1 text-black hover:text-gray-800 transition"
                  onClick={() => handleRemove(product.id)}
                  aria-label={`Remover ${product.SubInsumo_Especificacao}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campos de Nome, Destino e Centro de Custo */}
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Almoxarife
            </label>
            <Input
              type="text"
              value={nome || ""}
              placeholder="Digite seu nome"
              readOnly
              className="mt-1 rounded-2xl"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo de Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destino
              </label>
              {destino ? (
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-100 px-4 py-2 rounded-2xl flex items-center justify-between">
                    <span>{destino}</span>
                    <button 
                      onClick={handleClearDestino}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsDestinoModalOpen(true)}
                  className="w-full mt-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-2xl flex items-center justify-center hover:bg-blue-600 transition"
                >
                  Escolher Destino
                </button>
              )}
            </div>
            
            {/* Campo de Centro de Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Centro de Custo
              </label>
              {centroCustoSelected ? (
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-100 px-4 py-2 rounded-2xl flex items-center justify-between">
                    <span>{centroCustoSelected.Centro_Nome}</span>
                    <button 
                      onClick={handleClearCentroCusto}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCentroCustoModalOpen(true)}
                  className="w-full mt-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-2xl flex items-center justify-center hover:bg-blue-600 transition"
                >
                  Escolher Centro de Custo
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão de Enviar */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <button
            onClick={() => navigate("/lista-espera")}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl text-yellow-500 border border-yellow-500 hover:bg-yellow-500 hover:text-white transition"
          >
            Ir para Autorização de Requisição
          </button>
          <button
            onClick={handleSend}
            disabled={isSendButtonDisabled}
            className={`w-full sm:w-auto px-4 py-2 rounded-2xl transition ${
              isSendButtonDisabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {loadingSendProducts ? (
              <LoadingSpinner message="Enviando..." />
            ) : (
              "Enviar Produtos"
            )}
          </button>
        </div>
      </div>

      {/* Modal de Destino */}
      <AlertDialog open={isDestinoModalOpen} onOpenChange={setIsDestinoModalOpen}>
        <AlertDialogContent className="max-w-2xl flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Escolha o destino na lista abaixo</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione o destino para os produtos
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="p-4">
            <Input
              placeholder="Filtrar destinos..."
              value={filterDestino}
              onChange={(e) => setFilterDestino(e.target.value)}
              className="mb-4 rounded-2xl"
            />
            
            <div className="border rounded-lg overflow-auto max-h-[50vh]">
              {destinos
                .filter(destino => 
                  destino.toLowerCase().includes(filterDestino.toLowerCase())
                )
                .map((destinoItem, index) => (
                  <div 
                    key={index}
                    className={`p-3 border-b cursor-pointer flex items-center ${
                      destino === destinoItem
                        ? "bg-blue-50 border-l-4 border-l-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectDestino(destinoItem)}
                  >
                    <span>{destinoItem}</span>
                  </div>
                ))}
            </div>
          </div>
          
          <AlertDialogFooter className="mt-2 px-6 pb-4">
            <AlertDialogCancel 
              onClick={() => setIsDestinoModalOpen(false)}
              className="w-full"
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal de Centro de Custo */}
      <AlertDialog open={isCentroCustoModalOpen} onOpenChange={setIsCentroCustoModalOpen}>
        <AlertDialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userInfo?.tipo === 'Almoxarife' 
                ? "Centros de Custo da Sua Obra" 
                : "Escolha o centro de custo"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userInfo?.tipo === 'Almoxarife' && userInfo?.obra_id && (
                <div className="text-green-600 font-medium">
                  Filtrados pela obra associada ao seu perfil
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="p-4">
            <div className="border rounded-lg overflow-auto max-h-[300px]">
              {centrosCusto.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum centro de custo disponível
                </div>
              ) : (
                centrosCusto.map((centro, index) => (
                  <div 
                    key={index}
                    className={`p-3 border-b cursor-pointer flex items-center ${
                      centroCustoSelected?.Centro_Nome === centro.Centro_Nome
                        ? "bg-blue-50 border-l-4 border-l-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectCentroCusto(centro)}
                  >
                    <span>{centro.Centro_Nome} - {centro.Centro_Negocio_Cod}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel 
              onClick={() => setIsCentroCustoModalOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};