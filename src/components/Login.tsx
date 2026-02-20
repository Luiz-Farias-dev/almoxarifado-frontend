import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidCPF, formatCPF } from "@/utils/validateCpf";
import { login } from "@/api/endpoints";
import LoadingSpinner from "./LoadingSpinner";
import Logo from "@/assets/logo.png";

function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSenhaError, setLoginSenhaError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await login(formatCPF(cpf), senha);
      const token = response.data.token;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", token);
      navigate("/");
    } catch (error: any) {
      setLoginError(null);
      setLoginSenhaError(null);
      const msg = error.response?.data?.error ?? error.response?.data?.detail ?? "";
      if (error.response?.status === 403) {
        setLoginError(msg || "Apenas administradores podem acessar o sistema.");
      } else if (error.response?.status === 401) {
        setLoginSenhaError(msg || "Senha incorreta.");
      } else {
        setLoginError(msg || "Erro ao validar CPF.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    if (value && !isValidCPF(value)) {
      setLoginError("CPF inválido. Verifique e tente novamente.");
    } else {
      setLoginError(null);
    }
  };

  const handleSenhaChange = (value: string) => {
    setSenha(value);
    if (!value) {
      setLoginSenhaError("Campo senha é obrigatório.");
    } else {
      setLoginSenhaError(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
        {/* Área da Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src={Logo} 
            alt="Logo da Empresa" 
            className="h-[135px] w-auto" // Ajuste o tamanho conforme necessário
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-700">
          Bem-vindo!
        </h1>
        <p className="text-center text-gray-500">Por favor, faça login para continuar</p>
        
        <div className="mt-6">
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
        
        <div className="mt-6">
          <label htmlFor="senha" className="mt-3 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            autoComplete="one-time-code"
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => handleSenhaChange(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          {loginSenhaError && <p className="text-red-500 text-sm mt-1">{loginSenhaError}</p>}
        </div>
        
        <button
          onClick={handleLogin}
          type="button"
          className={`w-full mt-4 px-4 py-2 text-white focus:outline-none rounded-2xl focus:ring-2 focus:ring-offset-2 ${
            isValidCPF(cpf) && senha
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isValidCPF(cpf) || !senha || loading}
            >
            {loading ? <LoadingSpinner message="Carregando" /> : "Entrar"}
          </button>
      </div>
    </div>
  );
}

export default LoginPage;