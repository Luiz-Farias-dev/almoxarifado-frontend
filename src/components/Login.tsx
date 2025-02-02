import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidCPF, formatCPF } from "@/utils/validateCpf";
import { login } from "@/api/endpoints";
import LoadingSpinner from "./LoadingSpinner";

function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await login(formatCPF(cpf));
      console.log(response);
      const { access_token, refresh_token } = response.data;
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      navigate("/almoxarifado/");
    } catch (error: any) {
      setCpfError(error.response?.data?.detail || "Erro ao validar CPF.");
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    if (value && !isValidCPF(value)) {
      setCpfError("CPF inválido. Verifique e tente novamente.");
    } else {
      setCpfError(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-700">
          Bem-vindo!
        </h1>
        <p className="text-center text-gray-500">Por favor, faça login para continuar</p>
        <div className="mt-6">
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
            {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
        </div>
        <button
          onClick={handleLogin}
          className={`w-full mt-4 px-4 py-2 text-white focus:outline-none rounded-2xl focus:ring-2 focus:ring-offset-2 ${
            isValidCPF(cpf)
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? <LoadingSpinner message="Carregando" /> : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
