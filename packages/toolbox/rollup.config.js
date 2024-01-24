// @ts-check

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy-glob";
import postcss from "rollup-plugin-postcss";

import {generateCSSTypings} from "@focus4/tooling";

import pkg from "./package.json";

export default (async () => {
    await generateCSSTypings("src");

    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: "src/focus4.toolbox.ts",
        plugins: [
            postcss({extract: true, modules: true}),
            resolve(),
            typescript(),
            copy([{files: "src/components/**/*.css.d.ts", dest: "lib/components"}])
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
            "react",
            "react/jsx-runtime",
            "react-dom",
            "tslib"
        ]
    };

    return config;
})();
