import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";



const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

/**
 * A Firemitt checkout next to Fireguard (../firemitt) is used instead of the published package, so that both can be
 * developed together without publishing Firemitt. Set FIREMITT=npm to use the published package anyway.
 */
const firemittRoot = fileURLToPath(new URL("../firemitt/", import.meta.url));
const firemittEntry = fileURLToPath(new URL("../firemitt/src/index.ts", import.meta.url));
const localFiremitt = process.env.FIREMITT !== "npm" && existsSync(firemittEntry);
const firemittAlias: Record<string, string> = localFiremitt ? { "@eoussama/firemitt": firemittEntry } : {};

export default defineConfig(({ mode }) => ({
  define: {
    __FIREGUARD_VERSION__: JSON.stringify(version),
  },
  plugins: [
    sveltekit({
      adapter: adapter(),
      preprocess: vitePreprocess(),
      typescript: {
        // Resolve the local Firemitt types as well (paths are absolute, the generated tsconfig lives in node_modules).
        config: (config) => {
          if (localFiremitt) {
            config.compilerOptions.paths = { ...config.compilerOptions.paths, "@eoussama/firemitt": [firemittEntry] };
          }
        },
      },
      paths: {
        // Fireguard is served from https://ouss.es/fireguard/, set BASE_PATH to self-host it elsewhere (e.g. BASE_PATH="" for a domain root).
        base: (process.env.BASE_PATH ?? (mode === "production" ? "/fireguard" : "")) as "" | `/${string}`,
      },
      version: {
        // Fireguard is a short-lived static page, there is no need to poll for new deployments.
        pollInterval: 0,
      },
    }),
  ],
  resolve: {
    alias: firemittAlias,
  },
  server: {
    fs: {
      allow: localFiremitt ? [firemittRoot] : [],
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    // Stryker sandboxes link node_modules, where Vitest keeps its module cache: disable it while mutation testing.
    fsModuleCache: !process.env.STRYKER_MUTATOR_WORKER,
    coverage: {
      provider: "v8",
      include: ["src/lib/core/**/*.ts"],
      exclude: ["src/lib/core/**/*.test.ts", "src/lib/core/types/**"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
}));
