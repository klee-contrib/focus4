import * as React from "react";
import posed, {Transition} from "react-pose";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon, ScrollableContext} from "../components";
import {useTheme} from "../theme";

import {Overlay} from "./overlay";
import {Scrollable} from "./scrollable";

import * as styles from "./__style__/popin.css";
export type PopinStyle = Partial<typeof styles>;

/** Props de la popin. */
export interface PopinProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 200. */
    backToTopOffset?: number;
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Préfixe i18n pour l'icône de fermeture. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** Supprime le clic sur l'overlay pour fermer la popin. */
    preventOverlayClick?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: PopinStyle;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-right" | "from-left";
}

/** Affiche son contenu dans une popin, dont l'ouverture est contrôlée par ses props. */
export function Popin({
    backToTopOffset,
    children,
    closePopin,
    hideBackToTop,
    i18nPrefix = "focus",
    opened,
    preventOverlayClick,
    scrollBehaviour,
    theme: pTheme,
    type = "from-right"
}: React.PropsWithChildren<PopinProps>) {
    const theme = useTheme("popin", styles, pTheme);
    const context = React.useContext(ScrollableContext);

    return context.portal(
        <Transition>
            {opened ? <Overlay key="overlay" onClick={(!preventOverlayClick && closePopin) || undefined} /> : undefined}
            {opened ? (
                <PopinScrollable
                    key="scrollable"
                    backToTopOffset={backToTopOffset}
                    className={`${theme.popin} ${
                        type === "from-right" ? theme.right : type === "from-left" ? theme.left : ""
                    }`}
                    hideBackToTop={hideBackToTop}
                    scrollBehaviour={scrollBehaviour}
                    type={type}
                >
                    <IconButton
                        className={theme.close}
                        icon={getIcon(`${i18nPrefix}.icons.popin.close`)}
                        onClick={closePopin}
                    />
                    {children}
                </PopinScrollable>
            ) : (
                undefined
            )}
        </Transition>,
        "root"
    );
}

const PopinScrollable = posed(Scrollable)({
    props: {type: "from-right"},
    enter: {x: "0%", transition: {type: "tween"}},
    exit: {
        x: ({type}: {type: "from-right" | "from-left"}) => `${type === "from-right" ? "" : "-"}100%`,
        transition: {type: "tween"}
    }
});
