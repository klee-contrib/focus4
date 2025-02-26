// @ts-check

import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-preserve-shebang";

import pkg from "./package.json";

export default {
    input: "src/focus4.tooling.ts",
    plugins: [typescript(), shebang()],
    treeshake: {
        moduleSideEffects: true
    },
    output: {
        format: "esm",
        dir: "lib"
    },
    external: [...Object.keys(pkg.dependencies || {}), "crypto", "dns", "fs", "path"]
};
