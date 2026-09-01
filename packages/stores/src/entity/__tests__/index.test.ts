import i18next from "i18next";
import {isObservableArray} from "mobx";
import {describe, expect, test, vi} from "vitest";

import {FormNodeBuilder} from "../form";
import {clearNode, defaultLoad, getValues, makeStoreNode, replaceNode, setNode} from "../store";

import {DO_STRING, LigneEntity, OperationEntity, ProjetEntity, StructureEntity} from "./entities";

i18next.init();

function getStore() {
    return makeStoreNode({
        operation: OperationEntity,
        projetTest: ProjetEntity,
        structureList: [StructureEntity],
        subStore: {
            structure: StructureEntity,
            operationList: [OperationEntity]
        }
    });
}

function getFormNodes() {
    const entry = getStore().operation;
    const entry2 = getStore().projetTest;
    const formNode = new FormNodeBuilder(entry).patch("montant", f => f.metadata({label: "montant"})).build();
    const setter = vi.fn();
    const formNode2 = new FormNodeBuilder(entry2)
        .add("test", f => f.domain(DO_STRING))
        .add("test2", f => f.domain(DO_STRING).value(() => "2", setter))
        .patch("ligneList", l => l.items(i => i.add("label", f => f.domain(DO_STRING).value<string>("label"))))
        .build();
    return {entry, entry2, formNode, formNode2, setter};
}

const operation = {
    id: 4,
    numero: "A324",
    montant: 400.32,
    structure: {id: 5, nom: "Test", siret: "324123456"}
};
const structureList = [{id: 5}, {id: 6}, {id: 7}];
const projetTest = {ligneList: [{id: 5}, {id: 6}, {id: 7}]};

describe("EntityStore — Structure et création", () => {
    test("Un StoreNode expose les entrées, sous-noeuds et méthodes standards", () => {
        const store = getStore();
        const {id, numero, montant} = OperationEntity;

        expect(store.operation).toEqual({
            $entity: OperationEntity,
            id: {$field: id, value: undefined},
            numero: {$field: numero, value: undefined},
            montant: {$field: montant, value: undefined},
            structure: {
                $entity: StructureEntity,
                $required: true,
                id: {$field: StructureEntity.id, value: undefined},
                nom: {$field: StructureEntity.nom, value: undefined},
                siret: {$field: StructureEntity.siret, value: undefined},
                set: setNode,
                clear: clearNode,
                replace: replaceNode,
                load: defaultLoad,
                getValues
            },
            set: setNode,
            clear: clearNode,
            replace: replaceNode,
            load: defaultLoad,
            getValues,
            $required: true
        });
    });

    test("Les StoreListNode sont bien des arrays observables typés", () => {
        const store = getStore();
        expect(isObservableArray(store.structureList)).toBe(true);
        expect(store.structureList.$entity).toEqual(StructureEntity);
        expect(isObservableArray(store.projetTest.ligneList)).toBe(true);
        expect(store.projetTest.ligneList.$entity).toEqual(LigneEntity);
    });

    test("Un sous-store est directement accessible via ses entrées", () => {
        const store = getStore();
        expect(store.subStore.structure.id.$field).toEqual(StructureEntity.id);
    });
});

