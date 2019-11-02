import * as React from "react";
import {DialogProps} from "react-toolbox/lib/dialog";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSToStrings, cssTransitionProps, ScrollableContext, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {Overlay} from "./overlay";

import dialogStyles, {DialogCss} from "./__style__/dialog.css";
export {dialogStyles};
export type DialogStyle = CSSToStrings<DialogCss>;

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
                    <CSSTransition {...cssTransitionProps(theme as any)}>
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
