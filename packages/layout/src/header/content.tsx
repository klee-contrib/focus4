import {ReactNode, useContext, useLayoutEffect, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {HeaderContext, ScrollableContext} from "../utils/contexts";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/** Contenu du header. n'est affiché que si le header est déplié. */
export function HeaderContent(props: HeaderContentProps) {
    const theme = useTheme("header", headerCss, props.theme);

    const {headerHeight, registerIntersect} = useContext(ScrollableContext);
    const {sticky, setSticky} = useContext(HeaderContext);

    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            return registerIntersect(ref.current, (ratio: number) => {
                const contentHeight = ref.current?.clientHeight ?? 0;
                const visibleContent = ratio === 1 ? contentHeight : ratio * contentHeight - headerHeight;
                const fixedRatio = visibleContent / contentHeight;
                if (fixedRatio < 0.1 && !sticky) {
                    setSticky(true);
                } else if (fixedRatio > 0.2 && sticky) {
                    setSticky(false);
                }
            });
        }
    }, [headerHeight, sticky]);

    return (
        <div ref={ref} className={theme.content()}>
            {props.children}
        </div>
    );
}
