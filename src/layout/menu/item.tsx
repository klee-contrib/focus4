import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import * as styles from "./__style__/menu.css";
export {styles};

export type MenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Props du MenuItem. */
export interface MenuItemProps extends ButtonProps {
    /** Sous-menu. */
    children?: React.ReactChildren;
    /** La route associée, pour comparaison avec la route active. */
    route?: string;
    /** CSS. */
    theme?: MenuStyle;
}

/** Elément de menu. */
export const MenuItem = observer<MenuItemProps>(props => {
    const {label, icon, onClick, route, theme, children, ...otherProps} = props;
    if (label) {
        return (
            <Button
                {...otherProps}
                icon={icon}
                label={label}
                onClick={onClick}
                theme={{
                    button: theme!.button,
                    icon: theme!.icon,
                    neutral: theme!.neutral
                }}
            />
        );
    } else {
        return (
            <IconButton
                {...otherProps}
                icon={icon}
                onClick={onClick}
                theme={{
                    toggle: theme!.toggle,
                    icon: theme!.icon,
                    neutral: theme!.neutral,
                    rippleWrapper: theme!.rippleWrapper
                }}
            />
        );
    }
});

export default themr("menu", styles)(MenuItem);
