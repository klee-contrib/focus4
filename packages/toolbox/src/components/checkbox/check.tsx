import classnames from "classnames";
import {CSSProperties, MouseEventHandler, ReactNode, TouchEventHandler} from "react";

import {rippleFactory} from "../ripple";

export interface CheckProps {
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLDivElement>;
    onTouchStart?: TouchEventHandler<HTMLDivElement>;
    style?: CSSProperties;
    theme: {check?: string; checked?: string};
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
            data-react-toolbox="check"
            className={classnames(theme.check, {[theme.checked!]: value})}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={style}
        >
            {children}
        </div>
    );
});
