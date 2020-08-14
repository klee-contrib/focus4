import * as React from "react";

import {CSSProp, ScrollableContext, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "./__style__/header.css";
export {headerCss, HeaderCss};

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    /** Children. */
    children?: React.ReactNode;
    /** Classes CSS. */
    theme?: CSSProp<HeaderCss>;
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
export function HeaderScrolling({canDeploy = true, children, theme: pTheme}: HeaderScrollingProps) {
    const context = React.useContext(ScrollableContext);
    const theme = useTheme("header", headerCss, pTheme);
    const ref = React.useRef<HTMLElement>(null);

    React.useLayoutEffect(() => context.registerHeader(ref.current!, canDeploy), [canDeploy]);
    React.useLayoutEffect(() => context.registerHeaderProps({className: theme.scrolling({sticky: true}), children}), [
        children
    ]);

    return (
        <header className={theme.scrolling({deployed: canDeploy, undeployed: !canDeploy})} ref={ref}>
            {children}
        </header>
    );
}
