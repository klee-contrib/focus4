import {Ripple} from "@focus4/toolbox";

import {RippleMeta} from "./metas/ripple";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...RippleMeta,
    title: "Composants/@focus4∕toolbox/Ripple"
} as Meta<typeof Ripple>;

export const Showcase: StoryObj<typeof Ripple> = {
    render(props) {
        return (
            <Ripple {...props}>
                <div style={{position: "relative", padding: 40}}>Test</div>
            </Ripple>
        );
    }
};
