import * as React from "react";
import {LINK} from "react-toolbox/lib/identifiers";
import {Link as RTLink, LinkProps, LinkTheme} from "react-toolbox/lib/link/Link";

import {useTheme} from "@focus4/styling";
import rtLinkTheme from "react-toolbox/components/link/theme.css";
const linkTheme: LinkTheme = rtLinkTheme;
export {linkTheme};

export const Link = React.forwardRef<RTLink, LinkProps>((props, ref) => {
    const theme = useTheme(LINK, linkTheme, props.theme);
    return <RTLink ref={ref} {...props} theme={theme} />;
});

export {LinkProps, LinkTheme};
