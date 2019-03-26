import i18next from "i18next";
import {isObservableArray} from "mobx";

import {makeFormNode} from "../form";
import {makeEntityStore, toFlatValues} from "../store";
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
    const formNode = makeFormNode(entry);
    const formNode2 = makeFormNode(entry2);
    return {entry, entry2, formNode, formNode2};
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

    const {id, numero, montant} = OperationEntity.fields;
    test("L'entrée 'operation' a bien la forme attendue", () =>
        expect(store.operation).toEqual({
            id: {$field: id, value: undefined},
            numero: {$field: numero, value: undefined},
            montant: {$field: montant, value: undefined},
            structure: {
                id: {$field: StructureEntity.fields.id, value: undefined},
                nom: {$field: StructureEntity.fields.nom, value: undefined},
                siret: {$field: StructureEntity.fields.siret, value: undefined},
                set: store.operation.structure.set,
                clear: store.operation.structure.clear,
                replace: store.operation.structure.replace
            },
            set: store.operation.set,
            clear: store.operation.clear,
            replace: store.operation.replace
        }));

    test("L'entrée 'structureList' est bien un array", () => expect(isObservableArray(store.structureList)).toBe(true));
    test("L'entrée 'structureList' possède bien la bonne entité", () =>
        expect(store.structureList.$entity).toEqual(StructureEntity));

    test("'ligneList' de l'entrée 'projet' est bien un array", () =>
        expect(isObservableArray(store.projetTest.ligneList)).toBe(true));
    test("'ligneList' de l'entrée 'projet' possède bien la bonne entité", () =>
        expect(store.projetTest.ligneList.$entity).toEqual(LigneEntity));

    test("Le sous-store est bien accessible", () =>
        expect(store.subStore.structure.id.$field).toEqual(StructureEntity.fields.id));
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
        expect(store.structureList[3].id.$field).toEqual(StructureEntity.fields.id));
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
});

describe("FormNode: Création à partir d'un noeud non-vide", () => {
    const entry = getStore().operation;
    const entry2 = getStore().projetTest;
    entry.replace(operation);
    entry2.replace(projetTest);

    const formNode = makeFormNode(entry);
    const formNode2 = makeFormNode(entry2);
    const formNodeB = makeFormNode(entry, {isEmpty: true});
    const formNodeB2 = makeFormNode(entry2, {isEmpty: true});

    test("Un FormNode créé sans options à partir d'une source non vide possède tout son contenu.", () =>
        expect(toFlatValues(formNode)).toEqual(toFlatValues(entry)));
    test("Un FormListNode créé sans options à partir d'une source non vide possède tout son contenu.", () =>
        expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));

    test("Un FormNode créé vide à partir d'une source non vide est bien vide.", () =>
        expect(toFlatValues(formNodeB)).toEqual({structure: {}}));
    test("Un FormListNode créé vide à partir d'une source non vide possède est bien vide.", () =>
        expect(toFlatValues(formNodeB2)).toEqual({ligneList: []}));
});

describe("FormNode: Modification de StoreNode.", () => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);

    test("Le contenu du FormNode est identique à celui du StoreNode.", () =>
        expect(toFlatValues(formNode)).toEqual(toFlatValues(entry)));
});

describe("FormNode: Modification de StoreListNode.", () => {
    describe("replace", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        test("Le contenu du FormListNode est identique à celui du StoreListNode.", () =>
            expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));
        test("Le sourceNode d'un objet de liste est bien le bon.", () =>
            expect(formNode2.ligneList[0].sourceNode).toEqual(entry2.ligneList[0]));
    });

    describe("delete", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        entry2.ligneList.splice(2, 1);
        test("Les suppressions d'élements de liste dans un Storeode sont bien répercutées.", () =>
            expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}]));
    });

    describe("push", () => {
        const {entry2, formNode2} = getFormNodes();
        entry2.replace(projetTest);
        entry2.ligneList.splice(2, 1);
        entry2.ligneList.pushNode({id: 8});
        test("Les ajouts d'élements de liste dans un Storeode sont bien répercutées.", () =>
            expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}, {id: 8}]));
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
});

