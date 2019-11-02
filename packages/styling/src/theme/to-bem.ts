import {CSSElement, CSSMod, CSSToStrings} from "./common";

type AllMods<T> = {[P in keyof T]: T[P] extends CSSMod<infer _, infer __> ? P : never}[keyof T];
type Mods<T, A> = {[P in keyof T]: T[P] extends CSSMod<infer N, A> ? N : never}[keyof T];

export type ToBem<T> = Omit<
    {
        [P in keyof T]-?: T[P] extends CSSElement<infer A>
            ? Mods<T, A> extends never
                ? () => string
                : ((mods?: {[Q in Mods<T, A>]?: boolean}) => string)
            : T[P] extends CSSMod<infer __, infer ___>
            ? never
            : () => string;
    },
    AllMods<T>
>;

export function toBem<T>(css: T): ToBem<T> {
    return css as any;
}

export function fromBem<T>(css: T): CSSToStrings<T> {
    return css as any;
}
