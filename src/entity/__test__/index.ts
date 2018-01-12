/* tslint:disable */

import {isObservable, isObservableArray} from "mobx";
import test = require("tape");

import {makeEntityStore, toFlatValues} from "../store";
import {createViewModel} from "../view-model";
import {LigneEntity} from "./ligne";
import {OperationEntity, OperationNode} from "./operation";
import {ProjetEntity, ProjetNode} from "./projet";
import {StructureEntity, StructureNode} from "./structure";

function getStore() {
    const subStore = makeEntityStore({
        structure: {} as StructureNode
    }, {
        operationList: {} as OperationNode
    }, [
        OperationEntity,
        StructureEntity
    ], {
        operationList: "operation"
    });

    return makeEntityStore({
        operation: {} as OperationNode,
        projetTest: {} as ProjetNode,
        subStore
    }, {
        structureList: {} as StructureNode
    }, [
        OperationEntity,
        ProjetEntity,
        StructureEntity,
        LigneEntity
    ], {
        projetTest: "projet",
        structureList: "structure"
    });
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

test("EntityStore: Création", t => {
    const store = getStore();

    const {id, numero, montant} = OperationEntity.fields;
    t.deepEqual(store.operation, {
        id: {$entity: id, value: undefined},
        numero: {$entity: numero, value: undefined},
        montant: {$entity: montant, value: undefined},
        structure: {
            id: {$entity: StructureEntity.fields.id, value: undefined},
            nom: {$entity: StructureEntity.fields.nom, value: undefined},
            siret: {$entity: StructureEntity.fields.siret, value: undefined},
            set: store.operation.structure.set,
            clear: store.operation.structure.clear
        },
        set: store.operation.set,
        clear: store.operation.clear
    }, "L'entrée 'operation' a bien la forme attendue");

    t.assert(isObservableArray(store.structureList), "L'entrée 'structureList' est bien un array");
    t.deepEqual(store.structureList.$entity, StructureEntity, "L'entrée 'structureList' possède bien la bonne entité");

    t.assert(isObservableArray(store.projetTest.ligneList), "'ligneList' de l'entrée 'projet' est bien un array");
    t.deepEqual(store.projetTest.ligneList.$entity, LigneEntity, "'ligneList' de l'entrée 'projet' possède bien la bonne entité");

    t.equal(store.subStore.structure.id.$entity, StructureEntity.fields.id, "Le sous-store est bien accessible");

    t.end();
});

test("EntityStore: Set global", t => {
    const store = getStore();

    store.set({operation});
    t.equal(store.operation.id.value, operation.id, "La propriété 'id' de l'entrée 'operation' a bien été enregistrée.");
    t.equal(store.operation.structure.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée.");

    store.set({structureList});
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(store.structureList[1].id.value, structureList[1].id, "Le deuxième élément de 'structureList' a bien été enregistré.");

    store.set({projetTest});
    t.assert(store.projetTest.ligneList[2], "La liste 'projet.ligneList' a bien été enresgitrée.");
    t.equal(store.projetTest.ligneList[1].id.value, projetTest.ligneList[1].id, "Le deuxième élément de 'projet.ligneList' a bien été enregistré.");

    store.set({subStore: {operationList: [operation], structure: structureList[0]}});
    t.assert(store.subStore.structure.id.value, "Le noeud 'structure' du sous-store a bien été enregistré.");
    t.assert(store.subStore.operationList[0].id, "Le liste 'operationList' du sous-store a bien été enregistrée.");
    t.equal(store.subStore.operationList[0].id.value, operation.id, "La liste `operationList` possède bien les bonnes valeurs.");
    t.end();
});

test("EntityStore: Set locaux", t => {
    let store = getStore();

    store.operation.set(operation);
    t.equal(store.operation.id.value, operation.id, "La propriété 'id' de l'entrée 'operation' a bien été enregistrée.");
    t.equal(store.operation.structure.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set operation).");

    store = getStore();
    store.operation.structure.set(operation.structure);
    t.equal(store.operation.structure.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set structure)");

    store.structureList.set(structureList);
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(store.structureList[1].id.value, structureList[1].id, "Le deuxième élément de 'structureList' a bien été enregistré.");

    store.projetTest.set(projetTest);
    t.assert(store.projetTest.ligneList[2], "La liste 'projet.ligneList' a bien été enregistrée.");
    t.equal(store.projetTest.ligneList[1].id.value, projetTest.ligneList[1].id, "Le deuxième élément de 'projet.ligneList' a bien été enregistré.");

    t.end();
});

test("EntityStore: Clear global", t => {
    const store = getStore();
    store.set({operation, structureList, projetTest, subStore: {operationList: [operation], structure: structureList[0]}});

    store.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(store.operation.structure.id.value, undefined, "La propriété 'structure.id' de l'entrée 'operation' est bien undefined.");
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");
    t.assert(store.projetTest.ligneList.length === 0, "La liste 'projet.ligneList' est bien vide.");
    t.equal(store.subStore.structure.id.value, undefined, "La propriété 'id' de l'entrée 'structure' du sous-store est bien undefined.");
    t.assert(store.subStore.operationList.length === 0, "La liste 'operationList' du sous store est bien vide.");

    t.end();
});

test("EntityStore: Ajout élément dans une liste", t => {
    const store = getStore();

    store.structureList.set(structureList);
    store.structureList.pushNode({id: 8});
    t.assert(store.structureList.length === 4, "La liste 'structureList' possède bien un élément de plus.");
    t.deepEqual(store.structureList[3].id.$entity, StructureEntity.fields.id, "L'élément ajouté est bien un node avec les bonnes métadonnées.");
    t.equal(store.structureList[3].id.value, 8, "L'élement ajouté possède bien les valeurs attendues");

    t.end();
})

test("EntityStore: Clear locaux", t => {
    const store = getStore();

    store.operation.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(store.operation.structure.id.value, undefined, "La propriété 'structure.id' de l'entrée 'operation' est bien undefined.");

    store.structureList.clear();
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");

    store.projetTest.ligneList.clear();
    t.assert(store.projetTest.ligneList.length === 0, "La liste 'projet.ligneList' est bien vide.");

    t.end();
});

test("toFlatValues", t => {
    const store = getStore();
    store.set({operation, projetTest, structureList});

    t.deepEqual(toFlatValues(store.operation), operation, "L'entrée 'operation' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.projetTest), projetTest, "L'entrée 'projet' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.structureList), structureList, "L'entrée 'structureList' a bien été mise à plat.");

    t.end();
});

test("ViewModel: Création", t => {
    const entry = getStore().operation;
    const viewModel = createViewModel(entry);

    const entry2 = getStore().projetTest;
    const viewModel2 = createViewModel(entry2);

    t.deepEqual(viewModel.numero, entry.numero, "Les champs simples du viewModel sont bien identiques à ceux du model.");
    t.deepEqual(viewModel.structure, entry.structure, "Les champs composites du viewModel sont bien identiques à ceux du model.");
    t.assert(isObservableArray(viewModel2.ligneList), "Une sous liste est bien toujours observable");
    t.deepEqual(viewModel2.ligneList.$entity, entry2.ligneList.$entity, "Une sous liste a bien toujours son entité attachée.");
    t.assert(!isObservable(viewModel2.ligneList.$entity), "Le champ '$entity' d'une sous liste n'est bien pas observable");
    t.assert(viewModel2.ligneList.set, "Une sous liste a bien toujours sa méthode 'set' attachée");

    t.comment("ViewModel: Modification de model.");
    entry.set(operation);

    t.equal(viewModel.id.value, entry.id.value, "Les modifications du model sont bien répercutées sur les champs simples.");
    t.deepEqual(viewModel.structure, entry.structure, "Les modifications du model sont bien répercutées sur les champs composites.");

    t.comment("ViewModel: Modification de viewModel");
    viewModel.montant.value = 1000;
    viewModel.set({structure: {id: 26}});
    viewModel.structure.set({nom: "yolo"});

    t.equal(viewModel.montant.value, 1000, "Champ simple: le viewModel a bien été modifié.");
    t.equal(entry.montant.value, operation.montant, "Champ simple: le model est bien toujours identique.");
    t.equal(viewModel.structure.id.value, 26, "Champ composite via set global: le viewModel a bien été modifié.");
    t.equal(entry.structure.id.value, operation.structure.id, "Champ composite via set global: le model est bien toujours identique.");
    t.equal(viewModel.structure.nom.value, "yolo", "Champ composite via set local: le viewModel a bien été modifié.");
    t.equal(entry.structure.nom.value, operation.structure.nom, "Champ composite via set local: le model est bien toujours identique.");

    t.comment("ViewModel: model.set(toFlatValues(viewModel))");
    entry.set(toFlatValues(viewModel));

    t.equal(viewModel.montant.value, 1000, "Champ simple: le viewModel est bien toujours identique.");
    t.equal(entry.montant.value, 1000, "Champ simple: le model a bien été mis à jour.");
    t.equal(viewModel.structure.id.value, 26, "Champ composite via set global: le viewModel est bien toujours identique.");
    t.equal(entry.structure.id.value, 26, "Champ composite via set global: le model a bien été mis à jour.");
    t.equal(viewModel.structure.nom.value, "yolo", "Champ composite via set local: le viewModel est bien toujours identique.");
    t.equal(entry.structure.nom.value, "yolo", "Champ composite via set local: le model a bien été mis à jour.");

    t.comment("ViewModel: reset");
    viewModel.set({montant: 3000, structure: {id: 23, nom: "LOL"}});
    viewModel.reset();

    t.equal(viewModel.montant.value, 1000, "Champ simple: le viewModel a bien été réinitialisé.");
    t.equal(entry.montant.value, 1000, "Champ simple: le model est bien toujours identique.");
    t.equal(viewModel.structure.id.value, 26, "Champ composite via set global: le viewModel a bien été réinitialisé.");
    t.equal(entry.structure.id.value, 26, "Champ composite via set global: le model est bien toujours identique.");
    t.equal(viewModel.structure.nom.value, "yolo", "Champ composite via set local: le viewModel a bien été réinitialisé.");
    t.equal(entry.structure.nom.value, "yolo", "Champ composite via set local: le model est bien toujours identique.");

    t.comment("ViewModel: unsubscribe");
    viewModel.unsubscribe();
    entry.montant.value = 2;

    t.equal(viewModel.montant.value, 1000, "Le viewModel n'a pas été mis à jour.");

    t.comment("ViewModel: subscribe");
    viewModel.subscribe();
    entry.montant.value = 5;

    t.equal(viewModel.montant.value, 5, "Le viewModel a bien été mis à jour.");

    t.end();
});
