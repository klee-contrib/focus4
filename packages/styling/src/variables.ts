import {kebabCase} from "lodash";
import "./variables/index.css";
import {CSSVariables} from "./variables/variables";

export function css(va: CSSVariables): Record<string, string> {
    return Object.keys(va)
        .map(k => ({[`--${kebabCase(k)}`]: va[k as keyof CSSVariables]}))
        .reduce((a, b) => ({...a, ...b}), {});
}
