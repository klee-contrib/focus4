import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z from "zod";

import {SelectCheckbox} from "@focus4/form-toolbox";
import {makeReferenceList} from "@focus4/stores";

import {SelectCheckboxMeta} from "./metas/select-checkbox";

export default {
    ...SelectCheckboxMeta,
    title: "Composants/@focus4∕form-toolbox/SelectCheckbox",
    tags: ["autodocs"],
    args: {
        schema: z.array(z.int()),
        values: makeReferenceList([
            {code: 1, label: "Valeur 1"},
            {code: 2, label: "Valeur 2"},
            {code: 3, label: "Valeur 3"}
        ])
    }
} as Meta<typeof SelectCheckbox>;

export const Showcase: StoryObj<typeof SelectCheckbox<z.ZodArray<z.ZodInt>>> = {
    render(props) {
        const [value, setValue] = useState<number[]>();
        return <SelectCheckbox {...props} onChange={setValue} value={value} />;
    }
};
