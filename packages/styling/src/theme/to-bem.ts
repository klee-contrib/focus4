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

/**
 * `toBem` permet de transformer un objet de classes CSS, tel que celui importé d'un module CSS, dont les noms respectent la convention BEM
 * en un objet contenant une fonction par "élément" à laquelle on peut appliquer ses "modificateurs".
 *
 * Par exemple, un objet contenant les classes
 * ```ts
 * ["panel", "panel--editing", "panel--loading", "title", "title--top", "title--bottom"]
 * ```
 * sera transformé en un objet avec 2 fonctions `panel` et `title` :
 * ```ts
 * {
 *     panel({editing?: boolean; loading?: boolean}) => string;
 *     title({top?: boolean; bottom?: boolean}) => string;
 * }
 * ```
 * Un appel à une fonction retournera la classe CSS de l'"élément", à laquelle seront ajoutées ou non les classes des différents "modificateurs",
 * selon les valeurs des différents booléens.
 *
 * Vous pouvez utiliser `toBem` pour éviter d'avoir à concaténer des classes CSS à la main et pour rendre vos composants et votre CSS plus propres.
 * Son usage est bien évidemment totalement facultatif et à utiliser si cela vous arrange.
 *
 * _Remarque 1 : Les modules CSS importés doivent avoir des définitions Typescript générés par la commande `focus4 cssgen` du module `@focus4/tooling`._
 *
 * _Remarque 2 : Les propriétés `theme` des différents composants Focus acceptent aussi bien un objet CSS classique ou un objet créé par `toBem`._
 */
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

/**
 * `fromBem` permet de faire la transformation inverse de `toBem`, à savoir prendre l'objet résultant d'un appel à `toBem` et de ressortir un objet
 * qui contient toutes les classes CSS qui le compose.
 */
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
