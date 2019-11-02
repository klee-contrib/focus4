import * as React from "react";

import {useTheme} from "@focus4/styling";

import styles from "../__style__/header.css";

export {HeaderBarLeft} from "./bar-left";
export {HeaderBarRight} from "./bar-right";
export {HeaderSummary} from "./summary";

/** Props du HeaderTopRow. */
export interface HeaderTopRowProps {
    children?: React.ReactNode;
    theme?: {
        topRow?: string;
    };
}

/** Barre du haut dans le header. */
export function HeaderTopRow(props: HeaderTopRowProps) {
    const theme = useTheme("header", styles, props.theme);
    return (
        <div className={theme.topRow()}>
            <div>{props.children}</div>
        </div>
    );
}
