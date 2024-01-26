import {IconButton} from "@focus4/toolbox";

import {IconButtonMeta} from "./metas/icon-button";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...IconButtonMeta,
    title: "Composants/@focus4∕toolbox/IconButton",
    tags: ["autodocs"],
    args: {
        icon: "add"
    }
} as Meta<typeof IconButton>;

export const Showcase: StoryObj<typeof IconButton> = {
    render(props) {
        return (
            <div className="container">
                <IconButton {...props} />
                <IconButton color="primary" {...props} />
                <IconButton color="primary" variant="filled" {...props} />
                <IconButton color="accent" variant="outlined" {...props} />
                <IconButton color="light" variant="filled" {...props} />
            </div>
        );
    }
};
