import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/** Contenu du header. n'est affiché que si le header est déplié. */
export function HeaderContent(props: HeaderContentProps) {
    const theme = useTheme("header", headerCss, props.theme);
    return <div className={theme.content()}>{props.children}</div>;
}
