import type {Meta, StoryObj} from "@storybook/react";

import {Layout} from "@focus4/layout";

import {LayoutMeta} from "./metas/layout";

export default {
    ...LayoutMeta,
    title: "Mise en page/Layout"
} as Meta<typeof Layout>;

export const Showcase: StoryObj<typeof Layout> = {
    render(props) {
        return <Layout {...props} />;
    }
};
