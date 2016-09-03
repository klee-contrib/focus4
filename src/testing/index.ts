import {shallow} from "enzyme";
import {Component, ComponentClass, ReactElement} from "react";
import tape = require("tape");

import {SearchStore} from "..";
import {setDefaultComponents} from "../defaults";

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
    SearchStore: new SearchStore({scoped: (data: any) => Promise.resolve({}), unscoped: (data: any) => Promise.resolve({})})
};

setDefaultComponents({
    ActionBar: dum.component,
    Button: dum.component,
    ButtonBackToTop: dum.component,
    Checkbox: dum.component,
    ContextualActions: dum.component,
    Field: dum.component,
    InputText: dum.component,
    Scope: dum.component,
    TopicDisplayer: dum.component
});

export function test(name: string, Element: ReactElement<any>) {
    tape(name, t => {
        try {
            t.ok(shallow(Element), "Ok");
        } catch (e) {
            t.error(e);
        } finally {
            t.end();
        }
    });
}
