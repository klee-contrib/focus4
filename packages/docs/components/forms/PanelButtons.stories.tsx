import {PanelButtons} from "@focus4/forms";

import {PanelButtonsMeta} from "./metas/panel-buttons";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...PanelButtonsMeta,
    title: "Composants/@focus4∕forms/PanelButtons"
} as Meta<typeof PanelButtons>;

export const Showcase: StoryObj<typeof PanelButtons> = {};
