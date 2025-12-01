import {autorun, IReactionOptions, reaction, when} from "mobx";
import {ComponentLifecycle} from "react";

/** Classe React. */
type RCL = ComponentLifecycle<any, any> & {[key: string]: any};

/** Décorateur permettant, dans une classe React, de poser un autorun sur la fonction décorée. */
export function classAutorun(targetMethod: () => void, context: ClassMethodDecoratorContext) {
    patchClass("autorun", targetMethod, context);
}

/**
 * Décorateur permettant, dans une classe React, de poser une réaction sur la fonction décorée.
 * @param expression L'expression à tracker pour la réaction. Si le contexte est nécessaire, le passer dans un lambda englobant.
 * @param opts Les options de la réaction.
 */
export function classReaction<T extends RCL, R>(expression: (inst: T) => () => R, opts?: IReactionOptions<T, boolean>) {
    return function cReaction(targetMethod: (p: R) => void, context: ClassMethodDecoratorContext<T>) {
        patchClass("reaction", targetMethod, context, expression, opts);
    };
}

/**
 * Décorateur permettant, dans une classe React, de poser un `when` sur la fonction décorée.
 * @param expression L'expression à tracker pour le when. Si le contexte est nécessaire, le passer dans un lambda englobant.
 */
export function classWhen<T extends RCL>(expression: (inst: T) => () => boolean) {
    return function cWhen(targetMethod: () => boolean, context: ClassMethodDecoratorContext<T>) {
        patchClass("when", targetMethod, context, expression);
    };
}

function patchClass<T extends RCL>(
    type: "autorun" | "reaction" | "when",
    targetMethod: (r?: any) => void,
    context: ClassMethodDecoratorContext<T>,
    expression?: (inst: T) => any,
    opts?: IReactionOptions<T, boolean>
) {
    const propertyKey = context.name.toString();
    context.addInitializer(function initializer(this: T) {
        function UNSAFE_componentWillMount(this: T) {
            const r = targetMethod.bind(this);
            (this as any)[`${type}_${propertyKey}`] =
                type === "autorun"
                    ? autorun(r)
                    : type === "reaction"
                      ? reaction(expression!(this), r, opts)
                      : type === "when"
                        ? when(expression!(this), r)
                        : undefined;
        }

        function componentWillUnmount(this: T) {
            this[`${type}_${propertyKey}`]();
        }

        const baseCWM = this.UNSAFE_componentWillMount;
        const baseCWUM = this.componentWillUnmount;

        this.UNSAFE_componentWillMount = !baseCWM
            ? UNSAFE_componentWillMount
            : function CWM(this: RCL) {
                  baseCWM.apply(this);
                  UNSAFE_componentWillMount.apply(this as T);
              };
        this.componentWillUnmount = !baseCWUM
            ? componentWillUnmount
            : function CWUM(this: RCL) {
                  baseCWUM.apply(this);
                  componentWillUnmount.apply(this as T);
              };
    });
}
