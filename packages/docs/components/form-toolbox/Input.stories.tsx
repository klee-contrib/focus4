import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z from "zod";

import {Input} from "@focus4/form-toolbox";

import {InputMeta} from "./metas/input";

export default {
    ...InputMeta,
    title: "Composants/@focus4∕form-toolbox/Input",
    tags: ["autodocs"],
    args: {
        hasThousandsSeparator: true,
        maxDecimals: 2,
        noNegativeNumbers: true
    }
} as Meta<typeof Input>;

export const Showcase: StoryObj<Partial<typeof Input>> = {
    render(props) {
        const [v1, setV1] = useState<string | undefined>();
        const [v2, setV2] = useState<number | undefined>(1234.45);
        return (
            <div className="stack">
                <Input
                    {...props}
                    hint="1111-1111-1111-1111"
                    mask={{pattern: "1111-1111-1111-1111"}}
                    onChange={setV1}
                    schema={z.string()}
                    value={v1}
                />
                <Input {...props} onChange={setV2} schema={z.number()} value={v2} supportingText={v2?.toString()} />
            </div>
        );
    }
};
