import type {Meta, StoryObj} from "@storybook/react";

import {Content} from "@focus4/layout";

import {ContentMeta} from "./metas/content";

export default {
    ...ContentMeta,
    title: "Mise en page/Content"
} as Meta<typeof Content>;

export const Showcase: StoryObj<typeof Content> = {
    render(props) {
        return <Content {...props} />;
    }
};
