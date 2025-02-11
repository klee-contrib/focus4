// @ts-check
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.legacy.ts",
    plugins: [typescript()],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [
        ...Object.keys(pkg.dependencies || {}),
        "classnames",
        "core-decorators",
        "history",
        "i18next",
        "inputmask-core",
        "es-toolkit",
        "luxon",
        "mobx",
        "mobx-react",
        "react",
        "react/jsx-runtime",
        "react-dom",
        "tslib",
        "uuid"
    ]
};

export default config;
