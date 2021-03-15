# (LEGACY) Module `legacy`

Permet d'utiliser les anciens formulaires (pré-v9) à partir du module `stores`.

### API

#### `displayFor(field, options?)`

Même chose que `fieldFor` mais avec `isEdit = false`.

#### `fieldFor(field, options?)`

La fonction `fieldFor`, permettent de créer un champ d'entrée ou d'affichage avec un libellé, en utilisant les composants du domaine ou par défaut. Elle prend comme paramètres :

-   `field`, l'`EntityField` contenant la valeur et les métadonnées du champ à afficher. La plupart du temps, `field` est une propriété dans un `EntityStore`, mais il est également possible de le créer à la volée. Il est également possible de passer directement une valeur s'il n'y a pas de métadonnées associées (elles seront toutes vides du coup).
-   `options`, les différentes options à passer au champ. On y retrouve les props du `Field`, comportant entre autres les propriétés `inputProps`, `displayProps` et `labelProps` qui seront les props supplémentaires à passer aux différents composants du `Field`.

Par défaut, `fieldFor` utilise les composants `InputComponent`, `DisplayComponent` et `LabelComponent` définis dans le domaine. Si ces composants ne sont pas renseignés, alors il utilisera les composants par défaut (en particulier, un `InputText` pour l'input). Il est possible de surcharger localement ces composants en les respécifiant dans les options. Si le typage des domaines et des entités est bien fait, alors `inputProps` et consorts seront bien typés avec les props du composant qui sera utilisé.

#### `selectFor(field, values, options?)`

La fonction `selectFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec une liste de référence. Elle utilise un composant `Select` par défaut comme composant d'input et renseigne `options.values` avec le paramètre `values`.

-   `field`, comme `fieldFor`, à la différence près qu'on accepte que des `EntityField`.
-   `values`, la liste des valeurs de la liste de référence à utilise pour résoudre le code.
-   `options`, comme `fieldfor`.

`selectFor` vérifie également le type de la liste de référence en fonction du type du champ et de la présence des propriétés de bon type `valueKey` et `labelKey`. Par défaut, il cherche des propriétés `code` et `label`, qui sont surchargeables dans les options. Attention de bien caster `valueKey` et `labelKey` en eux-même (par exemple `{valueKey: "id" as "id}`) pour que l'inférence de type cherche bien la propriété `id` et non toutes les propriétés de l'objet.

## AutoForm

L'`AutoForm` est une classe dont un composant de formulaire doit hériter. C'est le remplacant du `formMixin` de la v2.

C'est un "vestige" de Focus v2 qui fait le travail qu'on lui demande de façon très simple et les comportements qu'il apporte ne sont pas reproductibles simplement d'une autre manière. Focus v3 en est un excellent exemple. C'est la seule classe de base (ou seul équivalent "mixin") de la librairie (la v2 possède une 20taine de mixins et la v3 5 ou 6 connecteurs, à titre de comparaison), et son usage est très précis : **c'est pour faire un formulaire**, avec :

-   un service de chargement
-   un service de sauvegarde
-   un état consulation/modification
-   un state interne initialisé par un store, miroir synchrone de l'état des champs qu'on l'on saisit
-   de la validation de champs avec gestion d'erreurs

En somme, **un formulaire**.

Au risque de se répeter, **si vous ne faites pas un écran de formulaire, n'utilisez pas `AutoForm`**. Les fonctions `fieldFor` et co. sont disponibles dans la librairie et utilisables directement avec des stores, les composants sont synchronisés automatiquement avec les stores avec `@observer`, donc tous les cas de "non formulaire" sont gérés de façon beaucoup plus élégante, simple et souple qu'avec l'`AutoForm`. N'oubliez pas que le [starter kit](http://www.github.com/get-focus/focus4-starter-kit) fait également office de démo et présente les cas d'usages les plus courants.

### Configuration

La config d'un formulaire se fait intégralement dans la méthode `init()` dans laquelle il faut appeler la méthode `formInit()`, dont les paramètres sont :

-   `storeData`, le noeud de store sur lequel on veut créer un formulaire. La seule contrainte sur `storeData` est qu'il doit respecter l'interface `StoreNode`, c'est-à-dire posséder les méthodes `set()` et `clear()`. On peut donc faire des formulaires sur des objets, des arrays, avec le degré de composition qu'on veut. Attention tout de même, l'utilisation de `this.fieldFor` est restrainte pour des formulaires sur des objets simples. L'apport de `this.fieldFor` par rapport à `fieldFor` étant minimal, il est facilement possible de faire des folies sur un formulaire car tout le boulot est fait par MobX et l'EntityStore. En Typescript, le type de `storeData` doit être spécifié en tant que deuxième paramètre de la classe parente.
-   `serviceConfig`, qui est un objet contenant **les services** de `load` et de `save` (les actions n'existant plus en tant que telles, on saute l'étape), ainsi que la fonction `getLoadParams()` qui doit retourner les paramètres du `load`. Cette fonction sera appelée pendant `componentWillMount` puis une réaction MobX sera construite sur cette fonction : à chaque fois qu'une des observables utilisées dans la fonction est modifiée et que la valeur retournée à structurellement changée, le formulaire sera rechargé. Cela permet de synchroniser le formulaire sur une autre observable (en particulier un `ViewStore`) et de ne pas avoir à passer par une prop pour charger le formulaire. Rien n'empêche par contre de définir `getLoadParams` comme `() => [this.props.id]` et par conséquent de ne pas bénéficier de la réaction. C'est une moins bonne solution.
-   `options?`, un objet qui contient des options de configuration secondaires.

### this.entity et ViewModel

Le formulaire construit un `ViewModel` qu'il place dans la propriété `this.entity` à partir de `storeData`. C'est une copie conforme de `storeData` et fera office de state interne au formulaire (il est possible de passer son propre `ViewModel` dans les options du constructeur si on veut externaliser le state du formulaire).

Le ViewModel possède une méthode `reset` (qui s'ajoute en plus de tout ce que contient déjà `storeData` en tant que `StoreNode`) qui lui permet de se resynchroniser sur les valeurs de `storeData`. Une réaction MobX est enregistrée à la création qui va appeler cette fonction à chaque modification de store. En attendant, `this.entity` est librement modifiable et est synchronisé avec l'état des champs (via le `onChange` passé par le `this.fieldFor` si on l'utilise, sinon on peut le faire à la main).

L'appel de `load()` va appeler le service et mettre le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `save()` sur le formulaire va appeler le service avec la valeur courante de `this.entity` et récupérer le résultat dans le store, qui via la réaction mettra à jour `this.entity`.

L'appel de `cancel()` sur le formulaire appelle simplement `this.entity.reset()`.

Il est important de noter que puisque les valeurs de stores sont toutes stockées dans un objet `{$entity, value}`, copier cette objet puis modifier `value` va modifier la valeur initiale. C'est très pratique lorsque le contenu du store ne correspond pas à ce qu'on veut afficher, puisqu'il n'y a pas besoin de se soucier de mettre à jour le store lorsque l'on modifier sa transformée. `createViewModel` construit une copie profonde du store, ce qui veut dire que ceci ne s'applique pas de `this.entity` vers `storeData` (heureusement !).

### Autres fonctionnalités

-   Chaque `Field` gère ses erreurs et expose un champ dérivé `error` qui contient le message d'erreur courant (ou `undefined` du coup s'il n'y en a pas), surchargeable par la prop `error` (passée au `Field` par `this.fieldFor` dans le cas d'une erreur serveur). Pour la validation du formulaire, on parcourt tous les champs (d'où la `ref` passée par `this.fieldFor`) et on regarde s'il y a des erreurs.
-   `onChange` et `isEdit`, passés aux `Field`s par `this.fieldFor` permettent respectivement de synchroniser `this.entity` avec les valeurs courantes des champs et de spécifier l'état du formulaire.
-   La suppression des actions à entraîné une migration des fonctionnalités annexes de `l'actionBuilder` et du `CoreStore`, en particulier sur la gestion des erreurs. Le traitement des erreurs de services à été décalé dans `coreFetch` dans le module `network` (ce qui fait que toutes les erreurs de services vont s'enregistrer dans le `MessageCenter`, pas seulement quand on utilise des actions), et le stockage des erreurs de validation a été déplacé dans le formulaire. De même, l'état `isLoading` est porté par le formulaire.
-   Le formulaire possède également des méthodes à surcharger `onFormLoaded`, `onFormSaved` et `onFormDeleted` pour placer des actions après ces évènements.

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
