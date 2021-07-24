// @ts-check
import typescript from "rollup-plugin-typescript2";

import {abortOnError, onwarn} from "../../scripts/rollup";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.legacy.ts",
    plugins: [typescript({abortOnError: false}), abortOnError],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: "lib/focus4.legacy.js"
    },
    external: [
        ...Object.keys(pkg.dependencies || {}),
        "classnames",
        "core-decorators",
        "i18next",
        "inputmask-core",
        "lodash",
        "lodash-decorators",
        "mobx",
        "mobx-react",
        "moment",
        "moment-timezone",
        "react",
        "react/jsx-runtime",
        "react-dom",
        "tslib",
        "uuid",
        "yester"
    ],
    onwarn
};

export default config;
