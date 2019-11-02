import * as React from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "../__style__/header.css";

/** Props du HeaderBarLeft. */
export interface HeaderBarLeftProps {
    children?: React.ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/** Barre du haut à gauche, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarLeft({children, theme: pTheme}: HeaderBarLeftProps) {
    const theme = useTheme("header", headerCss, pTheme);
    return <div className={theme.item({left: true})}>{children}</div>;
}
