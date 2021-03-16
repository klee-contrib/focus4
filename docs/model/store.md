# Stores d'entité

## Présentation

Une entité retournée directement depuis le serveur est, comme tout le reste, un objet JSON simple. Parfois, pour diverses raisons, c'est bien la donnée seule qui nous intéresse. Dans ce cas, il suffit de stocker cette donnée dans une simple observable et de l'utiliser comme n'importe quel autre état. Dans d'autres cas, cette donnée est une liste que l'on voudra manipuler. Ici, il faudra s'orienter vers un [store de liste](#Stores-de-collections).

Dans le cas où la donnée a besoin d'être consommée sous forme de champs, par exemple pour construire un quelconque formulaire ou simplement pour afficher quelques champs formattés avec leurs libellés, Focus met à disposition un **`store d'entités`**. C'est un store construit à partir de définitions d'entités (et donc des champs qui la composent), qui présente toute la structure de données sous forme d'un "arbre" de champs, prêts à être renseigns avec des valeurs chargées depuis le serveur ou saisies dans l'application.

Par exemple, un objet `operation` de la forme:

```ts
{
    id: 1,
    number: "1.3",
    amount: 34.3
}
```

sera stocké dans un **`StoreNode`** sous la forme :

```ts
{
    operation: {
        id: {
            $field: {type: "field", fieldType: "number", isRequired: false, domain: DO_ID, label: "operation.id"},
            value: 1
        },
        number: {
            $field: {type: "field", fieldType: "string", isRequired: false, domain: DO_NUMBER, label: "operation.number"},
            value: "1.3"
        },
        amount: {
            $field: {type: "field", fieldType: "number", isRequired: true, domain: DO_AMOUNT, label: "operation.amount"},
            value: 34.3
        }
    }
}
```

A partir des champs ainsi déclarés (dans un objet qu'on appelera par la suite `EntityField`), on va pouvoir construire des méthodes simples pour les consommer.

Construire un `StoreNode` est une façon de créer des champs mais n'est pas la seule. Il n'est adapté que si les champs sont liés à une entité et que l'on aura besoin de plusieurs champs de cette dernière.

Il est également possible de créer et utiliser des **`StoreListNode`**, qui sont des listes de `StoreNode`. Ce sont des arrays observables avec quelques propriétés en plus.

## Constitution et APIs des noeuds (`StoreNode` et `StoreListNode`)

Un chaque objet contenu dans un `StoreNode` ne peut être que l'un des trois objets suivants :

-   Un `EntityField`, objet représentant un champ, détaillé dans le paragraphe précédent. La propriété `value` d'un champ est observable.
-   Un autre `StoreNode`
-   Un `StoreListNode`

Le `StoreNode` et le `StoreListNode` ont une API similaire, qui contient les méthodes suivantes :

-   `replace(data)`/`replaceNodes(data)`, qui remplace le noeud (récursivement) intégralement par l'objet (sous forme "JSON") passé en paramètre. `replace` sur un array observable existe déjà et est la méthode utilisée pour remplacer l'array par l'array donné : `replaceNodes` réalise la construction des `StoreNode`s en plus.
-   `set(data)`/`setNodes(data)`, qui met à jour le noeud (récursivement) avec les champs renseignés dans `data` (c'est un "merge"). Pour un noeud de liste, si l'objet à l'index passé n'existe pas encore dans la liste, il sera créé en même temps.
-   `clear()`, qui vide récursivement le noeud et son contenu.

Le `StoreListNode` possède également une méthode `pushNode(...items)`, qui est à `push(...items)` ce qu'est `replaceNode` à `replace`.

C'est aussi l'occasion de préciser que, contrairement à de la donnée brute sous forme de JSON, un `StoreNode` contient toujours l'ensemble de tous les champs du noeud. Si une valeur n'est pas renseignée, la propriété `value` du champ a simplement pour valeur `undefined`. De même, il faut toujours garder à l'esprit que `store.operation.id` est un _`EntityField`_ (qui est donc toujours "vrai") et non un _`number | undefined`_. La valeur est bien toujours `store.operation.id.value`.

De plus, il convient également de rappeler que la modification d'un noeud ou de l'un de ses champs n'est pas limité à l'usage des méthodes `replace()`, `set()` ou `clear()`. Ce sont des méthodes utilitaires qui permettent simplement d'affecter plusieurs valeurs en même temps à des champs. Il est parfaitement possible de faire l'affection manuellement, par exemple `store.operation.id.value = undefined`. Les valeurs des champs et les listes sont observables, donc MobX se chargera de mettre à jour les dépendances.

## APIs globales

### `makeEntityStore(config)`

La fonction `makeEntityStore` permet de créer un `StoreNode` composite à partir de plusieurs entités. Son unique paramètre est un objet de configuration, qui permet de décrire le contenu du `StoreNode` que l'on souhaite créer. Il peut donc contenir :

-   Des objets de définition d'entité (généralement générés sous le nom `OperationEntity`), pour générér les `StoreNode`s correspondants.
-   Des arrays contenants un objet d'entité (`[OperationEntity]`), pour générer les `StoreListNode`s correspondants.
-   Des `StoreNode`s pré-existants. Cela permet de les rattacher aux méthodes `replace`, `set` et `clear` du store, pour associer des ensembles d'entités liées par exemple.

### `buildNode(entity)`

La fonction `buildNode` permet de créer un `StoreNode` ou un `StoreListNode` à partir d'un objet de définition d'entité. Comme pour `makeEntityStore`, un `StoreListNode` s'obtient en passant un array.

Cette fonction est plutôt préconisée lorsqu'on a besoin de créer un noeud unique à la volée (pour des données provenant d'un store de liste, par exemple). `makeEntityStore` est plus adapté pour des stores stables qui seront utilisés à travers plusieurs composants.

### `toFlatValues(node)`

Cette fonction prend un noeud quelconque en paramètre et récupère toutes les valeurs de champs dans son objet "JSON" équivalent.
