// @ts-check

import typescript from "@rollup/plugin-typescript";
import chalk from "chalk";
import copy from "rollup-plugin-copy-glob";
import postcss from "rollup-plugin-postcss";

import {generateCSSTypings} from "@focus4/tooling";

import pkg from "./package.json";

export default (async () => {
    await generateCSSTypings("src");

    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: "src/focus4.collections.ts",
        plugins: [
            postcss({extract: true, modules: true}),
            typescript(),
            copy([
                {files: "src/list/**/*.css.d.ts", dest: "lib/list"},
                {files: "src/search/**/*.css.d.ts", dest: "lib/search"}
            ])
        ],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            dir: "lib"
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            "classnames",
            "es-toolkit",
            "framer-motion",
            "i18next",
            "mobx",
            "mobx-react",
            "react",
            "react/jsx-runtime",
            "tslib"
        ],
        onwarn: ({code, message}) => {
            if (code === "CIRCULAR_DEPENDENCY") {
                return;
            }
            console.warn(chalk.yellow(`(!) ${message}`));
        }
    };
    return config;
})();
