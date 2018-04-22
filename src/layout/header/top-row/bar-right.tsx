import * as React from "react";

import {themr} from "../../../theme";

import * as styles from "../__style__/header.css";
const Theme = themr("header", styles);

/** Props du HeaderBarRight. */
export interface HeaderBarRightProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        right?: string;
    };
}

/** Barre du haut à droite, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarRight({children, theme: pTheme}: HeaderBarRightProps) {
    return (
        <Theme theme={pTheme}>
            {theme =>
                <div className={`${theme.item} ${theme.right}`}>
                    {children}
                </div>
            }
        </Theme>
    );
}
