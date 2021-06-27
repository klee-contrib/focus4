import classNames from "classnames";
import {ReactNode, useContext} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, ScrollableContext, useTheme} from "@focus4/styling";
import {Button, ButtonProps} from "@focus4/toolbox";

import {Overlay} from "./overlay";

import dialogCss, {DialogCss} from "./__style__/dialog.css";
export {dialogCss, DialogCss};

export interface DialogProps {
    /** A array of objects representing the buttons for the dialog navigation area. The properties will be transferred to the buttons. */
    actions?: ButtonProps[];
    /** If true, the dialog will be active. */
    active?: boolean;
    /** Children to pass through the component. */
    children?: ReactNode;
    className?: string;
    /** Callback to be invoked when the dialog overlay is clicked. */
    onOverlayClick?: () => void;
    /** The text string to use as standar title of the dialog. */
    title?: string;
    /**  Classnames object defining the component style. */
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
