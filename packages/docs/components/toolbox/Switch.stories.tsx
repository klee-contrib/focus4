import {Switch} from "@focus4/toolbox";

import {SwitchMeta} from "./metas/switch";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SwitchMeta,
    title: "Composants/@focus4∕toolbox/Switch"
} as Meta<typeof Switch>;

export const Showcase: StoryObj<typeof Switch> = {};
