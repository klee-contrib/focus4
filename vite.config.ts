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
                "packages/core/src/focus4.core.ts",
                "packages/form-toolbox/src/focus4.form-toolbox.ts",
                "packages/legacy/src",
                "packages/styling/src/config.ts",
                "packages/styling/src/theme/common.ts",
                "packages/tooling/src"
            ]
        },
        projects: ["packages/*"]
    }
});
