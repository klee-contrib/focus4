// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

import resolve from "@rollup/plugin-node-resolve";
import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.toolbox.ts",
    plugins: [
        postcss({extract: true, modules: true, plugins: [postcssImport({load: () => ""})]}),
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
        "classnames",
        "ramda/src/dissoc",
        "ramda/src/range",
        "ramda/src/toPairs",
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-toolbox/lib/button/Button",
        "react-toolbox/lib/button/IconButton",
        "react-toolbox/lib/identifiers",
        "react-toolbox/lib/utils/events",
        "react-toolbox/lib/utils/prefixer",
        "react-toolbox/lib/utils/time",
        "react-toolbox/lib/utils/utils",
        "tslib"
    ],
    onwarn
};

export default config;
