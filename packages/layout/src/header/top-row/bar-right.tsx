import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "../__style__/header.css";

/** Props du HeaderBarRight. */
export interface HeaderBarRightProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/** Barre du haut à droite, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarRight({children, theme: pTheme}: HeaderBarRightProps) {
    const theme = useTheme("header", headerCss, pTheme);
    return <div className={theme.item({right: true})}>{children}</div>;
}
