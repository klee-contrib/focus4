import {CSSProp, useTheme} from "@focus4/styling";

import menuCss, {MenuCss} from "../__style__/menu.css";

export interface MenuDividerProps {
    /** Classnames object defining the component style. */
    theme: CSSProp<MenuCss>;
}

export function MenuDivider({theme: pTheme}: MenuDividerProps) {
    const theme = useTheme("RTMenu", menuCss, pTheme);
    return <hr className={theme.menuDivider()} data-react-toolbox="menu-divider" />;
}
