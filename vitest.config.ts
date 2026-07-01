import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "backend",
          environment: "node",
          include: ["tests/**/*.test.ts"],
          exclude: [
            "tests/unit/lib/auth-client.test.ts",
            "tests/unit/lib/api-client.test.ts",
            "tests/unit/lib/shopify/**",
          ],
          setupFiles: ["./tests/setup/vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: [
            "tests/unit/components/**/*.test.tsx",
            "tests/unit/hooks/**/*.test.tsx",
            "tests/unit/lib/auth-client.test.ts",
            "tests/unit/lib/api-client.test.ts",
            "tests/unit/lib/shopify/**/*.test.ts",
          ],
          setupFiles: ["./tests/setup/vitest.setup.dom.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
