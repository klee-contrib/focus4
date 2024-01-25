import {Panel} from "@focus4/forms";

import {PanelMeta} from "./metas/panel";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...PanelMeta,
    title: "Composants/@focus4∕forms/Panel"
} as Meta<typeof Panel>;

export const Showcase: StoryObj<typeof Panel> = {};
