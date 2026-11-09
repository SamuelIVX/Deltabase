/**
 * Vitest config for Deltabase — jsdom, path alias `@` → `./src`, UTC timezone.
 */
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["**/node_modules/**", "**/.stryker-tmp/**", "**/dist/**", "**/.next/**"],
        globals: true,
        css: false,
        env: {
            TZ: "UTC",
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    css: {
        postcss: {},
    },
});
