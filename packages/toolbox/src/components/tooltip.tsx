import {TooltippedComponentClass, TooltipProps, TooltipTheme} from "react-toolbox/lib/tooltip";
import RTtooltipFactory from "react-toolbox/lib/tooltip/Tooltip";

import rtTooltipTheme from "react-toolbox/components/tooltip/theme.css";
const tooltipTheme: TooltipTheme = rtTooltipTheme;
export {tooltipTheme};

export function Tooltip<P>(Component: React.ComponentType<P>): TooltippedComponentClass<P> {
    return RTtooltipFactory({heme: tooltipTheme})(Component);
}

export {TooltipProps, TooltipTheme};
