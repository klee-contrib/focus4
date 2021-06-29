import classnames from "classnames";
import {MouseEventHandler, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {SnackbarTheme} from "react-toolbox/lib/snackbar/Snackbar";

import {CSSProp, useTheme} from "@focus4/styling";
import rtSnackbarTheme from "react-toolbox/components/snackbar/theme.css";
const snackbarTheme: SnackbarTheme = rtSnackbarTheme;
export {snackbarTheme, SnackbarTheme};

import {Button} from "./button";

export interface SnackbarProps {
    /** Label for the action component inside the Snackbar. */
    action?: string;
    /** If true, the snackbar will be active. */
    active: boolean;
    /** Children to pass through the component. */
    children?: ReactNode;
    className?: string;
    /** Text to display in the content. */
    label?: string | JSX.Element;
    /** Callback function that will be called when the action button is clicked. */
    onClick?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    /** Callback function that will be called once the set timeout is finished. */
    onTimeout: () => void;
    /** Classnames object defining the component style. */
    theme?: CSSProp<SnackbarTheme>;
    /** Amount of time in milliseconds after which the `onTimeout` callback will be called after `active` becomes true. */
    timeout?: number;
    /** Indicates the action type. Can be accept, warning or cancel */
    type?: "accept" | "cancel" | "warning";
}

export function Snackbar({
    action,
    active: pActive = false,
    children,
    className: pClassName = "",
    label,
    onClick,
    theme: pTheme,
    timeout = 0,
    onTimeout,
    type
}: SnackbarProps) {
    const theme = useTheme("RTSnackbar", snackbarTheme, pTheme);
    const [active, setActive] = useState(pActive);
    const [rendered, setRendered] = useState(pActive);

    useEffect(() => {
        if (pActive) {
            setRendered(true);
            const t1 = setTimeout(() => setActive(true), 20);
            // tslint:disable-next-line: no-unnecessary-callback-wrapper
            const t2 = setTimeout(() => onTimeout?.(), timeout);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        } else {
            setActive(false);
            const t3 = setTimeout(() => setRendered(false), 500);
            return () => {
                clearTimeout(t3);
            };
        }
    }, [pActive]);

    const className = classnames(
        [theme.snackbar(), type ? theme[type]() : undefined],
        {[theme.active()]: active},
        pClassName
    );

    return rendered
        ? createPortal(
              <div data-react-toolbox="snackbar" className={className}>
                  <span className={theme.label()}>
                      {label}
                      {children}
                  </span>
                  {action ? <Button className={theme.button()} label={action} onClick={onClick} /> : null}
              </div>,
              document.body
          )
        : null;
}
