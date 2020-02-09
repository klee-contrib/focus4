import * as React from "react";
import {LINK} from "react-toolbox/lib/identifiers";
import {Link as RTLink, LinkProps as RTLinkProps, LinkTheme} from "react-toolbox/lib/link/Link";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtLinkTheme from "react-toolbox/components/link/theme.css";
const linkTheme: LinkTheme = rtLinkTheme;
export {linkTheme};

type LinkProps = Omit<RTLinkProps, "theme"> & {theme?: CSSProp<LinkTheme>};
export const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<RTLink>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(LINK, linkTheme, props.theme);
        return <RTLink ref={ref} {...props} theme={fromBem(theme)} />;
    }
);

export {LinkProps, LinkTheme};
