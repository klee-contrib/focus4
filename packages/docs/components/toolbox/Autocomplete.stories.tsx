import {useState} from "react";

import {Autocomplete} from "@focus4/toolbox";

import {AutocompleteMeta} from "./metas/autocomplete";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteMeta,
    title: "Composants/@focus4∕toolbox/Autocomplete",
    tags: ["autodocs"],
    args: {
        values: [
            {key: "1", label: "Option 1"},
            {key: "2", label: "Option 2"}
        ]
    }
} as Meta<typeof Autocomplete>;

export const Showcase: StoryObj<typeof Autocomplete> = {
    render(props) {
        const [selected, setSelected] = useState<string>();
        const [selected2, setSelected2] = useState<string>();
        return (
            <div className="stack">
                <Autocomplete
                    icon="search"
                    trailing={{icon: "clear", tooltip: "Vider le champ", onClick: () => setSelected(undefined)}}
                    value={selected}
                    {...props}
                    onChange={setSelected}
                />

                <Autocomplete
                    allowUnmatched
                    supportingText="Cet autocomplete autorise la sélection de valeurs supplémentaires"
                    value={selected2}
                    {...props}
                    onChange={setSelected2}
                />
            </div>
        );
    }
};
