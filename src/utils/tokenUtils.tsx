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
      console.log(`Token encontrado na chave: ${key}`);
      break;
    }
  }
  
  if (!token) {
    console.log("Nenhum token encontrado no localStorage");
    return null;
  }
  
  try {
    const decoded: any = jwtDecode(token);
    console.log("Token decodificado:", decoded);
    
    // Tenta obter o nome de várias possibilidades
    const userName = decoded.sub || decoded.name || decoded.username || '';
    // Tenta obter o tipo de várias possibilidades
    const userType = decoded.tipo || decoded.role || decoded.type || '';
    const userId = decoded.id || decoded.userId || 0;
    const obraId = decoded.obra_id || decoded.obraId || null;

    if (!userName) {
      console.error("Token não contém campo de nome (sub, name, username)");
      return null;
    }

    return {
      id: userId,
      nome: userName,
      tipo: userType,
      obra_id: obraId
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