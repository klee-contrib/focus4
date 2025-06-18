import type {Meta, StoryObj} from "@storybook/react";

import {Summary} from "@focus4/collections";

import {SummaryMeta} from "../metas/summary";

import {collectionStore} from "./store";

export default {
    ...SummaryMeta,
    title: "Listes/Composants de recherche/Summary",
    args: {
        orderableColumnList: [
            {label: "Id croissant", sort: [{fieldName: "id", sortDesc: false}]},
            {label: "Id décroissant", sort: [{fieldName: "id", sortDesc: true}]},
            {
                label: "Type 1 croissant, Type 2 croissant",
                sort: [
                    {fieldName: "type1", sortDesc: false},
                    {fieldName: "type2", sortDesc: false}
                ]
            },
            {
                label: "Type 1 croissant, Type 2 décroissant",
                sort: [
                    {fieldName: "type1", sortDesc: false},
                    {fieldName: "type2", sortDesc: true}
                ]
            },
            {
                label: "Type 1 décroissant, Type 2 croissant",
                sort: [
                    {fieldName: "type1", sortDesc: true},
                    {fieldName: "type2", sortDesc: false}
                ]
            },
            {
                label: "Type 1 décroissant, Type 2 décroissant",
                sort: [
                    {fieldName: "type1", sortDesc: true},
                    {fieldName: "type2", sortDesc: true}
                ]
            }
        ]
    },
    tags: ["autodocs"]
} as Meta<typeof Summary>;

export const Showcase: StoryObj<typeof Summary> = {
    render(props) {
        return <Summary {...props} store={collectionStore} />;
    }
};
