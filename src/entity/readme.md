# Module `entity`

## EntityStore
Il remplace à l'usage l'ancien `CoreStore` de `focus-core`, mais il gère beaucoup plus de choses. Toute la partie "store" étant de toute façon déjà couverte par MobX, il n'y avait donc rien à faire pour retrouver les mêmes fonctionnalités.

A la place, on utilise des `EntityStore`s, dont le but est de stocker des **entités**, c'est-à-dire des objets structurés (mappés sur les beans et DTOs renvoyés par le serveur) avec leurs *métadonnées*. Si vous cherchez à stocker des primitives, des objets non structurés ou des arrays de ceux-ci, vous n'avez pas besoin de tout ça et vous pouvez directement utiliser des observables.

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
            $entity: {type: "field", isRequired: false, domain: DO_NUMBER, translationKey: "operation.number"},
            value: "1.3"
        },
        amount: {
            $entity: {type: "field", isRequired: true, domain: DO_AMOUNT, translationKey: "operation.amount"},
            value: 34.3
        }
    }
}
```

### Mais quel est donc l'intérêt ?

Lorsque l'on veut afficher un champ issu d'un store dans Focus, on utilise la fonction `fieldFor` (et consorts) de la manière suivante : `this.fieldFor('amount')` (ou `this.props.fieldFor('amount')` pour la v3). Pour que ça marche, `fieldFor` doit être capable de retrouver à quelle propriété du noeud de store en cours (quel store en cours d'ailleurs ?) `amount` correspond, et à quelle propriété de l'entité en cours (quelle entité en cours d'ailleurs ?) `amount` correspond. Pour faire la correspondance, il est nécessaire de spécifier dans le composant qui utilise `fieldFor` un store, un noeud de store (ou un sélecteur sur le store pour la v3) ainsi que le nom de l'entité correspondante.

#### Listons les problèmes liés à cette approche :
* `fieldFor` est lié à la configuration du composant et ne peut donc pas être utilisé en dehors du cadre d'un composant avec au moins 2 mixins (v2) (`builtInComponents` + `storeBehaviour`) ou 3 connecteurs (v3) (`connectToMetadata` + `connectToForm` + `connectToFieldHelpers`). Youhou au moins c'est cohérent avec le numéro de version !
* `fieldFor` (et même le composant en général, puis qu'ils sont indissociables) ne vérifie pas si les données dans le store et l'entité correspondent.
* `fieldFor` accepte une chaîne de caractères comme identifiant pour le champ, ce qui n'est pas vérifiable statiquement et est un nid à problèmes, en particulier dès qu'on à le malheur de faire un peu de refactoring.

#### La solution proposée par l'EntityStore :
Grâce à MobX, on n'a plus besoin de connecteurs ou de mixins pour lier du state global à des composants, donc on n'a pas vraiment envie d'en rajouter pour gérer une map d'`entityDefinition` qui en plus ne changera jamais.

Du coup, ce qu'on va faire, c'est construire des stores à partir des `entityDefinition`s et les remplir avec notre state.

`fieldFor` est donc maintenant une fonction *de la librairie* qui s'utilise comme ça : **`fieldFor(store.operation.amount)`**.

`store.operation.amount` contient la valeur de la propriété `amount`, les métadonnées de la propriété `amount` et est directement le noeud de store qui existe et qui est vérifiable à la compilation (avec du Typescript bien entendu).

Et on retrouve le même fonctionnement d'avant.

*Note : Dans le cas du formulaire (`AutoForm`, voir plus bas), `fieldFor` redevient `this.fieldFor` car il ajoute également les propriétés `isEdit`, `onChange` et `ref` et `error`. Ce choix a été fait pour simplifier l'usage particulier du formulaire, dont l'utilisation dans autofocus doit rester plus que jamais limitée à des vrais formulaires. Cela ne contradit pas les idées qui ont été exposées au-dessus.*

### Description

Un `EntityStore` contient des *items* (`EntityStoreItem`) qui peuvent être soit un noeud (`EntityStoreNode`), soit une liste de noeuds (`StoreListNode<EntityStoreNode>`). Un `EntityStoreNode` contient des *valeurs* (`EntityValue`) qui peuvent être soit des *primitives*, soit un autre *item*. Chaque `EntityValue` se présente sous la forme `{$entity, value}` où `$entity` est la métadonnée associée à la valeur. Chaque *item* (objet ou liste), ainsi que le store lui-même, est également muni de deux méthodes `set(data)` et `clear()`, permettant respectivement de les remplir ou de les vider.

Un `StoreNode`, qui est la partie commune à tous les *items* (objet ou liste) d'un store, est conçu pour être utilisé par les `fieldHelpers` (`fieldFor`, `selectFor`...) et par extension par l'`AutoForm`, qui sont des composants qui consomment des métadonnées. Le `fieldHelper` prend en entrée une `EntityValue` (`{$entity, value}`) qui vient à priori d'un `StoreNode`, mais peut également être construite à la main sur place.

La modification du store ou de l'une de ses entrées n'est pas limitée à l'usage des méthodes `set()` ou `clear()`. Etant toujours une observable MobX, il est tout à fait possible d'affecter des valeurs directement, comme `store.operation.id.value = undefined` par exemple. Ca peut être utile car **`set()` ne mettra à jour que les valeurs qu'il reçoit**. Pour un array, la méthode `set()` prend un array en paramètre qui remplacera toutes les valeurs courantes.

Un `EntityStore` peut contenir des objets avec autant de niveau de composition que l'on veut, que ça soit des objets dans des objets ou des dans arrays ou des arrays dans des objets... L'arbre des entités et propriétés est généré à la création du store pour les objets, et la méthode `set` de l'array (`StoreListNode`) va construire l'arbre de chaque entité dans l'array à l'insertion. A noter du coup que pour des listes, on ne gère que le remplacement de toutes les valeurs de la liste à chaque fois. Pour ajouter un seul élément (par exemple), il est nécessaire de reconstruire à la main le noeud lié à l'objet de l'array. Pour une primitive, ça serait simplement un `{$entity: Entity.fields.field, value: 2}` par exemple à ajouter. Pour un objet, le plus simple serait de reprendre un noeud issu d'une autre entrée de store pour l'ajouter (et éventuellement d'en faire un `deepClone`). Cette utilisation semble néanmoins marginale : la plupart du temps, on va récupérer la liste entière du serveur et la `set` directement dans le store.

**Remarque importante** : Cela a été précisé à de nombreuses reprises dans la présentation mais l'accent jamais mis dessus : **`store.operation.id` n'est *pas* la valeur dans le store**, c'est **`store.operation.id.value`**. En particulier, quelque soit la valeur de `id`, **`store.operation.id` est toujours défini et vaut `{$entity, value}`**, même si `value` vaut `undefined`.


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

## AutoForm
L'`AutoForm` est une classe dont un composant de formulaire doit hériter. C'est le remplacant du `formMixin` de la v2.

C'est un "vestige" de Focus v2 qui fait le travail qu'on lui demande de façon très simple et les comportements qu'il apporte ne sont pas reproductibles simplement d'une autre manière. Focus v3 en est un excellent exemple. C'est la seule classe de base (ou seul équivalent "mixin") de la librairie (la v2 possède une 20taine de mixins et la v3 5 ou 6 connecteurs, à titre de comparaison), et son usage est très précis : **c'est pour faire un formulaire**, avec :
* un service de chargement
* un service de sauvegarde
* un état consulation/modification
* un state interne initialisé par un store, miroir synchrone de l'état des champs qu'on l'on saisit
* de la validation de champs avec gestion d'erreurs

En somme, **un formulaire**.

Au risque de se répeter, **si vous ne faites pas un écran de formulaire, n'utilisez pas `AutoForm`**. Les fonctions `fieldFor` et co. sont disponibles dans la librairie et utilisables directement avec des stores, les composants sont synchronisés automatiquement avec les stores avec `@observer`, donc tous les cas de "non formulaire" sont gérés de façon beaucoup plus élégante, simple et souple qu'avec l'`AutoForm`. N'oubliez pas que le [starter kit](http://www.github.com/JabX/autofocus-starter-kit) fait également office de démo et présente les cas d'usages les plus courants.

### Configuration
La config d'un formulaire se fait intégralement dans son constructeur via l'appel à `super`, qui appelle le constructeur d'`AutoForm`, ses paramètres sont :
* `props`, les props du composants, nécessaires pour React.
* `storeData`, le noeud de store sur lequel on veut créer un formulaire. La seule contrainte sur `storeData` est qu'il doit respecter l'interface `StoreNode`, c'est-à-dire posséder les méthodes `set()` et `clear()`. On peut donc faire des formulaires sur des objets, des arrays, avec le degré de composition qu'on veut. Attention tout de même, l'utilisation de `this.fieldFor` est restrainte pour des formulaires sur des objets simples. L'apport de `this.fieldFor` par rapport à `fieldFor` étant minimal, il est facilement possible de faire des folies sur un formulaire car tout le boulot est fait par MobX, l'EntityStore. En Typescript, le type de `storeData` doit être spécifié en tant que deuxième paramètre de la classe parente.
* `serviceConfig`, qui est un objet contenant **les services** de `load` et de `save` (les actions n'existant plus en tant que telles, on saute l'étape).

### this.entity et ViewModel
Le formulaire construit un `ViewModel` qu'il place dans la propriété `this.entity` à partir de `storeData`. C'est une copie conforme de `storeData` et fera office de state interne au formulaire (il est possible de passer son propre `ViewModel` en 4ème paramètre du constructeur si on veut externaliser le state du formulaire).

Le ViewModel possède une méthode `reset` (qui s'ajoute en plus de tout ce que contient déjà `storeData` en tant que `StoreNode`) qui lui permet de se resynchroniser sur les valeurs de `storeData`. Une réaction MobX est enregistrée à la création qui va appeler cette fonction à chaque modification de store. En attendant, `this.entity` est librement modifiable et est synchronisé avec l'état des champs (via le `onChange` passé par le `this.fieldFor` si on l'utilise, sinon on peut le faire à la main).

L'appel de `load()` (dans `componentWillMount` ou à la main) va appeler le service et mettre le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `save()` sur le formulaire va appeler le service avec la valeur courante de `this.entity` et récupérer le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `cancel()` sur le formulaire appelle simplement `this.entity.reset()`.

Il est important de noter que puisque les valeurs de stores sont toutes stockées dans un objet `{$entity, value}`, copier cette objet puis modifier `value` va modifier la valeur initiale. C'est très pratique lorsque le contenu du store ne correspond pas à ce qu'on veut afficher, puisqu'il n'y a pas besoin de se soucier de mettre à jour le store lorsque l'on modifier sa transformée. `createViewModel` construit une copie profonde du store, ce qui veut dire que ceci ne s'applique pas de `this.entity` vers `storeData` (heureusement !).

### Autres fonctionnalités
* Chaque `Field` gère ses erreurs et expose un champ dérivé `error` qui contient le message d'erreur courant (ou `undefined` du coup s'il n'y en a pas), surchargeable par la prop `error` (passée au `Field` par `this.fieldFor` dans le cas d'une erreur serveur). Pour la validation du formulaire, on parcourt tous les champs (d'où la `ref` passée par `this.fieldFor`) et on regarde s'il y a des erreurs.
* `onChange` et `isEdit`, passés aux `Field`s par `this.fieldFor` permettent respectivement de synchroniser `this.entity` avec les valeurs courantes des champs et de spécifier l'état du formulaire.
* La suppression des actions à entraîné une migration des fonctionnalités annexes de `l'actionBuilder` et du `CoreStore`, en particulier sur la gestion des erreurs. Le traitement des erreurs de services à été décalé dans `coreFetch` (exposé par `httpGet`, `httpPost`...) dans le module `network` (ce qui fait que toutes les erreurs de services vont s'enregistrer dans le `MessageCenter`, pas seulement quand on utilise des actions), et le stockage des erreurs de validation a été déplacé dans le formulaire. De même, l'état `isLoading` est porté par le formulaire.

### Exemple de formulaire (issu du starter kit)

```tsx
import {AutoForm, i18n, observer, React} from "autofocus";
import Panel from  "focus-components/panel";

import {StructureNode} from "../../model/main/structure";
import {loadStructure, saveStructure} from "../../services/main";
import {mainStore} from "../../stores/main";
import {referenceStore} from "../../stores/reference";

@observer
export class Form extends AutoForm<{}, StructureNode> {

    constructor(props: {}) {
        super(props, mainStore.structure, {load: loadStructure, save: saveStructure});
    }

    renderContent() {
        const {denominationSociale, capitalSocial, statutJuridiqueCode} = this.entity;
        return (
            <Panel title="form.title" {...this.getPanelButtonProps()}>
                {i18n.t("form.content")}
                {this.fieldFor(denominationSociale)}
                {this.fieldFor(capitalSocial)}
                {this.selectFor(statutJuridiqueCode, referenceStore.statutJuridique, {labelKey: "libelle"})}
            </Panel>
        );
    }
}
```