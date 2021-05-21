import {MouseEvent, MouseEventHandler, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import {findDOMNode} from "react-dom";

import {CSSProp} from "@focus4/styling";

import {Button, ButtonProps} from "../button";
import {tooltipFactory, TooltipProps} from "../tooltip";
import {Menu, MenuProps, MenuTheme} from "./menu";

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends Omit<MenuProps, "theme"> {
    /** Les props du bouton. */
    button: ButtonProps &
        TooltipProps & {
            /** L'icône à afficher quand le bouton est ouvert. */
            openedIcon?: ReactNode;
        };
    onClick?: MouseEventHandler<HTMLButtonElement>;
    theme?: CSSProp<MenuTheme>;
}

const TooltipButton = tooltipFactory()(Button);

/** Menu React-Toolbox avec un bouton personnalisable (non icône). */
export function ButtonMenu({
    button: {icon, openedIcon, ...buttonProps},
    onClick,
    onHide,
    position = "topLeft",
    ...menuProps
}: ButtonMenuProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const button = useRef<any>(null);

    /** Menu ouvert. */
    const [opened, setOpened] = useState(false);

    /** Hauteur du bouton, pour placer le menu. */
    const [buttonHeight, setButtonHeight] = useState(0);

    // On récupère à tout instant la hauteur du bouton.
    useLayoutEffect(() => {
        setButtonHeight((findDOMNode(button.current) as Element).clientHeight);
    });

    const clickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setOpened(o => !o);
            onClick?.(e);
        },
        [onClick]
    );

    const hideHandler = useCallback(() => {
        setOpened(false);
        onHide?.();
    }, [onHide]);

    /** Génère le style à passer au menu pour le positionner, en fonction de la position souhaitée et de la taille du bouton. */
    const menuStyle = useMemo(() => {
        if (position === "auto") {
            return undefined;
        }
        return {
            position: "absolute" as const,
            top: position.startsWith("top") ? buttonHeight : undefined,
            bottom: position.startsWith("bottom") ? buttonHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined
        };
    }, [position, buttonHeight]);

    const FinalButton = buttonProps.tooltip ? TooltipButton : Button;
    return (
        <div data-focus="button-menu" ref={ref} style={{position: "relative", display: "inline-block"}}>
            <FinalButton
                ref={button}
                {...buttonProps}
                onClick={clickHandler}
                icon={opened && openedIcon ? openedIcon : icon}
            />
            <div style={menuStyle}>
                <Menu {...menuProps} theme={menuProps.theme} position={position} active={opened} onHide={hideHandler}>
                    {menuProps.children}
                </Menu>
            </div>
        </div>
    );
}
