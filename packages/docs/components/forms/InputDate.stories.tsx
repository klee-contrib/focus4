import {InputDate} from "@focus4/forms";

import {InputDateMeta} from "./metas/input-date";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...InputDateMeta,
    title: "Composants/@focus4∕forms/InputDate",
    tags: ["autodocs"],
    args: {type: "string"}
} as Meta<typeof InputDate>;

export const Showcase: StoryObj<typeof InputDate> = {};
