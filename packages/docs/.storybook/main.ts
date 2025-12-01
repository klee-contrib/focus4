import type {StorybookConfig} from "@storybook/react-vite";
import {mergeConfig} from "vite";

export default {
    stories: ["../**/*.@(stories.tsx|mdx)"],
    addons: [
        "@storybook/addon-docs",
        "@vueless/storybook-dark-mode",
        "storybook-react-i18next",
        "@storybook/addon-vitest"
    ],
    staticDirs: ["./public"],

    framework: {
        name: "@storybook/react-vite",
        options: {}
    },

    typescript: {
        reactDocgen: "react-docgen-typescript"
    },

    viteFinal: config => mergeConfig(config, {esbuild: {minifyIdentifiers: false}})
} satisfies StorybookConfig;
