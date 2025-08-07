import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { addCostCenter, addWork } from "@/api/endpoints";
import LoadingSpinner from "../LoadingSpinner";
import Header from "../Header";

const AddCostCenter = () => {
  const { toast } = useToast();
  
  // Estado para o formulário de Centro de Custo
  const [costCenterForm, setCostCenterForm] = useState({
    code: "",
    name: "",
    workId: ""
  });
  
  // Estado para o formulário de Obra
  const [workForm, setWorkForm] = useState({
    initials: ""
  });
  
  // Lista de obras (simulada - na prática viria da API)
  const [works, setWorks] = useState([
    { id: "1", initials: "OBRA1", name: "Obra Alpha" },
    { id: "2", initials: "OBRA2", name: "Obra Beta" },
    { id: "3", initials: "OBRA3", name: "Obra Gamma" },
  ]);
  
  const [loadingCostCenter, setLoadingCostCenter] = useState(false);
  const [loadingWork, setLoadingWork] = useState(false);

  const handleCostCenterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCostCenterForm({ ...costCenterForm, [name]: value });
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkForm({ initials: e.target.value });
  };

  const handleCostCenterSubmit = async (e: React.FormEvent) => {
    setLoadingCostCenter(true);
    e.preventDefault();
    
    try {
      await addCostCenter({
        code: costCenterForm.code,
        name: costCenterForm.name,
        workId: costCenterForm.workId
      });
      
      handleSuccessToast("Centro de custo cadastrado com sucesso!");
      setCostCenterForm({ code: "", name: "", workId: "" });
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
    
    try {
      await addWork({
        initials: workForm.initials
      });
      
      handleSuccessToast("Obra cadastrada com sucesso!");
      // Atualizar a lista de obras com a nova obra cadastrada
      const newWork = { 
        id: (works.length + 1).toString(), 
        initials: workForm.initials,
        name: `Obra ${workForm.initials}`
      };
      setWorks([...works, newWork]);
      setWorkForm({ initials: "" });
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
            Administração de Centros de Custo e Obras
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
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Centro de Custo
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={costCenterForm.code}
                      onChange={handleCostCenterChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: CC001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Centro de Custo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={costCenterForm.name}
                      onChange={handleCostCenterChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Centro de Custo Administrativo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="workId" className="block text-sm font-medium text-gray-700 mb-1">
                      Escolher Obra
                    </label>
                    <select
                      id="workId"
                      name="workId"
                      value={costCenterForm.workId}
                      onChange={handleCostCenterChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    >
                      <option value="">Selecione uma obra</option>
                      {works.map(work => (
                        <option key={work.id} value={work.id}>
                          {work.initials} - {work.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-sm focus:outline-none flex items-center justify-center ${
                      costCenterForm.code && costCenterForm.name && costCenterForm.workId
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-colors duration-200`}
                    disabled={!costCenterForm.code || !costCenterForm.name || !costCenterForm.workId || loadingCostCenter}
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
                    <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-1">
                      Sigla da Obra
                    </label>
                    <input
                      type="text"
                      id="initials"
                      name="initials"
                      value={workForm.initials}
                      onChange={handleWorkChange}
                      className="w-full p-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: OBRA4"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Utilize uma sigla única para identificar a obra
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-sm focus:outline-none flex items-center justify-center ${
                      workForm.initials
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } transition-colors duration-200`}
                    disabled={!workForm.initials || loadingWork}
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
              <li>• Cada obra pode ter múltiplos centros de custo associados</li>
              <li>• A sigla da obra deve ter entre 3 e 10 caracteres</li>
              <li>• Após cadastrar uma obra, ela estará disponível no dropdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCostCenter;