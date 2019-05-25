import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {useTheme} from "@focus4/styling";
import {IconButtonTheme} from "@focus4/toolbox";

import {Overlay} from "../presentation/overlay";
import {MainMenuItem} from "./item";
import {MainMenuList, MainMenuListStyle} from "./list";

export {MainMenuItem};

import mainMenuStyles from "./__style__/menu.css";
export {mainMenuStyles};
export type MainMenuStyle = Partial<typeof mainMenuStyles> & IconButtonTheme;

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    showOverlay?: boolean;
    theme?: MainMenuListStyle & {menu?: string};
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
export function MainMenu({activeRoute, children, showOverlay, theme: pTheme}: React.PropsWithChildren<MainMenuProps>) {
    const theme = useTheme("mainMenu", mainMenuStyles, pTheme);
    return useObserver(() => (
        <nav className={theme.menu}>
            <MainMenuList activeRoute={activeRoute} theme={theme}>
                {children}
            </MainMenuList>
            {showOverlay ? <Overlay active isAdditional /> : null}
        </nav>
    ));
}
