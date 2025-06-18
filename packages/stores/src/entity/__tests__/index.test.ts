import i18next from "i18next";
import {isObservableArray} from "mobx";
import {describe, expect, test, vi} from "vitest";

import {FormNodeBuilder} from "../form";
import {makeEntityStore, toFlatValues} from "../store";
import {clearNode, defaultLoad, replaceNode, setNode} from "../store/store";

import {LigneEntity} from "./ligne";
import {OperationEntity} from "./operation";
import {ProjetEntity} from "./projet";
import {StructureEntity} from "./structure";

i18next.init();

function getStore() {
    const subStore = makeEntityStore({
        structure: StructureEntity,
        operationList: [OperationEntity]
    });

    return makeEntityStore({
        operation: OperationEntity,
        projetTest: ProjetEntity,
        structureList: [StructureEntity],
        subStore
    });
}

function getFormNodes() {
    const entry = getStore().operation;
    const entry2 = getStore().projetTest;
    const formNode = new FormNodeBuilder(entry).patch("montant", f => f.metadata({label: "montant"})).build();
    const setter = vi.fn();
    const formNode2 = new FormNodeBuilder(entry2)
        .add("test", f => f)
        .add("test2", f => f.value(() => "2", setter))
        .patch("ligneList", l => l.items(i => i.add("label", f => f.value<string>("label"))))
        .build();
    return {entry, entry2, formNode, formNode2, setter};
}

const operation = {
    id: 4,
    numero: "A324",
    montant: 400.32,
    structure: {
        id: 5,
        nom: "Test",
        siret: "324123456"
    }
};
const structureList = [{id: 5}, {id: 6}, {id: 7}];
const projetTest = {ligneList: [{id: 5}, {id: 6}, {id: 7}]};

describe("EntityStore: Création", () => {
    const store = getStore();

    const {id, numero, montant} = OperationEntity;
    test("L'entrée 'operation' a bien la forme attendue", () =>
        expect(store.operation).toEqual({
            id: {$field: id, value: undefined},
            numero: {$field: numero, value: undefined},
            montant: {$field: montant, value: undefined},
            structure: {
                $required: true,
                id: {$field: StructureEntity.id, value: undefined},
                nom: {$field: StructureEntity.nom, value: undefined},
                siret: {$field: StructureEntity.siret, value: undefined},
                set: setNode,
                clear: clearNode,
                replace: replaceNode,
                load: defaultLoad
            },
            set: setNode,
            clear: clearNode,
            replace: replaceNode,
            load: defaultLoad
        }));

    test("L'entrée 'structureList' est bien un array", () => expect(isObservableArray(store.structureList)).toBe(true));
    test("L'entrée 'structureList' possède bien la bonne entité", () =>
        expect(store.structureList.$entity).toEqual(StructureEntity));

    test("'ligneList' de l'entrée 'projet' est bien un array", () =>
        expect(isObservableArray(store.projetTest.ligneList)).toBe(true));
    test("'ligneList' de l'entrée 'projet' possède bien la bonne entité", () =>
        expect(store.projetTest.ligneList.$entity).toEqual(LigneEntity));

    test("Le sous-store est bien accessible", () =>
        expect(store.subStore.structure.id.$field).toEqual(StructureEntity.id));
});

