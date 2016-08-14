import tape = require("tape");
import {shallow} from "enzyme";
import {Component, ComponentClass, ReactElement} from "react";
import {setDefaultComponents} from "../component/defaults";
import {set} from "../reference/config";

export const dum = {
    any: {} as any,
    array: [],
    boolean: true,
    component: class extends Component<any, any> { render() { return null; }} as ComponentClass<any>,
    function: (...args: any[]) => null as any,
    number: 1,
    string: "yolo"
};

console.error = () => undefined;
setDefaultComponents({
    ActionBar: dum.component,
    Button: dum.component,
    ButtonBackToTop: dum.component,
    Checkbox: dum.component,
    ContextualActions: dum.component,
    FacetBox: dum.component,
    Field: dum.component,
    SearchBar: dum.component,
    TopicDisplayer: dum.component
});
set({scopes: () => Promise.resolve([])});

export function test(name: string, Element: ReactElement<any>) {
    tape(name, t => {
        try {
            t.ok(shallow(Element).render(), "Ok");
        } catch (e) {
            t.error(e);
        } finally {
            t.end();
        }
    });
}
