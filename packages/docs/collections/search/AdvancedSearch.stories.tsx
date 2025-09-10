import type {Meta, StoryObj} from "@storybook/react";

import {AdvancedSearch} from "@focus4/collections";

import {AdvancedSearchMeta} from "../metas/advanced-search";

import {collectionStore} from "./store";

export default {
    ...AdvancedSearchMeta,
    title: "Listes/Composants de recherche/AdvancedSearch",
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
} as Meta<typeof AdvancedSearch>;

export const Showcase: StoryObj<typeof AdvancedSearch<(typeof collectionStore.list)[0]>> = {
    render(props) {
        return (
            <AdvancedSearch
                {...props}
                listProps={{
                    itemKey: i => i.id,
                    LineComponent: ({data}) => (
                        <div style={{marginLeft: 40, padding: 12}}>
                            {data.label} - {data.type1} - {data.type2}
                        </div>
                    )
                }}
                paginationMode="single-manual"
                store={collectionStore}
            />
        );
    }
};
