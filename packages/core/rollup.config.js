import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
    input: "src/focus4.core.ts",
    plugins: [typescript()],
    output: {
        format: "esm",
        file: "lib/focus4.core.js"
    },
    external: [...Object.keys(pkg.dependencies || {})]
};
