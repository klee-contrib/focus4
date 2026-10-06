import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        isolate: false,
        setupFiles: ["./src/__tests__/setup.ts"]
    }
});