describe("EntityStore: Replace global", () => {
    const store = getStore();
    store.replace({
        operation,
        structureList,
        projetTest,
        subStore: {operationList: [operation], structure: structureList[0]}
    });

    test("La propriété 'id' de l'entrée 'operation' a bien été enregistrée.", () =>
        expect(store.operation.id.value).toBe(operation.id));
    test("La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée.", () =>
        expect(store.operation.structure.id.value).toBe(operation.structure.id));

    test("La liste 'structureList' a bien été enregistrée.", () => expect(store.structureList[2]).toBeTruthy());
    test("Le deuxième élément de 'structureList' a bien été enregistré.", () =>
        expect(store.structureList[1].id.value).toBe(structureList[1].id));

    test("La liste 'projet.ligneList' a bien été enregistrée.", () =>
        expect(store.projetTest.ligneList[2]).toBeTruthy());
    test("Le deuxième élément de 'projet.ligneList' a bien été enregistré.", () =>
        expect(store.projetTest.ligneList[1].id.value).toBe(projetTest.ligneList[1].id));

    test("Le noeud 'structure' du sous-store a bien été enregistré.", () =>
        expect(store.subStore.structure.id.value).toBeTruthy());
    test("Le liste 'operationList' du sous-store a bien été enregistrée.", () =>
        expect(store.subStore.operationList[0].id).toBeTruthy());
    test("La liste `operationList` possède bien les bonnes valeurs.", () =>
        expect(store.subStore.operationList[0].id.value).toBe(operation.id));
});

describe("EntityStore: Replace locaux", () => {
    describe("operation", () => {
        const store = getStore();
        store.operation.replace(operation);

        test("La propriété 'id' de l'entrée 'operation' a bien été enregistrée.", () =>
            expect(store.operation.id.value).toBe(operation.id));
        test("La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set operation).", () =>
            expect(store.operation.structure.id.value).toBe(operation.structure.id));
    });

    describe("operation.structure", () => {
        const store = getStore();
        store.operation.structure.replace(operation.structure);

        test("La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set structure)", () =>
            expect(store.operation.structure.id.value).toBe(operation.structure.id));
    });

    describe("structureList", () => {
        const store = getStore();
        store.structureList.replaceNodes(structureList);

        test("La liste 'structureList' a bien été enregistrée.", () => expect(store.structureList[2]).toBeTruthy());
        test("Le deuxième élément de 'structureList' a bien été enregistré.", () =>
            expect(store.structureList[1].id.value).toBe(structureList[1].id));
    });

    describe("projetTest", () => {
        const store = getStore();
        store.projetTest.replace(projetTest);

        test("La liste 'projet.ligneList' a bien été enregistrée.", () =>
            expect(store.projetTest.ligneList[2]).toBeTruthy());
        test("Le deuxième élément de 'projet.ligneList' a bien été enregistré.", () =>
            expect(store.projetTest.ligneList[1].id.value).toBe(projetTest.ligneList[1].id));
    });
});

describe("EntityStore: Ajout élément dans une liste", () => {
    const store = getStore();
    store.structureList.replaceNodes(structureList);
    store.structureList.pushNode({id: 8});

    test("La liste 'structureList' possède bien un élément de plus.", () => expect(store.structureList.length).toBe(4));
    test("L'élément ajouté est bien un node avec les bonnes métadonnées.", () =>
        expect(store.structureList[3].id.$field).toEqual(StructureEntity.id));
    test("L'élement ajouté possède bien les valeurs attendues", () => expect(store.structureList[3].id.value).toBe(8));
});

describe("EntityStore: Set global", () => {
    const store = getStore();
    store.set({operation, subStore: {structure: structureList[0]}});
    store.structureList.pushNode({id: 1}, {id: 2});
    store.set({structureList: [{siret: "test"}, {id: 4}, {id: 5}, {id: 6}]});

    test("La propriété 'id' de l'entrée 'operation' a bien été enregistrée.", () =>
        expect(store.operation.id.value).toBe(operation.id));
    test("La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée.", () =>
        expect(store.operation.structure.id.value).toBe(operation.structure.id));

    test("Le noeud 'structure' du sous-store a bien été enregistré.", () =>
        expect(store.subStore.structure.id.value).toBeTruthy());

    test("La propriété 'structure[0].id' n'a pas été modifiée.", () => expect(store.structureList[0].id.value).toBe(1));
    test("La propriété 'structure[1].id' a bien été modifiée.", () => expect(store.structureList[1].id.value).toBe(4));
    test("La propriété 'structure[0].siret' a bien été renseignée.", () =>
        expect(store.structureList[0].siret.value).toBe("test"));
    test("Un item supplémentaire dans la liste a bien été créé.", () =>
        expect(store.structureList[2].id.value).toBe(5));
    test("Un deuxième item supplémentaire dans la liste a bien été créé.", () =>
        expect(store.structureList[3].id.value).toBe(6));
});

