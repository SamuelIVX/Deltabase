# Spec 05: UI Component Primitives, Subtle Animations & Market Terminal Polish

## Objective

Standardize Deltabase's visual surfaces with reusable, accessible UI component primitives (`Card`, `Separator`, `Badge`) matching shadcn's composable API, introduce subtle motion and interactive feedback following professional design principles, expand the live market ticker into a continuous 12-asset moving banner, relocate the global theme toggle to the sidebar footer, and polish layout margins and timeframe controls across market terminals.

## Scope

- Package: Deltabase (checkout `~/Documents/projects/deltabase`)
- Creates:
  - `docs/specs/05-ui-components-and-animations.md` (this spec)
  - `src/components/ui/Card.tsx` & `Card.module.css` & `Card.test.tsx`
  - `src/components/ui/Separator.tsx` & `Separator.module.css` & `Separator.test.tsx`
  - `src/components/ui/Badge.tsx` & `Badge.module.css` & `Badge.test.tsx`
- Modifies:
  - `src/components/globals.css` (subtle transition and micro-interaction tokens)
  - `src/pages/api/marketIndices.ts` (expand `INDEX_CONFIG` to 12 symbols)
  - `src/__tests__/api/marketIndices.test.ts`
  - `src/components/dashboard/marketribbon/MarketRibbon.tsx` & `.module.css` & `.test.tsx`
  - `src/components/dashboard/navbar/navbar.tsx` & `.module.css` & `.test.tsx`
  - `src/components/dashboard/sidebar/sidebar.tsx` & `.module.css` & `.test.tsx`
  - `src/components/dashboard/macro/MarketBenchmarkChart.tsx` & `.test.tsx`
  - `src/components/whatif/comparisoncharts/UnifiedComparisonChart.tsx`
  - `src/components/taxfeecalculator/taxfeecalculator.tsx` & `.module.css` & `.test.tsx`
- Off-limits:
  - DCA calculation engine (`src/utils/simulateDCA.ts`)
  - Tax calculation engine (`src/utils/calculateTaxReturns.ts`)
  - Keyed API endpoints for news and single-symbol ticks (`searchFinnhubNews`, `searchCoinLatestTick`)

## Non-Goals

- No full Tailwind CSS / PostCSS toolchain re-installation (preserves clean CSS Modules architecture).
- No unrequested routes or third-party dependencies.
- No changes to underlying portfolio math, DCA simulations, or tax bracket algorithms.

## Invariants

- **Calculation & Financial Precision:** Tax calculations, net returns, DCA formulas, and currency formatting must remain exact.
- **Accessibility:** All buttons, badges, dividers, and tickers must pass axe-core audits (WCAG 2.2 AA contrast, valid ARIA roles).
- **Reduced Motion:** Any CSS transform, continuous ticker scroll, or entrance transition must degrade to static presentation or instant cross-fades under `@media (prefers-reduced-motion: reduce)`.
- **Responsive Shell:** Collapsed and expanded sidebar modes must operate without horizontal scroll or layout shift.

## Requirements

1. WHEN the UI renders card surfaces, dividers, or badges, THE SYSTEM SHALL provide reusable, accessible primitives in `src/components/ui/` matching shadcn composable patterns. (R1)
2. WHEN an interactive element (buttons, ticker pills, sidebar icons, app logo) is hovered or focused, THE SYSTEM SHALL render subtle transitions (<=180ms ease-out) and active press feedback (scale 0.97). (R2)
3. WHEN the top market ribbon is rendered, THE SYSTEM SHALL query 12 market assets and display a continuous, smoothly scrolling banner that pauses on hover. (R3)
4. WHEN the theme toggle is clicked, THE SYSTEM SHALL toggle the theme from the sidebar footer in both expanded and collapsed states, with zero theme controls in individual page navbars. (R4)
5. WHEN the What-If DCA comparison chart renders, THE SYSTEM SHALL provide at least 24px bottom margin and `dy={6}` tick offset so X-axis year labels are never clipped. (R5)
6. WHEN the main benchmark chart renders, THE SYSTEM SHALL provide a 3M timeframe toggle between 1M and 6M, fetching and formatting 3-month daily series. (R6)
7. WHEN the Tax-Adjusted Returns page renders, THE SYSTEM SHALL display a clear descriptive explanation under the title and a visual structural divider separating inputs from results. (R7)

## Acceptance Criteria

1. Reusable `Card`, `Separator`, and `Badge` components exist in `src/components/ui/` with 100% test coverage and JSDoc. (R1)
2. Continuous ticker track in `MarketRibbon` displays 12 assets and pauses on hover; reduced-motion query disables animation. (R3)
3. `Navbar` renders without `ThemeToggle`; `Sidebar` renders `ThemeToggle` in footer and passes all sidebar tests. (R4)
4. `UnifiedComparisonChart` has bottom margin >= 24px with zero tick label clipping. (R5)
5. `MarketBenchmarkChart` includes 3M button and correctly passes `range='3m'` to `useYahooBasicHistoricalData`. (R6)
6. `TaxAdjustedReturns` displays subtitle description and has visual divider between input controls and results column. (R7)
7. `npm run test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with 0 errors. (all)

## Current State

- Deltabase operates cleanly on Next.js 16 (Turbopack) and React 19 using CSS Modules. [verified]
- `MarketRibbon` currently queries 5 assets and uses static horizontal scroll. [verified]
- `ThemeToggle` is rendered in `Navbar` on every dashboard page. [verified]
- `UnifiedComparisonChart` uses `margin={{ bottom: 0 }}`, causing tight X-axis year ticks. [verified]
- `MarketBenchmarkChart` currently lacks the `3M` timeframe button. [verified]
- `TaxAdjustedReturns` lacks a descriptive subtitle and inter-column separator. [verified]
