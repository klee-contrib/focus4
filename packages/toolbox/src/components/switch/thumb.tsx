import {MouseEventHandler, ReactNode, TouchEventHandler} from "react";

import {ToBem} from "@focus4/styling";
import {SwitchCss} from "../__style__/switch.css";

import {rippleFactory} from "../ripple";

export interface ThumbProps {
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLSpanElement>;
    onTouchStart?: TouchEventHandler<HTMLSpanElement>;
    theme: ToBem<SwitchCss>;
}

export const Thumb = rippleFactory({rippleCentered: true, rippleSpread: 2.6})(function RTThumb({
    children,
    onMouseDown,
    onTouchStart,
    theme
}: ThumbProps) {
    return (
        <span className={theme.thumb()} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
            {children}
        </span>
    );
});
