import {FontIcon} from "@focus4/toolbox";

import {FontIconMeta} from "./metas/font-icon";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...FontIconMeta,
    title: "Composants/@focus4∕toolbox/FontIcon",
    args: {children: "add"}
} as Meta<typeof FontIcon>;

export const Showcase: StoryObj<typeof FontIcon> = {};
