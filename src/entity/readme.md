# Module `entity`

## Entité

Au sein de Focus, on appelle **entité** tout objet "métier" d'une application, à priori issu du (et généré à partir du) modèle de données. C'est un objet d'échange entre le client et le serveur, à partir duquel on va construire tous les rendus et formulaires qui vont peupler une application Focus.

Une entité est constituée de **champs**, objet primitif représentant une des valeurs qui la constitue. Une entité peut également contenir d'autres entités, mais en fin de compte toute la donnée sera représentée comme un ensemble de champs. Un champ est défini par son nom, son caractère obligatoire, son type (au choix parmi `string`, `number`, `boolean`, ou un array de ceux-ci) et son domaine.

Le **domaine** d'un champ répresente le type de donnée métier qui lui est associé (par exemple : une date, un numéro de téléphone, un montant...). On se sert du domaine pour définir des validateurs de saisie, des formatteurs, ou encore des composants de saisie/présentation/libellé personnalisés.

## Stockage des entités : `EntityStore`
Une entité retournée directement depuis le serveur est, comme tout le reste, un objet JSON simple. Parfois, pour diverses raisons, c'est bien la donnée seule qui nous intéresse. Dans ce cas, il suffit de stocker cette donnée dans une simple observable et de l'utiliser comme n'importe quel autre état. Dans d'autres cas, cette donnée est une liste que l'on voudra manipuler. Ici, il faudra s'orienter vers le module **`list`** et ses stores spécialisés.

Par contre, si vous avez besoin d'utiliser les **métadonnées** associées à l'entité pour construire un quelconque formulaire, ou bien si vous voulez simplement afficher quelques champs formattés avec leurs libellés, Focus met à disposition un **`EntityStore`**, un store d'entités pour un stockage qui consolide toutes les valeurs de champs avec leurs métadonnées, pour une consommation simplifiée.

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

A partir des champs ainsi déclarés (dans un objet appelé `EntityField`), on va pouvoir construire des méthodes simples pour les consommer. A noter que l'usage d'un `EntityStore` n'est pas la seule façon de créer des champs, comme montré plus bas.

## Constitution et APIs des noeuds
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

## API de l'`EntityStore`

### `makeEntityStore(config)`
La fonction `makeEntityStore` permet de créer un nouvel `EntityStore` à partir d'un objet de configuration. Cette objet peut contenir :
- Des objets de définition d'entité (généralement générés sous le nom `OperationEntity`), pour générér les `StoreNode`s correspondants.
- Des arrays contenants un objet d'entité (`[OperationEntity]`), pour générer les `StoreListNode`s correspondants.
- Des `StoreNode`s existants, créés à partir d'un autre `EntityStore`. Cela permet de les rattacher aux méthodes `set` et `clear` du store, pour associer des ensembles d'entités liées.

### `toFlatValues(node)`
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
Jusqu'ici, on est capable de créer des champs à partir de noeuds, mais ces champs ont été initialisés et figés par la définition initiale des entités générées depuis le modèle. Or bien souvent, on peut avoir besoin de modifier une métadonnée en particulier, ou bien d'avoir à remplacer un composant dans un écran précis pour un champ donné. Et même, on peut vouloir créer un champ à la volée sans avoir besoin d'insérer toute une entité dans un `EntityStore`.

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


## Création d'un formulaire : noeud de formulaire (`FormNode`).
TODO

## Création d'un formulaire : actions de formulaires
TODO

## Création d'un formulaire : `<Form>` (et `<Panel>`)
TODO

## AutoForm (OBSOLETE, A METTRE A JOUR ASAP)
L'`AutoForm` est une classe dont un composant de formulaire doit hériter. C'est le remplacant du `formMixin` de la v2.

C'est un "vestige" de Focus v2 qui fait le travail qu'on lui demande de façon très simple et les comportements qu'il apporte ne sont pas reproductibles simplement d'une autre manière. Focus v3 en est un excellent exemple. C'est la seule classe de base (ou seul équivalent "mixin") de la librairie (la v2 possède une 20taine de mixins et la v3 5 ou 6 connecteurs, à titre de comparaison), et son usage est très précis : **c'est pour faire un formulaire**, avec :
* un service de chargement (ou pas, si formulaire de création)
* un service de sauvegarde
* un état consulation/modification
* un state interne initialisé par un store, miroir synchrone de l'état des champs qu'on l'on saisit
* de la validation de champs avec gestion d'erreurs

En somme, **un formulaire**.

