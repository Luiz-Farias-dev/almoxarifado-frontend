import { useEffect, useState } from "react";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNameFromToken } from "@/utils/tokenUtils";

const Header = (header: { title?: string }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const name = getNameFromToken();
    setUserName(name);

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
      <div className="flex flex-col items-end">
        {userName && (
          <span className="text-sm text-gray-600">
            {greeting}, <strong>{userName.split(" ")[0]}</strong>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-2 text-red-600 px-3 py-1.5 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          Sair
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
