import type {Meta, StoryObj} from "@storybook/react";

import {PanelButtons} from "@focus4/layout";

import {PanelButtonsMeta} from "./metas/panel-buttons";

export default {
    ...PanelButtonsMeta,
    title: "Mise en page/PanelButtons"
} as Meta<typeof PanelButtons>;

export const Showcase: StoryObj<typeof PanelButtons> = {};
