import {Chip} from "@focus4/toolbox";

import {ChipMeta} from "./metas/chip";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...ChipMeta,
    title: "Composants/@focus4∕toolbox/Chip",
    args: {
        label: "Chip"
    }
} as Meta<typeof Chip>;

export const Showcase: StoryObj<typeof Chip> = {
    render(props) {
        return (
            <div className="container">
                <Chip {...props} onClick={undefined} onDeleteClick={undefined} />
                <Chip color="primary" {...props} onClick={undefined} />
                <Chip color="accent" elevated {...props} onDeleteClick={undefined} />
                <Chip color="light" icon="add" {...props} onDeleteClick={undefined} />
            </div>
        );
    }
};
