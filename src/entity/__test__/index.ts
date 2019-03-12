/* tslint:disable */
import "ignore-styles";

import {isObservableArray} from "mobx";
import test = require("tape");

import {makeFormNode} from "../form/node";
import {makeEntityStore, toFlatValues} from "../store";
import {LigneEntity} from "./ligne";
import {OperationEntity} from "./operation";
import {ProjetEntity} from "./projet";
import {StructureEntity} from "./structure";

import i18next = require("i18next");
i18next.default = i18next as any;
(i18next as any).init();

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

test("EntityStore: Création", t => {
    const store = getStore();

    const {id, numero, montant} = OperationEntity.fields;
    t.deepEqual(
        store.operation,
        {
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
        },
        "L'entrée 'operation' a bien la forme attendue"
    );

    t.assert(isObservableArray(store.structureList), "L'entrée 'structureList' est bien un array");
    t.deepEqual(store.structureList.$entity, StructureEntity, "L'entrée 'structureList' possède bien la bonne entité");

    t.assert(isObservableArray(store.projetTest.ligneList), "'ligneList' de l'entrée 'projet' est bien un array");
    t.deepEqual(
        store.projetTest.ligneList.$entity,
        LigneEntity,
        "'ligneList' de l'entrée 'projet' possède bien la bonne entité"
    );

    t.equal(store.subStore.structure.id.$field, StructureEntity.fields.id, "Le sous-store est bien accessible");

    t.end();
});

test("EntityStore: Replace global", t => {
    const store = getStore();

    store.replace({operation});
    t.equal(
        store.operation.id.value,
        operation.id,
        "La propriété 'id' de l'entrée 'operation' a bien été enregistrée."
    );
    t.equal(
        store.operation.structure.id.value,
        operation.structure.id,
        "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée."
    );

    store.replace({structureList});
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(
        store.structureList[1].id.value,
        structureList[1].id,
        "Le deuxième élément de 'structureList' a bien été enregistré."
    );

    store.replace({projetTest});
    t.assert(store.projetTest.ligneList[2], "La liste 'projet.ligneList' a bien été enresgitrée.");
    t.equal(
        store.projetTest.ligneList[1].id.value,
        projetTest.ligneList[1].id,
        "Le deuxième élément de 'projet.ligneList' a bien été enregistré."
    );

    store.replace({subStore: {operationList: [operation], structure: structureList[0]}});
    t.assert(store.subStore.structure.id.value, "Le noeud 'structure' du sous-store a bien été enregistré.");
    t.assert(store.subStore.operationList[0].id, "Le liste 'operationList' du sous-store a bien été enregistrée.");
    t.equal(
        store.subStore.operationList[0].id.value,
        operation.id,
        "La liste `operationList` possède bien les bonnes valeurs."
    );
    t.end();
});

test("EntityStore: Replace locaux", t => {
    let store = getStore();

    store.operation.replace(operation);
    t.equal(
        store.operation.id.value,
        operation.id,
        "La propriété 'id' de l'entrée 'operation' a bien été enregistrée."
    );
    t.equal(
        store.operation.structure.id.value,
        operation.structure.id,
        "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set operation)."
    );

    store = getStore();
    store.operation.structure.replace(operation.structure);
    t.equal(
        store.operation.structure.id.value,
        operation.structure.id,
        "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée (set structure)"
    );

    store.structureList.replaceNodes(structureList);
    t.assert(store.structureList[2], "La liste 'structureList' a bien été enregistrée.");
    t.equal(
        store.structureList[1].id.value,
        structureList[1].id,
        "Le deuxième élément de 'structureList' a bien été enregistré."
    );

    store.projetTest.replace(projetTest);
    t.assert(store.projetTest.ligneList[2], "La liste 'projet.ligneList' a bien été enregistrée.");
    t.equal(
        store.projetTest.ligneList[1].id.value,
        projetTest.ligneList[1].id,
        "Le deuxième élément de 'projet.ligneList' a bien été enregistré."
    );

    t.end();
});

