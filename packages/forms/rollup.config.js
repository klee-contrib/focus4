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
        input: "src/focus4.forms.ts",
        plugins: [
            // @ts-ignore
            postcss({extract: true, modules: true}),
            typescript({abortOnError: false}),
            copy([
                {files: "src/components/**/*.css.d.ts", dest: "lib/components"},
                {files: "src/fields/**/*.css.d.ts", dest: "lib/fields"}
            ]),
            abortOnError
        ],
        treeshake: {
            moduleSideEffects: false
        },
        output: {
            format: "esm",
            file: "lib/focus4.forms.js"
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
            "tslib"
        ],
        onwarn
    };

    return config;
})();
