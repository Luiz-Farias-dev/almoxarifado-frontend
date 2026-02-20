import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addProduct, addProductsFile } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import Header from "../Header";

const AddProductPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    Insumo_Cod: "",
    SubInsumo_Cod: "",
    SubInsumo_Especificacao: "",
    Unid_Cod: "",
    INSUMO_ITEMOBSOLETO: "N"
  });
  const [file, setFile] = useState<File | null>(null);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    setLoadingForm(true);
    e.preventDefault();
    try {
      await addProduct({
        SubInsumo_Especificacao: formData.SubInsumo_Especificacao,
        Insumo_Cod: formData.Insumo_Cod,
        SubInsumo_Cod: formData.SubInsumo_Cod,
        Unid_Cod: formData.Unid_Cod,
        INSUMO_ITEMOBSOLETO: formData.INSUMO_ITEMOBSOLETO
      });
      handleSuccessToast("Produto adicionado com sucesso!");
      setFormData({
        SubInsumo_Especificacao: "",
        Insumo_Cod: "",
        SubInsumo_Cod:"",
        Unid_Cod: "",
        INSUMO_ITEMOBSOLETO:"N"
      });
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        handleWarningToast("Produto já cadastrado.");
        return;
      }
      handleFailToast("Erro ao adicionar produto.");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    setLoadingFile(true);
    e.preventDefault();
    if (!file) {
      handleFailToast("Selecione um arquivo para enviar.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await addProductsFile(formData);
      handleSuccessToast("Arquivo enviado com sucesso!");
      setFile(null);
    } catch (error: any) {
      if (error.response?.status === 400) {
        const raw = error.response.data?.error ?? error.response.data?.detail ?? "Erro no envio.";
        const errorDetail = typeof raw === "string" ? raw : JSON.stringify(raw);
        if (errorDetail.includes("Colunas obrigatórias faltando")) {
          handleWarningToast(errorDetail);
          return;
        }
        if (errorDetail.includes("Apenas arquivos Excel")) {
          handleWarningToast(errorDetail);
          return;
        }
        if (errorDetail.includes("O arquivo está vazio")) {
          handleWarningToast(errorDetail);
          return;
        }
        if (errorDetail.includes("É necessário ter either")) {
          handleWarningToast("Formato de colunas incorreto. Verifique as instruções acima.");
          return;
        }
        
        // Mensagem genérica para outros erros 400
        handleWarningToast(errorDetail || "Erro no formato do arquivo.");
        return;
      }
      handleFailToast("Erro ao enviar arquivo de produtos.");
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSuccessToast = (message: string) => {
    toast({
      variant: "success",
      title: "Sucesso",
      description: message,
    });
  };
  const handleWarningToast = (message: string) => {
    toast({
      variant: "warning",
      title: "Aviso",
      description: message,
    });
  };
  const handleFailToast = (message: string) => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: message,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 self-center">
            Adicionar Produtos ao Catálogo do Almoxarifado
          </h1>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Adicionar Produto Individual</AccordionTrigger>
              <AccordionContent>
                {/* Formulário para adicionar produto individualmente */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="Insumo_Cod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Código do Insumo
                    </label>
                    <input
                      type="text"
                      id="Insumo_Cod"
                      name="Insumo_Cod"
                      value={formData.Insumo_Cod}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o código do insumo"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="SubInsumo_Cod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Código do SubInsumo
                    </label>
                    <input
                      type="text"
                      id="SubInsumo_Cod"
                      name="SubInsumo_Cod"
                      value={formData.SubInsumo_Cod}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o código do subinsumo"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="Unid_Cod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Unidade de Medida
                    </label>
                    <input
                      type="text"
                      id="Unid_Cod"
                      name="Unid_Cod"
                      value={formData.Unid_Cod}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe a unidade de medida"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="SubInsumo_Especificacao"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Especificação do Insumo/Subinsumo
                    </label>
                    <input
                      type="text"
                      id="SubInsumo_Especificacao"
                      name="SubInsumo_Especificacao"
                      value={formData.SubInsumo_Especificacao}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe a especificação do subinsumo"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2 px-4 text-white font-medium rounded-2xl shadow-sm focus:outline-none flex items-center justify-center ${
                      formData.SubInsumo_Especificacao &&
                      formData.Insumo_Cod &&
                      formData.SubInsumo_Cod &&
                      formData.Unid_Cod
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={
                      !formData.SubInsumo_Especificacao ||
                      !formData.Insumo_Cod ||
                      !formData.SubInsumo_Cod ||
                      !formData.Unid_Cod ||
                      loadingForm
                    }
                  >
                    {loadingForm ? (
                      <>
                        <LoadingSpinner message="Enviando..." />
                      </>
                    ) : (
                      "Adicionar Produto"
                    )}
                  </button>
                </form>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Adicionar Produtos via Planilha</AccordionTrigger>
              <AccordionContent>
                {/* Formulário para upload de arquivo */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">
                    Adicionar Produtos via Planilha
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-4">
                        A planilha (Excel ou CSV) deve conter:
                        <br />
                        <strong>Opção 1 (Recomendado):</strong> 
                        "Insumo_Codigo" (código completo), "Insumo_Especificacao", "Unid_Cod", "Insumo_ItemObsoleto"
                        <br />
                        <strong>Opção 2 (Legado):</strong> 
                        "Insumo_Cod", "SubInsumo_Cod", "SubInsumo_Especificacao", "Unid_Cod", "INSUMO_ITEMOBSOLETO"
                        <br />
                        O sistema fará automaticamente:
                        <br />
                        - Separação dos últimos 3 dígitos do Insumo_Codigo como SubInsumo_Cod
                        <br />
                        - Conversão de Insumo_Especificacao para SubInsumo_Especificacao
                        <br />
                        - Conversão de Insumo_ItemObsoleto para INSUMO_ITEMOBSOLETO
                      </p>
                      <input
                        type="file"
                        accept=".xlsx, .csv"
                        onChange={handleFileChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleFileSubmit}
                      className={`w-full py-2 px-4 text-white font-medium rounded-2xl shadow-sm focus:outline-none flex items-center justify-center ${
                        file
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!file || loadingFile}
                    >
                      {loadingFile ? (
                        <>
                          <LoadingSpinner message="Enviando..." />
                        </>
                      ) : (
                        "Upload de Arquivo"
                      )}
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;