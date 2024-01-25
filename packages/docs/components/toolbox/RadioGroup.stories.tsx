import {RadioGroup} from "@focus4/toolbox";

import {RadioGroupMeta} from "./metas/radio-group";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...RadioGroupMeta,
    title: "Composants/@focus4∕toolbox/RadioGroup"
} as Meta<typeof RadioGroup>;

export const Showcase: StoryObj<typeof RadioGroup> = {};
