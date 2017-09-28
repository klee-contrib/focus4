import {autobind} from "core-decorators";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {Button, ButtonProps} from "react-toolbox/lib/button";
import {IconMenu, Menu, MenuItem, MenuProps} from "react-toolbox/lib/menu";

export {MenuItem, IconMenu};

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends MenuProps {
    /** Les props du bouton. */
    button: ButtonProps & {
        /** L'icône à afficher quand le bouton est ouvert. */
        openedIcon?: React.ReactNode;
    };
}

/** Menu React-Toolbox avec un bouton personnalisable (non icône). */
@autobind
@observer
export class ButtonMenu extends React.Component<ButtonMenuProps, void> {

    /** Menu ouvert. */
    @observable isOpened = false;
    /** Hauteur du bouton, pour placer le menu. */
    @observable buttonHeight = 0;

    private button?: Button;

    // On récupère à tout instant la hauteur du bouton.
    componentDidMount() {
        if (this.button) {
            this.buttonHeight = findDOMNode(this.button).clientHeight;
        }
    }

    componentDidUpdate() {
        if (this.button) {
            this.buttonHeight = findDOMNode(this.button).clientHeight;
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
            position: "absolute",
            top: position.startsWith("top") ? this.buttonHeight : undefined,
            bottom: position.startsWith("bottom") ? this.buttonHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined
        };
    }

    private onClick() {
        this.isOpened = !this.isOpened;
        const {onClick} = this.props;
        if (onClick) {
            onClick();
        }
    }

    render() {
        const {button: {icon, openedIcon, ...buttonProps}, position = "topLeft", ...menuProps} = this.props;
        return (
            <div data-focus="button-menu" style={{position: "relative", display: "inline-block"}}>
                <Button ref={i => this.button = i} {...buttonProps} onClick={this.onClick} icon={this.isOpened && openedIcon ? openedIcon : icon}/>
                <div style={this.menuStyle}>
                    <Menu {...menuProps} position={position} active={this.isOpened} onHide={() => this.isOpened = false}>
                        {menuProps.children}
                    </Menu>
                </div>
            </div>
        );
    }
}

export default ButtonMenu;
