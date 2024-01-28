import {useState} from "react";

import {InputDate} from "@focus4/forms";

import {InputDateMeta} from "./metas/input-date";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...InputDateMeta,
    title: "Composants/@focus4∕forms/InputDate",
    tags: ["autodocs"],
    args: {type: "string", inputFormat: "dd/MM/yyyy"}
} as Meta<typeof InputDate>;

export const Showcase: StoryObj<typeof InputDate> = {
    render(props) {
        const [date, setDate] = useState<string | undefined>(new Date().toISOString());
        return <InputDate {...props} onChange={setDate} value={date} />;
    }
};
