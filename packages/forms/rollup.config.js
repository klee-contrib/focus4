// @ts-check
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";

import {generateCSSTypings} from "@focus4/tooling";

import pkg from "./package.json";

export default (async () => {
    await generateCSSTypings("src");

    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: "src/focus4.forms.ts",
        plugins: [
            postcss({extract: true, modules: true}),
            typescript(),
            copy([{src: "src/fields/**/*.css.d.ts", dest: "lib/fields"}])
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
            ...Object.keys(pkg.peerDependencies || {}),
            "react/jsx-runtime"
        ]
    };

    return config;
})();
