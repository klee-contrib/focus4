import {Tooltip} from "@focus4/toolbox";

import {TooltipMeta} from "./metas/tooltip";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...TooltipMeta,
    title: "Composants/@focus4∕toolbox/Tooltip",
    tags: ["autodocs"],
    args: {tooltip: "Tooltip"}
} as Meta<typeof Tooltip>;

export const Showcase: StoryObj<typeof Tooltip> = {
    render(props) {
        return (
            <div className="container">
                <Tooltip {...props}>
                    <div>Test</div>
                </Tooltip>
            </div>
        );
    }
};
