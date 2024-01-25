import {Dropdown} from "@focus4/toolbox";

import {DropdownMeta} from "./metas/dropdown";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...DropdownMeta,
    title: "Composants/@focus4∕toolbox/Dropdown",
    args: {
        values: [
            {key: "1", label: "Option 1"},
            {key: "2", label: "Option 2"}
        ]
    }
} as Meta<typeof Dropdown>;

export const Showcase: StoryObj<typeof Dropdown> = {};
