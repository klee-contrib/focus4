import * as React from "react";

import {ScrollableContext} from "../components";
import {useTheme} from "../theme";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;

/** Contenu du Layout. */
export function LayoutContent(props: {children?: React.ReactNode; theme?: LayoutStyle}) {
    const context = React.useContext(ScrollableContext);
    const theme = useTheme("layout", styles, props.theme);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const paddingTop = window.getComputedStyle(ref.current!).paddingTop;
        context.layout.contentPaddingTop =
            (paddingTop && paddingTop.endsWith("px") && +paddingTop.replace("px", "")) || 0;
    });

    return (
        <div ref={ref} className={theme.content}>
            {props.children}
        </div>
    );
}