test("EntityStore: Ajout élément dans une liste", t => {
    const store = getStore();

    store.structureList.replaceNodes(structureList);
    store.structureList.pushNode({id: 8});
    t.assert(store.structureList.length === 4, "La liste 'structureList' possède bien un élément de plus.");
    t.deepEqual(
        store.structureList[3].id.$field,
        StructureEntity.fields.id,
        "L'élément ajouté est bien un node avec les bonnes métadonnées."
    );
    t.equal(store.structureList[3].id.value, 8, "L'élement ajouté possède bien les valeurs attendues");

    t.end();
});

test("EntityStore: Set global", t => {
    const store = getStore();

    store.replace({operation});
    t.equal(
        store.operation.id.value,
        operation.id,
        "La propriété 'id' de l'entrée 'operation' a bien été enregistrée."
    );
    t.equal(
        store.operation.structure.id.value,
        operation.structure.id,
        "La propriété 'structure.id' de l'entrée 'operation' a bien été enregistrée."
    );

    store.set({subStore: {structure: structureList[0]}});
    t.assert(store.subStore.structure.id.value, "Le noeud 'structure' du sous-store a bien été enregistré.");

    store.structureList.pushNode({id: 1}, {id: 2});
    store.set({structureList: [{siret: "test"}, {id: 4}, {id: 5}, {id: 6}]});
    t.equal(store.structureList[0].id.value, 1, "La propriété 'structure[0].id' n'a pas été modifiée.");
    t.equal(store.structureList[1].id.value, 4, "La propriété 'structure[1].id' a bien été modifiée.");
    t.equal(store.structureList[0].siret.value, "test", "La propriété 'structure[0].siret' a bien été renseignée.");
    t.equal(store.structureList[2].id.value, 5, "Un item supplémentaire dans la liste a bien été créé.");
    t.equal(store.structureList[3].id.value, 6, "Un deuxième item supplémentaire dans la liste a bien été créé.");

    t.end();
});

test("EntityStore: Clear global", t => {
    const store = getStore();
    store.replace({
        operation,
        structureList,
        projetTest,
        subStore: {operationList: [operation], structure: structureList[0]}
    });

    store.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(
        store.operation.structure.id.value,
        undefined,
        "La propriété 'structure.id' de l'entrée 'operation' est bien undefined."
    );
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");
    t.assert(store.projetTest.ligneList.length === 0, "La liste 'projet.ligneList' est bien vide.");
    t.equal(
        store.subStore.structure.id.value,
        undefined,
        "La propriété 'id' de l'entrée 'structure' du sous-store est bien undefined."
    );
    t.assert(store.subStore.operationList.length === 0, "La liste 'operationList' du sous store est bien vide.");

    t.end();
});

test("EntityStore: Clear locaux", t => {
    const store = getStore();

    store.operation.clear();
    t.equal(store.operation.id.value, undefined, "La propriété 'id' de l'entrée 'operation' est bien undefined.");
    t.equal(
        store.operation.structure.id.value,
        undefined,
        "La propriété 'structure.id' de l'entrée 'operation' est bien undefined."
    );

    store.structureList.clear();
    t.assert(store.structureList.length === 0, "La liste 'structureList' est bien vide.");

    store.projetTest.ligneList.clear();
    t.assert(store.projetTest.ligneList.length === 0, "La liste 'projet.ligneList' est bien vide.");

    t.end();
});

