import React from "react";
import {Button} from "react-toolbox/lib/button";
import {DialogProps} from "react-toolbox/lib/dialog";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {ScrollableContext} from "../components";
import {useTheme} from "../theme";

import {cssTransitionProps, Overlay, overlayStyles} from "./overlay";

import * as styles from "./__style__/dialog.css";
export type DialogStyle = Partial<typeof styles>;

export function Dialog({
    active,
    actions = [],
    className,
    children,
    onOverlayClick,
    title,
    theme: pTheme
}: DialogProps & {theme?: DialogStyle}) {
    const theme = useTheme("dialog", styles, pTheme);
    const oTheme = useTheme("overlay", overlayStyles);
    const context = React.useContext(ScrollableContext);

    return context.portal(
        <TransitionGroup component={null}>
            {active ? (
                <CSSTransition {...cssTransitionProps(oTheme)}>
                    <Overlay />
                </CSSTransition>
            ) : null}
            {active ? (
                <CSSTransition {...cssTransitionProps(theme)}>
                    <div className={theme.wrapper} onClick={onOverlayClick as () => void}>
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
        </TransitionGroup>,
        "root"
    );
}
