import * as React from "react";

import {useTheme} from "@focus4/styling";

import {LayoutStyle, layoutStyles} from "./layout";

export function Content(props: {children?: React.ReactNode; theme?: LayoutStyle}) {
    const theme = useTheme("layout", layoutStyles, props.theme);
    return <div className={theme.content()}>{props.children}</div>;
}
