import {TextField} from "@focus4/toolbox";

import {TextFieldMeta} from "./metas/text-field";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...TextFieldMeta,
    title: "Composants/@focus4∕toolbox/TextField",
    tags: ["autodocs"]
} as Meta<typeof TextField>;

export const Showcase: StoryObj<typeof TextField> = {
    render(props) {
        return (
            <div className="stack">
                <TextField {...props} />
                <TextField maxLength={1000} multiline rows={4} {...props} />
                <TextField hint="Montant" suffix="€" {...props} />
                <TextField icon="search" loading {...props} />
                <TextField
                    trailing={{
                        icon: "clear",
                        tooltip: "Vider le champ",
                        onClick: () => {
                            /* */
                        }
                    }}
                    {...props}
                />
                <TextField error supportingText="Erreur" {...props} />
            </div>
        );
    }
};
