# Module `entity`

## Définitions

### Entité

Au sein de Focus, on appelle **entité** tout objet "métier" d'une application, à priori issu du (et généré à partir du) modèle de données. C'est un objet d'échange entre le client et le serveur, à partir duquel on va construire tous les rendus et formulaires qui vont peupler une application Focus.

### Champ

Une entité est constituée de **champs**, objet primitif représentant une des valeurs qui la constitue. Une entité peut également contenir d'autres entités, mais en fin de compte toute la donnée sera représentée comme un ensemble de champs. Un champ est défini par son nom, son caractère obligatoire, son type (au choix parmi `string`, `number`, `boolean`, ou un array de ceux-ci) et son domaine.

### Domaine

Le **domaine** d'un champ répresente le type de donnée métier qui lui est associé (par exemple : une date, un numéro de téléphone, un montant...). On se sert du domaine pour définir des validateurs de saisie, des formatteurs, ou encore des composants de saisie/présentation/libellé personnalisés.

## Principes généraux

-   Le module `entity`, comme son nom ne l'indique pas, est entièrement construit autour des **champs**. Une entité n'est qu'un ensemble de champs comme un autre, et les différentes APIs proposées n'agissent directement que sur des champs ou parfois sur des ensembles de champs.
-   Un champ est autonome et n'a jamais besoin d'un contexte extérieur pour compléter sa définition, ce qui permet justement aux APIs d'utiliser des champs directement. Même s'il est en pratique rattaché à un conteneur, ce rattachement est transparant à l'utilisation.

## Construction de champs via une entité dans un `EntityStore`

### Présentation

Une entité retournée directement depuis le serveur est, comme tout le reste, un objet JSON simple. Parfois, pour diverses raisons, c'est bien la donnée seule qui nous intéresse. Dans ce cas, il suffit de stocker cette donnée dans une simple observable et de l'utiliser comme n'importe quel autre état. Dans d'autres cas, cette donnée est une liste que l'on voudra manipuler. Ici, il faudra s'orienter vers le module **`list`** et ses stores spécialisés.

