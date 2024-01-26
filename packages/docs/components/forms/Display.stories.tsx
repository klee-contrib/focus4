import {Display} from "@focus4/forms";

import {DisplayMeta} from "./metas/display";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...DisplayMeta,
    title: "Composants/@focus4∕forms/Display",
    tags: ["autodocs"],
    args: {type: "string", value: "Valeur"}
} as Meta<typeof Display>;

export const Showcase: StoryObj<typeof Display> = {};
