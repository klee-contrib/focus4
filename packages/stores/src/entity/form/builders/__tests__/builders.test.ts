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

describe("FormNodeBuilder.build", () => {
    test("initialise le noeud et ses données initiales", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).build({name: "Initial"});

        expect(form.name.value).toBe("Initial");
        expect(store.o.name.value).toBeUndefined();
        expect(form.form._initialData).toEqual({
            name: "Initial",
            inner: {},
            list: []
        });
    });

    test("évalue une fonction fournissant les données initiales", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).build(() => ({name: "Initial"}));

        expect(form.name.value).toBe("Initial");
        expect(store.o.name.value).toBeUndefined();
        expect(form.form._initialData).toEqual({
            name: "Initial",
            inner: {},
            list: []
        });
    });

    test("initialise depuis la source avec true", () => {
        const source = {
            name: "Parent",
            inner: {id: 1, label: "Inner"},
            list: [
                {id: 1, label: "Item 1"},
                {id: 2, label: "Item 2"}
            ]
        };
        const store = makeStoreNode(OuterEntity, source);
        const form = new FormNodeBuilder(store).build(true);

        expect(form.getValues()).toEqual(source);
        expect(form.form._initialData).toEqual({inner: {}, list: []});
        expect(form.list[0].sourceNode).toBe(store.list[0]);
        expect(form.form.hasChanged).toBe(false);

        form.name.value = "Modifié";
        expect(form.form.hasChanged).toBe(true);
        expect(store.name.value).toBe("Parent");

        form.name.value = "Parent";
        expect(form.form.hasChanged).toBe(false);

        form.inner.set({label: "Brouillon"});
        expect(form.inner.form.hasChanged).toBe(true);
        expect(form.form.hasChanged).toBe(true);
        expect(store.inner.label.value).toBe("Inner");
        form.inner.set({label: "Inner"});
        expect(form.form.hasChanged).toBe(false);

        form.list.splice(0, 1);
        expect(form.list.map(item => item.id.value)).toEqual([2]);
        expect(form.form.hasChanged).toBe(true);
        expect(store.getValues()).toEqual(source);
    });

    test("ne définit pas de données initiales sans paramètre", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).build();

        expect(form.name.value).toBeUndefined();
        expect(form.form._initialData).toBeUndefined();
    });
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

    test("edit ignore une clé qui ne correspond à aucune entrée", () => {
        const store = makeStoreNode({o: OuterEntity});
        const builder = new FormNodeBuilder(store.o);

        expect(builder.edit(true, "inconnue" as any)).toBe(builder);
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

    test("patch ignore une clé qui ne correspond à aucune entrée", () => {
        const store = makeStoreNode({o: OuterEntity});
        const builder = new FormNodeBuilder(store.o);

        expect((builder as any).patch("inconnue", (value: any) => value)).toBe(builder);
    });
});

describe("FormNodeBuilder.remove / removeAllBut", () => {
    test("remove supprime les champs demandés", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).remove("name", "list").build() as any;

        expect(form.name).toBeUndefined();
        expect(form.list).toBeUndefined();
        expect(form.inner.$entity).toEqual(InnerEntity);
    });

    test("removeAllBut conserve uniquement les champs listés", () => {
        const store = makeStoreNode({o: OuterEntity});
        const form = new FormNodeBuilder(store.o).removeAllBut("name").build() as any;

        expect(form.name.$field).toEqual(OuterEntity.name);
        expect(form.inner).toBeUndefined();
        expect(form.list).toBeUndefined();
    });
});

describe("FormNodeBuilder.add", () => {
    test("add(f => f.field(...)) réutilise une définition de champ existante", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o).add("extra", f => f.field(e.field(DO_STRING))).build() as any;

        expect(form.extra.$field).toMatchObject({domain: DO_STRING, name: "extra"});
    });

    test("add(f => f.object(Entity)) crée un sous-noeud à partir d'une entité", () => {
        const store = makeStoreNode({o: InnerEntity});
        const form = new FormNodeBuilder(store.o).add("child", f => f.object(InnerEntity)).build() as any;

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
        expect(form.added.$field).toMatchObject({domain: DO_NUMBER, isRequired: true, name: "added"});
        // Les champs communs sont conservés
        expect(form.name.$field).toMatchObject({domain: DO_STRING, name: "name"});
        expect(form.inner.$entity).toBe(AltEntity.inner.entity);
        expect(form.list.$entity).toBe(AltEntity.list.entity);
        // Les champs qui n'existent pas dans AltEntity sont retirés
        expect(form.optionalInner).toBeUndefined();
        expect(form.optionalList).toBeUndefined();
    });

    test("conserve une liste déclarée avec sa forme courte", () => {
        const source = entity({items: [InnerEntity]});
        const target = entity({items: [InnerEntity]});
        const form = new FormNodeBuilder(makeStoreNode(source)).patchAllTo(target).build();

        expect(form.items.sourceNode.$entity).toBe(InnerEntity);
    });

    test("conserve un objet déclaré avec sa forme courte", () => {
        const source = entity({inner: e.object(InnerEntity)});
        const target = entity({inner: InnerEntity});
        const form = new FormNodeBuilder(makeStoreNode(source)).patchAllTo(target).build();

        expect(form.inner.form.isRequired).toBe(true);
        expect(form.inner.sourceNode.$entity).toBe(InnerEntity);
    });

    test("remplace les entrées communes incompatibles", () => {
        const OtherEntity = entity({value: e.field(DO_STRING)});
        const source = entity({name: e.field(DO_STRING), items: e.list(InnerEntity)});
        const target = entity({name: e.object(OtherEntity), items: [OtherEntity]});
        const form = new FormNodeBuilder(makeStoreNode(source)).patchAllTo(target).build() as any;

        expect(form.name.$entity).toBe(OtherEntity);
        expect(form.items.$entity).toBe(OtherEntity);
    });

    test("ajoute une liste récursive manquante", () => {
        const target = entity({children: e.recursiveList()});
        const form = new FormNodeBuilder(makeStoreNode(entity({}))).patchAllTo(target).build() as any;

        expect(form.children.$entity).toBe(target);
    });
});

