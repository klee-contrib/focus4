import type {Meta, StoryObj} from "@storybook/react";

import {FormSwitch} from "@focus4/form-toolbox";

import {FormSwitchMeta} from "./metas/form-switch";

export default {
    ...FormSwitchMeta,
    title: "Composants/@focus4∕form-toolbox/FormSwitch",
    tags: ["autodocs"],
    args: {error: "Ce Switch est en erreur"}
} as Meta<typeof FormSwitch>;

export const Showcase: StoryObj<typeof FormSwitch> = {};
