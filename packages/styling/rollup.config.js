// @ts-check

import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
export default {
    input: "src/focus4.styling.ts",
    plugins: [typescript(), postcss({extract: true})],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {}), "react/jsx-runtime"]
};
