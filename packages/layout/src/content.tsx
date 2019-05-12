import React from "react";

import {useTheme} from "@focus4/styling";

import {LayoutStyle, styles} from "./layout";

export function Content(props: {children?: React.ReactNode; theme?: LayoutStyle}) {
    const theme = useTheme("layout", styles, props.theme);
    return <div className={theme.content}>{props.children}</div>;
}
