import {HeaderTopRow} from "@focus4/layout";

import {HeaderTopRowMeta} from "./metas/header-top-row";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...HeaderTopRowMeta,
    title: "Mise en page/HeaderTopRow"
} as Meta<typeof HeaderTopRow>;

export const Showcase: StoryObj<typeof HeaderTopRow> = {
    render(props) {
        return <HeaderTopRow {...props} />;
    }
};
