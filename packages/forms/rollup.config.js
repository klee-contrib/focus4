// @ts-check
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.forms.ts",
    plugins: [typescript()],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {}), "react/jsx-runtime"]
};

export default config;
