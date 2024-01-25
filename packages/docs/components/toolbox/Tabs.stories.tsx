import {Tabs} from "@focus4/toolbox";

import {TabsMeta} from "./metas/tabs";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...TabsMeta,
    title: "Composants/@focus4∕toolbox/Tabs"
} as Meta<typeof Tabs>;

export const Showcase: StoryObj<typeof Tabs> = {};
