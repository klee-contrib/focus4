import {useState} from "react";

import {Dropdown} from "@focus4/toolbox";

import {DropdownMeta} from "./metas/dropdown";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...DropdownMeta,
    title: "Composants/@focus4∕toolbox/Dropdown",
    tags: ["autodocs"],
    args: {
        values: [
            {key: "1", label: "Option 1"},
            {key: "2", label: "Option 2"}
        ]
    }
} as Meta<typeof Dropdown>;

export const Showcase: StoryObj<typeof Dropdown> = {
    render(props) {
        const [selected, setSelected] = useState<string>();
        return (
            <div className="stack">
                <Dropdown value={selected} {...props} onChange={setSelected} />
                <Dropdown icon="add" value={selected} {...props} onChange={setSelected} />
                <Dropdown
                    sizing="fit-to-values"
                    trailing={{icon: "clear", tooltip: "Vider le champ", onClick: () => setSelected(undefined)}}
                    value={selected}
                    {...props}
                    onChange={setSelected}
                />
            </div>
        );
    }
};
