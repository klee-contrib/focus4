import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        isolate: false,
        setupFiles: ["../../vitest.setup.ts", "./src/__tests__/setup.ts"]
    }
});
