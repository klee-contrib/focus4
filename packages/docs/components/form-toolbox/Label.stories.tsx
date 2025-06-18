import type {Meta, StoryObj} from "@storybook/react";

import {Label} from "@focus4/form-toolbox";

import {LabelMeta} from "./metas/label";

export default {
    ...LabelMeta,
    title: "Composants/@focus4∕form-toolbox/Label",
    tags: ["autodocs"],
    args: {label: "Label", showTooltip: true, comment: "Une tooltip"}
} as Meta<typeof Label>;

export const Showcase: StoryObj<typeof Label> = {};
