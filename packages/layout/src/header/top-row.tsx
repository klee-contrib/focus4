import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderTopRow. */
export interface HeaderTopRowProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/** Barre du haut dans le header. */
export function HeaderTopRow(props: HeaderTopRowProps) {
    const theme = useTheme("header", headerCss, props.theme);
    return <div className={theme.topRow()}>{props.children}</div>;
}