describe("EntityStore: Clear global", () => {
    const store = getStore();
    store.replace({
        operation,
        structureList,
        projetTest,
        subStore: {operationList: [operation], structure: structureList[0]}
    });
    store.clear();

    test("La propriété 'id' de l'entrée 'operation' est bien undefined.", () =>
        expect(store.operation.id.value).toBe(undefined));
    test("La propriété 'structure.id' de l'entrée 'operation' est bien undefined.", () =>
        expect(store.operation.structure.id.value).toBe(undefined));
    test("La liste 'structureList' est bien vide.", () => expect(store.structureList.length === 0).toBeTruthy());
    test("La liste 'projet.ligneList' est bien vide.", () =>
        expect(store.projetTest.ligneList.length === 0).toBeTruthy());
    test("La propriété 'id' de l'entrée 'structure' du sous-store est bien undefined.", () =>
        expect(store.subStore.structure.id.value).toBe(undefined));
    test("La liste 'operationList' du sous store est bien vide.", () =>
        expect(store.subStore.operationList.length === 0).toBeTruthy());
});

describe("EntityStore: Clear locaux", () => {
    const store = getStore();
    store.operation.clear();
    store.structureList.clear();
    store.projetTest.ligneList.clear();

    test("La propriété 'id' de l'entrée 'operation' est bien undefined.", () =>
        expect(store.operation.id.value).toBe(undefined));
    test("La propriété 'structure.id' de l'entrée 'operation' est bien undefined.", () =>
        expect(store.operation.structure.id.value).toBe(undefined));

    test("La liste 'structureList' est bien vide.", () => expect(store.structureList.length === 0).toBeTruthy());

    test("La liste 'projet.ligneList' est bien vide.", () =>
        expect(store.projetTest.ligneList.length === 0).toBeTruthy());
});

describe("toFlatValues", () => {
    const store = getStore();
    store.replace({operation, projetTest, structureList});

    test("L'entrée 'operation' a bien été mise à plat.", () =>
        expect(toFlatValues(store.operation)).toEqual(operation));
    test("L'entrée 'projet' a bien été mise à plat.", () => expect(toFlatValues(store.projetTest)).toEqual(projetTest));
    test("L'entrée 'structureList' a bien été mise à plat.", () =>
        expect(toFlatValues(store.structureList)).toEqual(structureList));
});

