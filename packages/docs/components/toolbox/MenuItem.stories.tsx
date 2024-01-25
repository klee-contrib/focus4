import {MenuItem} from "@focus4/toolbox";

import {MenuItemMeta} from "./metas/menu-item";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...MenuItemMeta,
    title: "Composants/@focus4∕toolbox/MenuItem",
    args: {caption: "Action"}
} as Meta<typeof MenuItem>;

export const Showcase: StoryObj<typeof MenuItem> = {};
