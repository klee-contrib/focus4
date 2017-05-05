(global as any)["window"] = {addEventListener: () => null, navigator: {}};
(global as any)["document"] = {documentElement: {}};
(global as any)["componentHandler"] = {};
(global as any)["Element"] = {prototype: {}};

import "ignore-styles";
import {Component, ComponentClass, ReactElement} from "react";
import {createRenderer} from "react-addons-test-utils";
import * as tape from "tape";

import {StoreNode} from "../entity";
import {ListStore} from "../list";
import {SearchStore} from "../search";
export {StoreNode};

export const dum = {
    any: {} as any,
    boolean: true,
    component: class extends Component<any, any> { render() { return null; }} as ComponentClass<any>,
    function: (..._: any[]) => null as any,
    number: 1,
    string: "yolo"
};

export const dumClass = {
    ListStoreBase: new ListStore(),
    SearchStore: new SearchStore({scoped: (_: any) => Promise.resolve({} as any), unscoped: (_: any) => Promise.resolve({} as any)})
};

export function test(name: string, Element: ReactElement<any>) {
    tape(name, t => {
        try {
            t.ok(createRenderer().render(Element) || true, "Ok");
        } catch (e) {
            t.error(e);
        } finally {
            t.end();
        }
    });
}
