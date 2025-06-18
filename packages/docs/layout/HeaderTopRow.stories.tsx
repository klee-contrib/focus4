import type {Meta, StoryObj} from "@storybook/react";

import {HeaderTopRow} from "@focus4/layout";

import {HeaderTopRowMeta} from "./metas/header-top-row";

export default {
    ...HeaderTopRowMeta,
    title: "Mise en page/HeaderTopRow"
} as Meta<typeof HeaderTopRow>;

export const Showcase: StoryObj<typeof HeaderTopRow> = {
    render(props) {
        return <HeaderTopRow {...props} />;
    }
};
