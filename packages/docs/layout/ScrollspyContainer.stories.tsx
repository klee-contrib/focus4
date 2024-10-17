import {Layout, Panel, ScrollspyContainer} from "@focus4/layout";

import {ScrollspyContainerMeta} from "./metas/scrollspy-container";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...ScrollspyContainerMeta,
    title: "Mise en page/ScrollspyContainer"
} as Meta<typeof ScrollspyContainer>;

export const Showcase: StoryObj<typeof ScrollspyContainer> = {
    render(props) {
        return (
            <Layout theme={{scrollable: "doc-scrollable"}}>
                <ScrollspyContainer {...props}>
                    <Panel title="1 Panel">
                        <p>Contenu 1</p>
                    </Panel>
                    <Panel title="2 Panel">
                        <p>Contenu 2</p>
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
