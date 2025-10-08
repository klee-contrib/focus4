import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import z from "zod";

import {AutocompleteChips} from "@focus4/form-toolbox";

import {searchAdresse} from "./adresse";
import {AutocompleteChipsMeta} from "./metas/autocomplete-chips";

export default {
    ...AutocompleteChipsMeta,
    title: "Composants/@focus4∕form-toolbox/AutocompleteChips",
    tags: ["autodocs"]
} as Meta<typeof AutocompleteChips>;

export const Showcase: StoryObj<typeof AutocompleteChips<z.ZodArray<z.ZodString>>> = {
    render(props) {
        const [value, setValue] = useState<string[] | undefined>([]);
        return (
            <AutocompleteChips
                {...props}
                icon="place"
                keyResolver={async x => x}
                onChange={setValue}
                querySearcher={searchAdresse}
                schema={z.array(z.string())}
                value={value}
            />
        );
    }
};
