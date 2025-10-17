import type {Meta, StoryObj} from "@storybook/react";
import {DateTime} from "luxon";
import z from "zod";

import {Display} from "@focus4/form-toolbox";

import {DisplayMeta} from "./metas/display";

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
                <Display {...props} schema={z.array(z.string())} value={["Valeur 1", "Valeur 2"]} />
                <Display
                    {...props}
                    formatter="focus.datetime"
                    schema={z.iso.datetime()}
                    value={DateTime.now().toISO()}
                />
            </div>
        );
    }
};
