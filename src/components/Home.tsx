import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CircleUserRound , PackagePlus, Box, List, FileText } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-700">Bem-vindo à Página Inicial do Almoxarifado!</h1>
          <p className="text-center text-gray-500 mb-6">Escolha uma opção para continuar:</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("cadastrar-funcionario")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-gray-500 hover:bg-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transform transition-transform duration-200 hover:scale-105"
            >
              <CircleUserRound className="w-5 h-5" />
              Cadastrar Funcionário
            </button>
            <button
              onClick={() => navigate("adicionar-produto")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-blue-500 hover:bg-blue-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transform transition-transform duration-200 hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              Adicionar Produtos ao Catálogo
            </button>

            <button
              onClick={() => navigate("chegada-produtos")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-blue-800 hover:bg-blue-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform transition-transform duration-200 hover:scale-105"
            >
              <PackagePlus className="w-5 h-5" />
              Adicionar Produtos a Lista de chegada
            </button>

            <button
              onClick={() => navigate("catalogo")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-green-500 hover:bg-green-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transform transition-transform duration-200 hover:scale-105"
            >
              <Box className="w-5 h-5" />
              Catálogo de Produtos
            </button>

            <button
              onClick={() => navigate("lista-espera")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transform transition-transform duration-200 hover:scale-105"
            >
              <List className="w-5 h-5" />
              Lista de Espera
            </button>

            <button
              onClick={() => navigate("gerar-relatorio")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white bg-purple-500 hover:bg-purple-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transform transition-transform duration-200 hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
