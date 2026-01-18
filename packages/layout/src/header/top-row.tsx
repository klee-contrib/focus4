import {ReactNode, useContext, useId, useLayoutEffect, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {ScrollableContext} from "../utils/contexts";

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

    const ref = useRef<HTMLDivElement>(null);
    const {setHeaderElementHeight} = useContext(ScrollableContext);
    const id = useId();

    useLayoutEffect(() => {
        const element = ref.current!;
        const update = () => setHeaderElementHeight(id, element.clientHeight);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => {
            observer.disconnect();
            setHeaderElementHeight(id, 0);
        };
    }, []);

    return (
        <div ref={ref} className={theme.topRow()}>
            {props.children}
        </div>
    );
}
