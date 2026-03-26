import {defineConfig} from "tsdown";

export default defineConfig({
    entry: "src/focus4.styling.ts",
    outDir: "lib",
    target: "es2023",
    platform: "browser",
    css: {
        fileName: "focus4.styling.css"
    },
    dts: {
        sourcemap: true
    }
});
