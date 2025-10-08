import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z from "zod";

import {SelectChips} from "@focus4/form-toolbox";
import {makeReferenceList} from "@focus4/stores";

import {SelectChipsMeta} from "./metas/select-chips";

export default {
    ...SelectChipsMeta,
    title: "Composants/@focus4∕form-toolbox/SelectChips",
    tags: ["autodocs"],
    args: {
        schema: z.array(z.string()),
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"},
            {code: "3", label: "Valeur 3"}
        ])
    }
} as Meta<typeof SelectChips>;

export const Showcase: StoryObj<typeof SelectChips<z.ZodArray<z.ZodString>>> = {
    render(props) {
        const [value, setValue] = useState<string[]>();
        return <SelectChips {...props} onChange={setValue} value={value} />;
    }
};
