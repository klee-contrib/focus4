import type {Meta, StoryObj} from "@storybook/react";

import {LateralMenu} from "@focus4/layout";

import {LateralMenuMeta} from "./metas/lateral-menu";

export default {
    ...LateralMenuMeta,
    tags: ["autodocs"],
    title: "Mise en page/LateralMenu"
} as Meta<typeof LateralMenu>;

export const Showcase: StoryObj<typeof LateralMenu> = {
    render(props) {
        return (
            <div style={{display: "flex"}}>
                <LateralMenu {...props}>
                    <div style={{padding: 10, width: 120}}>
                        <h3>Menu</h3>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                            <li>Item 3</li>
                        </ul>
                    </div>
                </LateralMenu>
            </div>
        );
    }
};
