import {FontIcon} from "@focus4/toolbox";

import {FontIconMeta} from "./metas/font-icon";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...FontIconMeta,
    title: "Composants/@focus4∕toolbox/FontIcon",
    tags: ["autodocs"],
    args: {
        children: "lightbulb"
    }
} as Meta<typeof FontIcon>;

export const Showcase: StoryObj<typeof FontIcon> = {
    render(props) {
        return (
            <div className="stack">
                <div className="container">
                    <FontIcon {...props} />
                    <FontIcon iconClassName="material-icons-outlined" {...props} />
                    <FontIcon iconClassName="material-icons-round" {...props} />
                </div>
                <br />
                <div className="container">
                    <FontIcon iconI18nKey="focus.icons.actionBar.search" />
                </div>
            </div>
        );
    }
};
