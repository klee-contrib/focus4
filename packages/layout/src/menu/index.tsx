import {useObserver} from "mobx-react-lite";
import * as React from "react";
import {IconButtonTheme} from "react-toolbox/lib/button";

import {useTheme} from "@focus4/styling";

import {Overlay} from "../overlay";
import {MainMenuItem} from "./item";
import {MainMenuList, MainMenuListStyle} from "./list";

export {MainMenuItem};

import * as styles from "./__style__/menu.css";
export type MainMenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    showOverlay?: boolean;
    theme?: MainMenuListStyle & {menu?: string};
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
export function MainMenu({activeRoute, children, showOverlay, theme: pTheme}: React.PropsWithChildren<MainMenuProps>) {
    const theme = useTheme("mainMenu", styles, pTheme);
    return useObserver(() => (
        <nav className={theme.menu}>
            <MainMenuList activeRoute={activeRoute} theme={theme}>
                {children}
            </MainMenuList>
            {showOverlay ? <Overlay active isAdditional /> : null}
        </nav>
    ));
}
