// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

import typescript from "rollup-plugin-typescript2";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.stores.ts",
    plugins: [typescript({abortOnError: false}), abortOnError],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: pkg.main
    },
    external: [...Object.keys(pkg.dependencies || {}), "i18next", "lodash", "mobx", "tslib"],
    onwarn
};

export default config;
