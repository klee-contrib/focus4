/// <reference types="vitest/config" />
import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        reporters: ["junit", "default"],
        outputFile: {
            junit: "test-report.junit.xml"
        },
        coverage: {
            reporter: ["text", "lcov"]
        },
        projects: ["packages/*"]
    }
});
