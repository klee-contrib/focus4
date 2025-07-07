import type {Meta, StoryObj} from "@storybook/react";

import {FormCheckbox} from "@focus4/form-toolbox";

import {FormCheckboxMeta} from "./metas/form-checkbox";

export default {
    ...FormCheckboxMeta,
    title: "Composants/@focus4∕form-toolbox/FormCheckbox",
    tags: ["autodocs"],
    args: {error: "Cette checkbox est en erreur"}
} as Meta<typeof FormCheckbox>;

export const Showcase: StoryObj<typeof FormCheckbox> = {};
