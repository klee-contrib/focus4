import classNames from "classnames";
import {ReactNode, useContext} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, ScrollableContext, useTheme} from "@focus4/styling";
import {Button, ButtonProps} from "@focus4/toolbox";

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

    return context.portal(
        <>
            <Overlay active={active} onClick={onOverlayClick} />
            <TransitionGroup component={null}>
                {active ? (
                    <CSSTransition {...cssTransitionProps(fromBem(theme) as any)}>
                        <div className={theme.wrapper()}>
                            <div className={classNames(theme.dialog(), className)} onClick={e => e.stopPropagation()}>
                                <section className={theme.body()} role="body">
                                    {title ? <h6 className={theme.title()}>{title}</h6> : null}
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
                    </CSSTransition>
                ) : null}
            </TransitionGroup>
        </>
    );
}
