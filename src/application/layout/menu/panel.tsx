import * as React from "react";
import {themr} from "react-css-themr";

import {MenuStyle, styles} from "./item";

export interface MenuPanelProps {
    close: () => void;
    xOffset: number;
    yOffset: number;
    opened: boolean;
    theme?: MenuStyle;
}

@themr("menu", styles)
export class MenuPanel extends React.Component<MenuPanelProps, void> {

    render() {
        const {children, close, opened, xOffset, yOffset, theme} = this.props;
        return (
            <div className={opened && theme!.panelWrapper || ""} onClick={close}>
                <div className={`${theme!.panel} ${theme!.animate} ${opened ? theme!.open : theme!.close}`} style={{top: yOffset, left: xOffset}}>
                    {children}
                </div>
            </div>
        );
    }
}
