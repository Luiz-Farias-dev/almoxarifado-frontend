import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "../LoadingSpinner";
import { addProductToWaitingList } from "@/api/endpoints";
import { getNameFromToken } from "@/utils/tokenUtils";

type SelectedProduct = {
  id: number;
  Insumo_Cod: number;
  SubInsumo_Cod: number;
  Unid_Cod: string;
  SubInsumo_Especificacao: string;
  INSUMO_ITEMOBSOLETO: string;
  quantidade: number;
};

type SelectedProductsProps = {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<SelectedProduct[]>>;
  onRemoveProduct: (id: number) => void;
};

export const SelectedProducts = ({ selectedProducts, setSelectedProducts, onRemoveProduct }: SelectedProductsProps) => {
  const navigate = useNavigate();
  const [nome, setNome] = useState<string | null>(null);
  const [destino, setDestino] = useState("");
  const [loadingSendProducts, setLoadingSendProducts] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const name = getNameFromToken();
    setNome(name);
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

  const handleRemove = (id: number) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
    onRemoveProduct(id);
    setSuccessMessage(null);
  };

  const handleSend = async () => {
    setLoadingSendProducts(true);
    const dataToSend = {
      nome_funcionario_1: nome || undefined,
      destino: destino,
      produtos: selectedProducts.map((product) => ({
        Insumo_Cod: product.Insumo_Cod,
        SubInsumo_Cod: product.SubInsumo_Cod,
        Unid_Cod: product.Unid_Cod.trim(),
        SubInsumo_Especificacao: product.SubInsumo_Especificacao.trim(),
        INSUMO_ITEMOBSOLETO: product.INSUMO_ITEMOBSOLETO,
        quantidade: product.quantidade,
      })),
    };
    console.log("Payload a ser enviado:", JSON.stringify(dataToSend, null, 2))

    try {
      const response = await addProductToWaitingList(dataToSend);
      setOrderCode(response.codigo_pedido);
      setSuccessMessage("Envio realizado com sucesso!");
      setErrorMessage(null);
      setNome("");
      setDestino("");
    } catch (error) {
      setErrorMessage("Erro ao enviar dados. Tente novamente.");
      setSuccessMessage(null);
    } finally {
      setLoadingSendProducts(false);
    }
  };

  const isSendButtonDisabled = !(
    selectedProducts.length > 0 &&
    nome &&
    destino &&
    selectedProducts.every((p) => p.quantidade > 0)
  );

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(orderCode || '');;
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 5000);
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
              ) }
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
              <div className="mt-1 text-gray-900">{product.Insumo_Cod}</div>
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
            {/* Centro de Custo
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Centro de Custo
              </label>
              <div className="mt-1 text-gray-900">{product.centro_custo}</div>
            </div> */}
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

      {/* Campos de Nome e Destino */}
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destino
            </label>
            <Input
              type="text"
              value={destino}
              placeholder="Digite o destino"
              onChange={(e) => setDestino(e.target.value)}
              className="mt-1 rounded-2xl"
            />
          </div>
        </div>
        {/* Botão de Enviar */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <button
            onClick={() => navigate("/lista-espera")}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl text-yellow-500 border border-yellow-500 hover:bg-yellow-500 hover:text-white transition"
          >
            Ir para Lista de Espera
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
    </div>
  );
};
