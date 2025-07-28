import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addEmployee } from "@/api/endpoints";
import { isValidCPF, formatCPF } from "@/utils/validateCpf";
import { DropdownMenuRadioEmployeeType } from "./EmployeeTypeMenu";
import LoadingSpinner from "../LoadingSpinner";
import Header from "../Header";

const AddEmployeePage = () => {
  const { toast } = useToast();
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    cpf: "",
    tipo_funcionario: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      await addEmployee(formData);
      handleSuccessToast("Funcionário cadastrado com sucesso!");
      setFormData({
        nome: "",
        matricula: "",
        cpf: "",
        tipo_funcionario: "",
      });
    } catch (error: any) {
      if (error.response.status === 400) {
        handleFailToast("Funcionário já cadastrado com esse CPF.");
        return;
      }
      handleFailToast("Erro ao cadastrar funcionário.");
    } finally {
      setLoading(false);
    }
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
            Cadastrar Funcionário
          </h1>
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
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
                Matrícula (Opcional)
              </label>
              <input
                type="text"
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Informe a matrícula"
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
              <div id="id_teste">
                <DropdownMenuRadioEmployeeType 
                position={formData.tipo_funcionario} 
                setPosition={(value: string) => setFormData({ ...formData, tipo_funcionario: value })} 
              />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 px-4 text-white font-medium rounded-2xl shadow-sm focus:outline-none flex items-center justify-center ${
                formData.nome && formData.cpf && formData.tipo_funcionario
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={
                !formData.nome || !formData.cpf || !formData.tipo_funcionario || loading
              }
            >
              {loading ? <LoadingSpinner message="Enviando..." /> : "Cadastrar Funcionário"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;
