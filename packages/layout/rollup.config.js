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
                {files: "src/panels/**/*.css.d.ts", dest: "lib/panels"},
                {files: "src/presentation/**/*.css.d.ts", dest: "lib/presentation"}
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
            ...Object.keys(pkg.peerDependencies || {}),
            "motion/react",
            "react/jsx-runtime"
        ]
    };
    return config;
})();
