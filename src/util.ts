import {autorun, IReactionOptions, reaction, when} from "mobx";

/** Classe React. */
export type RCL = React.ComponentLifecycle<any, any> & {[key: string]: any};

/** Type d'expressions possibles pour le décorateur de réaction. */
export type ReactionExpression<T> = ((inst: T) => () => {}) | (() => {});

/** Type d'expressions possibles pour le décorateur de `when` */
export type WhenExpression<T> = ((inst: T) => () => boolean) | (() => boolean);

/** Décorateur permettant, dans une classe React, de poser un autorun sur la fonction décorée. */
export function classAutorun(target: RCL, propertyKey: keyof RCL, _: TypedPropertyDescriptor<any>) {
    patchClass("autorun", target, propertyKey);
}

/**
 * Décorateur permettant, dans une classe React, de poser une réaction sur la fonction décorée.
 * @param expression L'expression à tracker pour la réaction. Si le contexte est nécessaire, le passer dans un lambda englobant.
 * @param opts Les options de la réaction.
 */
export function classReaction<T extends RCL>(expression: ReactionExpression<T>, opts?: IReactionOptions) {
    return function(instance: T, propertyKey: keyof RCL) {
        patchClass("reaction", instance, propertyKey, expression, opts);
    };
}

/**
 * Décorateur permettant, dans une classe React, de poser un `when` sur la fonction décorée.
 * @param expression L'expression à tracker pour le when. Si le contexte est nécessaire, le passer dans un lambda englobant.
 */
export function classWhen<T extends RCL>(expression: WhenExpression<T>) {
    return function(instance: T, propertyKey: keyof RCL) {
        patchClass("when", instance, propertyKey, expression);
    };
}

function patchClass<T extends RCL>(type: "autorun" | "reaction" | "when", instance: T, propertyKey: keyof T, expression?: WhenExpression<T> | ReactionExpression<T>, opts?: IReactionOptions) {
    function componentWillMount(this: T) {
        this[`${type}_${propertyKey}`] =
            type === "autorun" ?
                autorun((instance[propertyKey]).bind(this))
          : type === "reaction" ?
                reaction(hasExpressionThis(expression) ? expression(this) : expression as any, instance[propertyKey].bind(this), opts)
          : type === "when" ?
                when(hasExpressionThis(expression) ? expression(this) : expression as any, instance[propertyKey].bind(this))
          : undefined;
    }

    function componentWillUnmount(this: RCL) {
        this[`${type}_${propertyKey}`]();
    }

    const baseCWM = instance.componentWillMount;
    const baseCWUM = instance.componentWillUnmount;

    instance.componentWillMount = !baseCWM ? componentWillMount : function(this: RCL) { baseCWM.apply(this); componentWillMount.apply(this); };
    instance.componentWillUnmount = !baseCWUM ? componentWillUnmount : function(this: RCL) { baseCWUM.apply(this); componentWillUnmount.apply(this); };
}

/** Permet de distinguer le type d'expression fourni à la réaction. */
function hasExpressionThis<T extends RCL>(expression?: ReactionExpression<T> | WhenExpression<T>): expression is (inst: T) => () => {} {
    return typeof (expression as ((inst: T) => () => any))({} as any) === "function";
}
