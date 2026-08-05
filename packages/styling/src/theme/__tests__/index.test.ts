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

function makePanelCss(): PanelCss {
    return {
        actions: "el-actions",
        title: "el-title",
        "title--bottom": "mod-bottom",
        "title--top": "mod-top"
    } as unknown as PanelCss;
}

describe("Styling helpers", () => {
    describe("toBem — usage classique (chaîne)", () => {
        test("Un élément sans modifier retourne la classe de base", () => {
            expect(toBem(makePanelCss()).actions()).toBe("el-actions");
        });

        test("Un élément avec modifiers appelé sans modifier retourne la base", () => {
            expect(toBem(makePanelCss()).title()).toBe("el-title");
        });

        test.each([
            {label: "un seul modifier (bottom)", mods: {bottom: true}, expected: "el-title mod-bottom"},
            {label: "un seul modifier (top)", mods: {top: true}, expected: "el-title mod-top"},
            {label: "deux modifiers", mods: {bottom: true, top: true}, expected: "el-title mod-bottom mod-top"},
            {
                label: "deux modifiers en ordre inverse",
                mods: {top: true, bottom: true},
                expected: "el-title mod-bottom mod-top"
            }
        ])("Élément avec modifiers appelé avec $label", ({mods, expected}) => {
            expect(toBem(makePanelCss()).title(mods)).toBe(expected);
        });
    });

    describe("toBem — usage alternatif (objet)", () => {
        test("Un élément sans modifier retourne un objet clé/classe", () => {
            expect(toBem(makePanelCss()).actions(true)).toStrictEqual({actions: "el-actions"});
        });

        test("Un élément avec modifiers retourne toutes les classes associées", () => {
            expect(toBem(makePanelCss()).title(true)).toStrictEqual({
                title: "el-title",
                "title--top": "mod-top",
                "title--bottom": "mod-bottom"
            });
        });
    });

    describe("fromBem — reconstruction du CSS d'origine", () => {
        test("Depuis un objet issu de toBem, on retrouve le CSS de départ", () => {
            const panelCss = makePanelCss();
            expect(fromBem(toBem(panelCss))).toStrictEqual(panelCss);
        });

        test("Depuis un CSS déjà brut, la sortie est équivalente à l'entrée", () => {
            const panelCss = makePanelCss();
            expect(fromBem(panelCss)).toStrictEqual(panelCss);
        });

        test("Depuis un mix bem + entrées supplémentaires, tout est préservé", () => {
            const panelCss = makePanelCss();
            const css = fromBem({...toBem(panelCss), lol: "salut", lol2: "yo"});
            expect(css).toStrictEqual({...panelCss, lol: "salut", lol2: "yo"});
        });
    });

    describe("themeable — fusion de thèmes", () => {
        test("Concatène les classes par clé et préserve les clés uniques", () => {
            const css = themeable({a: "test", b: "yolo"}, {a: "ahah", c: "hoho"}, {d: "aa", a: "allo"});
            expect(css).toStrictEqual({a: "test ahah allo", b: "yolo", c: "hoho", d: "aa"});
        });
    });
});
