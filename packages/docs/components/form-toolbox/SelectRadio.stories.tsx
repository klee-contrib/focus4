import {useState} from "react";

import {SelectRadio} from "@focus4/form-toolbox";
import {makeReferenceList} from "@focus4/stores";

import {SelectRadioMeta} from "./metas/select-radio";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SelectRadioMeta,
    title: "Composants/@focus4∕form-toolbox/SelectRadio",
    tags: ["autodocs"],
    args: {
        type: "string",
        values: makeReferenceList([
            {code: 1, label: "Valeur 1"},
            {code: 2, label: "Valeur 2"}
        ])
    }
} as Meta<typeof SelectRadio>;

export const Showcase: StoryObj<typeof SelectRadio<"number">> = {
    render(props) {
        const [value, setValue] = useState<number>();
        return <SelectRadio {...props} onChange={setValue} value={value} />;
    }
};
