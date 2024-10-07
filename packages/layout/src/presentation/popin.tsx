import classNames from "classnames";
import {PropsWithChildren, useContext} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {ScrollableContext} from "../utils";

import {useActiveTransition} from "./active-transition";
import {Overlay} from "./overlay";
import {Scrollable} from "./scrollable";

import popinCss, {PopinCss} from "./__style__/popin.css";
export {popinCss};
export type {PopinCss};

/** Props de la popin. */
export interface PopinProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** Supprime le clic sur l'overlay pour fermer la popin. */
    preventOverlayClick?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: CSSProp<PopinCss>;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-left" | "from-right";
}

/** Affiche son contenu dans une popin, dont l'ouverture est contrôlée par ses props. */
export function Popin({
    backToTopOffset,
    children,
    closePopin,
    hideBackToTop,
    opened,
    preventOverlayClick,
    scrollBehaviour,
    theme: pTheme,
    type = "from-right"
}: PropsWithChildren<PopinProps>) {
    const theme = useTheme("popin", popinCss, pTheme);
    const {portal} = useContext(ScrollableContext);

    const [displayed, tClassName] = useActiveTransition(opened, theme);

    return portal(
        <>
            <Overlay active={opened} onClick={(!preventOverlayClick && closePopin) || undefined} />
            {displayed ? (
                <Scrollable
                    backToTopOffset={backToTopOffset}
                    className={classNames(
                        tClassName,
                        theme.popin({left: type === "from-left", right: type === "from-right"})
                    )}
                    hideBackToTop={hideBackToTop}
                    scrollBehaviour={scrollBehaviour}
                >
                    {children}
                </Scrollable>
            ) : null}
        </>
    );
}
