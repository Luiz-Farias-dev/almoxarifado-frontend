import { jwtDecode } from "jwt-decode";

export const getNameFromToken = (): string | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded: { sub?: string } = jwtDecode(token);
    return decoded.sub || null;
  } catch (error) {
    return null;
  }
};