import * as React from "react";

import {CSSToStrings, useTheme} from "@focus4/styling";

import {Scrollable} from "../scrollable";
import {MessageCenter, MessageCenterProps} from "../utils";

import layoutStyles, {LayoutCss} from "./__style__/layout.css";
export {layoutStyles};
export type LayoutStyle = CSSToStrings<LayoutCss>;

/** Props du Layout. */
export interface LayoutProps extends MessageCenterProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: React.ReactNode;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Menu de gauche. */
    menu?: React.ReactNode;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: LayoutStyle;
}

/** Composant de Layout sans le provider de style. */
export function LayoutBase({
    theme: pTheme,
    children,
    backToTopOffset,
    hideBackToTop,
    menu,
    scrollBehaviour,
    ...messageCenterProps
}: LayoutProps) {
    const theme = useTheme("layout", layoutStyles, pTheme);
    return (
        <>
            <MessageCenter {...messageCenterProps} />
            <div className={theme.layout()}>
                {menu}
                <Scrollable
                    backToTopOffset={backToTopOffset}
                    className={theme.scrollable()}
                    hideBackToTop={hideBackToTop}
                    resetScrollOnChildrenChange
                    scrollBehaviour={scrollBehaviour}
                >
                    {children}
                </Scrollable>
            </div>
        </>
    );
}
