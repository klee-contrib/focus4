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

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
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
