import {HeaderActions} from "@focus4/layout";

import {HeaderActionsMeta} from "./metas/header-actions";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...HeaderActionsMeta,
    title: "Mise en page/HeaderActions"
} as Meta<typeof HeaderActions>;

export const Showcase: StoryObj<typeof HeaderActions> = {
    render(props) {
        return <HeaderActions {...props} />;
    }
};
