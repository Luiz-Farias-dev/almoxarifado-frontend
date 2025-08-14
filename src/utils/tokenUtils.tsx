// src/utils/tokenUtils.ts
import {jwtDecode} from "jwt-decode";

export interface UserToken {
  id: number;
  nome: string;
  tipo: string;
  obra_id: number | null;
}

export function getUserInfoFromToken(): UserToken | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.id,
      nome: decoded.sub,
      tipo: decoded.tipo,
      obra_id: decoded.obra_id
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

// Mantenha a função existente para nome se necessário
export function getNameFromToken(): string | null {
  const user = getUserInfoFromToken();
  return user ? user.nome : null;
}