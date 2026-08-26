import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        reporters: ["junit", "default"],
        outputFile: {
            junit: "test-report.junit.xml"
        },
        coverage: {
            reporter: ["text", "lcov"],
            include: ["packages/**/src/**/*.{ts,tsx}"],
            exclude: [
                "**/*.css.d.ts",
                "**/translation/**",
                "focus4.core.ts",
                "focus4.form-toolbox.ts",
                "legacy/src",
                "styling/src/config.ts",
                "styling/src/theme/common.ts",
                "tooling/src"
            ]
        },
        projects: ["packages/*"]
    }
});
