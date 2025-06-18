import type {Meta, StoryObj} from "@storybook/react";

import {MainMenuItem} from "@focus4/layout";

import {MainMenuItemMeta} from "./metas/main-menu-item";

export default {
    ...MainMenuItemMeta,
    title: "Mise en page/MainMenuItem"
} as Meta<typeof MainMenuItem>;

export const Showcase: StoryObj<typeof MainMenuItem> = {
    render(props) {
        return <MainMenuItem {...props} />;
    }
};
