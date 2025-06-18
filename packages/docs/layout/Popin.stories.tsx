import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Content, Layout, Popin} from "@focus4/layout";
import {Button} from "@focus4/toolbox";

import {PopinMeta} from "./metas/popin";

export default {
    ...PopinMeta,
    tags: ["autodocs"],
    title: "Mise en page/Popin"
} as Meta<typeof Popin>;

export const Showcase: StoryObj<typeof Popin> = {
    render(props) {
        const [opened, setOpened] = useState(false);
        return (
            <Layout theme={{scrollable: "doc-scrollable"}}>
                <Button label="Ouvrir" onClick={() => setOpened(true)} />
                <Popin {...props} closePopin={() => setOpened(false)} opened={opened}>
                    <Content>
                        <h3>Titre</h3>
                        <p>Contenu</p>
                    </Content>
                </Popin>
            </Layout>
        );
    }
};
