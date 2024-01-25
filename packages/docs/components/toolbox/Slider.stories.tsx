import {Slider} from "@focus4/toolbox";

import {SliderMeta} from "./metas/slider";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SliderMeta,
    title: "Composants/@focus4∕toolbox/Slider"
} as Meta<typeof Slider>;

export const Showcase: StoryObj<typeof Slider> = {};
