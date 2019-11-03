import classNames from "classnames";
import {pick} from "lodash";

import {CSSElement, CSSMod, CSSToStrings} from "./common";

export type AllMods<CSS> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer _, infer __> ? P : never}[keyof CSS];
export type Mods<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer M, E> ? M : never}[keyof CSS];
export type ModNames<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer _, E> ? P : never}[keyof CSS];

export type BemFunction<CSS = any, P extends string | number | symbol = any, E = any> = (Mods<CSS, E> extends
    | never
    | undefined
    ? () => string
    : (mods?: {[_ in Mods<CSS, E>]?: boolean}) => string) &
    ((object: true) => {[_ in P | ModNames<CSS, E>]: string});

export type ToBem<CSS> = Omit<
    {
        [P in keyof CSS]-?: CSS[P] extends CSSElement<infer E>
            ? BemFunction<CSS, P, E>
            : CSS[P] extends CSSMod<infer __, infer ___>
            ? never
            : BemFunction<CSS, P, string>;
    },
    AllMods<CSS>
>;

export type CSSProp<CSS> = CSSToStrings<CSS> | Partial<ToBem<CSS>>;

export function toBem<CSS>(css: CSS): ToBem<CSS> {
    const data: {[key: string]: string[]} = {};
    for (const key in css) {
        const [element, modifier] = key.split("--");
        if (data[element] && modifier) {
            data[element].push(modifier);
        } else if (!data[element]) {
            data[element] = modifier ? [modifier] : [];
        }
    }

    return Object.keys(data).reduce(
        (bem, key) => ({
            ...bem,
            [key]: (mods: true | {[key: string]: boolean}) => {
                if (mods !== true) {
                    return classNames(
                        (css as any)[key],
                        ...data[key].filter(mod => mods[mod]).map(mod => (css as any)[mod])
                    );
                } else {
                    return pick(css, key, ...data[key]);
                }
            }
        }),
        {}
    ) as ToBem<CSS>;
}

export function fromBem<T>(css: T | CSSToStrings<T> | Partial<ToBem<T>>): CSSToStrings<T> {
    const res: CSSToStrings<T> = {};

    for (const key in css as any) {
        const value = (css as any)[key];
        if (typeof value === "string") {
            (res as any)[key] = value;
        } else {
            Object.assign(res, value(true));
        }
    }

    return res;
}
