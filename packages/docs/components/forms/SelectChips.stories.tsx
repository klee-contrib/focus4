import {SelectChips} from "@focus4/forms";
import {makeReferenceList} from "@focus4/stores";

import {SelectChipsMeta} from "./metas/select-chips";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SelectChipsMeta,
    title: "Composants/@focus4∕forms/SelectChips",
    args: {
        type: "string-array",
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"}
        ])
    }
} as Meta<typeof SelectChips>;

export const Showcase: StoryObj<typeof SelectChips> = {};
