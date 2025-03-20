// @ts-check
import typescript from "@rollup/plugin-typescript";
import chalk from "chalk";

import pkg from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.stores.ts",
    plugins: [typescript()],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies)],
    onwarn: ({code, message}) => {
        if (code === "CIRCULAR_DEPENDENCY") {
            return;
        }
        console.warn(chalk.yellow(`(!) ${message}`));
    }
};

export default config;
