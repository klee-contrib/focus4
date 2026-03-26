import {defineConfig} from "tsdown";

import {decorators} from "@focus4/tooling";

export default defineConfig({
    plugins: [decorators()],
    entry: "src/focus4.stores.ts",
    outDir: "lib",
    target: "es2023",
    platform: "neutral",
    dts: {
        sourcemap: true
    }
});
