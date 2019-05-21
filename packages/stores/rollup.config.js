import chalk from "chalk";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
    input: "src/focus4.stores.ts",
    onwarn: warning => {
        if (warning.code === "CIRCULAR_DEPENDENCY") {
            return;
        }
        console.warn(chalk.yellow(`(!) ${warning.message}`));
    },
    plugins: [typescript()],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: "lib/focus4.stores.js"
    },
    external: [...Object.keys(pkg.dependencies || {})]
};
