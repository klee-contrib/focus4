import {Container} from "inversify";
import getDecorators from "inversify-inject-decorators";
import "reflect-metadata";

/** Container pour l'injection de dépendances. */
export const container = new Container();

const {lazyInject} = getDecorators(container);

/**
 * Décorateur pour injecter un composant/service dans une propriété de classe.
 * @param name Le nom du binding.
 */
export function injectByName(name: string) {
    return lazyInject(name);
}

/**
 * Décorateur pour injecter un composant/service dans une propriété de classe.
 *
 * Le nom de la propriété est utilisé comme nom du binding.
 */
export function injectByPropName(target: Object, propertyKey: string) {
    lazyInject(propertyKey)(target, propertyKey);
}
