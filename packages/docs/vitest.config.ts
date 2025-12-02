/// <reference types="vitest/config" />
import {storybookTest} from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import {playwright} from "@vitest/browser-playwright";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {defineConfig} from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    plugins: [
        react(),
        storybookTest({
            configDir: path.join(dirname, ".storybook")
        })
    ],
    test: {
        name: "storybook",
        browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
                {
                    browser: "chromium"
                }
            ]
        },
        setupFiles: [path.join(".storybook/vitest.setup.ts")]
    }
});
