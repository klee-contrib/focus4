// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

import typescript from "rollup-plugin-typescript2";

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
        "core-decorators",
        "i18next",
        "lodash",
        "mobx",
        "mobx-react",
        "moment",
        "react",
        "tslib",
        "uuid"
    ],
    onwarn
};

export default config;
