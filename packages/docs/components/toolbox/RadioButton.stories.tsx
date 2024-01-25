import {RadioButton} from "@focus4/toolbox";

import {RadioButtonMeta} from "./metas/radio-button";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...RadioButtonMeta,
    title: "Composants/@focus4∕toolbox/RadioButton"
} as Meta<typeof RadioButton>;

export const Showcase: StoryObj<typeof RadioButton> = {};
