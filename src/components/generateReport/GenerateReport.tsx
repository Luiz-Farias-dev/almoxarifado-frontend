import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast"
import Header from "../Header";
import { generateReport } from "@/api/endpoints";

const GenerateReportPage = () => {
  const { toast } = useToast();
  const handleGenerateReport = async (reportType: string) => {
    try {
      const date = new Date().toLocaleDateString("pt-BR").split("/").reverse().join("-");
      const response = await generateReport(date, reportType);

      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      handleSuccessToast();
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        handleWarningToast();
        return;
      }
      handleFailToast();
    }
  };

  const handleSuccessToast = () => {
    toast({
      variant: "success",
      title: "Sucesso",
      description: "Relatório gerado com sucesso",
    });
  };
  const handleWarningToast = () => {
    toast({
      variant: "warning",
      title: "Aviso",
      description: "Não há produtos para gerar relatório de hoje.",
    });
  };
  const handleFailToast = () => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Erro ao Gerar Relatório, tente novamente.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 self-center">
            Gerar Relatório
          </h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Relatório Planilha de Chegada</AccordionTrigger>
              <AccordionContent>
                <button
                  onClick={() => handleGenerateReport("produtos_chegada")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
                >
                  Gerar Relatório de Hoje
                </button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Relatório Planilha de Saída</AccordionTrigger>
              <AccordionContent>
                <button
                  onClick={() => handleGenerateReport("produtos_saida")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-2xl shadow hover:bg-purple-700 transition-colors"
                >
                  Gerar Relatório de Hoje
                </button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportPage;
