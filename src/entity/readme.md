# Module `entity`

## Définitions

### Entité
Au sein de Focus, on appelle **entité** tout objet "métier" d'une application, à priori issu du (et généré à partir du) modèle de données. C'est un objet d'échange entre le client et le serveur, à partir duquel on va construire tous les rendus et formulaires qui vont peupler une application Focus.

### Champ
Une entité est constituée de **champs**, objet primitif représentant une des valeurs qui la constitue. Une entité peut également contenir d'autres entités, mais en fin de compte toute la donnée sera représentée comme un ensemble de champs. Un champ est défini par son nom, son caractère obligatoire, son type (au choix parmi `string`, `number`, `boolean`, ou un array de ceux-ci) et son domaine.

### Domaine
Le **domaine** d'un champ répresente le type de donnée métier qui lui est associé (par exemple : une date, un numéro de téléphone, un montant...). On se sert du domaine pour définir des validateurs de saisie, des formatteurs, ou encore des composants de saisie/présentation/libellé personnalisés.

## Principes généraux
- Le module `entity`, comme son nom ne l'indique pas, est entièrement construit autour des **champs**. Une entité n'est qu'un ensemble de champs comme un autre, et les différentes APIs proposées n'agissent directement que sur des champs ou parfois sur des ensembles de champs.
- Un champ est autonome et n'a jamais besoin d'un contexte extérieur pour compléter sa définition, ce qui permet justement aux APIs d'utiliser des champs directement. Même s'il est en pratique rattaché à un conteneur, ce rattachement est transparant à l'utilisation.

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
- Un `EntityField`, objet représentant un champ, détaillé dans le paragraphe précédent.
- Un `StoreNode`, objet contenant des champs et d'autres `Store(List)Node`. Une entité dans un `EntityStore` est représentée par un `StoreNode`, et l'`EntityStore` lui-même est également un `StoreNode` (qui n'a à priori pas de champs au premier niveau).
- Un `StoreListNode`, qui est une liste de `StoreNode`.

Le `StoreNode` et le `StoreListNode` partagent la même API de base, qui comporte les deux méthodes suivantes :
- `set(data)`, qui prend les données sous forme "JSON" et les insère dans le noeud, de manière récursive. Si le `set` doit mettre à jour un `StoreNode`, alors il ne mettae à jour que les champs reçus (accomplissant un "merge"). Si le `set` doit mettre à jour un `StoreListNode`, alors il va vider la liste et la remplir avec les objets passés, tels quels.
- `clear()`, qui vide récursivement le noeud et son contenu.

C'est aussi l'occasion de rappeler que, contrairement à de la donnée brute sous forme de JSON, un `StoreNode` contient toujours l'ensemble de tous les champs du noeud. Si une valeur n'est pas renseignée, la propriété `value` du champ a simplement pour valeur `undefined`. De même, il faut toujours garder à l'esprit que `store.operation.id` est un _`EntityField`_ (qui est donc toujours vrai)  et non un _`number | undefined`_. La valeur est bien toujours `store.operation.id.value`.

Le `StoreListNode` dispose également d'une méthode supplémentaire `pushNode(item)`, qui permet d'y ajouter un node à partir d'un objet JSON brut.

De plus, il convient également de rappeler que la modification d'un noeud ou de l'un de ses champs n'est pas limité à l'usage des méthodes `set()` ou `clear()`. Ce sont des méthodes utilitaires qui permettent simplement d'affecter plusieurs valeurs en même temps à des champs. Il est parfaitement possible de faire l'affection manuellement, par exemple `store.operation.id.value = undefined`. Derrière, comme tout le reste de l'application, MobX gère tout tout seul.

### API de l'`EntityStore`

#### `makeEntityStore(config)`
La fonction `makeEntityStore` permet de créer un nouvel `EntityStore` à partir d'un objet de configuration. Cette objet peut contenir :
- Des objets de définition d'entité (généralement générés sous le nom `OperationEntity`), pour générér les `StoreNode`s correspondants.
- Des arrays contenants un objet d'entité (`[OperationEntity]`), pour générer les `StoreListNode`s correspondants.
- Des `StoreNode`s existants, créés à partir d'un autre `EntityStore`. Cela permet de les rattacher aux méthodes `set` et `clear` du store, pour associer des ensembles d'entités liées.

#### `toFlatValues(node)`
Cette fonction est l'opposé de la fonction `set` : elle prend un node et récupère toutes les valeurs de champs dans l'objet "JSON" équivalent au node.

## Afficher des champs
Focus met à disposition trois fonctions pour afficher des champs :

### `fieldFor(field, options?)`
C'est la fonction principale, elle permet d'afficher un champ avec son libellé, à partir de ses métadonnées (en particulier le domaine). Elle prend comme paramètres :
- `field`, un `EntityField`
- `options`, les différentes options à passer au champ. Il ne s'agit uniquement de props pour le composant de Field, et _il n'y est pas possible de surcharger les métadonnées du champ_.

Le composant de Field utilisera ses composants par défaut si le domaine ne les renseignent pas (`Input`, `Display` et `Label` de `components`).

### `selectFor(field, values, options?)`
La fonction `selectFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec une liste de référence. Elle prend comme paramètres :
- `field`, le champ contenant le code
- `values`, la liste de référence à utiliser pour résoudre le code.
- `options`, comme `fieldfor`, avec une option en plus pour personnaliser le composant de `Select`.

### `stringFor(field, values?)`
La fonction `stringFor` affiche la représentation textuelle d'un champ de store, en utilisant le formatteur et si besoin une liste de référence. Les paramètres sont :
- `field`,
- `values`, s'il y a une liste de référence à résoudre.


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

Du moins, une propriété `isEdit` peut être ajoutée aux champs, qui sera lue par `fieldFor` et `selectFor`, mais elle est presque toujours gérée par un noeud de formulaire. En l'absence de cette propriété, il n'est pas possible d'afficher un champ en édition.

La seule façon d'avoir un champ en édition en dehors d'un formulaire est d'utiliser la deuxième définition de `makeField` :

### `makeField(getter, $field, setter, isEdit?)`
- `getter` est une fonction sans paramètre représant une dérivation qui retourne la valeur.
- `setter` est une fonction qui prend la valeur comme paramètre et qui doit se charger de mettre à jour la valeur retournée par le getter.
- `isEdit` peut être renseigné à `true` pour afficher le champ en édition.

## Formulaires
L'affichage de champs est certes une problématique intéressante à résoudre, mais le coeur d'une application de gestion reste tout de même constitué d'écrans de saisie, ou formulaires.

Pour réaliser un formulaire, les entités et champs dont on dispose vont devoir être complétés d'un état d'**édition** ainsi qu'un état (dérivé) de **validation**. C'est le rôle du `FormNode`, présenté ci-après.

### Le noeud de formulaire : `FormNode`
Un formulaire sera toujours construit à partir d'un `Store(List)Node`, qui sara ici quasiment toujours une entité ou une liste d'entité. Définir un formulaire à ce niveau là fait sens puisque on se base sur des objets d'échange avec le serveur (qui est en passant toujours responsable de la validation et de la sauvegarde des données), et on ne fait pas vraiment de formulaires basés sur un champ unique.

Un `FormNode`, construit par la fonction **`makeFormNode`**, est une copie conforme du noeud à partir duquel il a été créé, qui sera "abonné" aux modifications de ce noeud. Il représentera l'état interne du formulaire, qui sera modifié lors de la saisie de l'utilisateur, sans impacter l'état du noeud initial.

#### Contenu
Tous les objets contenus dans un `FormNode` (et y compris le `FormNode` lui-même) sont complétés de propriétés supplémentaires représentant les états d'édition et de validation de l'objet. Ils prennent la forme :
- D'une propriété additionnelle `form` sur un `Store(List)Node`, un objet muni des deux propriétés `isEdit` et `isValid`
- Des deux propriétés additionnelles `isEdit` et `error` sur un `EntityField`.

Les propriétés `error` et `isValid` sont en lecture seule et sont calculées automatiquement. `error` est le message d'erreur de validation sur un champ et vaut `undefined` si il n'y a pas d'erreur. `isValid` sur un node est le résultat de validation de tous les champs qu'il contient, valant donc `true` seulement si toutes les propriétés `error` des champs valent `undefined`. A noter cependant que si le noeud n'est pas en édition, alors `isValid` vaut forcément `true` (en effet, il n'y a pas besoin de la validation si on n'est pas en cours de saisie).

Les propriétés `isEdit` sont modifiables, mais chaque `isEdit` est l'intersection de l'état d'édition du noeud/champ et de celui de son parent, ce qui veut dire qu'un champ de formulaire ne peut être en édition (et donc modifiable) que si le formulaire est en édition _et_ que son éventuel noeud parent est en édition _et_ que lui-même est en édition. En pratique, le seul état d'édition que l'on manipule directement est celui du `FormNode`, dont l'état initial peut être passé à la création (par défaut, ce sera `false`). Tous les sous-états d'édition sont initialisés à `true`, pour laisser l'état global piloter toute l'édition.

Sur les champs, ces deux propriétés sont utilisées par `fieldFor` et `selectFor` pour gérer le mode édition et afficher les erreurs de validation, comme attendu.

Enfin, pour terminer sur les ajouts, le `FormNode` est muni d'une méthode `reset()` pour se réinitialiser sur l'état du noeud initial (et qui sera appelée automatiquement à chaque changement de ce dernier), ainsi que d'une propriété `sourceNode` pour y accéder. Ces propriétés n'existe bien que sur la racine du `FormNode`, à l'inverse des états présentés au-dessus.

#### Transformations de noeud et de champs
En plus d'ajouter ces propriétés à tous les sous-noeuds et champs du noeud initial, le `FormNode` gère  également une **fonction de transformation** en entrée, qui sera utilisée à la création. Elle permet d'effectuer toutes les modifications de champs souhaitées pour le formulaire via des appels à `patchField()` (qui seront appliqués sur le noeud de formulaire pendant la création), ainsi que d'ajouter des champs au `FormNode` en retournant un objet de propriétés créées par `makeField()`.

En plus des signatures présentées dans leur chapitre dédié, ces deux fonctions peuvent également accepter des getters pour l'objet de métadonnées ainsi que pour l'état d'édition. Cela permet de dériver des métadonnées d'un autre état (le plus souvent de la valeur d'un autre champ, par exemple pour définir un caractère obligatoire dépendant du fait que l'autre champ soit renseigné ou non), ou bien d'ajouter une condition supplémentaire pour qu'un champ soit en édition.

Une fonction de patch supplémentaire, `patchNodeEdit`, est disponible pour ajouter une condition d'édition sur un sous-noeud tout entier. A noter que, de manière générale, si on ajoute une condition d'édition valant `false` sur un noeud ou un champ, alors ce champ ne sera jamais éditable puisqu'elle sera intersectée avec l'état propre et celui du parent (`false && true && true === false` en somme).

L'usage de `fromField` est à proscrire dans un noeud de formulaire, car le champ qui sera créé à partir du champ de formulaire initial ne sera plus lié au formulaire (plus de `isEdit`, plus de `error`). A la place, _chaque modification de champ (y compris un simple changement de libellé) doit passer par la fonction de transformation_.

Il est nécessaire d'utiliser la fonction de transformation pour modifier des champs car c'est le seul endroit où on peut le faire. On pourrait être tenté de vouloir le faire dans `fieldFor`/`selectFor`, mais il ne faut pas oublier qu'un composant de `Field` n'a pas d'état et que tout (en particulier la validation) est déjà géré en amont au niveau du `FormNode`.

#### Exemple
Cet exemple est peu réaliste, mais il montre bien tout ce qu'on peut faire à la création d'un `FormNode` :
```ts
const formNode = makeFormNode(mainStore.structure, entity => {
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
        email: makeField(() => entity.denominationSociale.value, {
            domain: DO_LIBELLE_100,
            label: "structure.email",
            validator: {type: "email"}
        }, email => entity.denominationSociale.value = email) // Setter.
    };
}, true); // FormNode initialisé en édition.
```


### Les actions de formulaires : `FormActions`
Une fois le `FormNode` créé, on aura besoin d'un deuxième objet pour gérer le cycle de vie du formulaire : un `FormActions`.

Il se crée à partir d'un `FormNode` via la fonction **`makeFormActions`**. Ses paramètres sont :
- `formNode`, le `FormNode` sur lequel les actions vont intéragir. Il est possible de passer ici un sous-noeud, mais ce dernier n'ayant pas accès au noeud d'origine, certaines fonctionalités ne seront pas disponbiles.
* `actions`, qui est un objet contenant essentiellement les services de **`load`** et de **`save`**. L'action de `load` n'est pas obligatoire (par exemple : formulaire de création), mais par contre le `save` l'est bien (sinon, ce ne serait pas un formulaire).
- `config?`, un objet de configuration additionel qui permet notamment de placer des `hooks` après le chargement, la sauvegarde ou le changement d'état.

#### Chargement des données
En plus du service de chargement, pour pouvoir charger des données il est aussi nécessaire de renseigner la fonction `getLoadParams()` dans `actions`. Cette fonction est un getter qui doit renvoyer un array de paramètres qui sera utilisé à l'appel de `load`. Si `getLoadParams()` ne renvoie rien (`undefined`), alors l'action ne sera pas appelée. Si `getLoadParams()` renvoie un array vide, alors l'action sera appelée sans paramètres.

`getLoadParams` sera utilisé comme une dérivation MobX, dont chaque changement (en plus de l'éventuel appel initial) lancera l'action de `load` en réaction. Cela permet de synchroniser le formulaire sur une autre observable (en particulier un `ViewStore`) et de ne pas avoir à passer par une prop (dont il faudrait gérer manuellement la modification) pour (re)charger le formulaire. Rien n'empêche par contre de définir `getLoadParams` comme `() => [this.props.id]`, mais c'est moins direct que d'utiliser directement l'état concerné. Par conséquent, cela veut dire que tout formulaire (et même écran en général) à usage unique n'a en général pas besoin de props.

#### Méthodes de `FormActions`
`FormActions` expose principalement trois méthodes, qui permettent d'appeler les actions que l'on a enregistrées :
- `load()`, qui si `formNode` est un "vrai" `FormNode`, appelle l'action de `actions.load` avec les paramètres de `actions.getLoadParams` si les deux sont renseignés, et met à jour le noeud origine de `formNode` (et donc `formNode` également).
- `save()`, qui appelle l'action de `actions.save` à partir de l'état actuellement stocké dans `formNode`. Si `formNode` est un "vrai" `FormNode`, alors le résultat de l'action de sauvegarde sera enregistré dans le noeud origine de `formNode` (et donc `formNode` également).
- `toggleEdit(edit)`, qui met à jour l'état d'édition général du `formNode`. Si `edit === false` et `formNode` est un "vrai" `FormNode`, alors `formNode` sera réinitialisé sur l'état du noeud origine.

On voit ici qu'utiliser un sous-node pour `FormActions` est un pratique assez limité. La fonctionnalité existe parce qu'elle ne demandait quasiment aucun temps de développement en plus et qu'elle peut avoir son utilité, en particulier dans des écrans avec plusieurs blocs dont la création est unifiée mais la modification se fait par bloc. Néanmoins, si les limitations de `load` et de `save` ne sont pas gênantes, celle de `toggleEdit` rend probablement la fonctionnalité peu pratique à utiliser. Une évolution future pourrait être de réussir à répéter les propriétés additionelles de `FormNode` (`reset`, `sourceNode`) sur tous les noeuds. Ca serait bien ouais :)

#### Exemples
Premier exemple : formulaire classique d'édition
```ts
actions = makeFormActions(this.entity, { // this.entity est un `formNode` préalablement créé
    getLoadParams: () => homeViewStore.withView(({page, id}) => !page && id && [+id]),
    load: loadStructure,
    save: saveStructure
});
```

Deuxième exemple : formulaire de création avec des options
```ts
actions = makeFormActions(
    this.entity,
    {save: async x  => { mainStore.suivi.evenementList.pushNode(x); return x; }},
    {
        clearBeforeInit: true,
        onFormSaved: () => this.props.close(),
        onToggleEdit: edit => !edit && this.props.close()
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

    entity = makeFormNode(mainStore.structure);
    actions = makeFormActions(this.entity, {
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
