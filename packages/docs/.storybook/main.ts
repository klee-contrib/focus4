import type {StorybookConfig} from "@storybook/react-vite";

export default {
    stories: ["../**/*.stories.tsx", "../**/*.mdx"],
    addons: ["@storybook/addon-essentials", "storybook-dark-mode"],
    staticDirs: ["./public"],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },
    docs: {
        autodocs: true
    },
    typescript: {
        reactDocgen: "react-docgen-typescript"
    }
} satisfies StorybookConfig;
