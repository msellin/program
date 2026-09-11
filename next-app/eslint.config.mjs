import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated, minified service worker (serwist build output). It is a build
    // artifact committed for the static export, not source — linting it
    // reported a `no-this-alias` error at column 4286 of line 1, which is a
    // finding about a bundler's codegen, not about anything anyone can fix
    // here. One real error hidden among noise is worse than no lint at all.
    "public/sw.js",
    "public/sw.js.map",
  ]),
  {
    /**
     * `_`-prefixed identifiers are deliberate, and the config never said so.
     *
     * `_onBack`, `_byId`, `_exId`, `_program`, `_phase` and `_todayISO` are
     * parameters kept to hold a position in a signature, or destructured to
     * document what is deliberately unused. The codebase already uses the
     * underscore convention for exactly this; eslint was simply never told,
     * so every intentional placeholder reported as a defect.
     *
     * Noise here is not free. Unused-vars was the bulk of a 138-warning run,
     * and a list nobody reads is where a genuinely dead identifier hides.
     */
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
