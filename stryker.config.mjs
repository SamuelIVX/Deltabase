// StrykerJS mutation testing.
// CI scopes to files changed vs the PR base by passing an explicit `--mutate`
// list (Stryker v10 removed the `--since` flag/config), so PR runs only ever
// mutate new/changed code and stay fast enough to run per-PR.
//
// Requires devDeps: @stryker-mutator/core, @stryker-mutator/vitest-runner
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  reporters: ['progress', 'clear-text', 'html'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },

  // Mutation testing is scoped to domain logic, calculations, API routes, data hooks, and providers.
  // Visual presentation components (SVG charts, styling, HTML layout) are validated by Vitest & Axe.
  mutate: [
    'src/pages/api/**/*.ts',
    'src/utils/**/*.{ts,tsx}',
    'src/lib/**/*.ts',
    'src/hooks/**/*.{ts,tsx}',
    'src/components/providers/**/*.{ts,tsx}',
    '!**/*.{test,spec}.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],

  // Mutation-score gate.
  thresholds: { high: 80, low: 65, break: 60 },
};

export default config;
