import {forwardRef} from "react";
import {NAVIGATION} from "react-toolbox/lib/identifiers";
import {
    Navigation as NavigationType,
    navigationFactory,
    NavigationProps as RTNavigationProps,
    NavigationTheme
} from "react-toolbox/lib/navigation/Navigation";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtNavigationTheme from "react-toolbox/components/navigation/theme.css";
const navigationTheme: NavigationTheme = rtNavigationTheme;
export {navigationTheme};

import {Button} from "./button";
import {Link} from "./link";

const RTNavigation = navigationFactory(Button as any, Link as any);
type NavigationProps = Omit<RTNavigationProps, "theme"> & {theme?: CSSProp<NavigationTheme>};
export const Navigation = forwardRef<NavigationType, NavigationProps>((props, ref) => {
    const theme = useTheme(NAVIGATION, navigationTheme, props.theme);
    return <RTNavigation ref={ref} {...props} theme={fromBem(theme)} />;
});

export {NavigationProps, NavigationTheme};
