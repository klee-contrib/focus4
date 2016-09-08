import {isObservableArray} from "mobx";
import test = require("tape");

import {makeEntityStore, EntityArray} from "../";
import {OperationEntity, OperationEntry} from "./operation";
import {ProjetEntity, ProjetEntry} from "./projet";
import {StructureEntity, StructureEntry} from "./structure";

function getStore() {
    return makeEntityStore<any>({
        operation: {},
        projet: {},
        structureList: [[], "structure"]
    }, [
        OperationEntity as any,
        ProjetEntity as any,
        StructureEntity as any
    ]) as {
        operation: OperationEntry,
        projet: ProjetEntry,
        structureList: EntityArray<StructureEntry>
    };
}

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
            set: store.operation.structure.value.set
        }},
        set: store.operation.set
    }, "L'entrée 'operation' a bien la forme attendue (construction générale + composition d'objets)");

    t.assert(isObservableArray(store.structureList), "L'entrée 'structureList' est bien un array (entrées de type array)");
    t.deepEqual(store.structureList.$entity, StructureEntity, "L'entrée 'structureList' possède bien la bonne entité (entrées de type array)");

    t.assert(isObservableArray(store.projet.operationList.value), "'operationList' de l'entrée 'projet' est bien un array (sous-entrées de type array)");
    t.deepEqual(store.projet.operationList.value.$entity, OperationEntity, "'operationList' de l'entrée 'projet' possède bien la bonne entité (sous entrées de type array)");

    t.end();
});
