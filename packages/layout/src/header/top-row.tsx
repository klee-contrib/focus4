import {ReactNode, useContext, useLayoutEffect, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {HeaderContext, ScrollableContext} from "../utils/contexts";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderTopRow. */
export interface HeaderTopRowProps {
    children?: ReactNode;
    theme?: CSSProp<HeaderCss>;
}

/**
 * Partie fixe du Header. C'est un composant obligatoire du `HeaderScrolling`.
 */
export function HeaderTopRow(props: HeaderTopRowProps) {
    const theme = useTheme("header", headerCss, props.theme);
    const {sticky} = useContext(HeaderContext);

    const ref = useRef<HTMLDivElement>(null);
    const {registerHeaderElement} = useContext(ScrollableContext);

    useLayoutEffect(() => (sticky ? registerHeaderElement(ref.current!) : undefined), [sticky]);

    return (
        <div ref={ref} className={theme.topRow()}>
            {props.children}
        </div>
    );
}