describe("FormNode: Création", () => {
    const {entry, entry2, formNode, formNode2} = getFormNodes();

    test("Les champs simples du FormNode sont bien identiques à ceux du StoreNode.", () =>
        expect(formNode.numero.$field).toEqual(entry.numero.$field));
    test("Les champs composites du FormNode sont bien identiques à ceux du StoreNode.", () =>
        expect(toFlatValues(formNode.structure)).toEqual(toFlatValues(entry.structure)));
    test("Une sous liste est bien toujours observable", () =>
        expect(isObservableArray(formNode2.ligneList)).toBeTruthy());
    test("Une sous liste a bien toujours son entité attachée.", () =>
        expect(formNode2.ligneList.$entity).toEqual(entry2.ligneList.$entity));
    test("Une sous liste a bien toujours sa méthode 'setNodes' attachée", () =>
        expect(formNode2.ligneList.setNodes).toBeTruthy());
    test("Le sourceNode racine est bien le bon.", () => expect(entry).toEqual(formNode.sourceNode));
    test("Le sous-sourceNode simple est bien le bon", () =>
        expect(entry.structure).toEqual(formNode.structure.sourceNode));
    test("Le sous-sourceNode liste est bien le bon", () =>
        expect(entry2.ligneList).toEqual(formNode2.ligneList.sourceNode));
    test("Un champ ajouté est bien présent", () => expect(formNode2.test).toBeDefined());

    test("Le FormNode a bien une propriété '_isEdit' initialisée à 'false'.", () =>
        expect((formNode.form as any)._isEdit).toBe(false));
    test("Le FormNode a bien une propriété 'isEdit' initialisée à 'false'.", () =>
        expect(formNode.form.isEdit).toBe(false));
    test("Les champs du FormNode ont bien une propriété '_isEdit' qui vaut 'true'.", () =>
        expect((formNode.montant as any)._isEdit).toBe(true));
    test("Les champs du FormNode ont bien une propriété 'isEdit' calculée qui vaut 'false'.", () =>
        expect(formNode.montant.isEdit).toBe(false));

    test("Les champs ont bien une propriété 'error'", () =>
        expect(formNode.numero.hasOwnProperty("error")).toBeTruthy());
    test("Le FormNode a bien une propriété 'isValid', initialisée à 'true'.", () =>
        expect(formNode.form.isValid).toBe(true));
    test("Le FormNode a bien une propriété 'isRequired', initialisée à 'true'.", () =>
        expect(formNode.form.isRequired).toBe(true));
    test("Le FormNode a bien une propriété 'isEmpty', initialisée à 'true'.", () =>
        expect(formNode.form.isEmpty).toBe(true));
    test("Le FormNode a bien une propriété 'hasChanged', initialisée à 'false'.", () =>
        expect(formNode.form.hasChanged).toBe(false));
});

describe("FormNode: Création à partir d'un noeud non-vide", () => {
    const entry = getStore().operation;
    const entry2 = getStore().projetTest;
    entry.replace(operation);
    entry2.replace(projetTest);

    const formNode = new FormNodeBuilder(entry).build();
    const formNode2 = new FormNodeBuilder(entry2).build();

    test("Un FormNode créé à partir d'une source non vide est bien vide.", () =>
        expect(toFlatValues(formNode)).toEqual({structure: {}}));
    test("Un FormListNode vide à partir d'une source non vide est bien vide.", () =>
        expect(toFlatValues(formNode2)).toEqual({ligneList: []}));
    test("La propriété 'hasChanged' est initialisée à 'true'.", () => expect(formNode.form.hasChanged).toBe(true));
});

describe("FormNode: Modification de StoreNode.", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);

    test("Le contenu du FormNode est identique à celui du StoreNode.", () =>
        expect(toFlatValues(formNode)).toEqual(toFlatValues(entry)));
    test("La propriété 'isEmpty' vaut bien désormais 'false'.", () => expect(formNode.form.isEmpty).toBe(false));
    test("La propriété 'hasChanged' vaut bien désormais 'false'.", () => expect(formNode.form.hasChanged).toBe(false));
});

