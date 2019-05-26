import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {Button, ButtonProps, IconMenu, Menu, MenuItem, MenuProps, tooltipFactory, TooltipProps} from "@focus4/toolbox";

export {MenuItem, IconMenu};

const TooltipButton = tooltipFactory()(Button);

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends MenuProps {
    /** Les props du bouton. */
    button: ButtonProps &
        TooltipProps & {
            /** L'icône à afficher quand le bouton est ouvert. */
            openedIcon?: React.ReactNode;
        };
}

/** Menu React-Toolbox avec un bouton personnalisable (non icône). */
@observer
export class ButtonMenu extends React.Component<ButtonMenuProps> {
    /** Menu ouvert. */
    @observable isOpened = false;
    /** Hauteur du bouton, pour placer le menu. */
    @observable buttonHeight = 0;

    private button?: React.Component<any> | null;

    // On récupère à tout instant la hauteur du bouton.
    componentDidMount() {
        if (this.button) {
            this.buttonHeight = (findDOMNode(this.button) as Element).clientHeight;
        }
    }

    componentDidUpdate() {
        if (this.button) {
            this.buttonHeight = (findDOMNode(this.button) as Element).clientHeight;
        }
    }

    /** Génère le style à passer au menu pour le positionner, en fonction de la position souhaitée et de la taille du bouton. */
    @computed.struct
    private get menuStyle() {
        const {position = "topLeft"} = this.props;
        if (position === "auto") {
            return undefined;
        }
        return {
            position: "absolute" as "absolute",
            top: position.startsWith("top") ? this.buttonHeight : undefined,
            bottom: position.startsWith("bottom") ? this.buttonHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined
        };
    }

    @action.bound
    private onClick() {
        this.isOpened = true;
        const {onClick} = this.props;
        if (onClick) {
            onClick();
        }
    }

    @action.bound
    private onHide() {
        this.isOpened = false;
        const {onHide} = this.props;
        if (onHide) {
            onHide();
        }
    }

    render() {
        const {
            button: {icon, openedIcon, ...buttonProps},
            position = "topLeft",
            ...menuProps
        } = this.props;
        const FinalButton = buttonProps.tooltip ? TooltipButton : Button;
        return (
            <div data-focus="button-menu" style={{position: "relative", display: "inline-block"}}>
                <FinalButton
                    ref={(i: any) => (this.button = i)}
                    {...buttonProps}
                    onClick={this.onClick}
                    icon={this.isOpened && openedIcon ? openedIcon : icon}
                />

                <div style={this.menuStyle}>
                    <Menu {...menuProps} position={position} active={this.isOpened} onHide={this.onHide}>
                        {menuProps.children}
                    </Menu>
                </div>
            </div>
        );
    }
}