describe("EntityStore — Mutations", () => {
    test("replace() global propage les valeurs à toutes les entrées et sous-stores", () => {
        const store = getStore();
        store.replace({
            operation,
            structureList,
            projetTest,
            subStore: {operationList: [operation], structure: structureList[0]}
        });

        expect(store.operation.id.value).toBe(operation.id);
        expect(store.operation.structure.id.value).toBe(operation.structure.id);
        expect(store.structureList).toHaveLength(3);
        expect(store.structureList[1].id.value).toBe(structureList[1].id);
        expect(store.projetTest.ligneList).toHaveLength(3);
        expect(store.projetTest.ligneList[1].id.value).toBe(projetTest.ligneList[1].id);
        expect(store.subStore.structure.id.value).toBe(structureList[0].id);
        expect(store.subStore.operationList[0].id.value).toBe(operation.id);
    });

    test.each([
        {
            label: "replace() sur un StoreNode",
            act: (s: ReturnType<typeof getStore>) => s.operation.replace(operation),
            check: (s: ReturnType<typeof getStore>) => {
                expect(s.operation.id.value).toBe(operation.id);
                expect(s.operation.structure.id.value).toBe(operation.structure.id);
            }
        },
        {
            label: "replace() sur un sous-noeud",
            act: (s: ReturnType<typeof getStore>) => s.operation.structure.replace(operation.structure),
            check: (s: ReturnType<typeof getStore>) => {
                expect(s.operation.structure.id.value).toBe(operation.structure.id);
            }
        },
        {
            label: "replaceNodes() sur un StoreListNode",
            act: (s: ReturnType<typeof getStore>) => s.structureList.replaceNodes(structureList),
            check: (s: ReturnType<typeof getStore>) => {
                expect(s.structureList).toHaveLength(3);
                expect(s.structureList[1].id.value).toBe(structureList[1].id);
            }
        },
        {
            label: "replace() sur un noeud contenant une liste",
            act: (s: ReturnType<typeof getStore>) => s.projetTest.replace(projetTest),
            check: (s: ReturnType<typeof getStore>) => {
                expect(s.projetTest.ligneList).toHaveLength(3);
                expect(s.projetTest.ligneList[1].id.value).toBe(projetTest.ligneList[1].id);
            }
        }
    ])("Mise à jour locale : $label", ({act, check}) => {
        const store = getStore();
        act(store);
        check(store);
    });

    test("pushNode() ajoute un item de type StoreNode avec ses métadonnées", () => {
        const store = getStore();
        store.structureList.replaceNodes(structureList);
        store.structureList.pushNode({id: 8});

        expect(store.structureList).toHaveLength(4);
        expect(store.structureList[3].id.$field).toEqual(StructureEntity.id);
        expect(store.structureList[3].id.value).toBe(8);
    });

    test("set() global fait une mise à jour partielle et étend les listes existantes", () => {
        const store = getStore();
        store.set({operation, subStore: {structure: structureList[0]}});
        store.structureList.pushNode({id: 1}, {id: 2});
        store.set({structureList: [{siret: "test"}, {id: 4}, {id: 5}, {id: 6}]});

        expect(store.operation.id.value).toBe(operation.id);
        expect(store.operation.structure.id.value).toBe(operation.structure.id);
        expect(store.subStore.structure.id.value).toBe(structureList[0].id);
        expect(store.structureList[0].id.value).toBe(1);
        expect(store.structureList[0].siret.value).toBe("test");
        expect(store.structureList[1].id.value).toBe(4);
        expect(store.structureList[2].id.value).toBe(5);
        expect(store.structureList[3].id.value).toBe(6);
    });

    test("clear() global vide toutes les valeurs et listes", () => {
        const store = getStore();
        store.replace({
            operation,
            structureList,
            projetTest,
            subStore: {operationList: [operation], structure: structureList[0]}
        });
        store.clear();

        expect(store.operation.id.value).toBeUndefined();
        expect(store.operation.structure.id.value).toBeUndefined();
        expect(store.structureList).toHaveLength(0);
        expect(store.projetTest.ligneList).toHaveLength(0);
        expect(store.subStore.structure.id.value).toBeUndefined();
        expect(store.subStore.operationList).toHaveLength(0);
    });

    test("clear() local vide uniquement le noeud ciblé", () => {
        const store = getStore();
        store.operation.clear();
        store.structureList.clear();
        store.projetTest.ligneList.clear();

        expect(store.operation.id.value).toBeUndefined();
        expect(store.operation.structure.id.value).toBeUndefined();
        expect(store.structureList).toHaveLength(0);
        expect(store.projetTest.ligneList).toHaveLength(0);
    });
});

