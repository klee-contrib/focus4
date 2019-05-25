import {RippledComponentFactory, RippleProps, RippleTheme} from "react-toolbox/lib/ripple";
import RTrippleFactory from "react-toolbox/lib/ripple/Ripple";

import rtRippleTheme from "react-toolbox/components/ripple/theme.css";
const rippleTheme: RippleTheme = rtRippleTheme;
export {rippleTheme};

export function rippleFactory(options: RippleProps): RippledComponentFactory {
    return RTrippleFactory({...options, theme: rippleTheme});
}

export {RippleProps, RippleTheme};
