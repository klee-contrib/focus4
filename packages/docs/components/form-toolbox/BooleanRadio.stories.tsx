import {useState} from "react";

import {BooleanRadio} from "@focus4/form-toolbox";

import {BooleanRadioMeta} from "./metas/boolean-radio";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...BooleanRadioMeta,
    title: "Composants/@focus4∕form-toolbox/BooleanRadio",
    tags: ["autodocs"],
    args: {type: "boolean"}
} as Meta<typeof BooleanRadio>;

export const Showcase: StoryObj<typeof BooleanRadio> = {
    render(props) {
        const [selected, setSelected] = useState<boolean | undefined>(false);
        return <BooleanRadio value={selected} {...props} onChange={setSelected} />;
    }
};
