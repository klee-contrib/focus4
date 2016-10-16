import {createRenderer} from "react-addons-test-utils";
import {Component, ComponentClass, ReactElement} from "react";
import tape = require("tape");

import {ListStore} from "../list";
import {SearchStore} from "../search";

(global as any)["window"] = {};
(global as any)["document"] = {documentElement: {}};

export const dum = {
    any: {} as any,
    array: [],
    boolean: true,
    component: class extends Component<any, any> { render() { return null; }} as ComponentClass<any>,
    function: (...args: any[]) => null as any,
    number: 1,
    string: "yolo"
};

export const dumClass = {
    ListStore: new ListStore((data: any) => Promise.resolve({dataList: [], totalCount: 0})),
    SearchStore: new SearchStore({scoped: (data: any) => Promise.resolve({}), unscoped: (data: any) => Promise.resolve({})})
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
