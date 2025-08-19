import { useEffect, useState } from "react";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNameFromToken, getTypeFromToken } from "@/utils/tokenUtils";

const Header = (header: { title?: string }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    // Adicione um log para debug
    console.log("Token no localStorage:", localStorage.getItem("token"));
    
    const name = getNameFromToken();
    const type = getTypeFromToken();
    
    console.log("Nome do token:", name);
    console.log("Tipo do token:", type);
    
    setUserName(name);
    setUserType(type);

    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Bom dia");
    } else if (currentHour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  const handleLogout = () => {
    // Remove todos os possíveis tokens
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center pt-2 pr-3">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-800 transition relative group"  
      >
        <Home size={24} />
        <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-gray-700 bg-white px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
          Voltar para a página inicial
        </span>
      </button>
      <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">{header.title}</h1>
      <div className="flex items-center gap-4">
        {userName ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {greeting}, <strong>{userName.split(" ")[0]}</strong>
              </div>
              {userType && (
                <div className="text-xs text-blue-600 font-medium">
                  {userType === "Administrador" ? "Administrador" : 
                   userType === "Almoxarife" ? "Almoxarife" : "Usuário"}
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Carregando...</div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 px-3 py-1.5 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          Sair
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;