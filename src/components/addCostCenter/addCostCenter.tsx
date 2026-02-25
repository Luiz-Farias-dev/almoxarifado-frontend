import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addCostCenter, addWork, getAllWorks } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import Header from "../Header";

const AddCostCenter = () => {
  const { toast } = useToast();

  // Estado para o formulário de Centro de Custo (nomes iguais aos do backend)
  const [costCenterForm, setCostCenterForm] = useState({
    Centro_Negocio_Cod: "",
    Centro_Nome: "",
    work_id: ""
  });

  // Estado para o formulário de Obra
  const [workForm, setWorkForm] = useState({
    name: ""
  });

  // Lista de obras
  const [works, setWorks] = useState<any[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(true);

  const [loadingCostCenter, setLoadingCostCenter] = useState(false);
  const [loadingWork, setLoadingWork] = useState(false);

  // Carregar obras ao montar o componente
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoadingWorks(true);
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

  const handleCostCenterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCostCenterForm({ ...costCenterForm, [name]: value });
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkForm({ name: e.target.value });
  };

  const handleCostCenterSubmit = async (e: React.FormEvent) => {
    setLoadingCostCenter(true);
    e.preventDefault();

    try {
      // Converte work_id para número (caso o backend espere número)
      const workIdNumber = Number(costCenterForm.work_id);

      await addCostCenter({
        Centro_Negocio_Cod: costCenterForm.Centro_Negocio_Cod,
        Centro_Nome: costCenterForm.Centro_Nome,
        work_id: workIdNumber
      });

      handleSuccessToast("Centro de custo cadastrado com sucesso!");
      setCostCenterForm({ Centro_Negocio_Cod: "", Centro_Nome: "", work_id: "" });
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        handleWarningToast("Centro de custo já cadastrado.");
        return;
      }
      handleFailToast("Erro ao cadastrar centro de custo.");
    } finally {
      setLoadingCostCenter(false);
    }
  };

  const handleWorkSubmit = async (e: React.FormEvent) => {
    setLoadingWork(true);
    e.preventDefault();

    // Validar tamanho do nome
    if (workForm.name.length < 3 || workForm.name.length > 10) {
      handleWarningToast("O nome deve ter entre 3 e 10 caracteres");
      setLoadingWork(false);
      return;
    }

    try {
      const response = await addWork({
        name: workForm.name
      });

      handleSuccessToast("Obra cadastrada com sucesso!");

      // Atualizar a lista de obras com a nova obra cadastrada
      setWorks([...works, response]);
      setWorkForm({ name: "" });
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        handleWarningToast("Obra já cadastrada.");
        return;
      }
      handleFailToast("Erro ao cadastrar obra.");
    } finally {
      setLoadingWork(false);
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
      <div className="flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Cadastro de Centros de Custo e Obras
          </h1>

          <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
            {/* Accordion para Cadastrar Centro de Custo */}
            <AccordionItem value="item-1" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <span className="text-lg font-medium text-gray-800">Cadastrar Centro de Custo</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <form onSubmit={handleCostCenterSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="Centro_Negocio_Cod" className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Centro de Custo
                    </label>
                    <input
                      type="text"
                      id="Centro_Negocio_Cod"
                      name="Centro_Negocio_Cod"
                      value={costCenterForm.Centro_Negocio_Cod}
                      onChange={handleCostCenterChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: CTZ.00.0000"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="Centro_Nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Centro de Custo
                    </label>
                    <input
                      type="text"
                      id="Centro_Nome"
                      name="Centro_Nome"
                      value={costCenterForm.Centro_Nome}
                      onChange={handleCostCenterChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Solar RMT"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="work_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Escolher Obra
                    </label>
                    {loadingWorks ? (
                      <div className="w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-gray-500 text-center">Carregando obras...</p>
                      </div>
                    ) : (
                      <select
                        id="work_id"
                        name="work_id"
                        value={costCenterForm.work_id}
                        onChange={handleCostCenterChange}
                        className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      >
                        <option value="">Selecione uma obra</option>
                        {works.map(work => (
                          <option key={work.id} value={work.id}>
                            {work.initials ? `${work.initials} - ${work.name}` : work.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-sm focus:outline-none flex items-center justify-center ${
                      costCenterForm.Centro_Negocio_Cod && costCenterForm.Centro_Nome && costCenterForm.work_id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-colors duration-200`}
                    disabled={!costCenterForm.Centro_Negocio_Cod || !costCenterForm.Centro_Nome || !costCenterForm.work_id || loadingCostCenter}
                  >
                    {loadingCostCenter ? (
                      <LoadingSpinner message="Cadastrando..." />
                    ) : (
                      "Cadastrar Centro de Custo"
                    )}
                  </button>
                </form>
              </AccordionContent>
            </AccordionItem>

            {/* Accordion para Cadastrar Obra */}
            <AccordionItem value="item-2" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 hover:no-underline">
                <span className="text-lg font-medium text-gray-800">Cadastrar Obra</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <form onSubmit={handleWorkSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="work_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Obra
                    </label>
                    <input
                      type="text"
                      id="work_name"
                      name="name"
                      value={workForm.name}
                      onChange={handleWorkChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: OBRA4"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      O nome deve ter de 3 a 10 caracteres
                    </p>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-sm focus:outline-none flex items-center justify-center ${
                      workForm.name && workForm.name.length >= 3 && workForm.name.length <= 10
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-colors duration-200`}
                    disabled={!workForm.name || workForm.name.length < 3 || workForm.name.length > 10 || loadingWork}
                  >
                    {loadingWork ? (
                      <LoadingSpinner message="Cadastrando..." />
                    ) : (
                      "Cadastrar Obra"
                    )}
                  </button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Informações importantes</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O código do centro de custo deve ser único</li>
              <li>• O nome da obra deve ter entre 3 e 10 caracteres</li>
              <li>• Após cadastrar uma obra, ela estará disponível na opção "Selecione uma obra" na aba "Cadastrar Centro de Custo"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCostCenter;