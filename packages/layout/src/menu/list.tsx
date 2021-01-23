import {PropsWithChildren, useState} from "react";
import {createPortal} from "react-dom";

import {CSSProp, useTheme} from "@focus4/styling";

import {MenuContext} from "./context";
import {MainMenuCss, mainMenuCss} from "./style";

/** Props du MenuList. */
export interface MainMenuListProps {
    /** Route active. */
    activeRoute?: string;
    /** Pour fermer le panel qui contient la liste. */
    closePanel?: () => void;
    /** CSS. */
    theme?: CSSProp<MainMenuCss>;
}

/** Liste d'item de menu. */
export function MainMenuList({activeRoute, children, closePanel, theme: pTheme}: PropsWithChildren<MainMenuListProps>) {
    const theme = useTheme("mainMenu", mainMenuCss, pTheme);
    const [ref, setRef] = useState<HTMLUListElement | null>(null);
    return (
        <MenuContext.Provider
            value={{
                activeRoute,
                closePanel:
                    closePanel ||
                    (() => {
                        /* */
                    }),
                renderSubMenu(subMenu) {
                    return (ref && createPortal(subMenu, ref)) || null;
                }
            }}
        >
            <ul ref={setRef} className={theme.list()}>
                {children}
            </ul>
        </MenuContext.Provider>
    );
}
