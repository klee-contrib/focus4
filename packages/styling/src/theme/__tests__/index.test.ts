import {describe, expect, test} from "vitest";

import {CSSElement, CSSMod} from "../common";
import {themeable} from "../themeable";
import {fromBem, toBem} from "../to-bem";

interface Actions {
    _f6135: void;
}
interface Title {
    _4bf8f: void;
}

interface PanelCss {
    actions: CSSElement<Actions>;
    title: CSSElement<Title>;
    "title--bottom": CSSMod<"bottom", Title>;
    "title--top": CSSMod<"top", Title>;
}

const panelCss: PanelCss = {
    actions: "el-actions",
    title: "el-title",
    "title--bottom": "mod-bottom",
    "title--top": "mod-top"
} as any;

describe("toBem : usage simple", () => {
    const panelBem = toBem(panelCss);

    test("élement sans modifiers", () => expect(panelBem.actions()).toBe("el-actions"));
    test("élément avec modifiers appelé sans", () => expect(panelBem.title()).toBe("el-title"));
    test("élément avec modifiers appelé avec 1", () =>
        expect(panelBem.title({bottom: true})).toBe("el-title mod-bottom"));
    test("élément avec modifiers appelé avec 1 autre", () =>
        expect(panelBem.title({top: true})).toBe("el-title mod-top"));
    test("élément avec modifiers appelé avec 2", () =>
        expect(panelBem.title({bottom: true, top: true})).toBe("el-title mod-bottom mod-top"));
    test("élément avec modifiers appelé avec 2 à l'envers", () =>
        expect(panelBem.title({top: true, bottom: true})).toBe("el-title mod-bottom mod-top"));
});

describe("toBem : usage alternatif", () => {
    const panelBem = toBem(panelCss);

    test("élement sans modifiers", () => expect(panelBem.actions(true)).toStrictEqual({actions: "el-actions"}));
    test("élément avec modifiers", () =>
        expect(panelBem.title(true)).toStrictEqual({
            title: "el-title",
            "title--top": "mod-top",
            "title--bottom": "mod-bottom"
        }));
});

describe("fromBem : à partir d'un bem", () => {
    const panelCss2 = fromBem(toBem(panelCss));
    test("on retrouve le même css", () => expect(panelCss2).toStrictEqual(panelCss));
});

describe("fromBem : à partir d'un css", () => {
    const panelCss2 = fromBem(panelCss);
    test("on retrouve le même css", () => expect(panelCss2).toStrictEqual(panelCss));
});

describe("fromBem : à partir d'un mix", () => {
    const css = fromBem({...toBem(panelCss), lol: "salut", lol2: "yo"});
    test("on trouve le bon css", () => expect(css).toStrictEqual({...panelCss, lol: "salut", lol2: "yo"}));
});

describe("themeable", () => {
    const css = themeable({a: "test", b: "yolo"}, {a: "ahah", c: "hoho"}, {d: "aa", a: "allo"});
    test("ça marche", () => expect(css).toStrictEqual({a: "test ahah allo", b: "yolo", c: "hoho", d: "aa"}));
});
