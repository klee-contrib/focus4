import {SearchBar} from "@focus4/collections";

import {SearchBarMeta} from "../metas/search-bar";

import {collectionStore} from "./store";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SearchBarMeta,
    title: "Listes/Composants de recherche/SearchBar",
    tags: ["autodocs"]
} as Meta<typeof SearchBar>;

export const Showcase: StoryObj<typeof SearchBar> = {
    render(props) {
        return <SearchBar {...props} store={collectionStore} />;
    }
};