describe("FormNode: Ajout de champs.", () => {
    describe("replace sur storeNode", () => {
        const {entry2, formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        entry2.replace(projetTest);

        test("Un champ ajouté a bien sa valeur.", () => expect(formNode2.test.value).toEqual("yolo"));
        test("Un champ ajouté calculé a bien sa valeur.", () => expect(formNode2.test2.value).toEqual("2"));
        test("Le setter du champ custom n'a pas été appelé", () => expect(setter).toBeCalledTimes(0));
        test("Un champ ajouté n'est pas remonté dans toFlatValues.", () =>
            expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));
        test("Un champ ajouté est remonté dans toFlatValues avec includeAddedFields.", () =>
            expect(toFlatValues(formNode2, true)).toEqual({
                ligneList: [
                    {id: 5, label: "label"},
                    {id: 6, label: "label"},
                    {id: 7, label: "label"}
                ],
                test: "yolo",
                test2: "2"
            }));
        test("Un champ ajouté à toujours 'hasChanged' à 'false'.", () => expect(formNode2.test.hasChanged).toBe(false));
    });

    describe("replace sur formNode", () => {
        const {formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        formNode2.replace(projetTest);

        test("Un champ ajouté a bien sa valeur vidée.", () => expect(formNode2.test.value).toBeUndefined());
        test("Un champ ajouté calculé a bien toujours sa valeur.", () => expect(formNode2.test2.value).toEqual("2"));
        test("Le setter du champ ajouté a été appelé 1 fois", () => expect(setter).toBeCalledTimes(1));
    });

    describe("clear sur storeNode", () => {
        const {entry2, formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        entry2.clear();

        test("Un champ ajouté a bien sa valeur.", () => expect(formNode2.test.value).toEqual("yolo"));
        test("Un champ ajouté calculé a bien toujours sa valeur.", () => expect(formNode2.test2.value).toEqual("2"));
        test("Le setter du champ custom n'a pas été appelé", () => expect(setter).toBeCalledTimes(0));
    });

    describe("clear sur formNode", () => {
        const {formNode2, setter} = getFormNodes();
        formNode2.set({test: "yolo"});
        formNode2.clear();

        test("Un champ ajouté a bien sa valeur vidée.", () => expect(formNode2.test.value).toBeUndefined());
        test("Un champ ajouté calculé a bien toujours sa valeur.", () => expect(formNode2.test2.value).toEqual("2"));
        test("Le setter du champ ajouté a été appelé 1 fois", () => expect(setter).toBeCalledTimes(1));
    });
});

describe("FormNode: Modification de StoreListNode.", () => {
    describe("replace", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        test("Le contenu du FormListNode est identique à celui du StoreListNode.", () =>
            expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));
        test("Le sourceNode d'un objet de liste est bien le bon.", () =>
            expect(formNode2.ligneList[0].sourceNode).toEqual(entry2.ligneList[0]));
        test("La propriété 'hasChanged' vaut bien désormais 'false'.", () =>
            expect(formNode2.form.hasChanged).toBe(false));
    });

    describe("delete", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        entry2.ligneList.splice(2, 1);
        test("Les suppressions d'élements de liste dans un StoreNode sont bien répercutées.", () =>
            expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}]));
    });

    describe("push", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        entry2.ligneList.splice(2, 1);
        entry2.ligneList.pushNode({id: 8});

        test("Les ajouts d'élements de liste dans un StoreNode sont bien répercutées.", () =>
            expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}, {id: 8}]));
        test("La propriété 'hasChanged' vaut bien désormais 'false'.", () =>
            expect(formNode2.ligneList.form.hasChanged).toBe(false));
    });
});

describe("FormNode: Modification de FormNode", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.montant.value = 1000;
    formNode.set({structure: {id: 26}});
    formNode.structure.set({nom: "yolo"});

    test("Champ simple: le FormNode a bien été modifié.", () => expect(formNode.montant.value).toBe(1000));
    test("Champ simple: le StoreNode est bien toujours identique.", () =>
        expect(entry.montant.value).toBe(operation.montant));
    test("Champ composite via set global: le FormNode a bien été modifié.", () =>
        expect(formNode.structure.id.value).toBe(26));
    test("Champ composite via set global: le StoreNode est bien toujours identique.", () =>
        expect(entry.structure.id.value).toBe(operation.structure.id));
    test("Champ composite via set local: le FormNode a bien été modifié.", () =>
        expect(formNode.structure.nom.value).toBe("yolo"));
    test("Champ composite via set local: le StoreNode est bien toujours identique.", () =>
        expect(entry.structure.nom.value).toBe(operation.structure.nom));
    test("La propriété 'hasChanged' est bien 'true'.", () => expect(formNode.form.hasChanged).toBe(true));
    test("La propriété 'hasChanged' du montant est bien 'true'.", () => expect(formNode.montant.hasChanged).toBe(true));
    test("La propriété 'hasChanged' du numéro est bien 'false'.", () => expect(formNode.numero.hasChanged).toBe(false));
});

