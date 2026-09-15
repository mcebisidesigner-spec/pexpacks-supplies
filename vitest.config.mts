import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./tests/stubs/server-only.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    exclude: ["e2e/**", "node_modules/**", "dist/**", ".idea/**", ".git/**", ".cache/**"],
  },
});