Dans le cas où la donnée a besoin d'être consommée sous forme de champs, par exemple pour construire un quelconque formulaire ou simplement pour afficher quelques champs formattés avec leurs libellés, Focus met à disposition un **`EntityStore`**. C'est un store construit à partir de définitions d'entités (et donc des champs qui la composent), qui présente toute la structure de données sous forme d'un "arbre" de champs, prêts à être renseigns avec des valeurs chargées depuis le serveur ou saisies dans l'application.

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
            $field: {type: "field", fieldType: {} as number, isRequired: false, domain: DO_ID, label: "operation.id"},
            value: 1
        },
        number: {
            $field: {type: "field", fieldType: {} as string, isRequired: false, domain: DO_NUMBER, label: "operation.number"},
            value: "1.3"
        },
        amount: {
            $field: {type: "field", fieldType: {} as number, isRequired: true, domain: DO_AMOUNT, label: "operation.amount"},
            value: 34.3
        }
    }
}
```

A partir des champs ainsi déclarés (dans un objet qu'on appelera par la suite `EntityField`), on va pouvoir construire des méthodes simples pour les consommer.

Construire un `EntityStore` est une façon de créer des champs mais n'est pas la seule. Il n'est adapté que si les champs sont liés à une entité et que l'on aura besoin de plusieurs champs de cette dernière.

### Constitution et APIs des noeuds

Un chaque objet contenu dans un `EntityStore` peut être l'un des trois objets suivants :

-   Un `EntityField`, objet représentant un champ, détaillé dans le paragraphe précédent.
-   Un `StoreNode`, objet contenant des champs et d'autres `Store(List)Node`. Une entité dans un `EntityStore` est représentée par un `StoreNode`, et l'`EntityStore` lui-même est également un `StoreNode` (qui n'a à priori pas de champs au premier niveau).
-   Un `StoreListNode`, qui est une liste de `StoreNode` (il s'agit d'un array observable avec des propriétés en plus, il hérite donc de toutes ses méthodes).

Le `StoreNode` et le `StoreListNode` ont une API similaire, qui contient les méthodes suivantes :

-   `replace(data)`/`replaceNodes(data)`, qui remplace le noeud (récursivement) intégralement par l'objet (sous forme "JSON") passé en paramètre. `replace` sur un array observable existe déjà et est la méthode utilisée pour remplacer l'array par l'array donné : `replaceNodes` réalise la construction des `StoreNode`s en plus.
-   `set(data)`/`setNodes(data)`, qui met à jour le noeud (récursivement) avec les champs renseignés dans `data` (c'est un "merge"). Pour un noeud de liste, si l'objet à l'index passé n'existe pas encore dans la liste, il sera créé en même temps.
-   `clear()`, qui vide récursivement le noeud et son contenu.

Le `StoreNode` possède également une méthode `pushNode(...items)`, qui est à `push(...items)` ce qu'est `replaceNode` à `replace`.

C'est aussi l'occasion de rappeler que, contrairement à de la donnée brute sous forme de JSON, un `StoreNode` contient toujours l'ensemble de tous les champs du noeud. Si une valeur n'est pas renseignée, la propriété `value` du champ a simplement pour valeur `undefined`. De même, il faut toujours garder à l'esprit que `store.operation.id` est un _`EntityField`_ (qui est donc toujours vrai) et non un _`number | undefined`_. La valeur est bien toujours `store.operation.id.value`.

De plus, il convient également de rappeler que la modification d'un noeud ou de l'un de ses champs n'est pas limité à l'usage des méthodes `replace()`, `set()` ou `clear()`. Ce sont des méthodes utilitaires qui permettent simplement d'affecter plusieurs valeurs en même temps à des champs. Il est parfaitement possible de faire l'affection manuellement, par exemple `store.operation.id.value = undefined`. Derrière, comme tout le reste de l'application, MobX gère tout tout seul.

### API de l'`EntityStore`

#### `makeEntityStore(config)`

La fonction `makeEntityStore` permet de créer un nouvel `EntityStore` à partir d'un objet de configuration. Cette objet peut contenir :

-   Des objets de définition d'entité (généralement générés sous le nom `OperationEntity`), pour générér les `StoreNode`s correspondants.
-   Des arrays contenants un objet d'entité (`[OperationEntity]`), pour générer les `StoreListNode`s correspondants.
-   Des `StoreNode`s existants, créés à partir d'un autre `EntityStore`. Cela permet de les rattacher aux méthodes `replace`, `set` et `clear` du store, pour associer des ensembles d'entités liées.

#### `toFlatValues(node)`

Cette fonction prend un noeud quelconque en paramètre et récupère toutes les valeurs de champs dans son objet "JSON" équivalent.

## Afficher des champs

Focus met à disposition quatre fonctions pour afficher des champs :

### `fieldFor(field, options?)`

C'est la fonction principale, elle permet d'afficher un champ avec son libellé, à partir de ses métadonnées (en particulier le domaine). Elle prend comme paramètres :

-   `field`, un `EntityField`
-   `options`, les différentes options à passer au champ. Il ne s'agit uniquement de props pour le composant de Field, et _il n'y est pas possible de surcharger les métadonnées du champ_.

Le composant de Field utilisera ses composants par défaut si le domaine ne les renseignent pas (`Input`, `Display` et `Label` de `forms`).

### `selectFor(field, values, options?)`

La fonction `selectFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec une liste de référence. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `values`, la liste de référence à utiliser pour résoudre le code.
-   `options`, comme `fieldFor`, avec une option en plus pour personnaliser le composant de `Select`.

### `autocompleteFor(field, options)`

