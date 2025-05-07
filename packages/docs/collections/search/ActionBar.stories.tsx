import {ActionBar, listFor} from "@focus4/collections";

import {ActionBarMeta} from "../metas/action-bar";

import {collectionStore} from "./store";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...ActionBarMeta,
    title: "Listes/Composants de recherche/ActionBar",
    args: {
        hasSearchBar: true,
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
        ],
        hasSelection: true,
        operationList: [
            {
                action: () => {
                    /** */
                },
                label: "action 2"
            },
            {
                action: () => {
                    /** */
                },
                label: "action 1",
                showIfNoData: true
            }
        ]
    },
    tags: ["autodocs"]
} as Meta<typeof ActionBar>;

export const Showcase: StoryObj<typeof ActionBar> = {
    render(props) {
        return (
            <>
                <ActionBar {...props} store={collectionStore} />
                {listFor({
                    store: collectionStore,
                    hasSelection: props.hasSelection,
                    itemKey: i => i.id,
                    LineComponent: ({data}) => (
                        <div style={{marginLeft: 40, padding: 12}}>
                            {data.label} - {data.type1} - {data.type2}
                        </div>
                    )
                })}
            </>
        );
    }
};
