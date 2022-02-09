import {autorun, IReactionOptions, reaction, when} from "mobx";
import {ComponentLifecycle} from "react";

/** Classe React. */
export type RCL = ComponentLifecycle<any, any> & {[key: string]: any};

/** Type d'expressions possibles pour le décorateur de réaction. */
export type ReactionExpression<T> = ((inst: T) => () => any) | (() => any);

/** Type d'expressions possibles pour le décorateur de `when` */
export type WhenExpression<T> = ((inst: T) => () => boolean) | (() => boolean);

/** Utiliser `@disposeOnUnmount` sur la réaction à la place, si possible. */
/** Décorateur permettant, dans une classe React, de poser un autorun sur la fonction décorée. */
export function classAutorun(target: RCL, propertyKey: keyof RCL & string) {
    patchClass("autorun", target, propertyKey);
}

/** Utiliser `@disposeOnUnmount` sur la réaction à la place, si possible. */
/**
 * Décorateur permettant, dans une classe React, de poser une réaction sur la fonction décorée.
 * @param expression L'expression à tracker pour la réaction. Si le contexte est nécessaire, le passer dans un lambda englobant.
 * @param opts Les options de la réaction.
 */
export function classReaction<T extends RCL>(expression: ReactionExpression<T>, opts?: IReactionOptions<T, boolean>) {
    return function cReaction(instance: T, propertyKey: keyof RCL & string) {
        patchClass("reaction", instance, propertyKey, expression, opts);
    };
}

/** Utiliser `@disposeOnUnmount` sur la réaction à la place, si possible. */
/**
 * Décorateur permettant, dans une classe React, de poser un `when` sur la fonction décorée.
 * @param expression L'expression à tracker pour le when. Si le contexte est nécessaire, le passer dans un lambda englobant.
 */
export function classWhen<T extends RCL>(expression: WhenExpression<T>) {
    return function cWhen(instance: T, propertyKey: keyof RCL & string) {
        patchClass("when", instance, propertyKey, expression);
    };
}

function patchClass<T extends RCL>(
    type: "autorun" | "reaction" | "when",
    instance: T,
    propertyKey: keyof T & string,
    expression?: WhenExpression<T> | ReactionExpression<T>,
    opts?: IReactionOptions<T, boolean>
) {
    function componentWillMount(this: T) {
        const r = this[propertyKey].bind(this);

        (this as any)[`${type}_${propertyKey}`] =
            type === "autorun"
                ? autorun(r)
                : type === "reaction"
                ? reaction(hasExpressionThis(expression) ? expression(this) : (expression as any), r, opts)
                : type === "when"
                ? when(hasExpressionThis(expression) ? expression(this) : (expression as any), r)
                : undefined;
    }

    function componentWillUnmount(this: T) {
        this[`${type}_${propertyKey}`]();
    }

    const baseCWM = instance.componentWillMount;
    const baseCWUM = instance.componentWillUnmount;

    instance.componentWillMount = !baseCWM
        ? componentWillMount
        : function CWM(this: RCL) {
              baseCWM.apply(this);
              componentWillMount.apply(this as T);
          };
    instance.componentWillUnmount = !baseCWUM
        ? componentWillUnmount
        : function CWUM(this: RCL) {
              baseCWUM.apply(this);
              componentWillUnmount.apply(this as T);
          };
}

/** Permet de distinguer le type d'expression fourni à la réaction. */
function hasExpressionThis<T extends RCL>(
    expression?: ReactionExpression<T> | WhenExpression<T>
): expression is (inst: T) => () => {} {
    return typeof (expression as (inst: T) => () => any)({} as any) === "function";
}
