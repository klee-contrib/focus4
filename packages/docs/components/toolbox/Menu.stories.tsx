import {IconButton, Menu, MenuItem, useMenu} from "@focus4/toolbox";

import {MenuMeta} from "./metas/menu";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...MenuMeta,
    title: "Composants/@focus4∕toolbox/Menu"
} as Meta<typeof Menu>;

export const Showcase: StoryObj<typeof Menu> = {
    render() {
        const menu = useMenu();
        return (
            <div ref={menu.anchor} style={{position: "relative"}}>
                <IconButton icon="more_vert" onClick={menu.toggle} />
                <Menu {...menu}>
                    <MenuItem caption="Item 1" />
                    <MenuItem caption="Item 2" />
                </Menu>
            </div>
        );
    }
};
