/**
 * Unit tests for shared YahooFinance client instance.
 */
import { describe, it, expect } from "vitest";
import yahooFinance from "./yahooFinance";

describe("yahooFinance client", () => {
    it("exports an instance or compatible client", () => {
        expect(yahooFinance).toBeDefined();
    });
});
