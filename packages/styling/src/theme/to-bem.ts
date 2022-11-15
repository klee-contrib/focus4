import classNames from "classnames";
import {pick} from "lodash";

import {BemFunction, CSSElement, CSSMod, CSSToStrings} from "./common";

export type AllMods<CSS> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer _, infer __> ? P : never}[keyof CSS];
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
            [key]: (mods: true | {[key: string]: boolean} = {}) => {
                if (mods !== true) {
                    return classNames(
                        (css as any)[key],
                        ...data[key].filter(mod => mods[mod]).map(mod => (css as any)[`${key}--${mod}`])
                    );
                } else {
                    return pick(css, key, ...data[key].map(mod => `${key}--${mod}`));
                }
            }
        }),
        {}
    ) as ToBem<CSS>;
}

export function fromBem<T>(css: CSSToStrings<T> | Partial<ToBem<T>> | T): CSSToStrings<T> {
    const res: CSSToStrings<T> = {};

    for (const key in css as any) {
        const value = (css as any)[key];
        if (value) {
            if (typeof value === "string") {
                (res as any)[key] = value;
            } else {
                Object.assign(res, value(true));
            }
        }
    }

    return res;
}
