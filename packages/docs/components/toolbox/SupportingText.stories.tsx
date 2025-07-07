import type {Meta, StoryObj} from "@storybook/react";

import {SupportingText} from "@focus4/toolbox";

import {SupportingTextMeta} from "./metas/supporting-text";

export default {
    ...SupportingTextMeta,
    tags: ["autodocs"],
    title: "Composants/@focus4∕toolbox/SupportingText",
    args: {supportingText: "Ceci est un text de support", length: 1, maxLength: 12}
} as Meta<typeof SupportingText>;

export const Showcase: StoryObj<typeof SupportingText> = {};
