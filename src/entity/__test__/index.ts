import {isObservableArray} from "mobx";
import test = require("tape");

import {makeEntityStore, EntityArray, toFlatValues, ClearSet} from "../";
import {LigneEntity} from "./ligne";
import {OperationEntity, OperationData} from "./operation";
import {ProjetEntity, ProjetData} from "./projet";
import {StructureEntity, StructureData} from "./structure";

function getStore() {
    return makeEntityStore<any>({
        operation: {},
        projet: {},
        structureList: [[], "structure"]
    }, [
        OperationEntity,
        ProjetEntity,
        StructureEntity,
        LigneEntity
    ]) as {
        operation: OperationData,
        projet: ProjetData,
        structureList: EntityArray<StructureData>,
    } & ClearSet<{}>;
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
const projet = {ligneList: [{id: 5}, {id: 6}, {id: 7}]};

test("EntityStore: Création", t => {
    const store = getStore();

    const {id, numero, montant, structure} = OperationEntity.fields;
    t.deepEqual(store.operation, {
        id: {$entity: id, value: undefined},
        numero: {$entity: numero, value: undefined},
        montant: {$entity: montant, value: undefined},
        structure: {$entity: structure, value: {
            id: {$entity: StructureEntity.fields.id, value: undefined},
            nom: {$entity: StructureEntity.fields.nom, value: undefined},
            siret: {$entity: StructureEntity.fields.siret, value: undefined},
            set: store.operation.structure.value.set,
            clear: store.operation.structure.value.clear
        }},
        set: store.operation.set,
        clear: store.operation.clear
    }, "L'entrée 'operation' a bien la forme attendue");

    t.assert(isObservableArray(store.structureList), "L'entrée 'structureList' est bien un array");
    t.deepEqual(store.structureList.$entity, StructureEntity, "L'entrée 'structureList' possède bien la bonne entité");

    t.assert(isObservableArray(store.projet.ligneList.value), "'ligneList' de l'entrée 'projet' est bien un array");
    t.deepEqual(store.projet.ligneList.value.$entity, LigneEntity, "'ligneList' de l'entrée 'projet' possède bien la bonne entité");

    t.end();
});

test("EntityStore: Set global", t => {
    const store = getStore();

    store.set({operation});
    t.equal(store.operation.id.value, operation.id, "La propriété 'id' de l'entrée 'operation' a bien été enregistrée.");
    t.equal(store.operation.structure.value.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée.");

    store.set({structureList});
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(store.structureList[1].id.value, structureList[1].id, "Le deuxième élément de 'structureList' a bien été enregistré.");

    store.set({projet});
    t.assert(store.projet.ligneList.value[2], "La liste 'projet.ligneList' a bien été enresgitrée.");
    t.equal(store.projet.ligneList.value[1].id.value, projet.ligneList[1].id, "Le deuxième élément de 'projet.ligneList' a bien été enregistré.");

    t.end();
});

test("EntityStore: Set locaux", t => {
    let store = getStore();

    store.operation.set(operation);
    t.equal(store.operation.id.value, operation.id, "La propriété 'id' de l'entrée 'operation' a bien été enregistrée.");
    t.equal(store.operation.structure.value.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set operation).");

    store = getStore();
    store.operation.structure.value.set(operation.structure);
    t.equal(store.operation.structure.value.id.value, operation.structure.id, "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set structure)");

    store.structureList.set(structureList);
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(store.structureList[1].id.value, structureList[1].id, "Le deuxième élément de 'structureList' a bien été enregistré.");

    store.projet.set(projet);
    t.assert(store.projet.ligneList.value[2], "La liste 'projet.ligneList' a bien été enregistrée.");
    t.equal(store.projet.ligneList.value[1].id.value, projet.ligneList[1].id, "Le deuxième élément de 'projet.ligneList' a bien été enregistré.");

    t.end();
});

test("EntityStore: Clear global", t => {
    const store = getStore();

    store.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(store.operation.structure.value.id.value, undefined, "La propriété 'structure.id' de l'entrée 'operation' est bien undefined.");
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");
    t.assert(store.projet.ligneList.value.length === 0, "La liste 'projet.ligneList' est bien vide.");

    t.end();
});

test("EntityStore: Clear locaux", t => {
    const store = getStore();

    store.operation.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(store.operation.structure.value.id.value, undefined, "La propriété 'structure.id' de l'entrée 'operation' est bien undefined.");

    store.structureList.clear();
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");

    store.projet.ligneList.value.clear();
    t.assert(store.projet.ligneList.value.length === 0, "La liste 'projet.ligneList' est bien vide.");

    t.end();
});

test("toFlatValues", t => {
    const store = getStore();
    store.set({operation, projet, structureList});

    t.deepEqual(toFlatValues(store.operation as any), operation, "L'entrée 'operation' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.projet as any), projet, "L'entrée 'projet' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.structureList as any), structureList, "L'entrée 'structureList' a bien été mise à plat.");

    t.end();
});
