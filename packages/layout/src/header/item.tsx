import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import headerCss, {HeaderCss} from "./__style__/header.css";

/** Props du HeaderItem. */
export interface HeaderItemProps {
    /** Contenu de l'item de header. */
    children?: ReactNode;
    /** Si renseigné, prend tout l'espace disponible (== flex-grow: 1) */
    fillWidth?: boolean;
    /** N'affiche cet item que si le header est en mode sticky. */
    stickyOnly?: boolean;
    /** CSS. */
    theme?: CSSProp<HeaderCss>;
}

/** Item de header, doit être posé dans `HeaderTopRow`. */
export function HeaderItem({children, fillWidth = false, stickyOnly = false, theme: pTheme}: HeaderItemProps) {
    const theme = useTheme("header", headerCss, pTheme);
    return <div className={theme.item({fillWidth, stickyOnly})}>{children}</div>;
}
