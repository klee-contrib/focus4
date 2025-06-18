import type {Meta, StoryObj} from "@storybook/react";

import {Button, IconButton, Menu, MenuItem, useMenu} from "@focus4/toolbox";

import {MenuMeta} from "./metas/menu";

export default {
    ...MenuMeta,
    title: "Composants/@focus4∕toolbox/Menu"
} as Meta<typeof Menu>;

export const Showcase: StoryObj<typeof Menu> = {
    render() {
        const menu = useMenu();
        const menu2 = useMenu();
        return (
            <div className="container">
                <div ref={menu.anchor} style={{position: "relative"}}>
                    <IconButton icon="more_vert" onClick={menu.toggle} />
                    <Menu {...menu}>
                        <MenuItem caption="Item 1" />
                        <MenuItem caption="Item 2" />
                    </Menu>
                </div>
                <div ref={menu2.anchor} style={{position: "relative"}}>
                    <Button icon="keyboard_arrow_down" label="Détail" onClick={menu2.toggle} />
                    <Menu {...menu2}>
                        <MenuItem caption="Item 1" iconLeft="add" />
                        <hr />
                        <MenuItem caption="Item 2" iconRight="clear" />
                    </Menu>
                </div>
            </div>
        );
    }
};
