import {Button} from "@focus4/toolbox";

import {ButtonMeta} from "./metas/button";

import type {Meta, StoryObj} from "@storybook/react";
export default {
    ...ButtonMeta,
    title: "Composants/@focus4∕toolbox/Button",
    args: {
        label: "Button"
    }
} as Meta<typeof Button>;

export const Showcase: StoryObj<typeof Button> = {
    render(props) {
        return (
            <div className="container">
                <Button {...props} />
                <Button color="primary" {...props} />
                <Button color="primary" variant="filled" {...props} />
                <Button color="accent" variant="outlined" {...props} />
                <Button icon="add" variant="elevated" {...props} />
                <Button color="light" icon="clear" iconPosition="right" variant="elevated-filled" {...props} />
            </div>
        );
    }
};
