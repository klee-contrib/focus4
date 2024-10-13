import {HeaderContent} from "@focus4/layout";

import {HeaderContentMeta} from "./metas/header-content";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...HeaderContentMeta,
    title: "Mise en page/HeaderContent"
} as Meta<typeof HeaderContent>;

export const Showcase: StoryObj<typeof HeaderContent> = {
    render(props) {
        return <HeaderContent {...props} />;
    }
};
