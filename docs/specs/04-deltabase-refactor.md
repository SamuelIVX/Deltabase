# Spec: Deltabase Refactor — CoinDesk Auth Unification, React Query Consolidation & Dependency Cleanup

## Objective

Unify server-side CoinDesk API authentication to standard HTTP Bearer headers across all Pages API routes, consolidate custom data-fetching hooks onto React Query (`@tanstack/react-query`) with return-shape shims, and prune dead package dependencies (`zustand`, `react-router-dom`, `slider`).

## Scope

- Package: Deltabase (checkout `~/Documents/projects/deltabase`)
- Modifies:
  - `src/lib/coindesk.ts` (new helper for CoinDesk server-side fetch headers)
  - `src/pages/api/searchCoinHistoricalData.ts` — use standard CoinDesk auth header helper
  - `src/pages/api/searchCoinLatestTick.ts` — migrate `api_key` query param to `Authorization: Bearer` header
  - `src/hooks/useCryptoHistoricalData.tsx` — migrate fetching to React Query with `{ results, isLoading, error }` shim
  - `src/hooks/useCryptoLatestTick.tsx` — migrate fetching to React Query with `{ result, isLoading, error }` shim
  - `src/hooks/useYahooHistoricalData.tsx` — migrate fetching to React Query with `{ results, isLoading, error }` shim
  - `src/hooks/useYahooBasicHistoricalData.tsx` — migrate fetching to React Query with `{ historicalData, isLoading, error }` shim
  - `src/hooks/useYahooStockQuote.tsx` — migrate fetching to React Query with `{ quote, isLoading, error }` shim
  - `src/hooks/useYahooStockSymbols.jsx` — migrate fetching to React Query with `{ results, isLoading, error }` shim
  - `package.json`, `package-lock.json` — remove dead dependencies
- Off-limits:
  - `src/pages/api/searchFinnhubNews.ts` (already refactored server-side in PR #221)
  - `src/utils/simulateDCA.ts` calculation logic
  - Consuming component UI files (must remain untouched due to return-shape shims)

## Non-Goals

- No changes to client-facing REST API response formats or endpoint paths.
- No changes to UI component structures or layout.
- Do not remove `@radix-ui/react-slider` (which is actively used by `investmentform.jsx`).

## Invariants

- **API Key Security:** `COINDESK_API_KEY` remains server-side only in Next.js Pages API routes and is never sent to or exposed in the browser.
- **API Request Authorization:** All CoinDesk API requests use `Authorization: Bearer ${apiKey}` in HTTP request headers.
- **React Query Hook Shim Invariant:** All refactored data hooks must preserve their exact return object structures so zero consumer component edits are required.

## Requirements

1. WHEN an API route communicates with CoinDesk (`searchCoinHistoricalData` or `searchCoinLatestTick`), THE SYSTEM SHALL send `COINDESK_API_KEY` via `Authorization: Bearer ${apiKey}` in HTTP headers without passing `api_key` in the URL query string. (R1)
2. WHEN `useCryptoHistoricalData`, `useCryptoLatestTick`, `useYahooHistoricalData`, `useYahooBasicHistoricalData`, `useYahooStockQuote`, or `useYahooStockSymbols` are called, THE SYSTEM SHALL execute data fetching using React Query (`useQuery`). (R2)
3. WHEN any component invokes a refactored data hook, THE SYSTEM SHALL return the expected return object keys (  `results`, `result`, `quote`, `historicalData`, `isLoading`, `error`) maintaining 100% backward compatibility. (R3)
4. WHEN `package.json` is audited, THE SYSTEM SHALL omit unused dependencies (`zustand`, `react-router-dom`, `slider`). (R4)

## Acceptance Criteria

1. Both `searchCoinHistoricalData.ts` and `searchCoinLatestTick.ts` construct CoinDesk API requests with `Authorization: Bearer ${apiKey}` headers and zero `api_key` query params. (R1)
2. `grep -rn "react-router-dom\|zustand\|\"slider\"" package.json` returns zero matches. (R4)
3. All custom fetching hooks in `src/hooks/` utilize React Query's `useQuery`. (R2, R3)
4. `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with zero errors. (all)

## Design

Helper module `src/lib/coindesk.ts`:

```ts
/** Standard headers for server-side CoinDesk Data API requests. */
export function getCoinDeskHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };
}
```

Hook shim pattern (example for `useCryptoLatestTick`):

```ts
export default function useCryptoLatestTick({ instrument }: Params) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cryptoLatestTick', instrument],
    queryFn: () => fetchLatestTick(instrument),
    enabled: Boolean(instrument),
  });

  return {
    result: data ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
```

## Current State

- `searchCoinHistoricalData.ts` uses `Authorization: Bearer`; `searchCoinLatestTick.ts` appends `api_key` query param. [verified]
- `useFinnhubNews.tsx` uses `useQuery`; 6 other data hooks use `useEffect` + `useState` + `queueMicrotask`. [verified]
- `zustand`, `react-router-dom`, and `"slider"` are listed in `package.json` but have 0 imports in `src/` (`@radix-ui/react-slider` is used). [verified]
- Baseline: 27 Vitest tests pass (5 files); lint clean (0 errors, 12 warnings); `tsc --noEmit` clean. [verified 2026-08-13]

## Tests

- `searchCoinLatestTick.test.ts` (new): asserts authorization header is used and query param `api_key` is absent.
- Existing Vitest suite (29 tests across 6 files) remains 100% green.

## Constraints

- Backward compatibility: return shape of hooks must remain unchanged.
- Follow `docs/specs` in-repo convention (D6/D7 of `master-refactor-v3`).
