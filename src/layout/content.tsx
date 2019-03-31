import {Observer} from "mobx-react";
import * as React from "react";

import {useTheme} from "../theme";

import {LayoutContext, LayoutProps, styles} from "./types";

/** Contenu du Layout. */
export function LayoutContent(props: LayoutProps) {
    const context = React.useContext(LayoutContext);
    const theme = useTheme("layout", styles, props.theme);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const paddingTop = window.getComputedStyle(ref.current!).paddingTop;
        context.layout.contentPaddingTop =
            (paddingTop && paddingTop.endsWith("px") && +paddingTop.replace("px", "")) || 0;
    });

    return (
        <Observer>
            {() => (
                <div ref={ref} className={theme.content} style={{marginLeft: context.layout.menuWidth}}>
                    {props.children}
                </div>
            )}
        </Observer>
    );
}
