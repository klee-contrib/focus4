import type {Meta, StoryObj} from "@storybook/react";

import {Layout, Panel, ScrollspyContainer} from "@focus4/layout";
import {TextField} from "@focus4/toolbox";

import {ScrollspyContainerMeta} from "./metas/scrollspy-container";

export default {
    ...ScrollspyContainerMeta,
    title: "Mise en page/ScrollspyContainer"
} as Meta<typeof ScrollspyContainer>;

export const Showcase: StoryObj<typeof ScrollspyContainer> = {
    render(props) {
        return (
            <Layout theme={{scrollable: "doc-scrollable"}}>
                <ScrollspyContainer {...props}>
                    <Panel title="1 Panel" icon="home">
                        <p>Contenu 1</p>
                    </Panel>
                    <Panel title="2 Panel" icon="settings">
                        <p>Contenu 2</p>
                        <TextField />
                    </Panel>
                    <Panel title="3 Panel">
                        <p>Contenu 3</p>
                    </Panel>
                    <Panel title="4 Panel">
                        <p>Contenu 4</p>
                    </Panel>
                </ScrollspyContainer>
            </Layout>
        );
    }
};
