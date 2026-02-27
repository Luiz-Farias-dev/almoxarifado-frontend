import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  Navigate: (props: any) => {
    mockNavigate(props);
    return <div data-testid="navigate">Redirecting to {props.to}</div>;
  },
}));

import PrivateRoute from "../PrivateRoute";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("PrivateRoute", () => {
  it("renders the child element when accessToken exists", () => {
    localStorage.setItem("accessToken", "valid-token");
    render(
      <PrivateRoute element={<div data-testid="protected">Protected</div>} />,
    );
    expect(screen.getByTestId("protected")).toBeInTheDocument();
  });

  it("redirects to /login when no accessToken", () => {
    render(
      <PrivateRoute element={<div data-testid="protected">Protected</div>} />,
    );
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/login", replace: true }),
    );
  });
});
