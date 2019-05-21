// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn} from "../../scripts/onwarn";

import chalk from "chalk";
import fs from "fs";
import glob from "glob";
import {camelCase, flatten} from "lodash";
import postcssImport from "postcss-import";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";

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

/** @type {import("rollup").RollupOptions[]} */
const configs = [
    {
        input: "src/focus4.styling.ts",
        plugins: [typescript({abortOnError: false}), postcss({extract: true, plugins: [postcssImport()]})],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            file: "lib/focus4.styling.js"
        },
        external: [...Object.keys(pkg.dependencies || {})],
        onwarn
    },
    {
        input: "src/css.ts",
        plugins: [typescript({abortOnError: false})],
        output: {
            format: "cjs",
            file: "lib/css.js"
        },
        external: [...Object.keys(pkg.dependencies || {})],
        onwarn
    }
];

export default configs;
