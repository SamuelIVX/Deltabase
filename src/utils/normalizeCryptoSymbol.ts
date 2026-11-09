/**
 * Normalizes user-entered crypto symbols, names, and ticker pairs to standard exchange formats.
 * e.g. "btc" → "BTC-USD", "ethereum" → "ETH-USD", "SOL/USD" → "SOL-USD".
 */

const CRYPTO_ALIASES: Record<string, string> = {
  BITCOIN: "BTC-USD",
  BTC: "BTC-USD",
  ETHEREUM: "ETH-USD",
  ETH: "ETH-USD",
  SOLANA: "SOL-USD",
  SOL: "SOL-USD",
  DOGECOIN: "DOGE-USD",
  DOGE: "DOGE-USD",
  RIPPLE: "XRP-USD",
  XRP: "XRP-USD",
  CARDANO: "ADA-USD",
  ADA: "ADA-USD",
  AVALANCHE: "AVAX-USD",
  AVAX: "AVAX-USD",
  CHAINLINK: "LINK-USD",
  LINK: "LINK-USD",
  POLKADOT: "DOT-USD",
  DOT: "DOT-USD",
  LITECOIN: "LTC-USD",
  LTC: "LTC-USD",
  SHIBA: "SHIB-USD",
  SHIB: "SHIB-USD",
};

/**
 * Converts a raw query string into a canonical exchange pair ticker.
 * @param query - User input string (e.g. "btc", "Bitcoin", "ETH-USD", "SOL/USD").
 * @returns Canonical uppercase instrument string (e.g. "BTC-USD").
 * @example
 * normalizeCryptoSymbol("btc"); // "BTC-USD"
 * normalizeCryptoSymbol("ethereum"); // "ETH-USD"
 * normalizeCryptoSymbol("SOL/USD"); // "SOL-USD"
 */
export function normalizeCryptoSymbol(query: string | null | undefined): string {
  if (!query) return "";
  const cleaned = query
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "-");

  if (!cleaned) return "";

  if (CRYPTO_ALIASES[cleaned]) {
    return CRYPTO_ALIASES[cleaned];
  }

  // If already contains a dash (e.g. "BTC-USD", "ETH-EUR"), return cleaned
  if (cleaned.includes("-")) {
    return cleaned;
  }

  // If standard alphanumeric token (e.g. "MATIC"), default quote currency to USD
  if (/^[A-Z0-9]+$/.test(cleaned)) {
    return `${cleaned}-USD`;
  }

  return cleaned;
}

export default normalizeCryptoSymbol;
