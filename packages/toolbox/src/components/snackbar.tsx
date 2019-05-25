import * as React from "react";
import {SNACKBAR} from "react-toolbox/lib/identifiers";
import {
    Snackbar as SnackbarType,
    snackbarFactory,
    SnackbarProps,
    SnackbarTheme
} from "react-toolbox/lib/snackbar/Snackbar";

import {useTheme} from "@focus4/styling";
import rtSnackbarTheme from "react-toolbox/components/snackbar/theme.css";
const snackbarTheme: SnackbarTheme = rtSnackbarTheme;
export {snackbarTheme};

import {Button} from "./button";

const RTSnackbar = snackbarFactory(Button);
export const Snackbar = React.forwardRef<SnackbarType, SnackbarProps>((props, ref) => {
    const theme = useTheme(SNACKBAR, snackbarTheme, props.theme);
    return <RTSnackbar ref={ref} {...props} theme={theme} />;
});

export {SnackbarProps, SnackbarTheme};