describe("FormListNode: Modification", () => {
    function step1() {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        return {entry2, formNode2};
    }

    test("Une suppression d'élement dans un StoreListNode est bien répercutée dans le FormListNode en conservant un élément dans ce dernier ajouté à la fin.", () => {
        const {formNode2} = step1();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 7}, {id: 8}]);
        expect(formNode2.ligneList.form.hasChanged).toBe(true);
        expect(formNode2.ligneList[0].form.hasChanged).toBe(false);
        expect(formNode2.ligneList[1].form.hasChanged).toBe(false);
        expect(formNode2.ligneList[2].form.hasChanged).toBe(true);
    });

    function step2() {
        const {entry2, formNode2} = step1();
        formNode2.ligneList[2].label.value = "yolo";
        entry2.ligneList.pushNode({id: 9});
        return {entry2, formNode2};
    }

    test("Un élément ajouté dans un StoreListNode est fusionné avec l'élément en plus du FormListNode.", () => {
        const {formNode2} = step2();
        expect(toFlatValues(formNode2.ligneList, true)).toEqual([
            {id: 5, label: "label"},
            {id: 7, label: "label"},
            {id: 9, label: "yolo"}
        ]);
    });

    function step3() {
        const {entry2, formNode2} = step2();
        entry2.ligneList[1].id.value = 77;
        entry2.ligneList[2].id.value = 99;
        formNode2.ligneList.pushNode({id: 10, label: "salut"});
        entry2.ligneList.pushNode({id: 11}, {id: 12});
        return {entry2, formNode2};
    }

    test("Et si on en ajoute 2, le premier est fusionné et le deuxième ajouté.", () => {
        const {formNode2} = step3();
        expect(toFlatValues(formNode2.ligneList, true)).toEqual([
            {id: 5, label: "label"},
            {id: 77, label: "label"},
            {id: 99, label: "yolo"},
            {id: 11, label: "salut"},
            {id: 12, label: "label"}
        ]);
    });

    function step4() {
        const {entry2, formNode2} = step3();
        entry2.ligneList[1].id.value = 7;
        entry2.ligneList[2].id.value = 9;
        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.pushNode({id: 13});
        return {entry2, formNode2};
    }

    test("Si le FormListNode retire un élément, un élément ajouté dans le StoreListNode se retrouve bien à la fin.", () => {
        const {formNode2} = step4();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 9}, {id: 11}, {id: 12}, {id: 13}]);
    });

    function step5() {
        const {entry2, formNode2} = step4();
        formNode2.ligneList.pushNode({id: 14});
        entry2.replace(projetTest);
        return {entry2, formNode2};
    }

    test("Et si je reset ma liste initiale : je la retrouve dans le FormNode suivie des éléments qui y on été ajoutés.", () => {
        const {formNode2} = step5();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}, {id: 7}, {id: 14}]);
    });

    function step6() {
        const {entry2, formNode2} = step5();
        formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
        entry2.replace(projetTest);
        return {entry2, formNode2};
    }

    test("Un replace du StoreListNode écrase totalement les modifications du FormListNode.", () => {
        const {formNode2, entry2} = step6();
        expect(toFlatValues(formNode2.ligneList)).toEqual(toFlatValues(entry2.ligneList));
    });

    function step7() {
        const {entry2, formNode2} = step6();
        entry2.ligneList.setNodes([{id: 10}, {id: 11}, {}, {id: 13}]);
        return {entry2, formNode2};
    }

    test("SetNodes marche comme attendu.", () => {
        const {formNode2, entry2} = step7();
        expect(toFlatValues(formNode2.ligneList)).toEqual(toFlatValues(entry2.ligneList));
    });

    function step8() {
        const {entry2, formNode2} = step7();
        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.setNodes([{id: 14}, {id: 15}, {}, {id: 17}]);
        return {entry2, formNode2};
    }

    test("SetNodes marche comme attendu bis.", () => {
        const {formNode2} = step8();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 14}, {id: 7}, {id: 17}]);
    });
});

