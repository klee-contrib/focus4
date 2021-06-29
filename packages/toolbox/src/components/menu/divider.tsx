import {MenuDividerTheme} from "react-toolbox/lib/menu/MenuDivider";

import {CSSProp, useTheme} from "@focus4/styling";
import menuTheme from "react-toolbox/components/menu/theme.css";
export {MenuDividerTheme};

export interface MenuDividerProps {
    /** Classnames object defining the component style. */
    theme: CSSProp<MenuDividerTheme>;
}

export function MenuDivider({theme: pTheme}: MenuDividerProps) {
    const theme = useTheme("RTMenu", menuTheme as MenuDividerTheme, pTheme);
    return <hr data-react-toolbox="menu-divider" className={theme.menuDivider()} />;
}
