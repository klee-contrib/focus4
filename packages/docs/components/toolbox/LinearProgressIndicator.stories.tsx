import type {Meta, StoryObj} from "@storybook/react";

import {LinearProgressIndicator} from "@focus4/toolbox";

import {LinearProgressIndicatorMeta} from "./metas/linear-progress-indicator";

export default {
    ...LinearProgressIndicatorMeta,
    title: "Composants/@focus4∕toolbox/LinearProgressIndicator",
    tags: ["autodocs"],
    args: {
        value: 55
    }
} as Meta<typeof LinearProgressIndicator>;

export const Showcase: StoryObj<typeof LinearProgressIndicator> = {
    render(props) {
        return (
            <div className="stack">
                <LinearProgressIndicator {...props} />
                <LinearProgressIndicator {...props} indeterminate />
            </div>
        );
    }
};
