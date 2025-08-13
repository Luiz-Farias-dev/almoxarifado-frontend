import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { addEmployee, addEmployeesFile, getAllWorks } from "@/api/endpoints";
import { isValidCPF, formatCPF } from "@/utils/validateCpf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DropdownMenuRadioEmployeeType } from "./EmployeeTypeMenu";
import LoadingSpinner from "../LoadingSpinner";
import Header from "../Header";
import { utils, write } from "xlsx";

const AddEmployeePage = () => {
  const { toast } = useToast();
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    tipo_funcionario: "",
  });
  const [selectedWork, setSelectedWork] = useState<string>("");
  const [works, setWorks] = useState<any[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  // Buscar obras ao montar o componente
  useEffect(() => {
    const fetchWorks = async () => {
      setLoadingWorks(true);
      try {
        const worksData = await getAllWorks();
        setWorks(worksData);
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
        handleFailToast("Erro ao carregar obras. Tente novamente.");
      } finally {
        setLoadingWorks(false);
      }
    };
    
    fetchWorks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    setLoadingForm(true);
    e.preventDefault();
    try {
      // Se for almoxarife, incluir a obra_id
      const dataToSend = formData.tipo_funcionario === "Almoxarife"
        ? { ...formData, obra_id: selectedWork }
        : formData;
        
      await addEmployee(dataToSend);
      handleSuccessToast("Funcionário cadastrado com sucesso!");
      setFormData({
        nome: "",
        cpf: "",
        tipo_funcionario: "",
      });
      setSelectedWork(""); // Resetar a obra selecionada
    } catch (error: any) {
      if (error.response?.status === 400) {
        handleFailToast("Funcionário já cadastrado com esse CPF.");
        return;
      }
      handleFailToast("Erro ao cadastrar funcionário.");
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
      const response = await addEmployeesFile(formData);
      
      // Extrair dados da resposta
      const { sucessos, erros, cpf_duplicados, cpf_invalidos } = response;
      
      // Calcular estatísticas
      const cadastrados = sucessos;
      const jaCadastrados = cpf_duplicados;
      const cpfInvalidos = cpf_invalidos;
      const outrosErros = erros;
      
      // Mensagem personalizada
      let message = `Processamento concluído!\n`;
      message += `✅ ${cadastrados} funcionários cadastrados\n`;
      message += `⚠️ ${jaCadastrados} já estavam cadastrados\n`;
      message += `❌ ${cpfInvalidos} CPFs inválidos\n`;
      message += `❗ ${outrosErros} linhas com outros erros`;
      
      // Toast personalizado
      toast({
        variant: "success",
        title: "Upload de Funcionários",
        description: (
          <div className="whitespace-pre-line">
            {message}
          </div>
        ),
        duration: 10000, // 10 segundos
      });
      
      setFile(null);
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Tratar diferentes tipos de erro 400
        if (error.response.data?.detail) {
          handleWarningToast(error.response.data.detail);
        } else if (error.response.data?.message) {
          handleWarningToast(error.response.data.message);
        } else {
          handleWarningToast("Erro no formato do arquivo");
        }
        return;
      }
      handleFailToast("Erro ao enviar arquivo de funcionários.");
    } finally {
      setLoadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleCpfChange = (value: string) => {
    setFormData({ ...formData, cpf: value });
    if (value && !isValidCPF(value)) {
      setCpfError("CPF inválido. Verifique e tente novamente.");
    } else {
      setCpfError(null);
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

  // Função para gerar e baixar o template Excel
  const downloadTemplate = () => {
    try {
      // 1. Cria os dados do template com CPFs como strings formatadas
      const data = [
        ["COLABORADOR", "CPF", "EMPRESA"], // Cabeçalhos
        ["Fulano de Tal", "'06040005010", "Empresa A"], // Exemplo de linha 1
        ["Beltrana da Silva", "'11111111111", "Empresa B"]  // Exemplo de linha 2
      ];
      
      // 2. Cria uma planilha com os dados
      const worksheet = utils.aoa_to_sheet(data);
      
      // 3. Aplica estilos básicos aos cabeçalhos
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } } // Cor azul
      };
      
      // 4. Configura todas as células da coluna B como texto
      const range = utils.decode_range(worksheet['!ref'] || "A1:C3");
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;
          
          // Se for a coluna CPF (coluna 1), força tipo texto
          if (col === 1) {
            worksheet[cellAddress].t = 's'; // 's' para string
          }
        }
      }
      
      // 5. Percorre as colunas para aplicar o estilo aos cabeçalhos
      const columns = ["A", "B", "C"];
      columns.forEach((col) => {
        const cellRef = `${col}1`;
        if (!worksheet[cellRef]) return;
        worksheet[cellRef].s = headerStyle;
      });
      
      // 6. Ajusta a largura das colunas
      worksheet["!cols"] = [
        { wch: 30 }, // Largura para COLABORADOR
        { wch: 20 }, // Largura para CPF
        { wch: 20 }  // Largura para EMPRESA
      ];
      
      // 7. Cria um workbook e adiciona a planilha
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Funcionários");
      
      // 8. Gera o arquivo Excel em formato binário
      const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
      
      // 9. Cria um blob a partir do buffer
      const blob = new Blob([excelBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      // 10. Cria um link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "template_funcionarios.xlsx";
      document.body.appendChild(link);
      link.click();
      
      // 11. Limpeza: remove o link após o download
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Erro ao gerar o template:", error);
      handleFailToast("Erro ao gerar o template. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4">
      <Header />
      <div className="flex-1 flex items-center justify-center"> {/* Centralizado vertical e horizontalmente */}
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center"> {/* Texto centralizado */}
            Cadastrar Funcionário
          </h1>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Adicionar Funcionário Individual</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o nome"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                      CPF
                    </label>
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleCpfChange(formatCPF(e.target.value))}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informe o CPF"
                      required
                    />
                    {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="tipo_funcionario" className="block text-sm font-medium text-gray-700">
                      Tipo de Funcionário
                    </label>
                    <DropdownMenuRadioEmployeeType 
                      position={formData.tipo_funcionario} 
                      setPosition={(value: string) => setFormData({ ...formData, tipo_funcionario: value })} 
                    />
                  </div>
                  
                  {/* Campo para selecionar a obra apenas se for Almoxarife */}
                  {formData.tipo_funcionario === "Almoxarife" && (
                    <div>
                      <label htmlFor="obra_id" className="block text-sm font-medium text-gray-700">
                        Obra do Almoxarife
                      </label>
                      {loadingWorks ? (
                        <div className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl bg-gray-100">
                          <p className="text-gray-500 text-center">Carregando obras...</p>
                        </div>
                      ) : (
                        <select
                          id="obra_id"
                          name="obra_id"
                          value={selectedWork}
                          onChange={(e) => setSelectedWork(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Selecione uma obra</option>
                          {works.map(work => (
                            <option key={work.id} value={work.id}>
                              {work.initials} - {work.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className={`w-full py-2 px-4 text-white font-medium rounded-2xl shadow-sm focus:outline-none flex items-center justify-center ${
                      formData.nome && 
                      formData.cpf && 
                      formData.tipo_funcionario &&
                      (formData.tipo_funcionario !== "Almoxarife" || selectedWork)
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={
                      !formData.nome || 
                      !formData.cpf || 
                      !formData.tipo_funcionario ||
                      (formData.tipo_funcionario === "Almoxarife" && !selectedWork) ||
                      loadingForm
                    }
                    id="cadastrar-funcionario"
                  >
                    {loadingForm ? <LoadingSpinner message="Enviando..." /> : "Cadastrar Funcionário"}
                  </button>
                </form>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Adicionar Funcionários via Excel</AccordionTrigger>
              <AccordionContent>
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Adicionar Funcionários via Excel
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-4">
                        A planilha deve conter as colunas: 
                        <strong> COLABORADOR</strong>, 
                        <strong> CPF</strong> e 
                        <strong> EMPRESA</strong>.
                      </p>
                      
                      <div className="flex gap-2 mb-4">
                        <button
                          type="button"
                          onClick={downloadTemplate}
                          className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-2xl shadow-sm focus:outline-none"
                        >
                          Baixar Template
                        </button>
                      </div>
                      
                      <input
                        type="file"
                        accept=".xlsx, .xls"
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
                        <LoadingSpinner message="Enviando..." />
                      ) : (
                        "Enviar Arquivo"
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

export default AddEmployeePage;