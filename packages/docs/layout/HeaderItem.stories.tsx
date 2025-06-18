import type {Meta, StoryObj} from "@storybook/react";

import {HeaderItem} from "@focus4/layout";

import {HeaderItemMeta} from "./metas/header-item";

export default {
    ...HeaderItemMeta,
    title: "Mise en page/HeaderItem"
} as Meta<typeof HeaderItem>;

export const Showcase: StoryObj<typeof HeaderItem> = {
    render(props) {
        return <HeaderItem {...props} />;
    }
};
