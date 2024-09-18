import {Summary} from "@focus4/collections";

import {SummaryMeta} from "../metas/summary";

import {collectionStore} from "./store";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SummaryMeta,
    title: "Listes/Composants de recherche/Summary",
    args: {
        orderableColumnList: [
            {key: "id", label: "Id croissant", order: true},
            {key: "id", label: "Id décroissant", order: false}
        ]
    },
    tags: ["autodocs"]
} as Meta<typeof Summary>;

export const Showcase: StoryObj<typeof Summary> = {
    render(props) {
        return <Summary {...props} store={collectionStore} />;
    }
};
