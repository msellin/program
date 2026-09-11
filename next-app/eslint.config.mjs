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
      /**
       * React Compiler's set-state-in-effect, downgraded to a warning
       * 2026-09-11 — with a counted baseline, not silenced.
       *
       * It fires 20 times here. Five were read in full before this change and
       * every one is a legitimate idiom rather than a cascading render:
       *
       *   useUserPrefs      — `useState(fallback)` then read localStorage in an
       *                       effect. This is the canonical SSR-hydration-safe
       *                       pattern; moving the read into the initialiser
       *                       CAUSES the mismatch it looks like it prevents.
       *   StickyCta         — offset derived from VirtualKeyboard /
       *                       visualViewport, which do not exist until mount.
       *   YourPlanCard      — a view counter writing localStorage, then
       *                       reflecting the result.
       *   TodaySession,
       *   plan/page         — `setPrograms([])` in the empty-guard branch of an
       *                       async loader, keyed on a value that only changes
       *                       on a real change. No loop.
       *
       * Left as `error` it contributed 20 of 24 lint errors, which is how a
       * real one hides. The count is pinned by `setstate-effects.test.ts`, so
       * a NEW one still has to be looked at — the rule is demoted, not the
       * signal.
       */
      "react-hooks/set-state-in-effect": "warn",
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
