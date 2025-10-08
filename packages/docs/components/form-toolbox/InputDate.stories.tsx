import type {Meta, StoryObj} from "@storybook/react";
import {DateTime} from "luxon";
import {useState} from "react";

import {InputDate} from "@focus4/form-toolbox";

import {InputDateMeta} from "./metas/input-date";

export default {
    ...InputDateMeta,
    title: "Composants/@focus4∕form-toolbox/InputDate",
    tags: ["autodocs"],
    args: {inputFormat: "dd/MM/yyyy"}
} as Meta<typeof InputDate>;

export const Showcase: StoryObj<typeof InputDate> = {
    render(props) {
        const [date, setDate] = useState<string | undefined>(
            DateTime.utc().startOf("second").toISO({suppressMilliseconds: true})
        );
        return <InputDate {...props} onChange={setDate} value={date} />;
    }
};
