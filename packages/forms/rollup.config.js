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
        input: "src/focus4.forms.ts",
        plugins: [
            // @ts-ignore
            postcss({extract: true, modules: true}),
            typescript(),
            copy([
                {files: "src/components/**/*.css.d.ts", dest: "lib/components"},
                {files: "src/fields/**/*.css.d.ts", dest: "lib/fields"}
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
            "i18next",
            "lodash",
            "mobx",
            "mobx-react",
            "moment",
            "react",
            "react/jsx-runtime",
            "tslib"
        ]
    };

    return config;
})();
