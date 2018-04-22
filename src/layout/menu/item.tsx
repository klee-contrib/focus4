import * as React from "react";
import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import {themr} from "../../theme";

import * as styles from "./__style__/menu.css";
const Theme = themr("mainMenu", styles);

/** Props du MenuItem. */
export interface MainMenuItemProps extends ButtonProps {
    /** La route associée, pour comparaison avec la route active. */
    route?: string;
    /** CSS. */
    theme?: IconButtonTheme;
}

/** Elément de menu. */
export function MainMenuItem(props: MainMenuItemProps) {
    const {label, icon, onClick, route, children, ...otherProps} = props;
    if (label) {
        return (
            <Theme theme={props.theme}>
                {theme =>
                    <Button
                        {...otherProps}
                        icon={icon}
                        label={label}
                        onClick={onClick}
                        theme={theme}
                    />
                }
            </Theme>
        );
    } else {
        return (
            <Theme theme={props.theme}>
                {theme =>
                    <IconButton
                        {...otherProps}
                        icon={icon}
                        onClick={onClick}
                        theme={theme}
                    />
                }
            </Theme>
        );
    }
}
