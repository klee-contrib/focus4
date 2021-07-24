// @ts-check

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
        input: "src/focus4.layout.tsx",
        plugins: [
            // @ts-ignore
            postcss({extract: true, modules: true}),
            typescript({abortOnError: false}),
            copy([
                {files: "src/header/**/*.css.d.ts", dest: "lib/header"},
                {files: "src/menu/**/*.css.d.ts", dest: "lib/menu"},
                {files: "src/presentation/**/*.css.d.ts", dest: "lib/presentation"},
                {files: "src/scrollable/**/*.css.d.ts", dest: "lib/scrollable"},
                {files: "src/utils/**/*.css.d.ts", dest: "lib/utils"}
            ]),
            abortOnError
        ],
        treeshake: {
            moduleSideEffects: ["intersection-observer"]
        },
        output: {
            format: "esm",
            file: "lib/focus4.layout.js"
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            "classnames",
            "i18next",
            "lodash",
            "mobx",
            "mobx-react",
            "moment",
            "react",
            "react/jsx-runtime",
            "react-dom",
            "react-transition-group",
            "tslib"
        ],
        onwarn
    };
    return config;
})();
