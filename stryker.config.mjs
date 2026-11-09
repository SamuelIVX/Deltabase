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

  // Cover TypeScript source files
  mutate: [
    '{src,app,components,lib,hooks,utils}/**/*.{ts,tsx}',
    '!**/*.{test,spec}.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.d.ts',
    // Framework entrypoints: exercised by integration/e2e, not unit tests.
    '!**/app/**/{layout,page,loading,error,not-found,template,route}.tsx',
    '!**/middleware.ts',
  ],

  // Mutation-score gate. `break` fails the run; tune as the suites mature.
  thresholds: { high: 80, low: 60, break: 55 },
};

export default config;
