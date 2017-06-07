import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {Button, ButtonProps} from "react-toolbox/lib/button";
import {IconMenu, Menu, MenuItem, MenuProps} from "react-toolbox/lib/menu";
export {MenuItem, IconMenu};

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends MenuProps {
    /** Les props du bouton. */
    button?: ButtonProps;
}

/** Menu React-Toolbox avec un bouton personnalisable. */
@observer
export class ButtonMenu extends React.Component<ButtonMenuProps, void> {

    static defaultProps = {
        position: "auto"
    };

    /** Menu ouvert. */
    @observable isOpened = false;

    render() {
        const {button, ...menuProps} = this.props;
        return (
            <div style={{position: "relative", display: "inline-block"}}>
                <Button {...button} onClick={() => this.isOpened = !this.isOpened} />
                <Menu {...menuProps} active={this.isOpened} onHide={() => this.isOpened = false}>
                    {menuProps.children}
                </Menu>
            </div>
        );
    }
}

export default ButtonMenu;
