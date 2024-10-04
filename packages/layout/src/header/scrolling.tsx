import {ReactNode, useContext, useLayoutEffect, useRef} from "react";

import {CSSProp, ScrollableContext, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "./__style__/header.css";
export {headerCss};
export type {HeaderCss};

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    /** Children. */
    children?: ReactNode;
    /** Classes CSS. */
    theme?: CSSProp<HeaderCss>;
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
export function HeaderScrolling({canDeploy = true, children, theme: pTheme}: HeaderScrollingProps) {
    const context = useContext(ScrollableContext);
    const theme = useTheme("header", headerCss, pTheme);
    const ref = useRef<HTMLElement>(null);

    useLayoutEffect(() => context.registerHeader(ref.current!, canDeploy), [canDeploy]);
    useLayoutEffect(
        () => context.registerHeaderProps({className: theme.scrolling({sticky: true}), children}),
        [children]
    );

    return (
        <header ref={ref} className={theme.scrolling({deployed: canDeploy, undeployed: !canDeploy})}>
            {children}
        </header>
    );
}
