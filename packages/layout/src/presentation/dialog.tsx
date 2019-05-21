import React from "react";
import {Button} from "react-toolbox/lib/button";
import {DialogProps} from "react-toolbox/lib/dialog";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {cssTransitionProps, ScrollableContext, useTheme} from "@focus4/styling";

import {Overlay} from "./overlay";

import dialogStyles from "./__style__/dialog.css";
export {dialogStyles};
export type DialogStyle = Partial<typeof dialogStyles>;

export function Dialog({
    active = false,
    actions = [],
    className,
    children,
    onOverlayClick,
    title,
    theme: pTheme
}: DialogProps & {theme?: DialogStyle}) {
    const theme = useTheme("dialog", dialogStyles, pTheme);
    const context = React.useContext(ScrollableContext);

    return context.portal(
        <>
            <Overlay active={active} onClick={onOverlayClick as () => void} />
            <TransitionGroup component={null}>
                {active ? (
                    <CSSTransition {...cssTransitionProps(theme)}>
                        <div className={theme.wrapper}>
                            <div
                                data-react-toolbox="dialog"
                                className={`${theme.dialog} ${className || ""}`}
                                onClick={e => e.stopPropagation()}
                            >
                                <section role="body" className={theme.body}>
                                    {title ? <h6 className={theme.title}>{title}</h6> : null}
                                    {children}
                                </section>
                                {actions.length ? (
                                    <nav className={theme.navigation}>
                                        {actions.map((action, idx) => (
                                            <Button
                                                key={idx}
                                                {...action}
                                                className={`${theme.button} ${action.className || ""}`}
                                            />
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
