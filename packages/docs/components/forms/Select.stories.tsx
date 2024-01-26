import {Select} from "@focus4/forms";
import {makeReferenceList} from "@focus4/stores";

import {SelectMeta} from "./metas/select";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SelectMeta,
    title: "Composants/@focus4∕forms/Select",
    tags: ["autodocs"],
    args: {
        type: "string",
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"}
        ])
    }
} as Meta<typeof Select>;

export const Showcase: StoryObj<typeof Select> = {};
