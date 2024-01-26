import {useState} from "react";

import {RadioButton, RadioGroup} from "@focus4/toolbox";

import {RadioButtonMeta} from "./metas/radio-button";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...RadioButtonMeta,
    title: "Composants/@focus4∕toolbox/RadioButton"
} as Meta<typeof RadioButton>;

export const Showcase: StoryObj<Partial<typeof RadioButton>> = {
    render(props) {
        const [value, setValue] = useState<string>();
        return (
            <RadioGroup onChange={setValue} value={value}>
                <RadioButton label="Option 1" value="Option 1" {...props} />
                <RadioButton label="Option 2" value="Option 2" {...props} />
                <RadioButton label="Option 3" value="Option 3" {...props} />
            </RadioGroup>
        );
    }
};
