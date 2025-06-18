import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Switch} from "@focus4/toolbox";

import {SwitchMeta} from "./metas/switch";

export default {
    ...SwitchMeta,
    title: "Composants/@focus4∕toolbox/Switch",
    tags: ["autodocs"]
} as Meta<typeof Switch>;

export const Showcase: StoryObj<typeof Switch> = {
    render(props) {
        const [selected, setSelected] = useState(false);
        return (
            <div className="stack">
                <Switch value={selected} {...props} onChange={setSelected} />
                <Switch
                    iconOff="clear"
                    iconOn="check"
                    label="Avec des icônes"
                    value={selected}
                    {...props}
                    onChange={setSelected}
                />
            </div>
        );
    }
};
