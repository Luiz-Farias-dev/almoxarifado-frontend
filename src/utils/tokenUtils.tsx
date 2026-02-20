import { jwtDecode } from "jwt-decode";

export interface UserToken {
  id: number;
  nome: string;
  tipo: string;
  obra_id: number | null;
}

export function getUserInfoFromToken(): UserToken | null {
  const tokenKeys = ['token', 'accessToken', 'authToken'];
  let token = null;
  
  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      token = value;
      break;
    }
  }

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    const userId = decoded.id ?? decoded.userId ?? 0;
    const userType = decoded.tipoFuncionario ?? decoded.tipo ?? decoded.role ?? decoded.type ?? "";
    const userName = decoded.nome ?? decoded.sub ?? decoded.name ?? decoded.username ?? decoded.cpf ?? "Usuário";
    const obraId = decoded.obra_id ?? decoded.obraId ?? null;

    return {
      id: userId,
      nome: userName,
      tipo: userType,
      obra_id: obraId,
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

export function getNameFromToken(): string | null {
  const user = getUserInfoFromToken();
  return user ? user.nome : null;
}

export function getTypeFromToken(): string | null {
  const user = getUserInfoFromToken();
  return user ? user.tipo : null;
}

export function getUserTypeDisplayName(): string {
  const tipo = getTypeFromToken();
  switch (tipo) {
    case "Administrador":
      return "Administrador";
    case "Almoxarife":
      return "Almoxarife";
    default:
      return "Usuário";
  }
}