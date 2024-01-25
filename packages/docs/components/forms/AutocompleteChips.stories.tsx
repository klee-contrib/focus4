import {AutocompleteChips} from "@focus4/forms";

import {AutocompleteChipsMeta} from "./metas/autocomplete-chips";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteChipsMeta,
    title: "Composants/@focus4∕forms/AutocompleteChips",
    args: {type: "string"}
} as Meta<typeof AutocompleteChips>;

export const Showcase: StoryObj<typeof AutocompleteChips> = {};
