import {BooleanRadio} from "@focus4/forms";

import {BooleanRadioMeta} from "./metas/boolean-radio";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...BooleanRadioMeta,
    title: "Composants/@focus4∕forms/BooleanRadio",
    args: {type: "boolean"}
} as Meta<typeof BooleanRadio>;

export const Showcase: StoryObj<typeof BooleanRadio> = {};
