import type {Meta, StoryObj} from "@storybook/react";

import {CircularProgressIndicator} from "@focus4/toolbox";

import {CircularProgressIndicatorMeta} from "./metas/circular-progress-indicator";

export default {
    ...CircularProgressIndicatorMeta,
    title: "Composants/@focus4∕toolbox/CircularProgressIndicator",
    tags: ["autodocs"],
    args: {
        value: 55
    }
} as Meta<typeof CircularProgressIndicator>;

export const Showcase: StoryObj<typeof CircularProgressIndicator> = {
    render(props) {
        return (
            <div className="stack">
                <CircularProgressIndicator {...props} />
                <CircularProgressIndicator {...props} indeterminate />
            </div>
        );
    }
};
