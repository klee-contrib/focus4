/// <reference types="vitest/config" />
import {storybookTest} from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import {playwright} from "@vitest/browser-playwright";
import path from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
    plugins: [
        react(),
        storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook")
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
        }
    }
});
