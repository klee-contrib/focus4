import {useObserver} from "mobx-react";
import {PropsWithChildren} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {Overlay} from "../presentation/overlay";
import {MainMenuItem} from "./item";
import {MainMenuList} from "./list";
import {MainMenuCss, mainMenuCss} from "./style";

export {MainMenuItem, MainMenuCss, mainMenuCss};

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    showOverlay?: boolean;
    theme?: CSSProp<MainMenuCss>;
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
export function MainMenu({activeRoute, children, showOverlay, theme: pTheme}: PropsWithChildren<MainMenuProps>) {
    const theme = useTheme<MainMenuCss>("mainMenu", mainMenuCss, pTheme);
    return useObserver(() => (
        <nav className={theme.menu()}>
            <MainMenuList activeRoute={activeRoute} theme={theme}>
                {children}
            </MainMenuList>
            {showOverlay ? <Overlay active isAdditional /> : null}
        </nav>
    ));
}
