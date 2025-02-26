import {useState} from "react";

import {AutocompleteSearch} from "@focus4/form-toolbox";

import {searchAdresse} from "./adresse";
import {AutocompleteSearchMeta} from "./metas/autocomplete-search";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AutocompleteSearchMeta,
    title: "Composants/@focus4∕form-toolbox/AutocompleteSearch",
    tags: ["autodocs"]
} as Meta<typeof AutocompleteSearch>;

export const Showcase: StoryObj<typeof AutocompleteSearch> = {
    render(props) {
        const [value, setValue] = useState<string>();
        return (
            <AutocompleteSearch
                {...props}
                icon="place"
                onChange={setValue}
                querySearcher={searchAdresse}
                supportingText={value ? `Code sélectionné : ${value}` : undefined}
                type="string"
                value={value}
            />
        );
    }
};
