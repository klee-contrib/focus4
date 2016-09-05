# EntityStore
Il remplace à l'usage l'ancien `CoreStore` de `focus-core`, mais en réalité ce n'est pas la même chose. Toute la partie "store" est de toute façon déjà couverte par MobX, donc il n'y avait rien à faire pour atteindre les mêmes fonctionnalités.

A la place, on a un `EntityStore` dont le but est de stocker des **entités**, c'est-à-dire des objets structurés (mappés sur les beans et DTOs renvoyés par le serveur) avec leurs métadonnées.

Par exemple, un objet `operation` de la forme:

```ts
{
    id: 1,
    number: "1.3",
    amount: 34.3
}
```

sera stocké dans un EntityStore sous la forme :

```ts
{
    operation: {
        id: {
            $entity: {type: "field", isRequired: true, domain: DO_ID, translationKey: "operation.id"},
            value: 1
        },
        number: {
            $entity: {type: "field", isRequired: false, domain: DO_CODE, translationKey: "operation.number"},
            value: "1.3"
        },
        amount: {
            $entity: {type: "field", isRequired: true, domain: DO_AMOUNT, translationKey: "operation.amount"},
            value: 34.3
        }
    }
}
```

Un EntityStore expose une méthode `set(config)` qui prend un objet représentant un contenu possible du store pour le mettre à jour, mais il est tout à fait possible de faire `store.operation.id.value = 4` pour effectuer une mise à jour (on voit bien que ça coince lorsqu'on voudra mettre à jour plusieurs valeurs à la fois, d'où `set(config)`).

L'EntityStore peut contenir des objets avec autant de niveau de composition que l'on veut, mais il ne peut contenir que des arrays d'objets simples. En l'état actuel, il ne gère les arrays qu'au premier niveau.

La fonction `makeEntityStore<T>(entityConfig, entities)` permet de créer un EntityStore. Elle prend comme paramètre `T` le type de sortie de la fonction (le store), comme paramètre `entityConfig` la config des entités, et comme paramètre `entities` la liste des entités utilisées dans la config.

Ci-dessous un exemple de tout ce qui est géré pour l'instant :

```tsx
/*
    La convention utilisée est la suivante :
    - *entity*Store est le type de la forme {[key]: {$entity, value}}
    - *entity*Entity est l'objet de la forme {name: *entity*, fields: EntityField[]}
*/

const store = makeEntityStore<{
    operation: OperationStore,
    projet: ProjetStore,
    operationList: OperationStore[]
}>({
    operation: {}, // Créé une entrée "operation" qui utilise l'entité "OperationEntity"
    projet: [{}, "yolo"], // Crée une entrée "projet" qui utilise l'entité "YoloEntity", qui dépend de "StructureEntity".
    operationList: [[], "operation"] // Créé une entrée "operationList" qui est une liste de "OperationEntity
}, [
    OperationEntity,
    YoloEntity,
    StructureEntity
]);

import * as React from "react";
import {render} from "react-dom";
import {observer} from 'mobx-react';

const clickHandler = () => store.set({
    projet: {
        isEss: true,
        solde: 43,
        structure: {
            libelle: "YOLO"
        }
    },
    operationList: [
        {numero: "1.01.00001", ligneId: 3},
        {numero: "1.01.00002", ligneId: 4},
        {numero: "1.01.00003", ligneId: 5}
    ]
});

store.projet.solde.value = 133333;

const View = observer(function View() {
    return (
        <div>
            <button onClick={clickHandler}>CLICK</button>
            <div>{store.projet.structure.libelle}</div>
            <ul>
                {store.operationList.map((op, i) => <li key={i}>{op.numero.$entity.translationKey} {op.numero.value}</li>)}
            </ul>
        </div>
    );
});

render(<View />, document.getElementById("root")!);
```

## Remarque
Il est important de noter que l'usage de ce store est totalement facultatif et qu'il n'est là que pour tenter de simplifier les usages courants. En particulier, le `fieldFor` d'autofocus-mobx prend un objet `{$entity, value}` comme premier paramètre : Il peut donc soit être issu directement du store, soit reconstruit sur place en important l'entité directement dans le composant.