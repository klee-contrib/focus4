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
        input: "src/focus4.collections.ts",
        plugins: [
            // @ts-ignore
            postcss({extract: true, modules: true}),
            typescript({abortOnError: false}),
            copy([
                {files: "src/list/**/*.css.d.ts", dest: "lib/list"},
                {files: "src/search/**/*.css.d.ts", dest: "lib/search"}
            ]),
            abortOnError
        ],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            file: "lib/focus4.collections.js"
        },
        external: [
            ...Object.keys(pkg.dependencies || {}),
            "classnames",
            "i18next",
            "lodash",
            "mobx",
            "mobx-react",
            "react",
            "react/jsx-runtime",
            "tslib"
        ],
        onwarn
    };
    return config;
})();
