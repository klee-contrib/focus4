// @ts-check

import shebang from "rollup-plugin-preserve-shebang";
import typescript from "rollup-plugin-typescript2";

import {abortOnError, onwarn} from "../../scripts/rollup";

import pkg from "./package.json";

export default {
    input: "src/focus4.tooling.ts",
    plugins: [typescript({abortOnError: false}), shebang(), abortOnError],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "cjs",
        file: pkg.main
    },
    external: [...Object.keys(pkg.dependencies || {}), "fs"],
    onwarn
};
