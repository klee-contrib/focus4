// @ts-check

import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

import {abortOnError, onwarn} from "../../scripts/rollup";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions[]} */
export default {
    input: "src/focus4.styling.ts",
    // @ts-ignore
    plugins: [typescript({abortOnError: false}), postcss({extract: true, plugins: [postcssImport()]}), abortOnError],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: pkg.main
    },
    external: [...Object.keys(pkg.dependencies || {}), "i18next", "lodash", "react", "react/jsx-runtime", "tslib"],
    onwarn
};