describe("FormListNode: Modification", () => {
    let step1Done: () => void;
    const step1 = new Promise(resolve => (step1Done = resolve));
    let step2Done: () => void;
    const step2 = new Promise(resolve => (step2Done = resolve));
    let step3Done: () => void;
    const step3 = new Promise(resolve => (step3Done = resolve));
    let step4Done: () => void;
    const step4 = new Promise(resolve => (step4Done = resolve));
    let step5Done: () => void;
    const step5 = new Promise(resolve => (step5Done = resolve));
    let step6Done: () => void;
    const step6 = new Promise(resolve => (step6Done = resolve));
    let step7Done: () => void;
    const step7 = new Promise(resolve => (step7Done = resolve));

    const {entry2, formNode2} = getFormNodes();

    test("Une suppression d'élement dans un StoreListNode est bien répercutée dans le FormListNode en conservant un élément dans ce dernier ajouté à la fin.", () => {
        entry2.replace(projetTest);
        formNode2.ligneList.pushNode({id: 8});
        entry2.ligneList.splice(1, 1);
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 7}, {id: 8}]);

        step1Done();
    });

    test("Un élément ajouté dans un StoreListNode se retoruve dans le FormListNode avant tout élément ajouté dans ce dernier.", async () => {
        await step1;

        entry2.ligneList.pushNode({id: 9});
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 7}, {id: 9}, {id: 8}]);

        step2Done();
    });

    test("Y compris si le FormListNode a retiré un élément au milieu avant.", async () => {
        await step2;

        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.pushNode({id: 10});
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 9}, {id: 10}, {id: 8}]);

        step3Done();
    });

    test("Plus dur : l'élément à partir du quel j'ai ajouté dans le StoreListNode manque dans le FormListNode.", async () => {
        await step3;

        formNode2.ligneList.splice(2, 1);
        entry2.ligneList.pushNode({id: 11});
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 9}, {id: 11}, {id: 8}]);

        step4Done();
    });

    test("Et si je reset ma liste initiale : je la retrouve dans le FormNode suivie des éléments qui y on été ajoutés.", async () => {
        await step4;

        formNode2.ligneList.splice(0, 1);
        entry2.replace(projetTest);
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 6}, {id: 7}, {id: 8}]);

        step5Done();
    });

    test("Un replace du StoreListNode écrase totalement les modifications du FormListNode.", async () => {
        await step5;

        formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
        entry2.replace(projetTest);
        expect(toFlatValues(formNode2.ligneList)).toEqual(toFlatValues(entry2.ligneList));

        step6Done();
    });

    test("SetNodes marche comme attendu.", async () => {
        await step6;

        entry2.ligneList.setNodes([{id: 10}, {id: 11}, {}, {id: 13}]);
        expect(toFlatValues(formNode2.ligneList)).toEqual(toFlatValues(entry2.ligneList));

        step7Done();
    });

    test("SetNodes marche comme attendu bis.", async () => {
        await step7;

        formNode2.ligneList.splice(1, 1);
        entry2.ligneList.setNodes([{id: 14}, {id: 15}, {}, {id: 17}]);
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 14}, {id: 7}, {id: 17}]);
    });
});

describe("FormNode: Modification de source forcée", () => {
    let step1Done: () => void;
    const step1 = new Promise(resolve => (step1Done = resolve));
    let step2Done: () => void;
    const step2 = new Promise(resolve => (step2Done = resolve));

    const {entry, entry2, formNode, formNode2} = getFormNodes();

    describe("init", () => {
        entry.replace(operation);
        entry2.replace(projetTest);
        formNode.numero.value = "10";
        formNode2.ligneList[0].id.value = 65;
        entry.replace(operation);
        entry2.replace(projetTest);

        test("La mise à jour de la source (noeud simple) reset toujours la cible, même si la mise à jour de la source ne fait rien.", () =>
            expect(toFlatValues(formNode)).toEqual(toFlatValues(entry)));
        test("La mise à jour de la source (noeud liste) reset toujours la cible, même si la mise à jour de la source ne fait rien.", () =>
            expect(toFlatValues(formNode2)).toEqual(toFlatValues(entry2)));

        afterAll(() => {
            formNode.numero.value = "yolo";
            entry.structure.id.value = 9000;
            entry.structure.replace(operation.structure);
            step1Done();
        });
    });

    describe("resetPartiel 1", () => {
        test("Un reset partiel n'affecte pas les champs non affectés.", async () => {
            await step1;
            expect(formNode.numero.value).toBe("yolo");
        });
        test("Un reset partiel affecte les champs concernés.", async () => {
            await step1;
            expect(toFlatValues(formNode.structure)).toEqual(operation.structure);
        });

        afterAll(() => {
            formNode.montant.value = 9000;
            entry.numero.value = "déso";
            step2Done();
        });
    });

    describe("resetPartiel 2", () => {
        test("Un reset partiel n'affecte pas les champs non affectés.", async () => {
            await step2;
            expect(formNode.montant.value).toBe(9000);
        });
        test("Un reset partiel n'affecte pas les champs non affectés.", async () => {
            await step2;
            expect(formNode.numero.value).toBe("déso");
        });
    });
});

