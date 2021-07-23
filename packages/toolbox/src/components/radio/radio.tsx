import {MouseEventHandler, ReactNode, TouchEventHandler} from "react";

import {ToBem} from "@focus4/styling";

import {rippleFactory} from "../ripple";

import {RadioCss} from "../__style__/radio.css";


export interface RadioProps {
    checked: boolean;
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLSpanElement>;
    onTouchStart?: TouchEventHandler<HTMLSpanElement>;
    theme: ToBem<RadioCss>;
}

export const Radio = rippleFactory({rippleCentered: true, rippleSpread: 2.6})(function RTRadio({
    checked,
    children,
    onMouseDown,
    onTouchStart,
    theme
}: RadioProps) {
    return (
        <div
            className={theme.radio({checked})}
            data-react-toolbox="radio"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {children}
        </div>
    );
});
