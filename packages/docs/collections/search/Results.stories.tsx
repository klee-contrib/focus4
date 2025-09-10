import type {Meta, StoryObj} from "@storybook/react";

import {Results} from "@focus4/collections";

import {ResultsMeta} from "../metas/results";

import {collectionStore} from "./store";

export default {
    ...ResultsMeta,
    title: "Listes/Composants de recherche/Results",
    args: {hasSelection: true},
    tags: ["autodocs"]
} as Meta<typeof Results>;

collectionStore.groupingKey = "type1";

export const Showcase: StoryObj<typeof Results<(typeof collectionStore.list)[0]>> = {
    render(props) {
        return (
            <Results
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
