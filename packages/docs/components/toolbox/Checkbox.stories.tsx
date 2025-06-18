import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Checkbox} from "@focus4/toolbox";

import {CheckboxMeta} from "./metas/checkbox";

export default {
    ...CheckboxMeta,
    title: "Composants/@focus4∕toolbox/Checkbox",
    tags: ["autodocs"]
} as Meta<typeof Checkbox>;

export const Showcase: StoryObj<typeof Checkbox> = {
    render(props) {
        const [selected, setSelected] = useState(false);
        return (
            <div className="stack">
                <Checkbox value={selected} {...props} onChange={setSelected} />
                <Checkbox indeterminate label="Non déterminé" value={selected} {...props} onChange={setSelected} />
            </div>
        );
    }
};
