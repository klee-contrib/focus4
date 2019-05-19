import chalk from "chalk";
import fs from "fs";
import glob from "glob";
import {camelCase, flatten} from "lodash";
import postcssImport from "postcss-import";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import pkg from "./package.json";

glob("./src/variables/*.css", null, (_, files) => {
    fs.writeFileSync(
        "./src/variables/variables.ts",
        [
            "export interface CSSVariables {",
            ...flatten(
                files.map(f =>
                    fs
                        .readFileSync(f, "utf-8")
                        .split("\r\n")
                        .map(l => l.trim())
                        .filter(l => l.startsWith("--"))
                        .map(s => s.replace(/:.+/, ""))
                        .map(camelCase)
                        .map(s => `    ${s}: string;`)
                )
            ),
            "}",
            ""
        ].join("\r\n")
    );
    console.log("Wrote " + chalk.green("packages/styling/src/variables/variables.d.ts"));
});

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
