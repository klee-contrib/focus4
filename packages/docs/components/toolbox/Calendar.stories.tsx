import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Calendar} from "@focus4/toolbox";

import {CalendarMeta} from "./metas/calendar";

export default {
    ...CalendarMeta,
    title: "Composants/@focus4∕toolbox/Calendar",
    tags: ["autodocs"]
} as Meta<typeof Calendar>;

export const Showcase: StoryObj<typeof Calendar> = {
    render(props) {
        const [date, setDate] = useState(new Date().toISOString());
        return <Calendar value={date} {...props} onChange={setDate} />;
    }
};
