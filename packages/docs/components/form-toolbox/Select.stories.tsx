import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z from "zod";

import {Select} from "@focus4/form-toolbox";
import {makeReferenceList} from "@focus4/stores";

import {SelectMeta} from "./metas/select";

export default {
    ...SelectMeta,
    title: "Composants/@focus4∕form-toolbox/Select",
    tags: ["autodocs"],
    args: {
        schema: z.string(),
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"}
        ])
    }
} as Meta<typeof Select>;

export const Showcase: StoryObj<typeof Select<z.ZodString>> = {
    render(props) {
        const [value, setValue] = useState<string>();
        return <Select {...props} onChange={setValue} value={value} />;
    }
};
