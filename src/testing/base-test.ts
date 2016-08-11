import tape = require("tape");
import {shallow} from "enzyme";
import {Component, ComponentClass, ReactElement} from "react";
import {setDefaultComponents} from "../component/defaults";

export const dum = {
    any: {} as any,
    array: [],
    boolean: true,
    class: class extends Component<any, any> { render() { return null; }} as ComponentClass<any>,
    function: (...args: any[]) => null as any,
    number: 1,
    string: "yolo"
};

console.error = () => undefined;
setDefaultComponents({
    ActionBar: dum.class,
    Button: dum.class,
    ButtonBackToTop: dum.class,
    Checkbox: dum.class,
    ContextualActions: dum.class,
    FacetBox: dum.class,
    Field: dum.class,
    SearchBar: dum.class,
    TopicDisplayer: dum.class
});

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
