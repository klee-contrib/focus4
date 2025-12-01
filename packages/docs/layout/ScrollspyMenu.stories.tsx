import type {Meta, StoryObj} from "@storybook/react";

import {ScrollspyMenu} from "@focus4/layout";

import {ScrollspyMenuMeta} from "./metas/scrollspy-menu";

export default {
    ...ScrollspyMenuMeta,
    title: "Mise en page/ScrollspyMenu",
    args: {
        theme: {
            menu: () => undefined
        } as any,
        panels: []
    }
} as Meta<typeof ScrollspyMenu>;

export const Showcase: StoryObj<typeof ScrollspyMenu> = {
    render(props) {
        return <ScrollspyMenu {...props} />;
    }
};
