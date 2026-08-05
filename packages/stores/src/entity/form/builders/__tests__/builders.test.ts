import i18next from "i18next";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";

import {domain} from "../../../../__tests__/test-utils";
import {makeStoreNode} from "../../../store/node";
import {FormListNodeBuilder} from "../form-list-node";
import {FormNodeBuilder} from "../form-node";

i18next.init();

const DO_STRING = domain(z.string());
const DO_NUMBER = domain(z.number());

const InnerEntity = entity({
    id: e.field(DO_NUMBER),
    label: e.field(DO_STRING)
});

const OuterEntity = entity({
    name: e.field(DO_STRING),
    inner: e.object(InnerEntity),
    list: e.list(InnerEntity),
    optionalInner: e.object(InnerEntity, o => o.optional()),
    optionalList: e.list(InnerEntity, l => l.optional())
});

const AltEntity = entity({
    name: e.field(DO_STRING),
    added: e.field(DO_NUMBER),
    list: e.list(InnerEntity),
    inner: e.object(InnerEntity)
});

describe("FormNodeBuilder.edit", () => {
    test("edit(boolean) fixe $edit sur le noeud entier", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).edit(true).build();

        expect(form.form.isEdit).toBe(true);
    });

    test("edit(fn) évalue dynamiquement depuis le noeud", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).edit(() => true).build();

        expect(form.form.isEdit).toBe(true);
    });

    test("edit(value, ...params) propage à chaque enfant (champ / objet / liste)", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).edit(true, "name", "inner", "list").build();
        form.form.isEdit = true;

        expect(form.name.isEdit).toBe(true);
        expect(form.inner.form.isEdit).toBe(true);
        expect(form.list.form.isEdit).toBe(true);
    });

    test("edit(fn, ...params) propage la fonction aux enfants", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).edit(() => true, "name").build();
        form.form.isEdit = true;

        expect(form.name.isEdit).toBe(true);
    });
});

describe("FormNodeBuilder.required", () => {
    test("required(false) rend le noeud non obligatoire", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(false).build();

        expect(form.form.isRequired).toBe(false);
    });

    test("required(fn) évalue dynamiquement", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(n => !!n.name.value).build();

        expect(form.form.isRequired).toBe(false);
        store.o.name.value = "hop";
        expect(form.form.isRequired).toBe(true);
    });

    test("required(value, ...params) propage aux enfants (objet / liste / champ)", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(false, "name", "inner", "list").build();

        expect(form.inner.form.isRequired).toBe(false);
        expect(form.list.form.isRequired).toBe(false);
        expect(form.name.$field.isRequired).toBe(false);
    });

    test("required(fn, ...params) propage la fonction aux champs", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(() => false, "name").build();

        expect(form.name.$field.isRequired).toBe(false);
    });
});

describe("FormNodeBuilder.patch", () => {
    test("patch sur un objet applique le sous-builder", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).patch("inner", i => i.required(false)).build();

        expect(form.inner.form.isRequired).toBe(false);
    });

    test("patch sur une liste applique le sous-builder", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).patch("list", l => l.required(false)).build();

        expect(form.list.form.isRequired).toBe(false);
    });
});

describe("FormNodeBuilder.remove / removeAllBut", () => {
    test("remove supprime les champs demandés", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).remove("name", "list").build() as any;

        expect(form.name).toBeUndefined();
        expect(form.list).toBeUndefined();
        expect(form.inner).toBeDefined();
    });

    test("removeAllBut conserve uniquement les champs listés", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).removeAllBut("name").build() as any;

        expect(form.name).toBeDefined();
        expect(form.inner).toBeUndefined();
        expect(form.list).toBeUndefined();
    });
});

describe("FormNodeBuilder.add", () => {
    test("add(f => f.field(...)) réutilise une définition de champ existante", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o).add("extra", f => f.field(e.field(DO_STRING))).build() as any;

        expect(form.extra).toBeDefined();
        expect(form.extra.$field).toBeDefined();
    });

    test("add(f => f.object(Entity)) crée un sous-noeud à partir d'une entité", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o).add("child", f => f.object(InnerEntity)).build() as any;

        expect(form.child).toBeDefined();
        expect(form.child.$entity).toEqual(InnerEntity);
    });

    test("add(f => f.object(objectEntry)) respecte isRequired", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o)
            .add("child", f => f.object(e.object(InnerEntity, o => o.optional())))
            .build() as any;

        expect(form.child.form.isRequired).toBe(false);
    });

    test("add(f => f.list(Entity)) crée une sous-liste", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o).add("children", f => f.list(InnerEntity)).build() as any;

        expect(form.children).toBeDefined();
        expect(Array.isArray(form.children)).toBe(true);
        expect(form.children.$entity).toEqual(InnerEntity);
    });

    test("add(f => f.list(listEntry)) respecte isRequired", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o)
            .add("children", f => f.list(e.list(InnerEntity, l => l.optional())))
            .build() as any;

        expect(form.children.form.isRequired).toBe(false);
    });
});

