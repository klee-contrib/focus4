import {ReactNode, useContext, useLayoutEffect, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {HeaderContext, ScrollableContext} from "../utils/contexts";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/**
 * Partie non fixe du Header, qui scrollera avec la page.
 *
 * Il peut être utilisé pour mettre en évidence un contenu lors de la navigation vers une nouvelle page, qui sera réduit une fois que l'on scrolle vers le reste de son contenu.
 */
export function HeaderContent(props: HeaderContentProps) {
    const theme = useTheme("header", headerCss, props.theme);

    const {registerIntersect} = useContext(ScrollableContext);
    const {sticky, setSticky} = useContext(HeaderContext);

    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            return registerIntersect(ref.current, (ratio: number) => {
                const contentHeight = ref.current?.clientHeight ?? 0;
                const visibleContent = ratio * contentHeight;
                const fixedRatio = visibleContent / contentHeight;
                if (fixedRatio < 0.1 && !sticky) {
                    setSticky(true);
                } else if (fixedRatio > 0.2 && sticky) {
                    setSticky(false);
                }
            });
        }
    }, [sticky]);

    return (
        <div ref={ref} className={theme.content()}>
            {props.children}
        </div>
    );
}
