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
            {key: "id", label: "Id croissant", order: true},
            {key: "id", label: "Id décroissant", order: false}
        ],
        hasSelection: true,
        operationList: [
            {
                action: () => {
                    /** */
                },
                label: "action"
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