describe("FormNodeBuilder.patchAllTo", () => {
    test("Ajoute les champs manquants et retire les champs en trop", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).patchAllTo(AltEntity).build() as any;

        // "added" doit avoir été ajouté (n'existait pas sur OuterEntity)
        expect(form.added).toBeDefined();
        // Les champs communs sont conservés
        expect(form.name).toBeDefined();
        expect(form.inner).toBeDefined();
        expect(form.list).toBeDefined();
        // Les champs qui n'existent pas dans AltEntity sont retirés
        expect(form.optionalInner).toBeUndefined();
        expect(form.optionalList).toBeUndefined();
    });
});

describe("FormListNodeBuilder", () => {
    test("edit(boolean) sur une liste", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).edit(true).build();

        expect(form.form.isEdit).toBe(true);
    });

    test("edit(fn) sur une liste", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).edit(n => n.length === 0).build();

        expect(form.form.isEdit).toBe(true);
    });

    test("required(false) sur une liste", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).required(false).build();

        expect(form.form.isRequired).toBe(false);
    });

    test("required(fn) sur une liste", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).required(n => n.length > 0).build();

        expect(form.form.isRequired).toBe(false);
    });

    test("items configure les nouveaux items", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).items(i => i.edit(true)).build();
        form.form.isEdit = true;

        store.l.pushNode({id: 1});
        expect(form[0].form.isEdit).toBe(true);
    });
});

describe("FormNodeBuilder branches additionnelles", () => {
    test("patch sur un champ applique EntityFieldBuilder", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).patch("name", n => n.metadata({label: "Nom"})).build() as any;

        expect(form.name.$field.label).toBe("Nom");
    });

    test("required(fn, ...params) sur un objet applique la fonction au sous-noeud", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(() => true, "inner").build() as any;

        expect(form.inner.form.isRequired).toBe(true);
    });

    test("required(boolean, ...params) applique false à un objet et une liste", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).required(false, "inner", "list").build() as any;

        expect(form.inner.form.isRequired).toBe(false);
        expect(form.list.form.isRequired).toBe(false);
    });

    test("patchAllTo garde les champs communs et remplace la définition", () => {
        const store = makeStoreNode({o: OuterEntity});
        const AltWithNewFieldDef = entity({
            name: e.field(DO_NUMBER),
            inner: e.object(InnerEntity, o => o.optional()),
            list: e.list(InnerEntity, l => l.optional())
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(AltWithNewFieldDef).build() as any;

        expect(form.name).toBeDefined();
        expect(form.inner.form.isRequired).toBe(false);
        expect(form.list.form.isRequired).toBe(false);
    });

    test("build() sans edit par défaut a $edit=false", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).build();

        expect(form.form.isEdit).toBe(false);
    });

    test("remove supprime des sous-noeuds", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).remove("inner", "list").build() as any;

        expect(form.inner).toBeUndefined();
        expect(form.list).toBeUndefined();
        expect(form.name).toBeDefined();
    });

    test("patchAllTo ajoute un champ manquant depuis targetEntity", () => {
        const store = makeStoreNode({o: OuterEntity});
        const Target = entity({
            name: e.field(DO_STRING),
            inner: e.object(InnerEntity),
            list: e.list(InnerEntity),
            optionalInner: e.object(InnerEntity, o => o.optional()),
            optionalList: e.list(InnerEntity, l => l.optional()),
            extra: e.field(DO_NUMBER)
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(Target).build() as any;
        expect(form.extra).toBeDefined();
        expect(form.extra.$field).toBeDefined();
    });

    test("patchAllTo ajoute un objet manquant depuis targetEntity", () => {
        const NoInnerEntity = entity({
            name: e.field(DO_STRING),
            list: e.list(InnerEntity)
        });
        const store = makeStoreNode({o: NoInnerEntity});
        const Target = entity({
            name: e.field(DO_STRING),
            list: e.list(InnerEntity),
            inner: e.object(InnerEntity)
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(Target).build() as any;
        expect(form.inner).toBeDefined();
        expect(form.inner.form).toBeDefined();
    });

    test("patchAllTo ajoute une liste manquante depuis targetEntity", () => {
        const NoListEntity = entity({name: e.field(DO_STRING)});
        const store = makeStoreNode({o: NoListEntity});
        const Target = entity({
            name: e.field(DO_STRING),
            items: e.list(InnerEntity)
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(Target).build() as any;
        expect(form.items).toBeDefined();
        expect(Array.isArray(form.items)).toBe(true);
    });

    test("patchAllTo écrase la définition d'un champ commun", () => {
        const store = makeStoreNode({o: OuterEntity});
        const Target = entity({
            name: e.field(DO_NUMBER),
            inner: e.object(InnerEntity),
            list: e.list(InnerEntity),
            optionalInner: e.object(InnerEntity, o => o.optional()),
            optionalList: e.list(InnerEntity, l => l.optional())
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(Target).build() as any;
        expect(form.name.$field.domain).toBe(DO_NUMBER);
    });
});