describe("FormNode: propagation isEdit et isValid", () => {
    let step1Done: () => void;
    const step1 = new Promise(resolve => (step1Done = resolve));
    let step2Done: () => void;
    const step2 = new Promise(resolve => (step2Done = resolve));

    const {formNode, formNode2} = getFormNodes();
    formNode.replace(operation);
    formNode2.replace(projetTest);

    describe("isEdit", () => {
        formNode.form.isEdit = true;
        formNode2.form.isEdit = true;
        test("Tous les champs du noeud simple sont maintenant en édition", () =>
            expect(formNode.structure.nom.isEdit).toBe(true));
        test("Tous les champs du noeud liste sont maintenant en édition", () =>
            expect(formNode2.ligneList[0].id.isEdit).toBe(true));

        afterAll(() => {
            formNode.structure.nom.value = undefined;
            step1Done();
        });
    });

    describe("validation object", () => {
        test("Un champ required non renseigné est bien en erreur.", async () => {
            await step1;
            expect(!!formNode.structure.nom.error).toBeTruthy();
        });
        test("Par conséquent le FormNode n'est plus valide.", async () => {
            await step1;
            expect(formNode.form.isValid).toBe(false);
        });
        test("La liste d'erreurs du FormNode est bien remplie.", async () => {
            await step1;
            expect(formNode.form.errors).toEqual({structure: {nom: "focus.validation.required"}});
        });
        test("Les erreurs de formulaires sont les mêmes à tous les niveaux.", async () => {
            await step1;
            expect(formNode.structure.form.errors).toEqual(formNode.form.errors.structure);
        });

        afterAll(() => {
            formNode2.ligneList[1].id.value = undefined;
            step2Done();
        });
    });

    describe("validation liste", () => {
        test("Dans un FormListNode le noeud avec une champ en erreur est invalide.", async () => {
            await step2;
            expect(formNode2.ligneList[1].form.isValid).toBe(false);
        });
        test("Mais le noeud d'à côté reste valide.", async () => {
            await step2;
            expect(formNode2.ligneList[0].form.isValid).toBe(true);
        });
        test("La liste elle-même est invalide.", async () => {
            await step2;
            expect(formNode2.ligneList.form.isValid).toBe(false);
        });
        test("La liste des erreurs sur le noeud liste est correcte.", async () => {
            await step2;
            expect(formNode2.ligneList.form.errors).toEqual([{}, {id: "focus.validation.required"}, {}]);
        });
    });
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
    formNode.form.dispose();
    entry.montant.value = 2;

    test("Le FormNode n'a pas été mis à jour.", () => expect(formNode.montant.value).toBe(operation.montant));
});

describe("FormListNode: dispose", () => {
    let step1Done: () => void;
    const step1 = new Promise(resolve => (step1Done = resolve));
    let step2Done: () => void;
    const step2 = new Promise(resolve => (step2Done = resolve));

    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);

    describe("modif", () => {
        const [item2] = formNode2.ligneList.splice(2, 1);
        entry2.ligneList[2].id.value = 55;
        entry2.ligneList[1].id.value = 54;
        test("Un objet supprimé d'un FormListNode n'est bien plus mis à jour.", () =>
            expect(item2.id.value).toBe(projetTest.ligneList[2].id));
        test("Mais les autres le sont toujours.", () => expect(formNode2.ligneList[1].id.value).toBe(54));

        afterAll(step1Done);
    });

    test("Après le dispose de la liste, les ajouts et les suppressions ne font plus rien.", async () => {
        await step1;

        formNode2.form.dispose();
        entry2.replace({ligneList: [{id: 41}]});
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 54}]);

        step2Done();
    });

    test("Et les noeuds invididuels sont inchangés.", async () => {
        await step2;

        entry2.ligneList[0].id.value = 235;
        expect(toFlatValues(formNode2.ligneList)).toEqual([{id: 5}, {id: 54}]);
    });
});
