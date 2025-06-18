import classNames from "classnames";
import {PropsWithChildren, useCallback, useContext} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {ScrollableContext} from "../utils";

import {useActiveTransition} from "./active-transition";
import {useOverlay} from "./overlay";
import {Scrollable, ScrollableCss} from "./scrollable";

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
    /** Appelé une fois que la Popin est effectivement fermée (après l'animtation). */
    onClosed?: () => void;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** Supprime le clic sur l'overlay pour fermer la popin. */
    preventOverlayClick?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS du Scrollable. */
    scrollableTheme?: CSSProp<ScrollableCss>;
    /** CSS. */
    theme?: CSSProp<PopinCss>;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-left" | "from-right";
}

/**
 * La `Popin` est un panneau latéral qui s'ouvre sur la gauche ou la droite et qui prend en général la moitié de l'écran.
 *
 * La `Popin` pose son propre [`Scrollable`](/docs/mise-en-page-scrollable--docs), donc il est possible d'utiliser dedans les fonctionnalités qui en ont besoin (le scroll infini, en particulier).
 *
 * Elle **doit être placée dans un [`Scrollable`](/docs/mise-en-page-scrollable--docs)**, c'est-à-dire en pratique soit dans le [`Layout`](/docs/mise-en-page-layout--docs) (donc n'importe où dans votre application, ce n'est pas vraiment limitant), soit dans une autre `Popin`.
 * En particulier, **elle s'ouvrira dans le contexte du premier [`Scrollable`](/docs/mise-en-page-scrollable--docs) parent** qu'elle rencontre. Ainsi, on peut mettre des `Popin` dans des `Popin`.
 */
export function Popin({
    backToTopOffset,
    children,
    closePopin,
    hideBackToTop,
    onClosed,
    opened,
    preventOverlayClick,
    scrollBehaviour,
    scrollableTheme,
    theme: pTheme,
    type = "from-right"
}: PropsWithChildren<PopinProps>) {
    const theme = useTheme("popin", popinCss, pTheme);
    const {portal} = useContext(ScrollableContext);

    const [displayed, tClassName] = useActiveTransition(opened, theme, onClosed);

    useOverlay(
        opened,
        useCallback(() => (!preventOverlayClick ? closePopin() : undefined), [closePopin, preventOverlayClick])
    );

    return displayed
        ? portal(
              <Scrollable
                  backToTopOffset={backToTopOffset}
                  className={classNames(
                      tClassName,
                      theme.popin({left: type === "from-left", right: type === "from-right"})
                  )}
                  hideBackToTop={hideBackToTop}
                  scrollBehaviour={scrollBehaviour}
                  showOverlay
                  theme={scrollableTheme}
              >
                  {children}
              </Scrollable>
          )
        : null;
}
