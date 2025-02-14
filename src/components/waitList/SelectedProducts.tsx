import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import jsQR from "jsqr";
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
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    } catch (error: any) {
      if (error.response.status === 403) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.response.data.detail,
        });
      } else {
        handleFailToast();
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

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

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
            handleCpfChange(code.data);
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
      .catch((error) => {
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

  return (
    <div className="mt-4 border-t p-4">
      <h2 className="font-semibold text-lg mb-1 text-center sm:text-left">
        Produtos Selecionados
      </h2>
      <p className="text-sm text-gray-500 mb-2">
        Obs: Caso queira validar por meio do QR Code e o ícone de câmera não esteja aparecendo, recarregue a página.
      </p>
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
              <div className="mt-1 text-gray-900">{product.unidade ? product.unidade : "-"}</div>
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

      {/* Campos de Matrícula e Cpf */}
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
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              CPF
            </label>
            <div className="relative">
              <Input
                type="password"
                value={cpf}
                placeholder="Digite o CPF ou escaneie o QR Code"
                onChange={(e) => handleCpfChange(e.target.value)}
                className="mt-1 rounded-2xl border-gray-300 pr-10"
              />
              <button
                type="button"
                onClick={handleOpenScanner}
                className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <Camera className="h-5 w-5 text-gray-500" />
              </button>
            </div>
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
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <video 
              ref={videoRef}
              className="w-full rounded-lg"
              playsInline
            />
            <p className="text-center text-gray-600 text-sm mt-2">
              Escaneie o QR Code do CPF, assim que o código for lido a câmera será fechada.
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
};