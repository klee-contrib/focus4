# Module `entity`

## EntityStore
Il remplace à l'usage l'ancien `CoreStore` de `focus-core`, mais en réalité ce n'est pas la même chose. Toute la partie "store" est de toute façon déjà couverte par MobX, donc en pratique il n'y avait rien à faire pour atteindre les mêmes fonctionnalités.

A la place, on a un `EntityStore`, dont le but est de stocker des **entités**, c'est-à-dire des objets structurés (mappés sur les beans et DTOs renvoyés par le serveur) avec leurs *métadonnées*. Si vous cherchez à stocker des primitives, des objets non structurés ou des arrays de ceux-ci, vous n'avez pas besoin de tout ça et vous pouvez directement utiliser des observables.

Par exemple, un objet `operation` de la forme:

```ts
{
    id: 1,
    number: "1.3",
    amount: 34.3
}
```

sera stocké dans un `EntityStore` sous la forme :

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

Un `EntityStore` contient des *items* (`EntityStoreItem`) qui peuvent être soit un noeud (`EntityStoreNode`), soit une liste de noeuds (`StoreListNode<EntityStoreNode>`). Un `EntityStoreNode` contient des *valeurs* (`EntityValue`) qui peuvent être soit des *primitives*, soit un autre *item*. Chaque `EntityValue` se présente sous la forme `{$entity, value}` où `$entity` est la métadonnée associée à la valeur. Chaque *item* (objet ou liste), ainsi que le store lui-même, est également muni de deux méthodes `set(data)` et `clear()`, permettant respectivement de les remplir ou de les vider.

Un `StoreNode`, qui est la partie commune à tous les *items* (objet ou liste) d'un store, est conçu pour être utilisé par les `fieldHelpers` (`fieldFor`, `selectFor`...) et par extension par l'`AutoForm`, qui sont des composants qui consomment des métadonnées. Si un `fieldHelper` peut se passer de l'entrée et directement utiliser des `EntityValue`'s directement, le form requiert absolumement que son state soit un `StoreNode`.

La modification du store ou de l'une de ses entrées n'est pas limitée à l'usage des méthodes `set()` ou `clear()`. Etant toujours une observable MobX, il est tout à fait possible d'affecter des valeurs directement, comme `store.operation.id.value = undefined` par exemple. Ca peut être utile car `set()` ne mettra à jour que les valeurs qu'il reçoit. Pour un array, la méthode `set()` va remplacer tous les éléments de l'array par ceux fournis à la méthode. Il est donc intéressant de pouvoir appeler directement des méthodes comme `push()` pour y ajouter des éléments, quitte à construire les `EntityValue`s à la main.

**Attention** : Un `EntityStore` peut contenir des objets avec autant de niveau de composition que l'on veut, mais cette hiérarchie ne peut pas contenir des arrays dans des arrays.

### API
#### `makeEntityStore(simpleNodes, listNodes, entities, entityMapping?)`
La fonction `makeEntityStore` permet de créer un nouvel `EntityStore`. Elle prend comme paramètres :
- `simpleNodes`, un objet dont les propriétés décrivent tous les noeuds "simples" du store (la valeur n'importe peu, mais il convient de la typer avec le type de noeud).
- `listNodes`, un objet dont les propriétés décrivent tous les noeuds "listes" du store (la valeur n'importe peu, mais il convient de la typer avec le type de l'**objet** du noeud, sans la liste).
- `entityList`, la liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
- `entityMapping` (facultatif), un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.

#### `toFlatValues(entityStoreItem)`
La fonction `toFlatValues` prend une **entrée** est la met à plat en enlevant toutes les métadonnées.

### Ce qui faut générer pour un `EntityStore`
Pour pouvoir pleinement profiter d'un `EntityStore`, il est vivement conseillé de générer automatiquement les 3 objets/types à partir du modèle du serveur. Ces trois objets, pour un objet `Operation`:
- Le type **`Operation`**, qui est une bête interface représentant le type "plat", dont tous les champs sont **optionnels**.
- Le type **`OperationNode`**, qui est l'`EntityStoreNode` correspondant, dont tous les champs sont **obligatoires**. C'est le type `Operation` avec toutes ses valeurs wrappées dans des `EntityValue` et `StoreListNode`, et avec les méthodes `set()` et `clear()` correspondantes.
- L'objet **`OperationEntity`**, qui est l'objet contenant les métadonnées.

### Exemple de création (d'après les tests)

```ts
const store = makeEntityStore({
    // Noeuds "simples"
    operation: {} as OperationNode,
    projetTest: {} as ProjetNode
}, {
    // Noeuds "listes"
    structureList: {} as StructureNode
}, [
    // Entités
    OperationEntity,
    ProjetEntity,
    StructureEntity,
    LigneEntity
], {
    // Mappings
    projetTest: "projet",
    structureList: "structure"
});
```

##### Tous les cas d'usages sont retrouvables dans les tests.