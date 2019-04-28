import {observable} from "mobx";
import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {useTheme} from "../../theme";

import {MenuContext} from "./context";

import * as styles from "./__style__/menu.css";

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
    const [items] = React.useState(() =>
        observable<readonly [React.RefObject<HTMLLIElement>, React.ReactElement, string | undefined]>([], {deep: false})
    );
    return (
        <MenuContext.Provider
            value={{
                activeRoute,
                addItem: i => items.push(i),
                closePanel:
                    closePanel ||
                    (() => {
                        /* */
                    }),
                removeItem: i => items.remove(i)
            }}
        >
            {useObserver(() => (
                <ul className={theme!.list}>
                    {children}
                    {items.map(([ref, item, route], idx) => (
                        <li
                            ref={ref}
                            className={`${theme.item} ${route === activeRoute ? theme.active : ""}`}
                            key={idx}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            ))}
        </MenuContext.Provider>
    );
}
