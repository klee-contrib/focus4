import {DateTime} from "luxon";

import {Display} from "@focus4/form-toolbox";

import {DisplayMeta} from "./metas/display";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...DisplayMeta,
    title: "Composants/@focus4∕form-toolbox/Display",
    tags: ["autodocs"],
    args: {type: "string", value: "Valeur"}
} as Meta<typeof Display>;

export const Showcase: StoryObj<typeof Display> = {
    render(props) {
        return (
            <div className="stack">
                <Display {...props} />
                <Display {...props} type="string-array" value={["Valeur 1", "Valeur 2"]} />
                <Display
                    {...props}
                    formatter={v => (v ? DateTime.fromISO(v).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) : "")}
                    type="string"
                    value={DateTime.now().toISO()}
                />
            </div>
        );
    }
};
