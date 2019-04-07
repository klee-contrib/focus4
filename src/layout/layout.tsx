import * as React from "react";

import {MessageCenter, MessageCenterProps} from "../message";
import {useTheme} from "../theme";

import {ErrorCenter} from "./error-center";
import {Scrollable} from "./scrollable";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;
export {styles};

/** Props du Layout. */
export interface LayoutProps extends MessageCenterProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 200. */
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
    const theme = useTheme("layout", styles, pTheme);
    return (
        <>
            <ErrorCenter />
            <MessageCenter {...messageCenterProps} />
            <div className={theme.layout}>
                {menu}
                <Scrollable
                    backToTopOffset={backToTopOffset}
                    className={theme.scrollable}
                    hideBackToTop={hideBackToTop}
                    scrollBehaviour={scrollBehaviour}
                >
                    {children}
                </Scrollable>
            </div>
        </>
    );
}
