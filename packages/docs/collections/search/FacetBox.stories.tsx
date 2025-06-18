import type {Meta, StoryObj} from "@storybook/react";

import {FacetBox} from "@focus4/collections";

import {FacetBoxMeta} from "../metas/facet-box";

import {collectionStore} from "./store";

export default {
    ...FacetBoxMeta,
    title: "Listes/Composants de recherche/FacetBox",
    tags: ["autodocs"]
} as Meta<typeof FacetBox>;

export const Showcase: StoryObj<typeof FacetBox> = {
    render(props) {
        return <FacetBox {...props} store={collectionStore} />;
    }
};
