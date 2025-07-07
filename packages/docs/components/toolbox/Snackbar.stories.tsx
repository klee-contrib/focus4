import type {Meta, StoryObj} from "@storybook/react";

import {Snackbar} from "@focus4/toolbox";

import {SnackbarMeta} from "./metas/snackbar";

export default {
    ...SnackbarMeta,
    title: "Composants/@focus4∕toolbox/Snackbar",
    tags: ["autodocs"],
    args: {
        active: true,
        message: "Salut",
        close: () => {
            /* */
        },
        action: {
            label: "Action",
            onClick: () => {
                /** */
            }
        }
    }
} as Meta<typeof Snackbar>;

export const Showcase: StoryObj<typeof Snackbar> = {};
