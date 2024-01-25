import {Tab} from "@focus4/toolbox";

import {TabMeta} from "./metas/tab";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...TabMeta,
    title: "Composants/@focus4∕toolbox/Tab",
    args: {label: "Onglet"}
} as Meta<typeof Tab>;

export const Showcase: StoryObj<typeof Tab> = {};
