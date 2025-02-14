import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidCPF, formatCPF } from "@/utils/validateCpf";
import { login } from "@/api/endpoints";
import LoadingSpinner from "./LoadingSpinner";

function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [matricula, setMatricula] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await login(matricula, formatCPF(cpf));
      const { access_token, refresh_token } = response.data;
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      navigate("/");
    } catch (error: any) {
      if (error.response?.status === 403) {
        setLoginError(error.response?.data?.detail || "Apenas administradores podem acessar o sistema.");
        return
      };
      setLoginError(error.response?.data?.detail || "Erro ao validar matrícula e CPF.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatriculaChange = (value: string) => {
    setMatricula(value);
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    if (value && !isValidCPF(value)) {
      setLoginError("CPF inválido. Verifique e tente novamente.");
    } else {
      setLoginError(null);
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
          <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
            Matrícula
          </label>
          <input
            autoComplete="one-time-code"
            type="text"
            id="matricula"
            placeholder="Digite sua matrícula"
            value={matricula}
            onChange={(e) => handleMatriculaChange(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          <label htmlFor="cpf" className="mt-3 block text-sm font-medium text-gray-700">
            CPF
          </label>
          <input
            autoComplete="one-time-code"
            type="text"
            id="cpf"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
            {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
        </div>
        <button
          onClick={handleLogin}
          className={`w-full mt-4 px-4 py-2 text-white focus:outline-none rounded-2xl focus:ring-2 focus:ring-offset-2 ${
            isValidCPF(cpf) && matricula
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isValidCPF(cpf) || !matricula || loading}
        >
          {loading ? <LoadingSpinner message="Carregando" /> : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
