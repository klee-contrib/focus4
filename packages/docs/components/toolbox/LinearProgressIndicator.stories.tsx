import {LinearProgressIndicator} from "@focus4/toolbox";

import {LinearProgressIndicatorMeta} from "./metas/linear-progress-indicator";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...LinearProgressIndicatorMeta,
    title: "Composants/@focus4∕toolbox/LinearProgressIndicator",
    args: {indeterminate: true}
} as Meta<typeof LinearProgressIndicator>;

export const Showcase: StoryObj<typeof LinearProgressIndicator> = {};