describe("FormNode: Modification de source forcée", () => {
    function step1() {
        const {entry, entry2, formNode, formNode2} = getFormNodes();
        entry.replace(operation);
        entry2.replace(projetTest);
        formNode.numero.value = "10";
        formNode2.ligneList[0].id.value = 65;
        entry.replace(operation);
        entry2.replace(projetTest);
        return {entry, entry2, formNode, formNode2};
    }

    describe("init", () => {
        const {entry, entry2, formNode, formNode2} = step1();
        test("La mise à jour de la source (noeud simple) reset toujours la cible, même si la mise à jour de la source ne fait rien.", () =>
            expect(toFlatValues(formNode)).toEqual(toFlatValues(entry)));
        test("La mise à jour de la source (noeud liste) reset toujours la cible, même si la mise à jour de la source ne fait rien.", () =>
            expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));
    });

    function step2() {
        const {entry, entry2, formNode, formNode2} = step1();
        formNode.numero.value = "yolo";
        entry.structure.id.value = 9000;
        entry.structure.replace(operation.structure);
        return {entry, entry2, formNode, formNode2};
    }

    describe("resetPartiel 1", () => {
        const {formNode} = step2();
        test("Un reset partiel n'affecte pas les champs non affectés.", () => {
            expect(formNode.numero.value).toBe("yolo");
        });
        test("Un reset partiel affecte les champs concernés.", () => {
            expect(toFlatValues(formNode.structure)).toEqual(operation.structure);
        });
    });

    function step3() {
        const {entry, entry2, formNode, formNode2} = step2();
        formNode.montant.value = 9000;
        entry.numero.value = "déso";
        return {entry, entry2, formNode, formNode2};
    }

    describe("resetPartiel 2", () => {
        const {formNode} = step3();
        test("Un reset partiel n'affecte pas les champs non affectés.", () => {
            expect(formNode.montant.value).toBe(9000);
        });
        test("Un reset partiel n'affecte pas les champs non affectés.", () => {
            expect(formNode.numero.value).toBe("déso");
        });
    });
});

describe("FormNode: propagation isEdit et isValid", () => {
    function step1() {
        const {formNode, formNode2} = getFormNodes();
        formNode.replace(operation);
        formNode2.replace(projetTest);
        formNode.form.isEdit = true;
        formNode2.form.isEdit = true;
        return {formNode, formNode2};
    }

    describe("isEdit", () => {
        const {formNode, formNode2} = step1();
        test("Tous les champs du noeud simple sont maintenant en édition", () =>
            expect(formNode.structure.nom.isEdit).toBe(true));
        test("Tous les champs du noeud liste sont maintenant en édition", () =>
            expect(formNode2.ligneList[0].id.isEdit).toBe(true));
    });

    function step2() {
        const {formNode, formNode2} = step1();
        formNode.structure.nom.value = undefined;
        return {formNode, formNode2};
    }

    describe("validation object", () => {
        const {formNode} = step2();
        test("Un champ required non renseigné est bien en erreur.", () => {
            expect(!!formNode.structure.nom.error).toBeTruthy();
        });
        test("Par conséquent le FormNode n'est plus valide.", () => {
            expect(formNode.form.isValid).toBe(false);
        });
        test("La liste d'erreurs du FormNode est bien remplie.", () => {
            expect(formNode.form.errors).toEqual({structure: {nom: "focus.validation.required"}});
        });
        test("Les erreurs de formulaires sont les mêmes à tous les niveaux.", () => {
            expect(formNode.structure.form.errors).toEqual((formNode.form.errors as any).structure);
        });
    });

    function step3() {
        const {formNode, formNode2} = step2();
        formNode2.ligneList[1].id.value = undefined;
        return {formNode, formNode2};
    }

    describe("validation liste", () => {
        const {formNode2} = step3();
        test("Dans un FormListNode le noeud avec une champ en erreur est invalide.", () => {
            expect(formNode2.ligneList[1].form.isValid).toBe(false);
        });
        test("Mais le noeud d'à côté reste valide.", () => {
            expect(formNode2.ligneList[0].form.isValid).toBe(true);
        });
        test("La liste elle-même est invalide.", () => {
            expect(formNode2.ligneList.form.isValid).toBe(false);
        });
        test("La liste des erreurs sur le noeud liste est correcte.", () => {
            expect(formNode2.ligneList.form.errors).toEqual([{}, {id: "focus.validation.required"}, {}]);
        });
    });
});

