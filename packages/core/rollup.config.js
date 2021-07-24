// @ts-check
import typescript from "rollup-plugin-typescript2";

import {abortOnError, onwarn} from "../../scripts/rollup";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.core.ts",
    plugins: [typescript({abortOnError: false}), abortOnError],
    treeshake: {
        moduleSideEffects: ["whatwg-fetch"]
    },
    output: {
        format: "esm",
        file: pkg.main
    },
    external: [...Object.keys(pkg.dependencies || {})],
    onwarn
};

export default config;
