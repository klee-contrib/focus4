import {Layout} from "@focus4/layout";

import {LayoutMeta} from "./metas/layout";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...LayoutMeta,
    title: "Mise en page/Layout"
} as Meta<typeof Layout>;

export const Showcase: StoryObj<typeof Layout> = {
    render(props) {
        return <Layout {...props} />;
    }
};
