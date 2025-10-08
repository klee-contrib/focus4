import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z, {ZodNumber} from "zod";

import {SelectRadio} from "@focus4/form-toolbox";
import {makeReferenceList} from "@focus4/stores";

import {SelectRadioMeta} from "./metas/select-radio";

export default {
    ...SelectRadioMeta,
    title: "Composants/@focus4∕form-toolbox/SelectRadio",
    tags: ["autodocs"],
    args: {
        schema: z.number(),
        values: makeReferenceList([
            {code: 1, label: "Valeur 1"},
            {code: 2, label: "Valeur 2"}
        ])
    }
} as Meta<typeof SelectRadio>;

export const Showcase: StoryObj<typeof SelectRadio<ZodNumber>> = {
    render(props) {
        const [value, setValue] = useState<number>();
        return <SelectRadio {...props} onChange={setValue} value={value} />;
    }
};
