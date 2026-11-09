/**
 * Shared YahooFinance client instance (yahoo-finance2 v3/v4 compatible).
 */
import YahooFinance from "yahoo-finance2";

const yahooFinance = typeof YahooFinance === "function"
    ? new YahooFinance({ suppressNotices: ["yahooSurvey"] })
    : (YahooFinance as unknown as InstanceType<typeof YahooFinance>);

export default yahooFinance;
