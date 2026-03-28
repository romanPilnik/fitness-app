import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    name: "integration",
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    passWithNoTests: false,
    fileParallelism: false,
    setupFiles: ["./src/test/setup.ts", "./src/test/integration.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        "build/**",
        "**/*.test.ts",
        "**/*.integration.test.ts",
        "src/generated/**",
        "src/test/setup.ts",
        "src/test/integration.setup.ts",
        "src/test/httpAgent.ts",
        "src/test/authHelpers.ts",
      ],
    },
  },
});
