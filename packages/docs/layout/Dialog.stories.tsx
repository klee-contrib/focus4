import {useState} from "storybook/internal/preview-api";

import {Dialog, Layout} from "@focus4/layout";
import {Button} from "@focus4/toolbox";

import {DialogMeta} from "./metas/dialog";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...DialogMeta,
    tags: ["autodocs"],
    title: "Mise en page/Dialog",
    args: {
        title: "Titre",
        children: <p>Contenu</p>
    }
} as Meta<typeof Dialog>;

export const Showcase: StoryObj<typeof Dialog> = {
    render(props) {
        const [active, setActive] = useState(false);
        return (
            <Layout theme={{scrollable: "doc-scrollable"}}>
                <Button label="Ouvrir" onClick={() => setActive(true)} />
                <Dialog
                    {...props}
                    actions={[
                        {onClick: () => setActive(false), color: "primary", variant: "filled", label: "Confirmer"},
                        {onClick: () => setActive(false), label: "Annuler"}
                    ]}
                    active={active}
                    onOverlayClick={() => setActive(false)}
                />
            </Layout>
        );
    }
};
