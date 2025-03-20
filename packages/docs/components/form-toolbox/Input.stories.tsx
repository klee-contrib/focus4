import {useState} from "react";

import {Input} from "@focus4/form-toolbox";

import {InputMeta} from "./metas/input";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...InputMeta,
    title: "Composants/@focus4∕form-toolbox/Input",
    tags: ["autodocs"]
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
                    type="string"
                    value={v1}
                />
                <Input
                    {...props}
                    hasThousandsSeparator
                    maxDecimals={2}
                    noNegativeNumbers
                    onChange={setV2}
                    type="number"
                    value={v2}
                    supportingText={v2?.toString()}
                />
            </div>
        );
    }
};
