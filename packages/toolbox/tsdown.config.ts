import {defineConfig} from "tsdown";

import {baseConfig, cssAutoModules, generateCSSTypings} from "@focus4/tooling";

await generateCSSTypings("src");

export default defineConfig({
    plugins: [cssAutoModules(/__style__/u)],
    entry: "src/focus4.toolbox.ts",
    outDir: "lib",
    target: "es2023",
    platform: "browser",
    css: {
        ...baseConfig.css,
        fileName: "focus4.toolbox.css"
    },
    dts: {
        sourcemap: true
    }
});
