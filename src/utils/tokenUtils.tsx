// src/utils/tokenUtils.ts
import {jwtDecode} from "jwt-decode";

export interface UserToken {
  id: number;
  nome: string;
  tipo: string;
  obra_id: number | null;
}

export function getUserInfoFromToken(): UserToken | null {
  // Tenta diferentes chaves possíveis para o token
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
    
    // Verifica se os campos necessários existem
    if (!decoded.sub || !decoded.tipo) {
      console.error("Token não contém os campos necessários (sub ou tipo)");
      return null;
    }
    
    return {
      id: decoded.id || 0,
      nome: decoded.sub,
      tipo: decoded.tipo,
      obra_id: decoded.obra_id || null
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