describe("EntityStore — getValues", () => {
    test("getValues(true) reproduit fidèlement l'entrée pour toutes les formes de noeud", () => {
        const store = getStore();
        store.replace({operation, projetTest, structureList});
        const errorSpy = vi.spyOn(console, "error");

        expect(store.operation.getValues(true)).toEqual(operation);
        expect(store.projetTest.getValues(true)).toEqual(projetTest);
        expect(store.structureList.getValues(true)).toEqual(structureList);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test("getValues() sans allowUndefined renvoie la donnée quand tous les champs requis sont là", () => {
        const store = getStore();
        store.operation.replace(operation);
        const errorSpy = vi.spyOn(console, "error");

        expect(store.operation.getValues()).toEqual(operation);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test.each([
        {
            label: "champ requis manquant sur un StoreNode",
            setup: (s: ReturnType<typeof getStore>) => s.operation.replace({...operation, numero: undefined}),
            expected: {id: 4, montant: 400.32, structure: {id: 5, nom: "Test", siret: "324123456"}},
            error: "getValues() - champ obligatoire manquant : numero",
            read: (s: ReturnType<typeof getStore>) => s.operation.getValues()
        },
        {
            label: "champ requis manquant sur un sous-objet",
            setup: (s: ReturnType<typeof getStore>) =>
                s.operation.replace({...operation, structure: {...operation.structure, nom: undefined}}),
            expected: {id: 4, numero: "A324", montant: 400.32, structure: {id: 5, siret: "324123456"}},
            error: "getValues() - champ obligatoire manquant : structure.nom",
            read: (s: ReturnType<typeof getStore>) => s.operation.getValues()
        },
        {
            label: "sous-objet obligatoire vide",
            setup: (s: ReturnType<typeof getStore>) => s.operation.replace({...operation, structure: undefined}),
            expected: {id: 4, numero: "A324", montant: 400.32, structure: {}},
            error: "getValues() - champ obligatoire manquant : structure",
            read: (s: ReturnType<typeof getStore>) => s.operation.getValues()
        },
        {
            label: "champ requis manquant dans une liste",
            setup: (s: ReturnType<typeof getStore>) =>
                s.structureList.replaceNodes([
                    {id: 1, nom: "A", siret: "123"},
                    {id: 2, nom: undefined, siret: "456"}
                ]),
            expected: [
                {id: 1, nom: "A", siret: "123"},
                {id: 2, siret: "456"}
            ],
            error: "getValues() - champ obligatoire manquant : [1].nom",
            read: (s: ReturnType<typeof getStore>) => s.structureList.getValues()
        },
        {
            label: "champ requis manquant dans un sous-objet d'un item de liste",
            setup: (s: ReturnType<typeof getStore>) =>
                s.subStore.operationList.replaceNodes([
                    {id: 1, numero: "A", structure: {id: 10, nom: "ok", siret: "123"}},
                    {id: 2, numero: "B", structure: {id: 20, nom: undefined, siret: "456"}}
                ]),
            expected: [
                {id: 1, numero: "A", structure: {id: 10, nom: "ok", siret: "123"}},
                {id: 2, numero: "B", structure: {id: 20, siret: "456"}}
            ],
            error: "getValues() - champ obligatoire manquant : [1].structure.nom",
            read: (s: ReturnType<typeof getStore>) => s.subStore.operationList.getValues()
        }
    ])("Logue et omet le champ manquant : $label", ({setup, expected, error, read}) => {
        const store = getStore();
        setup(store);
        const errorSpy = vi.spyOn(console, "error");

        expect(read(store)).toEqual(expected);
        expect(errorSpy).toHaveBeenCalledWith(error);
        errorSpy.mockRestore();
    });

    test("StoreListNode getValues() OK quand tous les champs requis sont renseignés", () => {
        const store = getStore();
        store.structureList.replaceNodes([
            {id: 1, nom: "A", siret: "123"},
            {id: 2, nom: "B"}
        ]);
        const errorSpy = vi.spyOn(console, "error");

        expect(store.structureList.getValues()).toEqual([
            {id: 1, nom: "A", siret: "123"},
            {id: 2, nom: "B"}
        ]);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test("FormNode.getValues() ignore les champs ajoutés sauf si includeAddedFields=true", () => {
        const {formNode2} = getFormNodes();
        formNode2.set({test: "yolo"});
        const errorSpy = vi.spyOn(console, "error");

        expect(formNode2.getValues(true)).not.toHaveProperty("test");
        expect(formNode2.getValues(true, true)).toEqual(expect.objectContaining({test: "yolo"}));
        expect(errorSpy).not.toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    test("FormNode.getValues() logue les champs requis manquants dans les sous-formulaires", () => {
        const {formNode} = getFormNodes();
        const errorSpy = vi.spyOn(console, "error");

        formNode.set({structure: {nom: undefined}});
        formNode.getValues();

        expect(errorSpy).toHaveBeenCalledWith("getValues() - champ obligatoire manquant : numero");
        expect(errorSpy).toHaveBeenCalledWith("getValues() - champ obligatoire manquant : structure");
        errorSpy.mockRestore();
    });
});

describe("FormNode — Création et structure", () => {
    test("Un FormNode vide partage la structure du StoreNode et ses métadonnées de champ", () => {
        const {entry, entry2, formNode, formNode2} = getFormNodes();

        expect(formNode.numero.$field).toEqual(entry.numero.$field);
        expect(formNode.structure.getValues()).toEqual(entry.structure.getValues());
        expect(isObservableArray(formNode2.ligneList)).toBe(true);
        expect(formNode2.ligneList.$entity).toEqual(entry2.ligneList.$entity);
        expect(formNode2.ligneList.setNodes).toBe(entry2.ligneList.setNodes);
        expect(formNode.sourceNode).toEqual(entry);
        expect(formNode.structure.sourceNode).toEqual(entry.structure);
        expect(formNode2.ligneList.sourceNode).toEqual(entry2.ligneList);
        expect(formNode2.test).toBeDefined();
    });

    test("Un FormNode initialise isEdit/isValid/isRequired/isEmpty/hasChanged aux valeurs par défaut", () => {
        const {formNode} = getFormNodes();
        expect((formNode.form as unknown as {_isEdit: boolean})._isEdit).toBe(false);
        expect(formNode.form.isEdit).toBe(false);
        expect((formNode.montant as unknown as {_isEdit: boolean})._isEdit).toBe(true);
        expect(formNode.montant.isEdit).toBe(false);
        expect(Object.hasOwn(formNode.numero, "error")).toBe(true);
        expect(formNode.form.isValid).toBe(true);
        expect(formNode.form.isRequired).toBe(true);
        expect(formNode.form.isEmpty).toBe(true);
        expect(formNode.form.hasChanged).toBe(false);
    });

    test("Un FormNode créé depuis un StoreNode non vide est initialement vide et marqué hasChanged", () => {
        const store = getStore();
        const entry = store.operation;
        const entry2 = store.projetTest;
        entry.replace(operation);
        entry2.replace(projetTest);

        const formNode = new FormNodeBuilder(entry).build();
        const formNode2 = new FormNodeBuilder(entry2).build();

        expect(formNode.getValues()).toEqual({structure: {}});
        expect(formNode2.getValues()).toEqual({ligneList: []});
        expect(formNode.form.hasChanged).toBe(true);
    });
});

describe("FormNode — Synchronisation StoreNode → FormNode", () => {
    test("Un replace() sur le StoreNode répercute la donnée sur le FormNode", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);

        expect(formNode.getValues()).toEqual(entry.getValues());
        expect(formNode.form.isEmpty).toBe(false);
        expect(formNode.form.hasChanged).toBe(false);
    });

    test("Les champs ajoutés côté FormNode conservent leur valeur quand le StoreNode change", () => {
        const {entry2, formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        entry2.replace(projetTest);

        expect(formNode2.test.value).toEqual("yolo");
        expect(formNode2.test2.value).toEqual("2");
        expect(setter).not.toHaveBeenCalled();
        expect(formNode2.getValues()).toEqual(entry2.getValues());
        expect(formNode2.getValues(false, true)).toEqual({
            ligneList: [
                {id: 5, label: "label"},
                {id: 6, label: "label"},
                {id: 7, label: "label"}
            ],
            test: "yolo",
            test2: "2"
        });
        expect(formNode2.test.hasChanged).toBe(false);
    });

    test("replace() sur le FormNode vide les champs ajoutés simples mais préserve les calculés", () => {
        const {formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        formNode2.replace(projetTest);

        expect(formNode2.test.value).toBeUndefined();
        expect(formNode2.test2.value).toEqual("2");
        expect(setter).toHaveBeenCalledTimes(1);
    });

    test("clear() du StoreNode ne touche pas aux champs ajoutés du FormNode", () => {
        const {entry2, formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        entry2.clear();

        expect(formNode2.test.value).toEqual("yolo");
        expect(formNode2.test2.value).toEqual("2");
        expect(setter).not.toHaveBeenCalled();
    });

    test("clear() du FormNode vide les champs ajoutés simples et laisse les calculés", () => {
        const {formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        formNode2.clear();

        expect(formNode2.test.value).toBeUndefined();
        expect(formNode2.test2.value).toEqual("2");
        expect(setter).toHaveBeenCalledTimes(1);
    });

    test("Modifier le FormNode ne modifie pas le StoreNode source (isolation)", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        formNode.montant.value = 1000;
        formNode.set({structure: {id: 26}});
        formNode.structure.set({nom: "yolo"});

        expect(formNode.montant.value).toBe(1000);
        expect(entry.montant.value).toBe(operation.montant);
        expect(formNode.structure.id.value).toBe(26);
        expect(entry.structure.id.value).toBe(operation.structure.id);
        expect(formNode.structure.nom.value).toBe("yolo");
        expect(entry.structure.nom.value).toBe(operation.structure.nom);
        expect(formNode.form.hasChanged).toBe(true);
        expect(formNode.montant.hasChanged).toBe(true);
        expect(formNode.numero.hasChanged).toBe(false);
    });
});

describe("FormListNode — Synchronisation StoreListNode → FormListNode", () => {
    test("Un replace() sur le StoreListNode remplit le FormListNode avec les mêmes sourceNode", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);

        expect(formNode2.getValues()).toEqual(entry2.getValues());
        expect(formNode2.ligneList[0].sourceNode).toEqual(entry2.ligneList[0]);
        expect(formNode2.form.hasChanged).toBe(false);
    });

    test("Les splice/pushNode côté StoreListNode sont répercutés", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        entry2.ligneList.splice(2, 1);
        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 6}]);

        entry2.ligneList.pushNode({id: 8});
        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 6}, {id: 8}]);
        expect(formNode2.ligneList.form.hasChanged).toBe(false);
    });

    test("Une suppression côté StoreListNode conserve un item ajouté côté FormListNode à la fin", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);

        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 7}, {id: 8}]);
        expect(formNode2.ligneList.form.hasChanged).toBe(true);
        expect(formNode2.ligneList[0].form.hasChanged).toBe(false);
        expect(formNode2.ligneList[1].form.hasChanged).toBe(false);
        expect(formNode2.ligneList[2].form.hasChanged).toBe(true);
    });

    test("Un push côté StoreListNode fusionne avec l'item ajouté côté FormListNode", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        formNode2.ligneList[2].label.value = "yolo";
        entry2.ligneList.pushNode({id: 9});

        expect(formNode2.ligneList.getValues(false, true)).toEqual([
            {id: 5, label: "label"},
            {id: 7, label: "label"},
            {id: 9, label: "yolo"}
        ]);
    });

    test("Deux pushs côté StoreListNode : le premier fusionne, le second est ajouté", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        formNode2.ligneList[2].label.value = "yolo";
        entry2.ligneList.pushNode({id: 9});
        entry2.ligneList[1].id.value = 77;
        entry2.ligneList[2].id.value = 99;
        formNode2.ligneList.pushNode({id: 10, label: "salut"});
        entry2.ligneList.pushNode({id: 11}, {id: 12});

        expect(formNode2.ligneList.getValues(false, true)).toEqual([
            {id: 5, label: "label"},
            {id: 77, label: "label"},
            {id: 99, label: "yolo"},
            {id: 11, label: "salut"},
            {id: 12, label: "label"}
        ]);
    });

    test("Un retrait côté FormListNode laisse les nouveaux items du StoreListNode à la fin", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        formNode2.ligneList[2].label.value = "yolo";
        entry2.ligneList.pushNode({id: 9});
        entry2.ligneList[1].id.value = 77;
        entry2.ligneList[2].id.value = 99;
        formNode2.ligneList.pushNode({id: 10, label: "salut"});
        entry2.ligneList.pushNode({id: 11}, {id: 12});
        entry2.ligneList[1].id.value = 7;
        entry2.ligneList[2].id.value = 9;
        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.pushNode({id: 13});

        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 9}, {id: 11}, {id: 12}, {id: 13}]);
    });

    test("Un replace() du StoreListNode retrouve la liste initiale suivie des items ajoutés côté form", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        formNode2.ligneList[2].label.value = "yolo";
        entry2.ligneList.pushNode({id: 9});
        entry2.ligneList[1].id.value = 77;
        entry2.ligneList[2].id.value = 99;
        formNode2.ligneList.pushNode({id: 10, label: "salut"});
        entry2.ligneList.pushNode({id: 11}, {id: 12});
        entry2.ligneList[1].id.value = 7;
        entry2.ligneList[2].id.value = 9;
        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.pushNode({id: 13});
        formNode2.ligneList.pushNode({id: 14});
        entry2.replace(projetTest);

        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 6}, {id: 7}, {id: 14}]);
    });

    test("Un replace() côté FormListNode écrase les modifications", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
        entry2.replace(projetTest);

        expect(formNode2.ligneList.getValues()).toEqual(entry2.ligneList.getValues());
    });

    test("setNodes() se répercute au FormListNode", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
        entry2.replace(projetTest);
        entry2.ligneList.setNodes([{id: 10}, {id: 11}, {}, {id: 13}]);

        expect(formNode2.ligneList.getValues()).toEqual(entry2.ligneList.getValues());
    });

    test("Un splice côté FormListNode combiné à setNodes côté StoreListNode reste cohérent", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
        entry2.replace(projetTest);
        entry2.ligneList.setNodes([{id: 10}, {id: 11}, {}, {id: 13}]);
        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.setNodes([{id: 14}, {id: 15}, {}, {id: 17}]);

        expect(formNode2.ligneList.getValues()).toEqual([{id: 14}, {id: 7}, {id: 17}]);
    });
});

