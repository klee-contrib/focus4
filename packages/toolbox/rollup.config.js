// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

import postcssColor from "postcss-color-function";
import postcssImport from "postcss-import";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.toolbox.ts",
    plugins: [
        postcss({extract: true, modules: true, plugins: [postcssImport({load: () => ""}), postcssColor()]}),
        resolve(),
        typescript({abortOnError: false}),
        abortOnError
    ],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: pkg.main
    },
    external: [
        ...Object.keys(pkg.dependencies || {}),
        "react",
        "react-toolbox/lib/autocomplete/Autocomplete",
        "react-toolbox/lib/avatar/Avatar",
        "react-toolbox/lib/chip/Chip",
        "react-toolbox/lib/font_icon",
        "react-toolbox/lib/identifiers",
        "react-toolbox/lib/input/Input",
        "tslib"
    ],
    onwarn
};

export default config;
