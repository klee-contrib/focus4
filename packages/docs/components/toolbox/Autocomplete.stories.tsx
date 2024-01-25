import {Autocomplete} from "@focus4/toolbox";

import {AutocompleteMeta} from "./metas/autocomplete";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteMeta,
    title: "Composants/@focus4∕toolbox/Autocomplete",
    args: {
        values: [
            {key: "1", label: "Option 1"},
            {key: "2", label: "Option 2"}
        ]
    }
} as Meta<typeof Autocomplete>;

export const Showcase: StoryObj<typeof Autocomplete> = {};
