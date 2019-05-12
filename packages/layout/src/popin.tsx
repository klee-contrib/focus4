import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {getIcon, ScrollableContext} from "@focus4/components";
import {cssTransitionProps, useTheme} from "@focus4/styling";

import {Overlay} from "./overlay";
import {Scrollable} from "./scrollable";

import * as styles from "./__style__/popin.css";
export type PopinStyle = Partial<typeof styles>;

/** Props de la popin. */
export interface PopinProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Cache le bouton pour fermer la popin. */
    hideCloseButton?: boolean;
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
    hideCloseButton,
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
        <>
            <Overlay active={opened} onClick={(!preventOverlayClick && closePopin) || undefined} />
            <TransitionGroup component={null}>
                {opened ? (
                    <CSSTransition {...cssTransitionProps(theme)}>
                        <Scrollable
                            backToTopOffset={backToTopOffset}
                            className={`${theme.popin} ${
                                type === "from-right" ? theme.right : type === "from-left" ? theme.left : ""
                            }`}
                            hideBackToTop={hideBackToTop}
                            scrollBehaviour={scrollBehaviour}
                        >
                            {!hideCloseButton ? (
                                <IconButton
                                    className={theme.close}
                                    icon={getIcon(`${i18nPrefix}.icons.popin.close`)}
                                    onClick={closePopin}
                                />
                            ) : null}
                            {children}
                        </Scrollable>
                    </CSSTransition>
                ) : null}
            </TransitionGroup>
        </>
    );
}
