import {CircularProgressIndicator} from "@focus4/toolbox";

import {CircularProgressIndicatorMeta} from "./metas/circular-progress-indicator";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...CircularProgressIndicatorMeta,
    title: "Composants/@focus4∕toolbox/CircularProgressIndicator",
    args: {
        indeterminate: true
    }
} as Meta<typeof CircularProgressIndicator>;

export const Showcase: StoryObj<typeof CircularProgressIndicator> = {};
