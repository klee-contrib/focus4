// @ts-check

import resolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy-glob";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

import {generateCSSTypings} from "@focus4/tooling";

import {abortOnError, onwarn} from "../../scripts/rollup";

import pkg from "./package.json";

export default (async () => {
    await generateCSSTypings("src");

    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: "src/focus4.toolbox.ts",
        plugins: [
            postcss({extract: true, modules: true}),
            resolve(),
            typescript({abortOnError: false}),
            copy([{files: "src/components/**/*.css.d.ts", dest: "lib/components"}]),
            abortOnError
        ],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            file: pkg.main
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            "classnames",
            "lodash",
            "react",
            "react/jsx-runtime",
            "react-dom",
            "tslib"
        ],
        onwarn
    };

    return config;
})();
