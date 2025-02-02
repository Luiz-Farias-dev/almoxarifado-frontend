import { Dispatch, SetStateAction, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "../LoadingSpinner";
import { addProductToFinalTable } from "@/api/endpoints";
import { isValidCPF } from "@/utils/validateCpf";

type SelectedProduct = {
  id: number;
  codigo_pedido: string;
  codigo_produto: string;
  nome_produto: string;
  centro_custo: string;
  nome_funcionario_1: string;
  unidade: string | null;
  quantidade: number;
  destino: string;
};

type SelectedProductsProps = {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<SelectedProduct[]>>;
  onRemoveProduct: (id: number) => void;
  onSendProductsSuccess: (removedProducts: number[]) => void;
};

export const SelectedProducts = ({ selectedProducts, setSelectedProducts, onRemoveProduct, onSendProductsSuccess }: SelectedProductsProps) => {
  const { toast } = useToast();
  const [matricula, setMatricula] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [loadingSendProducts, setLoadingSendProducts] = useState(false);

  const handleRemove = (id: number) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
    onRemoveProduct(id);
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    if (value && !isValidCPF(value)) {
      setCpfError("CPF inválido. Verifique e tente novamente.");
    } else {
      setCpfError(null);
    }
  };

  const handleSend = async () => {
    setLoadingSendProducts(true);
    const dataToSend = {
      matricula: matricula,
      cpf: cpf,
      produtos: selectedProducts.map((product) => ({
        codigo_pedido: product.codigo_pedido,
        codigo_produto: product.codigo_produto,
        nome_produto: product.nome_produto,
        centro_custo: product.centro_custo,
        nome_funcionario_1: product.nome_funcionario_1,
        unidade: product.unidade === "" ? null : product.unidade,
        quantidade: product.quantidade,
        destino: product.destino,
      })),
    };
    try {
      const response = await addProductToFinalTable(dataToSend);
      handleSuccessToast(response);
      onSendProductsSuccess(selectedProducts.map((product) => product.id));
      setSelectedProducts([]);
      console.log("Dados enviados:", response);
    } catch (error: any) {
      console.log("Erro ao enviar dados:", error);
      if (error.response.status === 403) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.response.data.detail,
        });
      } else {
        handleFailToast();
        console.error("Erro ao enviar dados:", error);
      }
    } finally {
      setLoadingSendProducts(false);
    }
  };

  const handleSuccessToast = (response: any) => {
    toast({
      variant: "success",
      title: "Sucesso",
      description: <span>Produtos enviados com sucesso. Validado para <u>{response.employee_2_name}</u></span>,
    });
  };
  const handleFailToast = () => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Erro ao enviar produtos, tente novamente.",
    });
  };

  const isSendButtonDisabled = !(matricula && cpf && !cpfError);

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
            className="flex flex-wrap md:gap-14 gap-8 items-center mb-6 border-b pb-4"
          >
            {/* Número do pedido */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Código do Pedido
              </label>
              <div className="mt-1 text-gray-900">{product.codigo_pedido}</div>
            </div>
            {/* Código do produto */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Código do Produto
              </label>
              <div className="mt-1 text-gray-900">{product.codigo_produto}</div>
            </div>
            {/* Nome do produto */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Nome do Produto
              </label>
                <div className="mt-1 text-gray-900">{product.nome_produto}</div>
            </div>
            {/* Centro de Custo */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Centro de Custo
              </label>
              <div className="mt-1 text-gray-900">{product.centro_custo}</div>
            </div>
            {/* Quantidade */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Quantidade
              </label>
              <div className="mt-1 text-gray-900">{product.quantidade}</div>
            </div>
            {/* Unidade */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Unidade
              </label>
              <div className="mt-1 text-gray-900">{product.unidade ? product.unidade : "Nenhuma"}</div>
            </div>
            {/* Nome do funcionário */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Nome do Funcionário
              </label>
              <div className="mt-1 text-gray-900">{product.nome_funcionario_1}</div>
            </div>
            {/* Destino */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-gray-700">
                Destino
              </label>
              <div className="flex flex-row items-center">
                <div className="mt-1 text-gray-900">{product.destino}</div>
                <button
                  className="pl-2 mr-1 text-black hover:text-gray-800 transition"
                  onClick={() => handleRemove(product.id)}
                  aria-label={`Remover ${product.nome_produto}`}
                >
                  <X size={20} className="mt-2 ml-3" />
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
              Matrícula do funcionário que dará baixa
            </label>
            <Input
              type="text"
              value={matricula}
              placeholder="Digite a matrícula"
              onChange={(e) => setMatricula(e.target.value)}
              className="mt-1 rounded-2xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CPF
            </label>
            <Input
              type="password"
              value={cpf}
              placeholder="Digite o CPF"
              onChange={(e) => handleCpfChange(e.target.value)}
              className="mt-1 rounded-2xl border-gray-300"
            />
            {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
          </div>
        </div>
        {/* Botão de Enviar */}
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
  );
};