describe("FormListNodeBuilder.build", () => {
    test("initialise le noeud et ses données initiales", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const initialData = [
            {id: 1, label: "Item 1"},
            {id: 2, label: "Item 2"}
        ];
        const form = new FormListNodeBuilder(store.l).build(initialData);

        expect(form.map(item => item.getValues())).toEqual(initialData);
        expect(store.l).toHaveLength(0);
        expect(form.form._initialData).toEqual(initialData);
    });

    test("évalue une fonction fournissant les données initiales", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const initialData = [{id: 1, label: "Item 1"}];
        const form = new FormListNodeBuilder(store.l).build(() => initialData);

        expect(form.map(item => item.getValues())).toEqual(initialData);
        expect(store.l).toHaveLength(0);
        expect(form.form._initialData).toEqual(initialData);
    });

    test("initialise depuis la source avec true", () => {
        const initialData = [
            {id: 1, label: "Item 1"},
            {id: 2, label: "Item 2"}
        ];
        const store = makeStoreNode([InnerEntity], initialData);
        const form = new FormListNodeBuilder(store).build(true);

        expect(form.map(item => item.getValues())).toEqual(initialData);
        expect(form.form._initialData).toEqual([]);
        expect(form.form.hasChanged).toBe(false);
        expect(form[0].sourceNode).toBe(store[0]);

        form[0].label.value = "Modifié";
        expect(form.form.hasChanged).toBe(true);

        form[0].label.value = "Item 1";
        expect(form.form.hasChanged).toBe(false);

        form.pushNode({id: 3, label: "Item 3"});
        expect(form[2].form.hasChanged).toBe(true);
        expect(form.form.hasChanged).toBe(true);

        form.splice(2, 1);
        expect(form.form.hasChanged).toBe(false);

        form.splice(1, 1);
        expect(form.map(item => item.id.value)).toEqual([1]);
        expect(form.form.hasChanged).toBe(true);
    });

    test("ne définit pas de données initiales sans paramètre", () => {
        const store = makeStoreNode({l: [InnerEntity]});
        const form = new FormListNodeBuilder(store.l).build();

        expect(form).toHaveLength(0);
        expect(form.form._initialData).toBeUndefined();
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

    test("required ignore une clé qui ne correspond à aucune entrée", () => {
        const store = makeStoreNode({o: OuterEntity});
        const builder = new FormNodeBuilder(store.o);

        expect(builder.required(false, "inconnue" as any)).toBe(builder);
    });

    test("patchAllTo garde les champs communs et remplace la définition", () => {
        const store = makeStoreNode({o: OuterEntity});
        const AltWithNewFieldDef = entity({
            name: e.field(DO_NUMBER),
            inner: e.object(InnerEntity, o => o.optional()),
            list: e.list(InnerEntity, l => l.optional())
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(AltWithNewFieldDef).build() as any;

        expect(form.name.$field).toMatchObject({domain: DO_NUMBER, name: "name"});
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
        expect(form.extra.$field).toMatchObject({domain: DO_NUMBER, name: "extra"});
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
        expect(form.inner.$entity).toBe(Target.inner.entity);
        expect(form.inner.form.isRequired).toBe(true);
    });

    test("patchAllTo ajoute une liste manquante depuis targetEntity", () => {
        const NoListEntity = entity({name: e.field(DO_STRING)});
        const store = makeStoreNode({o: NoListEntity});
        const Target = entity({
            name: e.field(DO_STRING),
            items: e.list(InnerEntity)
        });
        const form = new FormNodeBuilder(store.o).patchAllTo(Target).build() as any;
        expect(Array.isArray(form.items)).toBe(true);
        expect(form.items.$entity).toBe(Target.items.entity);
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
