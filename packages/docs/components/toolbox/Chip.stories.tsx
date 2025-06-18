import type {Meta, StoryObj} from "@storybook/react";

import {Chip} from "@focus4/toolbox";

import {ChipMeta} from "./metas/chip";

export default {
    ...ChipMeta,
    title: "Composants/@focus4∕toolbox/Chip",
    tags: ["autodocs"],
    args: {
        label: "Chip"
    }
} as Meta<typeof Chip>;

export const Showcase: StoryObj<typeof Chip> = {
    render(props) {
        return (
            <div className="container">
                <Chip {...props} />
                <Chip
                    color="primary"
                    onDeleteClick={() => {
                        /* */
                    }}
                    {...props}
                />
                <Chip
                    color="accent"
                    elevated
                    onClick={() => {
                        /* */
                    }}
                    {...props}
                />
                <Chip
                    color="light"
                    icon="add"
                    onClick={() => {
                        /* */
                    }}
                    {...props}
                />
            </div>
        );
    }
};
