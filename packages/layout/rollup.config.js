// @ts-check

import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy-glob";
import postcss from "rollup-plugin-postcss";

import {generateCSSTypings} from "@focus4/tooling";

import pkg from "./package.json";

export default (async () => {
    await generateCSSTypings("src");

    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: "src/focus4.layout.tsx",
        plugins: [
            postcss({extract: true, modules: true}),
            typescript(),
            copy([
                {files: "src/header/**/*.css.d.ts", dest: "lib/header"},
                {files: "src/menu/**/*.css.d.ts", dest: "lib/menu"},
                {files: "src/presentation/**/*.css.d.ts", dest: "lib/presentation"},
                {files: "src/scrollable/**/*.css.d.ts", dest: "lib/scrollable"},
                {files: "src/utils/**/*.css.d.ts", dest: "lib/utils"}
            ])
        ],
        treeshake: {
            moduleSideEffects: ["intersection-observer"]
        },
        output: {
            format: "esm",
            dir: "lib"
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            "classnames",
            "framer-motion",
            "i18next",
            "lodash",
            "luxon",
            "mobx",
            "mobx-react",
            "react",
            "react/jsx-runtime",
            "react-dom",
            "tslib"
        ]
    };
    return config;
})();
