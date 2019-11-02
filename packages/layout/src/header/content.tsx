import * as React from "react";

import {useTheme} from "@focus4/styling";

import styles from "./__style__/header.css";

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: React.ReactNode;
    theme?: {
        content?: string;
    };
}

/** Contenu du header. n'est affiché que si le header est déplié. */
export function HeaderContent(props: HeaderContentProps) {
    const theme = useTheme("header", styles, props.theme);
    return <div className={theme.content()}>{props.children}</div>;
}
