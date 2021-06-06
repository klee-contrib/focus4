import {MouseEventHandler, ReactNode, TouchEventHandler} from "react";
import {RadioTheme} from "react-toolbox/lib/radio/base";

import {rippleFactory} from "../ripple";

export {RadioTheme};

export interface RadioProps {
    checked: boolean;
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLSpanElement>;
    onTouchStart?: TouchEventHandler<HTMLSpanElement>;
    theme: RadioTheme;
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
            data-react-toolbox="radio"
            className={theme[checked ? "radioChecked" : "radio"]}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {children}
        </div>
    );
});
