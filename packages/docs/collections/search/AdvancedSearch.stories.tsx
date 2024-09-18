import {AdvancedSearch} from "@focus4/collections";

import {AdvancedSearchMeta} from "../metas/advanced-search";

import {collectionStore} from "./store";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...AdvancedSearchMeta,
    title: "Listes/Composants de recherche/AdvancedSearch",
    args: {
        orderableColumnList: [
            {key: "id", label: "Id croissant", order: true},
            {key: "id", label: "Id décroissant", order: false}
        ]
    },
    tags: ["autodocs"]
} as Meta<typeof AdvancedSearch>;

export const Showcase: StoryObj<typeof AdvancedSearch<(typeof collectionStore.list)[0]>> = {
    render(props) {
        return (
            <AdvancedSearch
                {...props}
                isManualFetch
                listProps={{
                    itemKey: i => i.id,
                    LineComponent: ({data}) => (
                        <div style={{marginLeft: 40, padding: 12}}>
                            {data.label} - {data.type1} - {data.type2}
                        </div>
                    )
                }}
                store={collectionStore}
            />
        );
    }
};