test("toFlatValues", t => {
    const store = getStore();
    store.replace({operation, projetTest, structureList});

    t.deepEqual(toFlatValues(store.operation), operation, "L'entrée 'operation' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.projetTest), projetTest, "L'entrée 'projet' a bien été mise à plat.");
    t.deepEqual(toFlatValues(store.structureList), structureList, "L'entrée 'structureList' a bien été mise à plat.");

    t.end();
});

test("FormNode: Création", t => {
    const {entry, entry2, formNode, formNode2} = getFormNodes();

    t.deepEqual(
        formNode.numero.$field,
        entry.numero.$field,
        "Les champs simples du FormNode sont bien identiques à ceux du StoreNode."
    );
    t.deepEqual(
        toFlatValues(formNode.structure),
        toFlatValues(entry.structure),
        "Les champs composites du FormNode sont bien identiques à ceux du StoreNode."
    );
    t.assert(isObservableArray(formNode2.ligneList), "Une sous liste est bien toujours observable");
    t.deepEqual(
        formNode2.ligneList.$entity,
        entry2.ligneList.$entity,
        "Une sous liste a bien toujours son entité attachée."
    );
    t.assert(formNode2.ligneList.setNodes, "Une sous liste a bien toujours sa méthode 'setNodes' attachée");
    t.deepEqual(entry, formNode.sourceNode, "Le sourceNode racine est bien le bon.");
    t.deepEqual(entry.structure, formNode.structure.sourceNode, "Le sous-sourceNode simple est bien le bon");
    t.deepEqual(entry2.ligneList, formNode2.ligneList.sourceNode, "Le sous-sourceNode liste est bien le bon");

    t.equal((formNode.form as any)._isEdit, false, "Le FormNode a bien une propriété '_isEdit' initialisée à 'false'.");
    t.equal(formNode.form.isEdit, false, "Le FormNode a bien une propriété 'isEdit' initialisée à 'false'.");
    t.equal(
        (formNode.montant as any)._isEdit,
        true,
        "Les champs du FormNode ont bien une propriété '_isEdit' qui vaut 'true'."
    );
    t.equal(
        formNode.montant.isEdit,
        false,
        "Les champs du FormNode ont bien une propriété 'isEdit' calculée qui vaut 'false'."
    );

    t.assert(formNode.numero.hasOwnProperty("error"), "Les champs ont bien une propriété 'error'");
    t.equal(formNode.form.isValid, true, "Le FormNode a bien une propriété 'isValid', initialisée à 'true'.");

    t.end();
});

test("FormNode: Création à partir d'un noeud non-vide", t => {
    const entry = getStore().operation;
    const entry2 = getStore().projetTest;
    entry.replace(operation);
    entry2.replace(projetTest);

    const formNode = makeFormNode(entry);
    const formNode2 = makeFormNode(entry2);

    t.deepEqual(
        toFlatValues(formNode),
        toFlatValues(entry),
        "Un FormNode créé sans options à partir d'une source non vide possède tout son contenu."
    );
    t.deepEqual(
        toFlatValues(formNode2),
        toFlatValues(entry2),
        "Un FormListNode créé sans options à partir d'une source non vide possède tout son contenu."
    );

    const formNodeB = makeFormNode(entry, {isEmpty: true});
    const formNodeB2 = makeFormNode(entry2, {isEmpty: true});

    t.deepEqual(
        toFlatValues(formNodeB),
        {structure: {}},
        "Un FormNode créé vide à partir d'une source non vide est bien vide."
    );
    t.deepEqual(
        toFlatValues(formNodeB2),
        {ligneList: []},
        "Un FormListNode créé vide à partir d'une source non vide possède est bien vide."
    );

    t.end();
});

test("FormNode: Modification de StoreNode.", t => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);

    t.deepEqual(
        toFlatValues(formNode),
        toFlatValues(entry),
        "Le contenu du FormNode est identique à celui du StoreNode."
    );

    t.end();
});

test("FormNode: Modification de StoreListNode.", t => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);

    t.deepEqual(
        toFlatValues(formNode2),
        toFlatValues(entry2),
        "Le contenu du FormListNode est identique à celui du StoreListNode."
    );
    t.deepEqual(
        formNode2.ligneList[0].sourceNode,
        entry2.ligneList[0],
        "Le sourceNode d'un objet de liste est bien le bon."
    );

    entry2.ligneList.splice(2, 1);
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 6}],
        "Les suppressions d'élements de liste dans un Storeode sont bien répercutées."
    );

    entry2.ligneList.pushNode({id: 8});
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 6}, {id: 8}],
        "Les ajouts d'élements de liste dans un Storeode sont bien répercutées."
    );

    t.end();
});

test("FormNode: Modification de FormNode", t => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.montant.value = 1000;
    formNode.set({structure: {id: 26}});
    formNode.structure.set({nom: "yolo"});

    t.equal(formNode.montant.value, 1000, "Champ simple: le FormNode a bien été modifié.");
    t.equal(entry.montant.value, operation.montant, "Champ simple: le StoreNode est bien toujours identique.");
    t.equal(formNode.structure.id.value, 26, "Champ composite via set global: le FormNode a bien été modifié.");
    t.equal(
        entry.structure.id.value,
        operation.structure.id,
        "Champ composite via set global: le StoreNode est bien toujours identique."
    );
    t.equal(formNode.structure.nom.value, "yolo", "Champ composite via set local: le FormNode a bien été modifié.");
    t.equal(
        entry.structure.nom.value,
        operation.structure.nom,
        "Champ composite via set local: le StoreNode est bien toujours identique."
    );

    t.end();
});

