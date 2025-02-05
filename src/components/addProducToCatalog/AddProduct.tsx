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
    codigo_produto: "",
    nome_produto: "",
    unidade: "",
    centro_custo: "",
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
        nome_produto: formData.nome_produto,
        codigo_produto: formData.codigo_produto,
        unidade: formData.unidade,
        centro_custo: formData.centro_custo,
      });
      handleSuccessToast("Produto adicionado com sucesso!");
      setFormData({
        nome_produto: "",
        codigo_produto: "",
        unidade: "",
        centro_custo: "",
      });
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        handleWarningToast("Produto já cadastrado.");
        return;
      }
      console.log("Erro ao adicionar produto:", error);
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
      console.error("Erro ao enviar arquivo de produtos:", error);
      if (error.response.status === 400 && error.response.data.detail === "A planilha deve conter as colunas: Código Produto/Material, Nome Produto/Especificação, Unidade e Centro de Custo") {
        handleWarningToast("A planilha deve conter as colunas: 'Código Produto ou Material', 'Nome Produto ou Especificação', 'Unidade' e 'Centro de Custo'");
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
                      htmlFor="nome_produto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      id="nome_produto"
                      name="nome_produto"
                      value={formData.nome_produto}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o nome do produto"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="codigo_produto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Código do Produto
                    </label>
                    <input
                      type="text"
                      id="codigo_produto"
                      name="codigo_produto"
                      value={formData.codigo_produto}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o código do produto"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="unidade"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Unidade de Medida (Opcional)
                    </label>
                    <input
                      type="text"
                      id="unidade"
                      name="unidade"
                      value={formData.unidade}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe a unidade de medida"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="centro_custo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Centro de Custo
                    </label>
                    <input
                      type="text"
                      id="centro_custo"
                      name="centro_custo"
                      value={formData.centro_custo}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o centro de custo"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2 px-4 text-white font-medium rounded-2xl shadow-sm focus:outline-none flex items-center justify-center ${
                      formData.nome_produto &&
                      formData.codigo_produto &&
                      formData.centro_custo
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={
                      !formData.nome_produto ||
                      !formData.codigo_produto ||
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
              <AccordionTrigger>Adicionar Produtos via Excel</AccordionTrigger>
              <AccordionContent>
                {/* Formulário para upload de arquivo Excel */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">
                    Adicionar Produtos via Excel
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-4">
                        A planilha deve conter, pelo menos, quatro colunas
                        seguindo o formato de nome "Código Produto ou Material",
                        "Nome Produto ou Especificação", "Unidade" e "Centro de
                        Custo".
                      </p>
                      <input
                        type="file"
                        accept=".xlsx"
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
