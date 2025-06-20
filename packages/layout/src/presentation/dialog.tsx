import classNames from "classnames";
import {ReactNode, useContext} from "react";

import {CSSProp, useTheme} from "@focus4/styling";
import {Button, ButtonProps} from "@focus4/toolbox";

import {ScrollableContext} from "../utils";

import {useActiveTransition} from "./active-transition";
import {useOverlay} from "./overlay";

import dialogCss, {DialogCss} from "./__style__/dialog.css";

export {dialogCss};
export type {DialogCss};

export interface DialogProps {
    /** Liste de props de boutons pour définir les actions du Dialog. */
    actions?: ButtonProps[];
    /** Affiche le Dialog. */
    active?: boolean;
    /** Contenu du Dialog. */
    children?: ReactNode;
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Appelé une fois que le Dialog est effectivement fermé (après l'animtation). */
    onClosed?: () => void;
    /** Au click sur l'overlay du Dialog, à priori pour le fermer. Si non renseigné, le Dialog ne se fermera pas au clic sur l'overlay. */
    onOverlayClick?: () => void;
    /** Titre du Dialog. */
    title?: string;
    /** CSS. */
    theme?: CSSProp<DialogCss>;
}

/**
 * Le `Dialog` est une petite fenêtre qui s'ouvre au centre, avec un titre, un contenu, et d'éventuelles actions.
 *
 * Il **doit être placé dans un [`Scrollable`](/docs/mise-en-page-scrollable--docs)**, c'est-à-dire en pratique soit dans le [`Layout`](/docs/mise-en-page-layout--docs) (donc n'importe où dans votre application, ce n'est pas vraiment limitant), soit dans une [`Popin`](/docs/mise-en-page-popin--docs).
 * En particulier, **il s'ouvrira dans le contexte du premier [`Scrollable`](/docs/mise-en-page-scrollable--docs) parent** qu'il rencontre. En particulier, il s'ouvrira donc dans la [`Popin`](/docs/mise-en-page-popin--docs) qui le contient et non dans le [`Layout`](/docs/mise-en-page-layout--docs) global, donc il sera centré dedans.
 */
export function Dialog({
    actions = [],
    active = false,
    className,
    children,
    onClosed,
    onOverlayClick,
    title,
    theme: pTheme
}: DialogProps) {
    const theme = useTheme("dialog", dialogCss, pTheme);
    const {portal} = useContext(ScrollableContext);

    const [displayed, tClassName] = useActiveTransition(active, theme, onClosed);

    useOverlay(active, onOverlayClick, true);

    return displayed
        ? portal(
              <div className={classNames(tClassName, theme.wrapper())}>
                  <div className={classNames(theme.dialog(), className)}>
                      {title ? <h5 className={theme.title()}>{title}</h5> : null}
                      <section className={theme.body()}>{children}</section>
                      {actions.length ? (
                          <nav className={theme.navigation()}>
                              {actions.map((action, idx) => (
                                  <Button key={idx} {...action} />
                              ))}
                          </nav>
                      ) : null}
                  </div>
              </div>
          )
        : null;
}
