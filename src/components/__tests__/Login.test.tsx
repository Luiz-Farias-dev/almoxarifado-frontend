import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock login endpoint
vi.mock("@/api/endpoints", () => ({
  login: vi.fn(),
}));

// Mock LoadingSpinner
vi.mock("../LoadingSpinner", () => ({
  default: ({ message }: { message: string }) => <span>{message}</span>,
}));

// Mock logo import
vi.mock("@/assets/logo.png", () => ({ default: "logo.png" }));

import { login as mockLogin } from "@/api/endpoints";
import LoginPage from "../Login";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginPage", () => {
  it("renders CPF and senha inputs", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Digite seu CPF")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();
  });

  it("renders the login button disabled initially", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /entrar/i });
    expect(button).toBeDisabled();
  });

  it("shows CPF error for invalid CPF", () => {
    render(<LoginPage />);
    const cpfInput = screen.getByPlaceholderText("Digite seu CPF");
    fireEvent.change(cpfInput, { target: { value: "123" } });
    expect(
      screen.getByText("CPF inválido. Verifique e tente novamente."),
    ).toBeInTheDocument();
  });

  it("stores token and navigates on successful login", async () => {
    (mockLogin as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { token: "jwt-token" },
    });

    render(<LoginPage />);

    const cpfInput = screen.getByPlaceholderText("Digite seu CPF");
    const senhaInput = screen.getByPlaceholderText("Digite sua senha");

    // Use valid CPF: 529.982.247-25
    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(senhaInput, { target: { value: "Padrao#2025" } });

    const button = screen.getByRole("button", { name: /entrar/i });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("jwt-token");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on 401 response", async () => {
    (mockLogin as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 401, data: { error: "Senha incorreta." } },
    });

    render(<LoginPage />);

    const cpfInput = screen.getByPlaceholderText("Digite seu CPF");
    const senhaInput = screen.getByPlaceholderText("Digite sua senha");

    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(senhaInput, { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Senha incorreta.")).toBeInTheDocument();
    });
  });

  it("shows error on 403 response", async () => {
    (mockLogin as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 403, data: { error: "Acesso negado." } },
    });

    render(<LoginPage />);

    const cpfInput = screen.getByPlaceholderText("Digite seu CPF");
    const senhaInput = screen.getByPlaceholderText("Digite sua senha");

    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(senhaInput, { target: { value: "pass" } });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Acesso negado.")).toBeInTheDocument();
    });
  });
});
