import {Input} from "@focus4/forms";

import {InputMeta} from "./metas/input";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...InputMeta,
    title: "Composants/@focus4∕forms/Input",
    tags: ["autodocs"],
    args: {type: "string"}
} as Meta<typeof Input>;

export const Showcase: StoryObj<typeof Input> = {};
