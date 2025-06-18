import type {Meta, StoryObj} from "@storybook/react";

import {MenuItem} from "@focus4/toolbox";

import {MenuItemMeta} from "./metas/menu-item";

export default {
    ...MenuItemMeta,
    title: "Composants/@focus4∕toolbox/MenuItem"
} as Meta<typeof MenuItem>;

export const Showcase: StoryObj<typeof MenuItem> = {};
