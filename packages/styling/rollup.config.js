// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

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
        // @ts-ignore
        plugins: [typescript({abortOnError: false}), postcss({extract: true}), abortOnError],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            file: pkg.main
        },
        external: [...Object.keys(pkg.dependencies || {}), "i18next", "lodash", "react", "react/jsx-runtime", "tslib"],
        onwarn
    },
    {
        input: "src/variables.ts",
        plugins: [
            typescript({abortOnError: false}),
            // @ts-ignore
            postcss({extract: true, plugins: [postcssImport()]}),
            abortOnError
        ],
        output: {
            format: "cjs",
            file: "lib/variables.js"
        },
        external: [...Object.keys(pkg.dependencies || {}), "lodash", "tslib"],
        onwarn
    },
    {
        input: "src/generator.ts",
        plugins: [typescript({abortOnError: false}), abortOnError],
        output: {
            format: "cjs",
            file: "lib/generator.js"
        },
        external: [...Object.keys(pkg.dependencies || {}), "fs", "lodash"],
        onwarn
    }
];

export default configs;
