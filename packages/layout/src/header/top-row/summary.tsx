import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "../__style__/header.css";

/** Props du HeaderSummary. */
export interface HeaderSummaryProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

export function HeaderSummary({children, theme: pTheme}: HeaderSummaryProps) {
    const theme = useTheme("header", headerCss, pTheme);
    return <div className={theme.item({middle: true})}>{children}</div>;
}