Au risque de se répeter, **si vous ne faites pas un écran de formulaire, n'utilisez pas `AutoForm`**. Les fonctions `fieldFor` et co. sont disponibles dans la librairie et utilisables directement avec des stores, les composants sont synchronisés automatiquement avec les stores avec `@observer`, donc tous les cas de "non formulaire" sont gérés de façon beaucoup plus élégante, simple et souple qu'avec l'`AutoForm`. N'oubliez pas que le [starter kit](http://www.github.com/get-focus/focus4-starter-kit) fait également office de démo et présente les cas d'usages les plus courants.

### Configuration
La config d'un formulaire se fait intégralement dans la méthode `init()` dans laquelle il faut appeler la méthode `formInit()`, dont les paramètres sont :
* `storeData`, le noeud de store sur lequel on veut créer un formulaire. La seule contrainte sur `storeData` est qu'il doit respecter l'interface `StoreNode`, c'est-à-dire posséder les méthodes `set()` et `clear()`. On peut donc faire des formulaires sur des objets, des arrays, avec le degré de composition qu'on veut. Attention tout de même, l'utilisation de `this.fieldFor` est restrainte pour des formulaires sur des objets simples. L'apport de `this.fieldFor` par rapport à `fieldFor` étant minimal, il est facilement possible de faire des folies sur un formulaire car tout le boulot est fait par MobX et l'EntityStore. En Typescript, le type de `storeData` doit être spécifié en tant que deuxième paramètre de la classe parente.
* `serviceConfig`, qui est un objet contenant **les services** de `load` et de `save` (les actions n'existant plus en tant que telles, on saute l'étape), ainsi que la fonction `getLoadParams()` qui doit retourner les paramètres du `load`. Cette fonction sera appelée pendant `componentWillMount` puis une réaction MobX sera construite sur cette fonction : à chaque fois qu'une des observables utilisées dans la fonction est modifiée et que la valeur retournée à structurellement changée, le formulaire sera rechargé. Cela permet de synchroniser le formulaire sur une autre observable (en particulier un `ViewStore`) et de ne pas avoir à passer par une prop pour charger le formulaire. Rien n'empêche par contre de définir `getLoadParams` comme `() => [this.props.id]` et par conséquent de ne pas bénéficier de la réaction. C'est une moins bonne solution.
* `options?`, un objet qui contient des options de configuration secondaires.

### this.entity et FormNode
Le formulaire construit un `FormNode` qu'il place dans la propriété `this.entity` à partir de `storeData`. C'est une copie conforme de `storeData` et fera office de state interne au formulaire (il est possible de passer son propre `FormNode` dans les options du constructeur si on veut externaliser le state du formulaire).

Le FormNode possède une méthode `reset` (qui s'ajoute en plus de tout ce que contient déjà `storeData` en tant que `StoreNode`) qui lui permet de se resynchroniser sur les valeurs de `storeData`. Une réaction MobX est enregistrée à la création qui va appeler cette fonction à chaque modification de store. En attendant, `this.entity` est librement modifiable et est synchronisé avec l'état des champs (via le `onChange` passé par le `this.fieldFor` si on l'utilise, sinon on peut le faire à la main).

L'appel de `load()` va appeler le service et mettre le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `save()` sur le formulaire va appeler le service avec la valeur courante de `this.entity` et récupérer le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `cancel()` sur le formulaire appelle simplement `this.entity.reset()`.

Il est important de noter que puisque les valeurs de stores sont toutes stockées dans un objet `{$field, value}`, copier cette objet puis modifier `value` va modifier la valeur initiale. C'est très pratique lorsque le contenu du store ne correspond pas à ce qu'on veut afficher, puisqu'il n'y a pas besoin de se soucier de mettre à jour le store lorsque l'on modifier sa transformée. `createFormNode` construit une copie profonde du store, ce qui veut dire que ceci ne s'applique pas de `this.entity` vers `storeData` (heureusement !).

### Autres fonctionnalités
* Chaque `Field` gère ses erreurs et expose un champ dérivé `error` qui contient le message d'erreur courant (ou `undefined` du coup s'il n'y en a pas), surchargeable par la prop `error` (passée au `Field` par `this.fieldFor` dans le cas d'une erreur serveur). Pour la validation du formulaire, on parcourt tous les champs (d'où la `ref` passée par `this.fieldFor`) et on regarde s'il y a des erreurs.
* `onChange` et `isEdit`, passés aux `Field`s par `this.fieldFor` permettent respectivement de synchroniser `this.entity` avec les valeurs courantes des champs et de spécifier l'état du formulaire.
* La suppression des actions à entraîné une migration des fonctionnalités annexes de `l'actionBuilder` et du `CoreStore`, en particulier sur la gestion des erreurs. Le traitement des erreurs de services à été décalé dans `coreFetch` (exposé par `httpGet`, `httpPost`...) dans le module `network` (ce qui fait que toutes les erreurs de services vont s'enregistrer dans le `MessageCenter`, pas seulement quand on utilise des actions), et le stockage des erreurs de validation a été déplacé dans le formulaire. De même, l'état `isLoading` est porté par le formulaire.
* Le formulaire possède également des méthodes à surcharger `onFormLoaded`, `onFormSaved` et `onFormDeleted` pour placer des actions après ces évènements.

### Exemple de formulaire (issu du starter kit)

```tsx
import {AutoForm, i18n, observer, Panel, React} from "focus4";

import {StructureNode} from "../../model/main/structure";
import {loadStructure, saveStructure} from "../../services/main";
import {mainStore} from "../../stores/main";
import {referenceStore} from "../../stores/reference";

@observer
export class Form extends AutoForm<{}, StructureNode> {

    init() {
        this.formInit(mainStore.structure, {getLoadParams: () => [], load: loadStructure, save: saveStructure});
    }

    renderContent() {
        const {denominationSociale, capitalSocial, statutJuridiqueCode} = this.entity;
        return (
            <Panel title="form.title" {...this.getPanelButtonProps()}>
                {i18next.t("form.content")}
                {this.fieldFor(denominationSociale)}
                {this.fieldFor(capitalSocial)}
                {this.selectFor(statutJuridiqueCode, referenceStore.statutJuridique, {labelKey: "libelle"})}
            </Panel>
        );
    }
}
```
