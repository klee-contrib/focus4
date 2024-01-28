import {useState} from "react";

import {AutocompleteChips} from "@focus4/forms";

import {searchAdresse} from "./adresse";
import {AutocompleteChipsMeta} from "./metas/autocomplete-chips";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteChipsMeta,
    title: "Composants/@focus4∕forms/AutocompleteChips",
    tags: ["autodocs"]
} as Meta<typeof AutocompleteChips>;

export const Showcase: StoryObj<typeof AutocompleteChips> = {
    render(props) {
        const [value, setValue] = useState<string[]>([]);
        return (
            <AutocompleteChips
                {...props}
                icon="place"
                keyResolver={async x => x}
                onChange={setValue}
                querySearcher={searchAdresse}
                type="string-array"
                value={value}
            />
        );
    }
};
