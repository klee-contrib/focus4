import {defineConfig} from "tsdown";

export default defineConfig({
    entry: "src/focus4.tooling.ts",
    outDir: "lib",
    target: "es2023",
    platform: "node",
    dts: {
        sourcemap: true
    }
});