test("FormListNode: Modification", t => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);

    formNode2.ligneList.pushNode({id: 8});
    entry2.ligneList.splice(1, 1);
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 7}, {id: 8}],
        "Une suppression d'élement dans un StoreListNode est bien répercutée dans le FormListNode, en conservant un élément dans ce dernier ajouté à la fin."
    );

    entry2.ligneList.pushNode({id: 9});
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 7}, {id: 9}, {id: 8}],
        "Un élément ajouté dans un StoreListNode se retoruve dans le FormListNode, avant tout élément ajouté dans ce dernier."
    );

    formNode2.ligneList.splice(1, 1);
    entry2.ligneList.pushNode({id: 10});
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 9}, {id: 10}, {id: 8}],
        "Y compris si le FormListNode a retiré un élément au milieu avant."
    );

    formNode2.ligneList.splice(2, 1);
    entry2.ligneList.pushNode({id: 11});
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 9}, {id: 11}, {id: 8}],
        "Plus dur, l'élément à partir du quel j'ai ajouté dans le StoreListNode manque dans le FormListNode."
    );

    formNode2.ligneList.splice(0, 1);
    entry2.replace(projetTest);
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 6}, {id: 7}, {id: 8}],
        "Et si je reset ma liste initiale, je la retrouve dans le FormNode suivie des éléments qui y on été ajoutés."
    );

    formNode2.replace({ligneList: [{id: 1}, {id: 2}, {id: 5}, {id: 7}]});
    entry2.replace(projetTest);
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        toFlatValues(entry2.ligneList),
        "Un replace du StoreListNode écrase totalement les modifications du FormListNode."
    );

    entry2.ligneList.setNodes([{id: 10}, {id: 11}, {}, {id: 13}]);
    t.deepEqual(toFlatValues(formNode2.ligneList), toFlatValues(entry2.ligneList), "SetNodes marche comme attendu.");

    formNode2.ligneList.splice(1, 1);
    entry2.ligneList.setNodes([{id: 14}, {id: 15}, {}, {id: 17}]);
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 14}, {id: 7}, {id: 17}],
        "SetNodes marche comme attendu, bis."
    );

    t.end();
});

test("FormNode: Modification de source forcée", t => {
    const {entry, entry2, formNode, formNode2} = getFormNodes();

    entry.replace(operation);
    entry2.replace(projetTest);
    formNode.numero.value = "10";
    formNode2.ligneList[0].id.value = 65;
    entry.replace(operation);
    entry2.replace(projetTest);

    t.deepEqual(
        toFlatValues(formNode),
        toFlatValues(entry),
        "La mise à jour de la source (noeud simple) reset toujours la cible, même si la mise à jour de la source ne fait rien."
    );
    t.deepEqual(
        toFlatValues(formNode2),
        toFlatValues(entry2),
        "La mise à jour de la source (noeud liste) reset toujours la cible, même si la mise à jour de la source ne fait rien."
    );

    formNode.numero.value = "yolo";
    entry.structure.id.value = 9000;
    entry.structure.replace(operation.structure);
    t.equal(formNode.numero.value, "yolo", "Un reset partiel n'affecte pas les champs non affectés.");
    t.deepEqual(
        toFlatValues(formNode.structure),
        operation.structure,
        "Un reset partiel affecte les champs concernés."
    );

    formNode.montant.value = 9000;
    entry.numero.value = "déso";
    t.equal(formNode.montant.value, 9000, "Un reset partiel n'affecte pas les champs non affectés.");
    t.equal(formNode.numero.value, "déso", "Un reset partiel n'affecte pas les champs non affectés.");

    t.end();
});

