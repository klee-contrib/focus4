import {useState} from "react";

import {Switch} from "@focus4/toolbox";

import {SwitchMeta} from "./metas/switch";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SwitchMeta,
    title: "Composants/@focus4∕toolbox/Switch"
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
