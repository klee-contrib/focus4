import type {Meta, StoryObj} from "@storybook/react";
import {DateTime} from "luxon";
import {useState} from "react";
import z from "zod";

import {InputDate} from "@focus4/form-toolbox";

import {InputDateMeta} from "./metas/input-date";

export default {
    ...InputDateMeta,
    title: "Composants/@focus4∕form-toolbox/InputDate",
    tags: ["autodocs"]
} as Meta<typeof InputDate>;

export const Showcase: StoryObj<typeof InputDate> = {
    render(props) {
        const [date, setDate] = useState<string | undefined>(DateTime.utc().toISODate());
        return <InputDate {...props} onChange={setDate} schema={z.iso.date()} value={date} />;
    }
};
