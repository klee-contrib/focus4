import {SelectAutocomplete} from "@focus4/forms";
import {makeReferenceList} from "@focus4/stores";

import {SelectAutocompleteMeta} from "./metas/select-autocomplete";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SelectAutocompleteMeta,
    title: "Composants/@focus4∕forms/SelectAutocomplete",
    tags: ["autodocs"],
    args: {
        type: "string-array",
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"}
        ])
    }
} as Meta<typeof SelectAutocomplete>;

export const Showcase: StoryObj<typeof SelectAutocomplete> = {};