describe("FormNode — Reset et source forcée", () => {
    test("Un replace() de la source qui n'apporte rien reset toujours la cible", () => {
        const {entry, entry2, formNode, formNode2} = getFormNodes();
        entry.replace(operation);
        entry2.replace(projetTest);
        formNode.numero.value = "10";
        formNode2.ligneList[0].id.value = 65;
        entry.replace(operation);
        entry2.replace(projetTest);

        expect(formNode.getValues()).toEqual(entry.getValues());
        expect(formNode2.ligneList.getValues()).toEqual(entry2.ligneList.getValues());
    });

    test("Un reset partiel n'affecte que les champs concernés", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        entry.replace(operation);
        formNode.numero.value = "yolo";
        entry.structure.id.value = 9000;
        entry.structure.replace(operation.structure);

        expect(formNode.numero.value).toBe("yolo");
        expect(formNode.structure.getValues()).toEqual(operation.structure);
    });

    test("Modifier un champ non concerné par le reset ne l'affecte pas", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        formNode.numero.value = "yolo";
        entry.structure.id.value = 9000;
        entry.structure.replace(operation.structure);
        formNode.montant.value = 9000;
        entry.numero.value = "déso";

        expect(formNode.montant.value).toBe(9000);
        expect(formNode.numero.value).toBe("déso");
    });

    test("clear() du StoreNode vide aussi le FormNode", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        entry.clear();
        expect(formNode.getValues()).toEqual({structure: {}});
    });

    test("reset() global remet toutes les valeurs modifiées à l'état source", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        formNode.set({montant: 3000, structure: {id: 23, nom: "LOL"}});
        formNode.reset();

        expect(formNode.montant.value).toBe(operation.montant);
        expect(formNode.structure.id.value).toBe(operation.structure.id);
    });

    test("reset() local ne touche qu'au sous-noeud ciblé", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        formNode.set({montant: 3000, structure: {id: 23}});
        formNode.structure.reset();

        expect(formNode.montant.value).toBe(3000);
        expect(formNode.structure.id.value).toBe(operation.structure.id);
    });

    test("reset() sur un FormListNode restaure la liste et retire les items ajoutés/enlevés", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList[0].id.value = 23;
        formNode2.ligneList.remove(formNode2.ligneList[2]);
        formNode2.ligneList.reset();

        expect(formNode2.ligneList.getValues()).toEqual(entry2.ligneList.getValues());
    });

    test("reset() sur un item de FormListNode réinitialise cet item uniquement", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList[0].id.value = 23;
        formNode2.ligneList[0].reset();

        expect(formNode2.ligneList[0].id.value).toBe(5);
    });
});

