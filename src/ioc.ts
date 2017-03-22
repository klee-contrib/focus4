import {Container} from "inversify";
import getDecorators from "inversify-inject-decorators";
import "reflect-metadata";

export const container = new Container();

const {lazyInject} = getDecorators(container);

export function inject(name: string) {
    return lazyInject(name);
}

export function resolve(name: string) {
    return container.get(name);
}
