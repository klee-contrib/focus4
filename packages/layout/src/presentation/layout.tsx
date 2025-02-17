import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {MessageCenter, MessageCenterProps} from "../utils";

import {OverlayProvider} from "./overlay";
import {Scrollable} from "./scrollable";

import layoutCss, {LayoutCss} from "./__style__/layout.css";
export {layoutCss};
export type {LayoutCss};

/** Props du Layout. */
export interface LayoutProps extends MessageCenterProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: ReactNode;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Menu de gauche. */
    menu?: ReactNode;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: CSSProp<LayoutCss>;
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
    const theme = useTheme("layout", layoutCss, pTheme);
    return (
        <OverlayProvider>
            <MessageCenter {...messageCenterProps} />
            <div className={theme.layout()}>
                {menu}
                <Scrollable
                    backToTopOffset={backToTopOffset}
                    className={theme.scrollable()}
                    hideBackToTop={hideBackToTop}
                    resetScrollOnChildrenChange
                    scrollBehaviour={scrollBehaviour}
                    showOverlay
                >
                    {children}
                </Scrollable>
            </div>
        </OverlayProvider>
    );
}
