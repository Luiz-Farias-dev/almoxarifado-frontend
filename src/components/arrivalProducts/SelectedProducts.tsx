import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "../LoadingSpinner";
import { addProductToArrivalProducts } from "@/api/endpoints";
import { getNameFromToken } from "@/utils/tokenUtils";

type SelectedProduct = {
  id: number;
  codigo_produto: string;
  nome_produto: string;
  centro_custo: string;
  quantidade: number;
  unidade: string | null;
};

type SelectedProductsProps = {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<SelectedProduct[]>>;
  onRemoveProduct: (id: number) => void;
};

export const SelectedProducts = ({ selectedProducts, setSelectedProducts, onRemoveProduct }: SelectedProductsProps) => {
  const { toast } = useToast();
  const [observacao, setObservacao] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [loadingSendProducts, setLoadingSendProducts] = useState(false);

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
  };

  const handleSend = async () => {
    setLoadingSendProducts(true);
    const dataToSend = {
      nome_funcionario: nome || undefined,
      observacao: observacao || null,
      produtos: selectedProducts.map((product) => ({
        codigo_produto: product.codigo_produto,
        nome_produto: product.nome_produto,
        centro_custo: product.centro_custo,
        quantidade: product.quantidade,
        unidade: product.unidade === "" ? null : product.unidade,
      })),
    };

    try {
      await addProductToArrivalProducts(dataToSend);
      handleSuccessToast();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      handleFailToast();
    } finally {
      setLoadingSendProducts(false);
    }
  };

  const handleSuccessToast = () => {
    toast({
      variant: "success",
      title: "Sucesso",
      description: "Produtos enviados com sucesso.",
    });
  };
  const handleFailToast = () => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Erro ao enviar produtos, tente novamente.",
    });
  };

  const isSendButtonDisabled = !(
    selectedProducts.length > 0 &&
    nome &&
    selectedProducts.every((p) => p.quantidade > 0)
  );

  return (
    <div className="mt-4 border-t p-4">
      <h2 className="font-semibold text-lg mb-3 text-center sm:text-left">
        Produtos Selecionados
      </h2>
      {/* Área rolável para os produtos */}
      <div className="max-h-60 overflow-y-auto border rounded-2xl p-2">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center mb-4 border-b pb-2 relative"
          >
            {/* Código do produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código do Produto
              </label>
              <div className="mt-1 text-gray-900">{product.codigo_produto}</div>
            </div>
            {/* Nome do produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome do Produto
              </label>
              <div className="mt-1 text-gray-900">{product.nome_produto}</div>
            </div>
            {/* Unidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unidade
              </label>
              <div className="mt-1 text-gray-900">{product.unidade || "-"}</div>
            </div>
            {/* Centro de Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Centro de Custo
              </label>
              <div className="mt-1 text-gray-900">{product.centro_custo}</div>
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
                  className="mt-1 rounded-2xl"
                />
                <button
                    className="pl-2 mr-1 text-black hover:text-gray-800 transition"
                    onClick={() => handleRemove(product.id)}
                    aria-label={`Remover ${product.nome_produto}`}
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
              Nome do Funcionário
            </label>
            <Input
              type="text"
              value={nome || undefined}
              placeholder="Digite seu nome"
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 rounded-2xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observações (Opcional)
            </label>
            <Input
              type="text"
              value={observacao || undefined}
              placeholder="Digite observações"
              onChange={(e) => setObservacao(e.target.value)}
              className="mt-1 rounded-2xl"
            />
          </div>
        </div>
        {/* Botão de Enviar */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
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
