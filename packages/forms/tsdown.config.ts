import {defineConfig} from "tsdown";

export default defineConfig({
    entry: "src/focus4.forms.ts",
    outDir: "lib",
    target: "es2023",
    platform: "neutral",
    dts: {
        sourcemap: true
    }
});
