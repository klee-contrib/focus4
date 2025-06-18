import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Autocomplete} from "@focus4/toolbox";

import {AutocompleteMeta} from "./metas/autocomplete";

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
        const [query, setQuery] = useState("");
        return (
            <div className="stack">
                <Autocomplete
                    icon="search"
                    trailing={{icon: "clear", tooltip: "Vider le champ", onClick: () => setSelected(undefined)}}
                    {...props}
                    onChange={setSelected}
                    value={selected}
                />

                <Autocomplete
                    allowUnmatched
                    supportingText="Cet autocomplete est utilisé pour fournir des suggestions."
                    {...props}
                    onChange={setSelected2}
                    onQueryChange={setQuery}
                    query={query}
                    value={selected2}
                />
            </div>
        );
    }
};
