import {Scrollable} from "@focus4/layout";

import {ScrollableMeta} from "./metas/scrollable";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...ScrollableMeta,
    title: "Mise en page/Scrollable"
} as Meta<typeof Scrollable>;

export const Showcase: StoryObj<typeof Scrollable> = {
    render(props) {
        return <Scrollable {...props} />;
    }
};
