import {AutocompleteSearch} from "@focus4/forms";

import {AutocompleteSearchMeta} from "./metas/autocomplete-search";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteSearchMeta,
    title: "Composants/@focus4∕forms/AutocompleteSearch",
    args: {type: "string"}
} as Meta<typeof AutocompleteSearch>;

export const Showcase: StoryObj<typeof AutocompleteSearch> = {};
