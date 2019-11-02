import * as React from "react";
import {createPortal} from "react-dom";

import {useTheme} from "@focus4/styling";

import {MenuContext} from "./context";

import styles from "./__style__/main-menu.css";

export interface MainMenuListStyle {
    active?: string;
    item?: string;
    list?: string;
}

/** Props du MenuList. */
export interface MainMenuListProps {
    /** Route active. */
    activeRoute?: string;
    /** Pour fermer le panel qui contient la liste. */
    closePanel?: () => void;
    /** CSS. */
    theme?: MainMenuListStyle;
}

/** Liste d'item de menu. */
export function MainMenuList({
    activeRoute,
    children,
    closePanel,
    theme: pTheme
}: React.PropsWithChildren<MainMenuListProps>) {
    const theme = useTheme("mainMenu", styles, pTheme);
    const [ref, setRef] = React.useState<HTMLUListElement | null>(null);
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
            <ul ref={setRef} className={theme!.list}>
                {children}
            </ul>
        </MenuContext.Provider>
    );
}
