import {HeaderActions, HeaderContent, HeaderItem, HeaderScrolling, HeaderTopRow, Layout} from "@focus4/layout";

import {HeaderScrollingMeta} from "./metas/header-scrolling";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...HeaderScrollingMeta,
    title: "Mise en page/HeaderScrolling"
} as Meta<typeof HeaderScrolling>;

export const Showcase: StoryObj<typeof HeaderScrolling> = {
    render(props) {
        return (
            <Layout theme={{scrollable: "doc-scrollable"}}>
                <HeaderScrolling {...props}>
                    <HeaderTopRow>
                        <HeaderItem>
                            <span style={{lineHeight: "40px"}}>Item à gauche</span>
                        </HeaderItem>
                        <HeaderItem fillWidth stickyOnly>
                            <span style={{lineHeight: "40px"}}>Item central</span>
                        </HeaderItem>
                        <HeaderItem>
                            <span style={{lineHeight: "40px"}}>Item à droite</span>
                        </HeaderItem>
                    </HeaderTopRow>
                    <HeaderContent>
                        <h1>Item central</h1>
                    </HeaderContent>
                    <HeaderActions
                        primary={[{color: "primary", icon: "add"}]}
                        secondary={[{caption: "Action 1"}, {caption: "Action 2"}]}
                    />
                </HeaderScrolling>
                <div style={{height: 600}} />
            </Layout>
        );
    }
};
