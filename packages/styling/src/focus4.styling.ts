import "./global.css";
import "./variables";

export {getDefaultTransition, getSpringTransition} from "./animation";
export {uiConfig} from "./config";
export {fromBem, themeable, ThemeContext, ThemeProvider, toBem, useTheme} from "./theme";

export type {
    CSSContext,
    CSSElement,
    CSSMod,
    CSSProp,
    CSSToStrings,
    FocusCSSContext,
    ThemeProviderProps,
    ToBem
} from "./theme";
