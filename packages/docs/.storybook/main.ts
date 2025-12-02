import type {StorybookConfig} from "@storybook/react-vite";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {mergeConfig} from "vite";

export default {
    stories: ["../**/*.@(stories.tsx|mdx)"],
    addons: [
        getAbsolutePath("@storybook/addon-docs"),
        getAbsolutePath("@vueless/storybook-dark-mode"),
        getAbsolutePath("storybook-react-i18next"),
        getAbsolutePath("@storybook/addon-vitest")
    ],
    staticDirs: ["./public"],

    framework: {
        name: getAbsolutePath("@storybook/react-vite"),
        options: {}
    },

    typescript: {
        reactDocgen: "react-docgen-typescript"
    },

    viteFinal: config => mergeConfig(config, {esbuild: {minifyIdentifiers: false}})
} satisfies StorybookConfig;

function getAbsolutePath(value: string): any {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
