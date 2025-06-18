import {Children, ReactElement, ReactNode, useMemo, useRef, useState} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {HeaderContext} from "../utils/contexts";

import {HeaderContent} from "./content";

import headerCss, {HeaderCss} from "./__style__/header.css";

export {headerCss};
export type {HeaderCss};

/** Props du conteneur de header. */
export interface HeaderProps {
    /** Children. */
    children?: ReactNode;
    /** Classes CSS. */
    theme?: CSSProp<HeaderCss>;
}

/**
 * Le `HeaderScrolling` permet de poser un Header en haut de la page, avec au moins une partie fixe.
 *
 * Il doit contenir un `HeaderTopRow` pour contenir les `HeaderItem` qui le constituent qui en sera la partie fixe.
 * Il peut contenir un `HeaderContent`, qui sera affiché en dessous du `HeaderTopRow` et qui scrollera avec la page.
 * Il peut aussi contenir des `HeaderActions`, des boutons d'actions qui seront affichés sous le `HeaderContent` et resteront fixés au `HeaderTopRow` une fois la page scrollée.
 *
 * La taille du `HeaderTopRow` sera sauvegardée dans le contexte du [`Scrollable`](/docs/mise-en-page-scrollable--docs) qui le contient, afin que les autre composants sticky qui seront posés dedans puissent se positionner par rapport à lui.
 */
export function HeaderScrolling({children, theme: pTheme}: HeaderProps) {
    const theme = useTheme("header", headerCss, pTheme);
    const ref = useRef<HTMLElement>(null);

    const [sticky, setSticky] = useState(() => {
        let hasContent = false;
        Children.forEach(children, c => {
            if ((c as ReactElement)?.type === HeaderContent) {
                hasContent = true;
            }
        });
        return !hasContent;
    });

    const context = useMemo(
        () => ({
            sticky,
            setSticky
        }),
        [sticky]
    );

    return (
        <header ref={ref} className={theme.scrolling({sticky})}>
            <HeaderContext.Provider value={context}>{children}</HeaderContext.Provider>
        </header>
    );
}
