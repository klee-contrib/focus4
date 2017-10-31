import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import * as styles from "./__style__/menu.css";

/** Props du MenuItem. */
export interface MainMenuItemProps extends ButtonProps {
    /** Sous-menu. */
    children?: React.ReactChildren;
    /** La route associée, pour comparaison avec la route active. */
    route?: string;
    /** CSS. */
    theme?: IconButtonTheme;
}

/** Elément de menu. */
export const MainMenuItem = observer<MainMenuItemProps>(props => {
    const {label, icon, onClick, route, theme, children, ...otherProps} = props;
    if (label) {
        return (
            <Button
                {...otherProps}
                icon={icon}
                label={label}
                onClick={onClick}
                theme={theme}
            />
        );
    } else {
        return (
            <IconButton
                {...otherProps}
                icon={icon}
                onClick={onClick}
                theme={theme}
            />
        );
    }
});

export default themr("mainMenu", styles)(MainMenuItem);
