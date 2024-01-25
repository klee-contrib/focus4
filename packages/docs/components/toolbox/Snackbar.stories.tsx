import {Snackbar} from "@focus4/toolbox";

import {SnackbarMeta} from "./metas/snackbar";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SnackbarMeta,
    title: "Composants/@focus4∕toolbox/Snackbar",
    args: {active: true, message: "Salut"}
} as Meta<typeof Snackbar>;

export const Showcase: StoryObj<typeof Snackbar> = {};