La fonction `autocompleteFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec un champ d'autocomplétion. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `options`, comme `fieldFor`, où il faut également préciser `keyResolver` et/ou `querySearcher` pour gérer la consultation et/ou la saisie. De plus, il y est possible de personnaliser le composant d'`Autocomplete`.

### `stringFor(field, values?)`

La fonction `stringFor` affiche la représentation textuelle d'un champ de store, en utilisant le formatteur et si besoin une liste de référence. Les paramètres sont :

-   `field`,
-   `values`, s'il y a une liste de référence à résoudre.

_Note : `stringFor` ne peut pas être utilisé avec un `keyResolver`, il faut soit utiliser `autocompleteFor` en consultation, ou résoudre la clé à la main_

## Création et modification de champs.

Jusqu'ici, les champs que l'on manipule font partis de noeuds d'`EntityStore`, et ces champs ont été initialisés et figés par la définition initiale des entités générées depuis le modèle. Or bien souvent, on peut avoir besoin de modifier une métadonnée en particulier, ou bien d'avoir à remplacer un composant dans un écran précis pour un champ donné. Et même, on peut vouloir créer un champ à la volée sans avoir besoin d'insérer toute une entité dans un `EntityStore`.

Pour répondre à ces problématiques, Focus propose trois fonctions utilitaires :

### `makeField(value, $field?)`

Cette fonction permet de créer un field à partir d'une valeur. L'objet optionnel `$field` peut contenir toutes les métadonnées (ainsi que celles portées par le domaine) à ajouter au champ ainsi créé. Par défaut, le champ n'a pas de nom, pas de domaine et n'est pas obligatoire.

Cet usage de `makeField` (il y en aura d'autres plus bas) peut servir à récréer rapidement un champ entier à partir d'une valeur, ou simplement pour ajouter un domaine, un formatteur ou juste un libellé et profiter des fonctions d'affichage du paragraphe précédent.

### `fromField(field, $field)`

Cette fonction permet de dupliquer un champ en remplaçant certaines métadonnées par celles précisées dans `$field`. Cette fonction ne sert qu'à de l'affichage (et en passant, on n'a bien parlé que de ça depuis le début).

### `patchField(field, $field)`

Cette fonction fonctionne comme `fromField`, à la différence notable qu'elle modifie le champ donné au lieu de le dupliquer. Son usage n'est conseillé que pour la construction de formulaires (voir plus bas).

## Gestion de l'édition.

Le sujet n'a pas réellement été abordé jusque ici pour une raison simple : **les champs ne gèrent pas l'édition nativement**.

Du moins, une propriété `isEdit` peut être ajoutée aux champs, qui sera lue par `fieldFor` et `autocompleteFor`/`selectFor`, mais elle est presque toujours gérée par un noeud de formulaire. En l'absence de cette propriété, il n'est pas possible d'afficher un champ en édition.

Il existe deux possibilités (_en dehors d'un formulaire, voir section suivante_) pour gérer un champ en édition :

### `makeField(getter, $field, setter, isEdit?)`

Cette deuxième signature de `makeField` permet de créer un champ "à la volée" à partir d'un getter et d'un setter. Les paramètres sont les suivants :

-   `getter` est une fonction sans paramètre représant une dérivation qui retourne la valeur.
-   `$field` pour y renseigner des métadonnées.
-   `setter` est une fonction qui prend la valeur comme paramètre et qui doit se charger de mettre à jour la valeur retournée par le getter.
-   `isEdit` peut être renseigné à `true` pour afficher le champ en édition.

### `cloneField(field, isEdit?)`

Cette méthode est un raccourci pour le `makeField` du dessus pour créer un champ (à priori en édition) à partir d'un champ existant, en réutilisant son getter, son setter et ses métadonnées.

## Formulaires

L'affichage de champs est certes une problématique intéressante à résoudre, mais le coeur d'une application de gestion reste tout de même constitué d'écrans de saisie, ou formulaires.

Pour réaliser un formulaire, les entités et champs dont on dispose vont devoir être complétés d'un état d'**édition** ainsi qu'un état (dérivé) de **validation**. C'est le rôle du `FormNode`, présenté ci-après.

### Le noeud de formulaire : `FormNode`

Un formulaire sera toujours construit à partir d'un `Store(List)Node`, qui sara ici quasiment toujours une entité ou une liste d'entité. Définir un formulaire à ce niveau là fait sens puisque on se base sur des objets d'échange avec le serveur (qui est en passant toujours responsable de la validation et de la sauvegarde des données), et on ne fait pas vraiment de formulaires basés sur un champ unique.

Un `FormNode`, construit par la fonction **`makeFormNode`**, est une copie conforme du noeud à partir duquel il a été créé, qui sera "abonné" aux modifications de ce noeud. Il représentera l'état interne du formulaire, qui sera modifié lors de la saisie de l'utilisateur, sans impacter l'état du noeud initial.

#### `makeFormNode(componentClass, node, {isEdit, isEmpty}, initializer)`

Les différents paramètres de `makeFormNode` sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de synchronisation lorsque le composant sera démonté).
-   `node`, le noeud à partir duquel on construit le formulaire. Il n'y a aucune restriction sur la nature de ce noeud (simple, liste, composé...). Il n'est juste pas possible de créer un `FormNode` à partir d'un autre `FormNode`.
-   `{isEdit, isEmpty}`, deux options permettant de préciser :
    -   `isEdit`, l'état d'édition initial du noeud (précisions plus bas). Cela peut également être un getter (de la forme `() => boolean`) qui sera utilisé à la place de l'état interne, pour contrôler l'état d'édition depuis l'extérieur (ou le forcer à `true` ou `false` avec `() => true` ou `() => false`)
    -   `isEmpty`, pour préciser si le noeud de formulaire ne doit pas copier le contenu de son noeud source à la création (il copie donc par défaut);
-   `initializer`, détaillé plus bas

#### Contenu

Tous les objets contenus dans un `FormNode` (et y compris le `FormNode` lui-même) sont complétés de propriétés supplémentaires représentant les états d'édition et de validation de l'objet. Ils prennent la forme :

-   Sur un `Form(List)Node`
    -   `form`, un objet muni des trois propriétés `isEdit`, `isValid` et `errors`.
    -   `sourceNode`, une référence vers le noeud source équivalent du `FormNode`
    -   `reset()`, une méthode pour réinitialiser le `FormNode` sur son `sourceNode`.
-   Des trois propriétés additionnelles `isEdit`, `isValid` et `error` sur un `EntityField`.

Les propriétés `error(s)` et `isValid` sont en lecture seule et sont calculées automatiquement. `error` est le message d'erreur de validation sur un champ et vaut `undefined` si il n'y a pas d'erreur. `errors` est l'objet qui contient l'ensemble des erreurs des champs contenu dans un noeud. `isValid` sur un noeud est le résultat de validation de tous les champs qu'il contient, valant donc `true` seulement si toutes les propriétés `isValid` des champs valent `true`. A noter cependant que si le noeud/champ n'est pas en édition, alors `isValid` vaut forcément `true` (en effet, il n'y a pas besoin de la validation si on n'est pas en cours de saisie).

Les propriétés `isEdit` sont modifiables, mais chaque `isEdit` est l'intersection de l'état d'édition du noeud/champ et de celui de son parent, ce qui veut dire qu'un champ de formulaire ne peut être en édition (et donc modifiable) que si le formulaire est en édition _et_ que son éventuel noeud parent est en édition _et_ que lui-même est en édition. En pratique, le seul état d'édition que l'on manipule directement est celui du `FormNode`, dont l'état initial peut être passé à la création (par défaut, ce sera `false`). Tous les sous-états d'édition sont initialisés à `true`, pour laisser l'état global piloter toute l'édition.

Sur les champs, ces deux propriétés sont utilisées par `fieldFor` et `autocompleteFor`/`selectFor` pour gérer le mode édition et afficher les erreurs de validation, comme attendu.

#### Initialisation et transformations de noeud et de champs

En plus d'ajouter ces propriétés à tous les sous-noeuds et champs du noeud initial, il est possible de spécifier au `FormNode` une **fonction d'initialisation** en entrée, qui sera appelée à sa création. C'est l'endroit adapté pour donner des valeurs par défaut aux différents champs qui compose le formulaire.

Son usage le plus avancé permet également d'effectuer toutes les modifications de champs souhaitées pour le formulaire via des appels à `patchField()` (qui seront appliqués sur le noeud de formulaire pendant la création), ainsi que d'ajouter des champs au `FormNode` en retournant un objet de propriétés créées par `makeField()`.

En plus des signatures présentées dans leur chapitre dédié, ces deux fonctions peuvent également accepter des getters pour l'objet de métadonnées ainsi que pour l'état d'édition. Cela permet de dériver des métadonnées d'un autre état (le plus souvent de la valeur d'un autre champ, par exemple pour définir un caractère obligatoire dépendant du fait que l'autre champ soit renseigné ou non), ou bien pour contrôler son état d'édition.

Tout comme `makeFormNode`, `makeField` et `patchField` peuvent recevoir, **dans la fonction d'initilisation uniquement**, soit un booléen (`true`/`false`), ou bien un "getter" de la forme `() => boolean` dans leur paramètre `isEdit`. Pour rappel (ceci étant valable également pour `makeFormNode`) :

-   Si on passe un _booléen_, alors il correspondra à la valeur initiale de l'état d'édition du champ cible
-   Si on passe un _getter_, alors il écrasera l'état d'édition interne du champ. A noter que le champ nécessitera toujours que son parent soit en édition pour être en édition, mais si on le contrôle ainsi.

Une fonction de patch supplémentaire, `patchNodeEdit`, est disponible pour initialiser ou contrôler l'état d'édition d'un sous-noeud tout entier. Les sous-états d'édition étant tous initilisés à `true` par défaut, cette fonction sera surtout utilisée pour bloquer d'édition du noeud tout entier via en passant `false`, ou mieux, `() => false`.

L'usage de `fromField` est à proscrire dans un noeud de formulaire, car le champ qui sera créé à partir du champ de formulaire initial ne sera plus lié au formulaire (plus de `isEdit`, plus de `error`). A la place, _chaque modification de champ (y compris un simple changement de libellé) doit passer par la fonction d'initialisation_.

L'usage de `cloneField` est à priori pensé pour gérer de l'édition sans avoir à passer par un formulaire complet (ce qui est utile pour des états qui doivent être pris en compte immédiatement sans validation, comme des filtres par exemple), mais il est également possible de cloner un champ de formulaire pour surcharger localement son état d'édition, en particulier pour qu'il ne dépende pas de celui du formulaire.

Il est nécessaire d'utiliser la fonction d'initialisation pour modifier des champs car c'est le seul endroit où on peut le faire. On pourrait être tenté de vouloir le faire dans `fieldFor`/`autocompleteFor`/`selectFor`, mais il ne faut pas oublier qu'un composant de `Field` n'a pas d'état et que tout (en particulier la validation) est déjà géré en amont au niveau du `FormNode`.

#### Exemple

Cet exemple est peu réaliste, mais il montre bien tout ce qu'on peut faire à la création d'un `FormNode` :

```ts
const formNode = makeFormNode(
    null, // Passer `this` dans un composant à la place.
    mainStore.structure, // StoreNode source.
    {isEdit: true}, // FormNode initialisé en édition.
    entity => {
        // On initialise la valeur du champ ville à "Paris".
        entity.adresse.ville.value = "Paris";

        // On change le domaine et le isRequired du champ.
        patchField(entity.denominationSociale, () => ({
            domain: DO_COMMENTAIRE,
            isRequired: !!entity.capitalSocial.value // Obligatoire si ce champ est renseigné
        }));

        // Ce champ ne sera pas modifiable si le statut juridique vaut "EARL"
        patchField(entity.capitalSocial, {}, () => entity.statutJuridiqueCode.value !== "EARL");

        // Le sous-node adresse n'est pas modifiable.
        patchNodeEdit(entity.adresse, false);

        // On ajoute un champ supplémentaire calculé.
        return {
            email: makeField(
                () => entity.denominationSociale.value,
                {
                    domain: DO_LIBELLE_100,
                    label: "structure.email",
                    validator: {type: "email"}
                },
                email => (entity.denominationSociale.value = email)
            ) // Setter.
        };
    }
);
```

### Les actions de formulaires : `FormActions`

Une fois le `FormNode` créé, on aura besoin d'un deuxième objet pour gérer le cycle de vie du formulaire : un `FormActions`.

Il se crée à partir d'un `FormNode` via la fonction **`makeFormActions`**. Ses paramètres sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de chargement lorsque le composant sera démonté).
-   `formNode`, le `FormNode` sur lequel les actions vont intéragir. Il est possible de passer ici un sous-noeud, mais ce dernier n'ayant pas accès au noeud d'origine, certaines fonctionalités ne seront pas disponbiles.
-   `actions`, qui est un objet contenant essentiellement les services de **`load`** et de **`save`**. L'action de `load` n'est pas obligatoire (par exemple : formulaire de création), mais par contre le `save` l'est bien (sinon, ce ne serait pas un formulaire).
-   `config?`, un objet de configuration additionel qui permet notamment de placer des `hooks` après le chargement, la sauvegarde ou le changement d'état.

#### Chargement des données

En plus du service de chargement, pour pouvoir charger des données il est aussi nécessaire de renseigner la fonction `getLoadParams()` dans `actions`. Cette fonction est un getter qui doit renvoyer un array de paramètres qui sera utilisé à l'appel de `load`. Si `getLoadParams()` ne renvoie rien (`undefined`), alors l'action ne sera pas appelée. Si `getLoadParams()` renvoie un array vide, alors l'action sera appelée sans paramètres.

`getLoadParams` sera utilisé comme une dérivation MobX, dont chaque changement (en plus de l'éventuel appel initial) lancera l'action de `load` en réaction. Cela permet de synchroniser le formulaire sur une autre observable (en particulier un `ViewStore`) et de ne pas avoir à passer par une prop (dont il faudrait gérer manuellement la modification) pour (re)charger le formulaire. Rien n'empêche par contre de définir `getLoadParams` comme `() => [this.props.id]`, mais c'est moins direct que d'utiliser directement l'état concerné. Par conséquent, cela veut dire que tout formulaire (et même écran en général) à usage unique n'a en général pas besoin de props.

#### Méthodes de `FormActions`

`FormActions` expose principalement trois méthodes, qui permettent d'appeler les actions que l'on a enregistrées :

-   `load()`, qui appelle l'action de `actions.load` avec les paramètres de `actions.getLoadParams` si les deux sont renseignés, et met à jour le noeud origine de `formNode` (et donc `formNode` également).
-   `save()`, qui appelle l'action de `actions.save` à partir de l'état actuellement stocké dans `formNode`. Le résultat de l'action de sauvegarde (si non void/undefined/null...) sera enregistré dans le noeud origine de `formNode` (et donc `formNode` également).
-   `toggleEdit(edit)`, qui met à jour l'état d'édition général du `formNode`. Si `edit === false`, alors `formNode` sera réinitialisé sur l'état du noeud origine.

_Note : pour éviter le reset de tout le formulaire lors de la sauvegarde d'un sous formulaire, il faut donc que son action de sauvegarde ne renvoie rien_

#### Exemples

Premier exemple : formulaire classique d'édition

```ts
actions = makeFormActions(this, this.entity, {
    // this.entity est un `formNode` préalablement créé
    getLoadParams: () => homeViewStore.withView(({page, id}) => !page && id && [+id]),
    load: loadStructure,
    save: saveStructure
});
```

Deuxième exemple : formulaire de création avec des options

```ts
actions = makeFormActions(
    this,
    this.entity,
    {
        save: async x => {
            mainStore.suivi.evenementList.pushNode(x);
            return x;
        }
    },
    {
        clearBeforeInit: true,
        onFormSaved: () => this.props.close(),
        onClickCancel: () => this.props.close()
    }
);
```

### Les composants de formulaire : `<Form>` (et `<Panel>`)

Une fois que l'on a le `formNode` (que l'on stocke habituellement dans `this.entity` dans un composant React) et son objet d'actions associé (que l'on stocke habituellement dans `this.actions`), on peut enfin les utiliser dans un composant de formulaire.

#### `<Form>`

`Form` est un composant qui sert à poser le formulaire dans un composant React. Il utilise l'objet d'actions dans son cycle de vie (en particulier, il appelle `load` pendant son `componentWillMount`) et peut poser un formulaire HTML dont l'action est le `save`.

La propriété `formProps` de `FormActions` contient toutes les props nécessaires au `Form`, donc en pratique son utilisation est très simple :

```tsx
render() {
    return (
        <Form {...this.actions.formProps}>
            {/* blablabla */}
        </Form>
    );
}
```

Sa seule prop additionnelle est `hasForm` (par défaut à true), qui indique s'il doit poser le formulaire HTML ou non.

#### `<Panel>`

C'est un composant qui permet de poser un panel avec un titre et des boutons d'actions. Il n'est pas spécialement lié aux formulaires (il se trouve dans le module `components`), mais en pratique il est quasiment toujours utilisé avec.

Comme pour `<Form>`, `FormActions` expose `actions.panelProps`, qui contient les méthodes et les états nécessaires à son fonctionnements.

#### Champs

Une fois qu'on a fait tout ça, on peut utiliser directement `fieldFor` et consorts sur les champs du `formNode`, sans aucune (autre) différences.

### Exemple complet de formulaire simple

```tsx
import {fieldFor, Form, makeFormActions, makeFormNode, observer, Panel, React, selectFor} from "focus4";

