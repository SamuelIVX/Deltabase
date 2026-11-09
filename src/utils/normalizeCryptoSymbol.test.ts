/**
 * Unit tests for normalizeCryptoSymbol utility.
 */
import { describe, it, expect } from "vitest";
import { normalizeCryptoSymbol } from "./normalizeCryptoSymbol";

describe("normalizeCryptoSymbol", () => {
  it("handles empty and nullish inputs gracefully", () => {
    expect(normalizeCryptoSymbol(null)).toBe("");
    expect(normalizeCryptoSymbol(undefined)).toBe("");
    expect(normalizeCryptoSymbol("")).toBe("");
    expect(normalizeCryptoSymbol("   ")).toBe("");
  });

  it("maps common crypto ticker aliases correctly", () => {
    expect(normalizeCryptoSymbol("btc")).toBe("BTC-USD");
    expect(normalizeCryptoSymbol("bitcoin")).toBe("BTC-USD");
    expect(normalizeCryptoSymbol("eth")).toBe("ETH-USD");
    expect(normalizeCryptoSymbol("Ethereum")).toBe("ETH-USD");
    expect(normalizeCryptoSymbol("sol")).toBe("SOL-USD");
    expect(normalizeCryptoSymbol("solana")).toBe("SOL-USD");
    expect(normalizeCryptoSymbol("doge")).toBe("DOGE-USD");
    expect(normalizeCryptoSymbol("DOGECOIN")).toBe("DOGE-USD");
  });

  it("normalizes slash notation to dash", () => {
    expect(normalizeCryptoSymbol("btc/usd")).toBe("BTC-USD");
    expect(normalizeCryptoSymbol("ETH/EUR")).toBe("ETH-EUR");
  });

  it("appends -USD to standalone alphanumeric tickers", () => {
    expect(normalizeCryptoSymbol("matic")).toBe("MATIC-USD");
    expect(normalizeCryptoSymbol("near")).toBe("NEAR-USD");
  });

  it("preserves already normalized tickers", () => {
    expect(normalizeCryptoSymbol("BTC-USD")).toBe("BTC-USD");
    expect(normalizeCryptoSymbol("ETH-USDT")).toBe("ETH-USDT");
  });
});
