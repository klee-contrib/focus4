import {CSSProperties, MouseEventHandler, ReactNode, TouchEventHandler} from "react";

import {ToBem} from "@focus4/styling";

import {rippleFactory} from "../ripple";

import {CheckboxCss} from "../__style__/checkbox.css";


export interface CheckProps {
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLDivElement>;
    onTouchStart?: TouchEventHandler<HTMLDivElement>;
    style?: CSSProperties;
    theme: ToBem<CheckboxCss>;
    value: boolean;
}

export const Check = rippleFactory({rippleCentered: true, rippleSpread: 2.6})(function RTCheck({
    children,
    onMouseDown,
    onTouchStart,
    style,
    theme,
    value
}: CheckProps) {
    return (
        <div
            className={theme.check({checked: value})}
            data-react-toolbox="check"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={style}
        >
            {children}
        </div>
    );
});
