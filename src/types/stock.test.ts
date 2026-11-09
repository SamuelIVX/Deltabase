/**
 * Unit tests verifying YahooQuote structure and typing safety.
 */
import { describe, it, expect } from "vitest";
import type { YahooQuote } from "./stock";

describe("YahooQuote interface", () => {
  it("allows constructing a complete YahooQuote record with moving averages", () => {
    const quote: YahooQuote = {
      regularMarketPrice: 220.5,
      regularMarketChangePercent: 1.25,
      currency: "USD",
      fiftyDayAverage: 215.1,
      twoHundredDayAverage: 198.4,
    };

    expect(quote.regularMarketPrice).toBe(220.5);
    expect(quote.fiftyDayAverage).toBe(215.1);
    expect(quote.twoHundredDayAverage).toBe(198.4);
  });
});
