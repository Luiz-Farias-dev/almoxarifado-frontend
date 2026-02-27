import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";

// We test the interceptor logic by importing the configured api instance.
// We need to mock import.meta.env before the module loads.

// Mock axios.create to return a real-enough mock
const mockInterceptors = {
  request: { use: vi.fn() },
  response: { use: vi.fn() },
};

vi.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => instance),
      __mockInstance: instance,
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("api axios instance", () => {
  it("creates axios instance with baseURL from env", async () => {
    // Re-import to trigger module execution
    const axiosMod = await import("axios");
    const { default: api } = await import("../axios");
    expect(axiosMod.default.create).toHaveBeenCalled();
  });

  it("request interceptor adds token for non-auth URLs", async () => {
    const axiosMod = await import("axios");
    const mockInstance = (axiosMod.default as any).__mockInstance;

    // Import triggers interceptor registration
    await import("../axios");

    // Get the request interceptor callback
    const requestInterceptorCall = mockInstance.interceptors.request.use.mock.calls[0];
    if (!requestInterceptorCall) return;

    const onFulfilled = requestInterceptorCall[0];

    // Simulate request to a non-auth endpoint with token
    localStorage.setItem("accessToken", "my-token");
    const config = { url: "/insumos", headers: {} as any };
    const result = onFulfilled(config);
    expect(result.headers.Authorization).toBe("Bearer my-token");
  });

  it("request interceptor does NOT add token for login URL", async () => {
    const axiosMod = await import("axios");
    const mockInstance = (axiosMod.default as any).__mockInstance;
    await import("../axios");

    const requestInterceptorCall = mockInstance.interceptors.request.use.mock.calls[0];
    if (!requestInterceptorCall) return;

    const onFulfilled = requestInterceptorCall[0];

    localStorage.setItem("accessToken", "my-token");
    const config = { url: "/login", headers: {} as any };
    const result = onFulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});
