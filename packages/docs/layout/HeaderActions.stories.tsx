import type {Meta, StoryObj} from "@storybook/react";

import {HeaderActions} from "@focus4/layout";

import {HeaderActionsMeta} from "./metas/header-actions";

export default {
    ...HeaderActionsMeta,
    title: "Mise en page/HeaderActions"
} as Meta<typeof HeaderActions>;

export const Showcase: StoryObj<typeof HeaderActions> = {
    render(props) {
        return <HeaderActions {...props} />;
    }
};
