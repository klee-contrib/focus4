import {useState} from "react";

import {Panel} from "@focus4/forms";

import {PanelMeta} from "./metas/panel";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...PanelMeta,
    title: "Composants/@focus4∕forms/Panel",
    args: {
        title: "Titre",
        children: "Contenu du Panel"
    }
} as Meta<typeof Panel>;

export const Showcase: StoryObj<typeof Panel> = {
    render(props) {
        const [editing, setEditing] = useState(false);
        return (
            <Panel
                {...props}
                editing={editing}
                onClickCancel={() => setEditing(false)}
                onClickEdit={() => setEditing(true)}
                save={() => setEditing(false)}
            />
        );
    }
};
