import * as React from "react";
import {IconButtonTheme} from "react-toolbox/lib/button";

import {useTheme} from "../../theme";

import {MainMenuItem} from "./item";
import {MainMenuList, MainMenuListStyle} from "./list";

export {MainMenuItem};

import * as styles from "./__style__/menu.css";
export type MainMenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    theme?: MainMenuListStyle & {menu?: string};
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
export function MainMenu({activeRoute, children, theme: pTheme}: React.PropsWithChildren<MainMenuProps>) {
    const theme = useTheme("mainMenu", styles, pTheme);
    return (
        <nav className={theme.menu}>
            <MainMenuList activeRoute={activeRoute} theme={theme}>
                {children}
            </MainMenuList>
        </nav>
    );
}
