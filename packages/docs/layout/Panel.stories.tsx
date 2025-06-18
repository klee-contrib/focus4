import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Panel} from "@focus4/layout";

import {PanelMeta} from "./metas/panel";

export default {
    ...PanelMeta,
    title: "Mise en page/Panel",
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
