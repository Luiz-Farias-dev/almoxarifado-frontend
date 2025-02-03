import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addDays, format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import Header from "../Header";
import { generateReport } from "@/api/endpoints";

const GenerateReportPage = () => {
  const { toast } = useToast();
  const [dataChegada, setDataChegada] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });
  const [dataSaida, setDataSaida] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });

  const handleGenerateReport = async (reportType: string) => {
    try {
      let dateFrom, dateTo;

      if (reportType === "produtos_chegada") {
        dateFrom = dataChegada?.from;
        dateTo = dataChegada?.to || dateFrom;
      } else if (reportType === "produtos_saida") {
        dateFrom = dataSaida?.from;
        dateTo = dataSaida?.to || dateFrom;
      }
  
      const formattedFrom = format(dateFrom!, "yyyy-MM-dd");
      const formattedTo = format(dateTo!, "yyyy-MM-dd");
      
      const response = await generateReport(formattedFrom, formattedTo, reportType);
      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${formattedFrom}_a_${formattedTo}.xlsx`;
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

  const isDateDisabled = (day: Date) => {
    return isAfter(day, new Date()); // Desabilita dias após hoje
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
      description: "Não há produtos para gerar relatório nas datas selecionadas.",
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
                <div className="mb-2 text-sm text-gray-600 font-medium">Selecione um data ou um período para gerar o relatório</div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dataChegada?.from}
                  selected={dataChegada}
                  onSelect={setDataChegada}
                  disabled={isDateDisabled}
                />
                <button
                  onClick={() => handleGenerateReport("produtos_chegada")}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
                >
                  {dataChegada?.from ? (
                    dataChegada.to ? (
                      <>
                        Gerar relatório dos dias{" "}
                        {format(dataChegada.from, "dd/MM/yyyy", {locale: ptBR})} a{" "}
                        {format(dataChegada.to, "dd/MM/yyyy", {locale: ptBR})}
                      </>
                    ) : (
                      <>
                        Gerar relatório do dia{" "}
                        {format(dataChegada.from, "dd/MM/yyyy", {locale: ptBR})}
                      </>
                    )
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Relatório Planilha de Saída</AccordionTrigger>
              <AccordionContent>
                <div className="mb-2 text-sm text-gray-600 font-medium">Selecione um data ou um período para gerar o relatório</div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dataSaida?.from}
                  selected={dataSaida}
                  onSelect={setDataSaida}
                  disabled={isDateDisabled}
                />
                <button
                  onClick={() => handleGenerateReport("produtos_saida")}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-2xl shadow hover:bg-purple-700 transition-colors"
                >
                  {dataSaida?.from ? (
                    dataSaida.to ? (
                      <>
                        Gerar relatório dos dias{" "}
                        {format(dataSaida.from, "dd/MM/yyyy", {locale: ptBR})} a{" "}
                        {format(dataSaida.to, "dd/MM/yyyy", {locale: ptBR})}
                      </>
                    ) : (
                      <>
                        Gerar relatório do dia{" "}
                        {format(dataSaida.from, "dd/MM/yyyy", {locale: ptBR})}
                      </>
                    )
                  ) : (
                    <span>Selecione uma data</span>
                  )}
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
