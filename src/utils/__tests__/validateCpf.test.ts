import { isValidCPF, formatCPF } from "../validateCpf";

describe("isValidCPF", () => {
  it("accepts a valid CPF", () => {
    // 529.982.247-25 is a known valid CPF
    expect(isValidCPF("52998224725")).toBe(true);
  });

  it("accepts a valid CPF with formatting", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("rejects CPF with all same digits", () => {
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);
    expect(isValidCPF("99999999999")).toBe(false);
  });

  it("rejects CPF with wrong check digit", () => {
    expect(isValidCPF("52998224726")).toBe(false);
  });

  it("rejects CPF too short", () => {
    expect(isValidCPF("123456")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidCPF("")).toBe(false);
  });

  it("accepts another known valid CPF", () => {
    // 347.066.120-04
    expect(isValidCPF("34706612004")).toBe(true);
  });
});

describe("formatCPF", () => {
  it("removes non-digit characters", () => {
    expect(formatCPF("529.982.247-25")).toBe("52998224725");
  });

  it("returns only digits for clean input", () => {
    expect(formatCPF("12345678901")).toBe("12345678901");
  });

  it("handles empty string", () => {
    expect(formatCPF("")).toBe("");
  });
});