import {loadStructure, saveStructure} from "../../../services/main";
import {homeViewStore, mainStore, referenceStore} from "../../../stores";

@observer
export class BasicForm extends React.Component<{}, void> {
    entity = makeFormNode(this, mainStore.structure);
    actions = makeFormActions(this, this.entity, {
        getLoadParams: () => homeViewStore.withView(({page, id}) => !page && id && [+id]),
        load: loadStructure,
        save: saveStructure
    });

    render() {
        const {denominationSociale, capitalSocial, statutJuridiqueCode, adresse} = this.entity;
        return (
            <Form {...this.actions.formProps}>
                <Panel title="form.title" {...this.actions.panelProps}>
                    {fieldFor(denominationSociale)}
                    {fieldFor(capitalSocial)}
                    {selectFor(statutJuridiqueCode, referenceStore.statutJuridique)}
                    {fieldFor(adresse.codePostal)}
                    {fieldFor(adresse.ville)}
                </Panel>
            </Form>
        );
    }
}
```

# Module `reference`

### `ReferenceStore`

Un `ReferenceStore` de Focus V4 est construit par la fonction `makeReferenceStore(referenceLoader, refConfig)` :

-   `referenceLoader` est une fonction qui prend en paramètre un nom de référence et la liste de référence (qui renvoie donc une Promise)
-   `refConfig` est un objet dont les propriétés sont des définitions de listes de référence, à priori générés avec le reste du modèle. Ce sont des objets de la forme `{type, valueKey, labelKey}` qui servent à définir totalement comme la référence doit s'utiliser.

Un store de référence se construit de la manière suivante :

```ts
const referenceStore = makeReferenceStore(referenceLoader, {
    product,
    line
});
```

Le `referenceStore` résultant peut être utilisé tel quel dans un composant `observer`: lorsqu'on veut récupérer une liste de références, le store regarde dans le cache et renvoie la valeur s'il la trouve. Sinon, il lance le service de chargement qui mettra à jour le cache et renvoie une liste vide. Une fois la liste chargée, l'observable sera modifiée et les composants mis à jour automatiquement.

Exemple d'usage :

```tsx
@observer
class View extends React.Component {
    render() {
        return (
            <ul>
                {referenceStore.product.map(product => (
                    <li>product.code</li>
                ))}
                {referenceStore.line.map(line => (
                    <li>line.label</li>
                ))}
            </ul>
        );
    }
}
```

Ce composant sera initialement rendu 3 fois:

-   La première fois, les deux utilisations de `product` et de `line` vont lancer les appels de service (les deux listes sont vides)
-   La deuxième fois, l'une des deux listes aura été chargée et sera affichée.
-   La troisième fois, l'autre liste aura également été chargée et les deux seront affichées.

Les fois suivantes (dans la mesure que les listes sont toujours en cache), il n'y aura qu'un seul rendu avec les deux listes déjà chargées.

Et voilà, ça marche tout seul.

### `makeReferenceList(list, {valueKey, labelKey})`

Cette fonction permet de transformer une liste classique en une liste utilisable comme liste de référence (pour `selectFor`).
