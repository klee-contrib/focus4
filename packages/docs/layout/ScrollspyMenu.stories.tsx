import {ScrollspyMenu} from "@focus4/layout";

import {ScrollspyMenuMeta} from "./metas/scrollspy-menu";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...ScrollspyMenuMeta,
    title: "Mise en page/ScrollspyMenu"
} as Meta<typeof ScrollspyMenu>;

export const Showcase: StoryObj<typeof ScrollspyMenu> = {
    render(props) {
        return <ScrollspyMenu {...props} />;
    }
};
