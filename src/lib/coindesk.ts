/**
 * Helper module for server-side CoinDesk Data API integration.
 * SECURITY: API keys must remain server-side and sent via Authorization headers.
 */

/**
 * Generates standard headers for CoinDesk Data API requests.
 * @param apiKey - Server-side `COINDESK_API_KEY`.
 * @returns Header dictionary with Content-Type and Authorization Bearer token.
 */
export function getCoinDeskHeaders(apiKey: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
    };
}
