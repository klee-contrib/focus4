// @ts-check

import typescript from "@rollup/plugin-typescript";
import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions[]} */
export default {
    input: "src/focus4.styling.ts",
    // @ts-ignore
    plugins: [typescript(), postcss({extract: true, plugins: [postcssImport()]})],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [...Object.keys(pkg.dependencies || {}), "i18next", "lodash", "react", "react/jsx-runtime", "tslib"]
};
