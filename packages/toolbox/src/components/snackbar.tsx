import {forwardRef} from "react";
import {SNACKBAR} from "react-toolbox/lib/identifiers";
import {
    Snackbar as SnackbarType,
    snackbarFactory,
    SnackbarProps as RTSnackbarProps,
    SnackbarTheme
} from "react-toolbox/lib/snackbar/Snackbar";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtSnackbarTheme from "react-toolbox/components/snackbar/theme.css";
const snackbarTheme: SnackbarTheme = rtSnackbarTheme;
export {snackbarTheme};

import {Button} from "./button";

const RTSnackbar = snackbarFactory(Button as any);
type SnackbarProps = Omit<RTSnackbarProps, "theme"> & {theme?: CSSProp<SnackbarTheme>};
export const Snackbar = forwardRef<SnackbarType, SnackbarProps>((props, ref) => {
    const theme = useTheme(SNACKBAR, snackbarTheme, props.theme);
    return <RTSnackbar ref={ref} {...props} theme={fromBem(theme)} />;
});

export {SnackbarProps, SnackbarTheme};
