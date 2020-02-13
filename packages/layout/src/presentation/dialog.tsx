import classNames from "classnames";
import * as React from "react";
import {DialogProps} from "react-toolbox/lib/dialog";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, ScrollableContext, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {Overlay} from "./overlay";

import dialogCss, {DialogCss} from "./__style__/dialog.css";
export {dialogCss, DialogCss};

export function Dialog({
    active = false,
    actions = [],
    className,
    children,
    onOverlayClick,
    title,
    theme: pTheme
}: DialogProps & {theme?: CSSProp<DialogCss>}) {
    const theme = useTheme("dialog", dialogCss, pTheme);
    const context = React.useContext(ScrollableContext);

    return context.portal(
        <>
            <Overlay active={active} onClick={onOverlayClick as () => void} />
            <TransitionGroup component={null}>
                {active ? (
                    <CSSTransition {...cssTransitionProps(fromBem(theme) as any)}>
                        <div className={theme.wrapper()}>
                            <div
                                data-react-toolbox="dialog"
                                className={classNames(theme.dialog(), className)}
                                onClick={e => e.stopPropagation()}
                            >
                                <section role="body" className={theme.body()}>
                                    {title ? <h6 className={theme.title()}>{title}</h6> : null}
                                    {children}
                                </section>
                                {actions.length ? (
                                    <nav className={theme.navigation()}>
                                        {actions.map((action, idx) => (
                                            <Button
                                                key={idx}
                                                {...action}
                                                className={classNames(theme.button(), action.className)}
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
