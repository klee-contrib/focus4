import {autorun, IReactionOptions, reaction} from "mobx";

/** Classe React. */
export type RCL = React.ComponentLifecycle<any, any> & {[key: string]: any};

/** Type d'expressions possibles pour le décorateur de réaction. */
export type ReactionExpression<T> = ((inst: T) => () => {}) | (() => {});

/** Décorateur permettant, dans une classe React, de poser un autorun sur la fonction décorée. */
export function classAutorun(target: RCL, propertyKey: keyof RCL, _: TypedPropertyDescriptor<any>) {
    function componentWillMount(this: RCL) {
        this[`$autorun_${propertyKey}`] = autorun((target[propertyKey]).bind(this));
    }

    function componentWillUnmount(this: RCL) {
        this[`$autorun_${propertyKey}`]();
    }

    const baseCWM = target.componentWillMount;
    const baseCWUM = target.componentWillUnmount;

    target.componentWillMount = !baseCWM ? componentWillMount : function(this: RCL) { componentWillMount.apply(this); baseCWM.apply(this); };
    target.componentWillUnmount = !baseCWUM ? componentWillUnmount : function(this: RCL) { componentWillUnmount.apply(this); baseCWUM.apply(this); };
}

/**
 * Décorateur permettant, dans une classe React, de poser une réaction sur la fonction décorée.
 * @param expression L'expression à tracker pour la réaction. Si le contexte est nécessaire, le passer dans un lambda englobant.
 * @param opts Les options de la réaction.
 */
export function classReaction<T extends RCL>(expression: ReactionExpression<T>, opts?: IReactionOptions) {
    return function(instance: RCL, propertyKey: keyof RCL) {
        function componentWillMount(this: T) {
            this[`$reaction_${propertyKey}`] = reaction(hasExpressionThis(expression) ? expression(this) : expression, instance[propertyKey].bind(this), opts);
        }

        function componentWillUnmount(this: RCL) {
            this[`$reaction_${propertyKey}`]();
        }

        const baseCWM = instance.componentWillMount;
        const baseCWUM = instance.componentWillUnmount;

        instance.componentWillMount = !baseCWM ? componentWillMount : function(this: RCL) { componentWillMount.apply(this); baseCWM.apply(this); };
        instance.componentWillUnmount = !baseCWUM ? componentWillUnmount : function(this: RCL) { componentWillUnmount.apply(this); baseCWUM.apply(this); };
    };
}

/** Permet de distinguer le type d'expression fourni à la réaction. */
function hasExpressionThis<T extends RCL>(expression: ReactionExpression<T>): expression is (inst: T) => () => {} {
    return typeof (expression as ((inst: T) => () => {}))({} as any) === "function";
}
