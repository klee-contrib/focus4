import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import pkg from "./package.json";

export default [
    {
        input: "src/focus4.styling.ts",
        plugins: [typescript(), postcss({extract: true, plugins: [postcssImport()]})],
        output: {
            format: "esm",
            file: "lib/focus4.styling.js"
        },
        external: [...Object.keys(pkg.dependencies || {})]
    },
    {
        input: "src/css.ts",
        plugins: [typescript()],
        output: {
            format: "cjs",
            file: "lib/css.js"
        },
        external: [...Object.keys(pkg.dependencies || {})]
    }
];
