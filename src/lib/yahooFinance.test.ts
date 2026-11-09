/**
 * Unit tests for shared YahooFinance client instance.
 */
import { describe, it, expect } from "vitest";
import YahooFinance from "yahoo-finance2";
import yahooFinance from "./yahooFinance";

describe("yahooFinance client", () => {
    it("exports an instantiated YahooFinance client instance with expected methods", () => {
        expect(yahooFinance).toBeInstanceOf(YahooFinance);
        expect(typeof yahooFinance.quote).toBe("function");
        expect(typeof yahooFinance.search).toBe("function");
        expect(typeof yahooFinance.chart).toBe("function");
    });
});
