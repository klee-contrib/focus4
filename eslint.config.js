import tseslint from "typescript-eslint";
import {eslintConfig} from "./packages/tooling/lib/focus4.tooling.js";

export default tseslint.config(eslintConfig, {
    ignores: ["**/__tests__/", "**/lib/", "scripts/", "**/*.d.ts", "**/*.js", "packages/docs/"]
});
