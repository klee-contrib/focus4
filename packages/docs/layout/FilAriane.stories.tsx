import type {Meta, StoryObj} from "@storybook/react";

import {FilAriane} from "@focus4/layout";

import {FilArianeMeta} from "./metas/fil-ariane";

export default {
    ...FilArianeMeta,
    tags: ["autodocs"],
    title: "Mise en page/FilAriane"
} as Meta<typeof FilAriane>;

const router = {
    get() {
        return "utilisateurs";
    },
    href() {
        return "#/";
    },
    sub() {
        return {
            get() {
                return "utiId";
            },
            href() {
                return window.location.href;
            },
            sub() {
                return {
                    get() {
                        return undefined;
                    }
                };
            },
            state: {
                utiId: 1
            }
        };
    },
    state: {
        utilisateurs: {}
    }
} as any;

export const Showcase: StoryObj<typeof FilAriane> = {
    render(props) {
        return <FilAriane {...props} router={router} />;
    }
};