describe("FormNode — Validation et propagation", () => {
    test("isEdit=true sur un FormNode se propage à tous les champs et sous-noeuds", () => {
        const {formNode, formNode2} = getFormNodes();
        formNode.replace(operation);
        formNode2.replace(projetTest);
        formNode.form.isEdit = true;
        formNode2.form.isEdit = true;

        expect(formNode.structure.nom.isEdit).toBe(true);
        expect(formNode2.ligneList[0].id.isEdit).toBe(true);
    });

    test("Un champ requis vide marque le FormNode comme invalide avec l'erreur remontée aux parents", () => {
        const {formNode} = getFormNodes();
        formNode.replace(operation);
        formNode.form.isEdit = true;
        formNode.structure.nom.value = undefined;

        expect(formNode.structure.nom.error).toBe("focus.validation.required");
        expect(formNode.form.isValid).toBe(false);
        expect(formNode.form.errors).toEqual({structure: {nom: "focus.validation.required"}});
        expect(formNode.structure.form.errors).toEqual(
            (formNode.form.errors as unknown as {structure: unknown}).structure
        );
    });

    test("Dans un FormListNode, seul l'item invalide est marqué et la liste devient invalide", () => {
        const {formNode, formNode2} = getFormNodes();
        formNode.replace(operation);
        formNode2.replace(projetTest);
        formNode.form.isEdit = true;
        formNode2.form.isEdit = true;
        formNode.structure.nom.value = undefined;
        formNode2.ligneList[1].id.value = undefined;

        expect(formNode2.ligneList[1].form.isValid).toBe(false);
        expect(formNode2.ligneList[0].form.isValid).toBe(true);
        expect(formNode2.ligneList.form.isValid).toBe(false);
        expect(formNode2.ligneList.form.errors).toEqual([{}, {id: "focus.validation.required"}, {}]);
    });
});

describe("FormNode — Dispose", () => {
    test("Un FormNode disposé n'est plus mis à jour par sa source", () => {
        const {entry, formNode} = getFormNodes();
        entry.replace(operation);
        formNode.dispose();
        entry.montant.value = 2;

        expect(formNode.montant.value).toBe(operation.montant);
    });

    test("Un item retiré d'un FormListNode n'est plus lié à sa source, les autres le restent", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        const [item2] = formNode2.ligneList.splice(2, 1);
        entry2.ligneList[2].id.value = 55;
        entry2.ligneList[1].id.value = 54;

        expect(item2.id.value).toBe(projetTest.ligneList[2].id);
        expect(formNode2.ligneList[1].id.value).toBe(54);
    });

    test("Après dispose() d'un FormListNode, les ajouts/suppressions/modifs de la source sont ignorés", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.splice(2, 1);
        entry2.ligneList[2].id.value = 55;
        entry2.ligneList[1].id.value = 54;
        formNode2.dispose();
        entry2.replace({ligneList: [{id: 41}]});
        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 54}]);

        entry2.ligneList[0].id.value = 235;
        expect(formNode2.ligneList.getValues()).toEqual([{id: 5}, {id: 54}]);
    });
});
