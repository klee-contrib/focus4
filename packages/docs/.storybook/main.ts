import type {StorybookConfig} from "@storybook/react-vite";
import {mergeConfig} from "vite";

export default {
    stories: ["../**/*.@(stories.tsx|mdx)"],
    addons: ["@storybook/addon-essentials", "storybook-dark-mode"],
    staticDirs: ["./public"],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },
    docs: {
        autodocs: "tag"
    },
    typescript: {
        reactDocgen: "react-docgen-typescript"
    },
    viteFinal: config => mergeConfig(config, {esbuild: {minifyIdentifiers: false}})
} satisfies StorybookConfig;