test("FormNode: propagation isEdit et isValid", t => {
    const {formNode, formNode2} = getFormNodes();
    formNode.replace(operation);
    formNode2.replace(projetTest);

    formNode.form.isEdit = true;
    formNode2.form.isEdit = true;
    t.equal(formNode.structure.nom.isEdit, true, "Tous les champs du noeud simple sont maintenant en édition");
    t.equal(formNode2.ligneList[0].id.isEdit, true, "Tous les champs du noeud liste sont maintenant en édition");

    formNode.structure.nom.value = undefined;
    t.assert(!!formNode.structure.nom.error, "Un champ required non renseigné est bien en erreur.");
    t.equal(formNode.form.isValid, false, "Par conséquent, le FormNode n'est plus valide.");
    t.deepEqual(
        formNode.form.errors,
        {structure: {nom: "focus.validation.required"}},
        "La liste d'erreurs du FormNode est bien remplie."
    );
    t.deepEqual(
        formNode.structure.form.errors,
        formNode.form.errors.structure,
        "Les erreurs de formulaires sont les mêmes à tous les niveaux."
    );

    formNode2.ligneList[1].id.value = undefined;
    t.equal(
        formNode2.ligneList[1].form.isValid,
        false,
        "Dans un FormListNode, le noeud avec une champ en erreur est invalide."
    );
    t.equal(formNode2.ligneList[0].form.isValid, true, "Mais le noeud d'à côté reste valide.");
    t.equal(formNode2.ligneList.form.isValid, false, "La liste elle-même est invalide.");
    t.deepEqual(
        formNode2.ligneList.form.errors,
        [{}, {id: "focus.validation.required"}, {}],
        "La liste des erreurs sur le noeud liste est correcte."
    );

    t.end();
});

test("FormNode: reset global", t => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.set({montant: 3000, structure: {id: 23, nom: "LOL"}});
    formNode.reset();

    t.equal(formNode.montant.value, operation.montant, "Champ simple: le FormNode a bien été réinitialisé.");
    t.equal(
        formNode.structure.id.value,
        operation.structure.id,
        "Champ composite: le FormNode a bien été réinitialisé."
    );

    t.end();
});

test("FormNode: reset local (noeud simple)", t => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.set({montant: 3000, structure: {id: 23}});
    formNode.structure.reset();

    t.equal(formNode.montant.value, 3000, "Champ non concerné pas le reset : n'a pas été touché.");
    t.equal(formNode.structure.id.value, operation.structure.id, "Champ concerné par le reset : a été réinitialisé.");

    t.end();
});

test("FormListNode: reset", t => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);
    formNode2.ligneList[0].id.value = 23;
    formNode2.ligneList.remove(formNode2.ligneList[2]);
    formNode2.ligneList.reset();

    t.deepEqual(toFlatValues(formNode2), toFlatValues(entry2), "La liste à bien été réinitialisée.");

    t.end();
});

test("FormListNode: reset d'un item", t => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);
    formNode2.ligneList[0].id.value = 23;
    formNode2.ligneList[0].reset();

    t.equal(formNode2.ligneList[0].id.value, 5, "Champ modifié de l'item : a été réinitialisé.");

    t.end();
});

test("FormNode: dispose", t => {
    const {entry, formNode} = getFormNodes();
    entry.replace(operation);
    formNode.form.dispose();
    entry.montant.value = 2;

    t.equal(formNode.montant.value, operation.montant, "Le FormNode n'a pas été mis à jour.");

    t.end();
});

test("FormListNode: dispose", t => {
    const {entry2, formNode2} = getFormNodes();
    entry2.replace(projetTest);

    const [item2] = formNode2.ligneList.splice(2, 1);
    entry2.ligneList[2].id.value = 55;
    entry2.ligneList[1].id.value = 54;
    t.equal(
        item2.id.value,
        projetTest.ligneList[2].id,
        "Un objet supprimé d'un FormListNode n'est bien plus mis à jour."
    );
    t.equal(formNode2.ligneList[1].id.value, 54, "Mais les autres le sont toujours.");

    formNode2.form.dispose();
    entry2.replace({ligneList: [{id: 41}]});
    t.deepEqual(
        toFlatValues(formNode2.ligneList),
        [{id: 5}, {id: 54}],
        "Après le dispose de la liste, les ajouts et les suppressions ne font plus rien."
    );

    entry2.ligneList[0].id.value = 235;
    t.deepEqual(toFlatValues(formNode2.ligneList), [{id: 5}, {id: 54}], "Et les noeuds invididuels sont inchangés.");

    t.end();
});