describe("FormNode: clear du storeNode", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    entry.clear();

    test("Le FormNode est bien vide après un clear du StoreNode.", () =>
        expect(toFlatValues(formNode)).toEqual({structure: {}}));
});

describe("FormNode: reset global", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.set({montant: 3000, structure: {id: 23, nom: "LOL"}});
    formNode.reset();

    test("Champ simple: le FormNode a bien été réinitialisé.", () =>
        expect(formNode.montant.value).toBe(operation.montant));
    test("Champ composite: le FormNode a bien été réinitialisé.", () =>
        expect(formNode.structure.id.value).toBe(operation.structure.id));
});

describe("FormNode: reset local (noeud simple)", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.set({montant: 3000, structure: {id: 23}});
    formNode.structure.reset();

    test("Champ non concerné pas le reset : n'a pas été touché.", () => expect(formNode.montant.value).toBe(3000));
    test("Champ concerné par le reset : a été réinitialisé.", () =>
        expect(formNode.structure.id.value).toBe(operation.structure.id));
});

describe("FormListNode: reset", () => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);
    formNode2.ligneList[0].id.value = 23;
    formNode2.ligneList.remove(formNode2.ligneList[2]);
    formNode2.ligneList.reset();

    test("La liste à bien été réinitialisée.", () => expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));
});

describe("FormListNode: reset d'un item", () => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);
    formNode2.ligneList[0].id.value = 23;
    formNode2.ligneList[0].reset();

    test("Champ modifié de l'item : a été réinitialisé.", () => expect(formNode2.ligneList[0].id.value).toBe(5));
});

describe("FormNode: dispose", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.dispose();
    entry.montant.value = 2;

    test("Le FormNode n'a pas été mis à jour.", () => expect(formNode.montant.value).toBe(operation.montant));
});

describe("FormListNode: dispose", () => {
    function step1() {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        const [item2] = formNode2.ligneList.splice(2, 1);
        entry2.ligneList[2].id.value = 55;
        entry2.ligneList[1].id.value = 54;
        return {item2, entry2, formNode2};
    }

    describe("modif", () => {
        const {item2, formNode2} = step1();
        test("Un objet supprimé d'un FormListNode n'est bien plus mis à jour.", () =>
            expect(item2.id.value).toBe(projetTest.ligneList[2].id));
        test("Mais les autres le sont toujours.", () => expect(formNode2.ligneList[1].id.value).toBe(54));
    });

    function step2() {
        const {entry2, formNode2} = step1();
        formNode2.dispose();
        entry2.replace({ligneList: [{id: 41}]});
        return {entry2, formNode2};
    }

    test("Après le dispose de la liste, les ajouts et les suppressions ne font plus rien.", () => {
        const {formNode2} = step2();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 54}]);
    });

    function step3() {
        const {entry2, formNode2} = step2();
        entry2.ligneList[0].id.value = 235;
        return {entry2, formNode2};
    }

    test("Et les noeuds invididuels sont inchangés.", () => {
        const {formNode2} = step3();
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 54}]);
    });
});
