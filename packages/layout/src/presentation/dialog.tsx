import classNames from "classnames";
import {ReactNode, useContext} from "react";

import {CSSProp, ScrollableContext, useTheme} from "@focus4/styling";
import {Button, ButtonProps} from "@focus4/toolbox";

import {useActiveTransition} from "./active-transition";
import {Overlay} from "./overlay";

import dialogCss, {DialogCss} from "./__style__/dialog.css";
export {dialogCss, DialogCss};

export interface DialogProps {
    /** Liste de props de boutons pour définir les actions du Dialog. */
    actions?: ButtonProps[];
    /** Affiche le Dialog. */
    active?: boolean;
    /** Contenu du Dialog. */
    children?: ReactNode;
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Au click sur l'overlay du Dialog, à priori pour le fermer. Si non renseigné, le Dialog ne se fermera pas au clic sur l'overlay. */
    onOverlayClick?: () => void;
    /** Titre du Dialog. */
    title?: string;
    /** CSS. */
    theme?: CSSProp<DialogCss>;
}

export function Dialog({
    actions = [],
    active = false,
    className,
    children,
    onOverlayClick,
    title,
    theme: pTheme
}: DialogProps) {
    const theme = useTheme("dialog", dialogCss, pTheme);
    const context = useContext(ScrollableContext);

    const [displayed, tClassName] = useActiveTransition(active, theme);

    return context.portal(
        <>
            <Overlay active={active} onClick={onOverlayClick} />
            {displayed ? (
                <div className={classNames(tClassName, theme.wrapper())}>
                    <div className={classNames(theme.dialog(), className)} onClick={e => e.stopPropagation()}>
                        {title ? <h5 className={theme.title()}>{title}</h5> : null}
                        <section className={theme.body()} role="body">
                            {children}
                        </section>
                        {actions.length ? (
                            <nav className={theme.navigation()}>
                                {actions.map((action, idx) => (
                                    <Button key={idx} {...action} />
                                ))}
                            </nav>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    );
}
