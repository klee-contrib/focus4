# Les actions de formulaires : `FormActions`

Une fois le `FormNode` créé, on aura besoin d'un deuxième objet pour gérer le cycle de vie du formulaire : un `FormActions`.

Il se crée à partir d'un `FormNode` via un `FormActionsBuilder`. En pratique, un `FormActions` sera créé via [**`makeFormActions`**](../forms#makeFormActions).

Il contiendra et gérera les actions de chargement et de sauvegarde.

## Chargement des données

Pour pouvoir charger des données dans un formulaire, il faudra renseigner un service de chargement. En plus du service de chargement, il faudra aussi lui donner des **paramètres**. Ces paramètres pourront être soit statiques, soit obtenus par une fonction, qui sera utilisée comme une **dérivation MobX** pour créer une réaction qui rechargera le formulaire à chaque fois qu'ils changent.

Définir les paramètres comme une dérivation permettra de synchroniser le contenu du formulaire (en particulier en consultation) sur la valeur d'une observable externe, qui peut être un état global de l'application (dans un `ViewStore` par exemple), ou tout simplement des props du composant React.

## `FormActionsBuilder`

Il dispose des méthodes suivantes :

### `params(() => params)`/`params(params)`

Cette méthode permet de définir les paramètres de la fonction de chargement. Ils peuvent prendre la forme :

-   D'une valeur simple, par exemple `params(data.id)`.
-   D'un array, par exemple `params([data.id, data.type])`, pour gérer le cas ou la fonction de chargement prend plusieurs paramètres
-   D'une fonction qui renvoie une valeur simple, par exemple `params(() => data.id)`, pour créer la réaction de rechargement
-   D'une fonction qui renvoie un array, par exemple `params(() => [data.id, data.type])`.

Pour information, cela veut dire que tout ça est identique :

```ts
params(() => [1]);
params(() => 1);
params([1]);
params(1);
```

Il est possible d'appeler `params()` tel quel, sans arguments, pour indiquer que le service de chargement ne prend pas de paramètres.

Si vous devez renvoyer plusieurs paramètres non fixes, alors il faudra marquer l'array renvoyé comme `as const` (cf. `load` juste en dessous). Exemple : `params(() => [this.props.id, "test"] as const)`

_Remarque : Si `params` est appelé avec `undefined` ou si la fonction passée renvoie `undefined`, la service de chargement **ne sera pas appelé**. Cela permet par exemple de gérer des formulaires en mode création et modification en désactivant simplement le service de chargement s'il n'y a pas d'id, par exemple. Attention tout de même à `params([])` qui correspond à `params()` et qui appelle sans paramètres le service, et à `params([undefined])` qui appellera quand même le service avec `undefined` comme paramètre._

### `load(service)`

Permet de préciser le service de chargement. **params() doit être appelé avant car il type les paramètres de load**.

### `save(service, name?)`

Permet de préciser un service de sauvegarde. Il est possible d'en spécifier plusieurs : pour se faire il suffit de renseigner le deuxième paramètre `name` avec le nom du service désiré (le service sans nom est appelé `"default"` et sera accessible sous `actions.save()`)

### `on(events, handler)`

La fonction `on` permet de définir un handler d'évènements autour des actions et permet de spécifier soit plusieurs fonctions par évènement, soit une fonction pour plusieurs évènements.

Les évènements possibles (premier paramètres) sont : `"error"`, `"load"`, `"save"`, `"cancel"` et `"edit"`. On peut en spécifier un seul ou bien un array d'évènements. Le handler passé en second paramètre sera appelé avec le nom de l'évènement qui l'a déclenché, ainsi que le nom du save pour `"error"` et `"save"`.

### `i18nPrefix(prefix)`

Après un appel à un service de sauvegarde avec succès, un message sera affiché, dont la clé i18n par défaut est `"focus.detail.saved"`. `i18nPrefix()` permet de remplacer `"focus"` par autre chose.

Par ailleurs, si le contenu du message d'erreur est vide (par exemple avec un préfixe personnalisé), le message ne sera pas affiché après sauvegarde.

### `useSaveNamesForMessages()`

Cette méthode permet de demander à ce que le nom du service de sauvegarde (ce qui n'est utile que s'il n'y a plusieurs) soit inclus dans le message de succès, comme ceci : `"focus.detail.{saveName}.saved"`.

## API de `FormActions`

### `load()`

Appelle le service de chargement, avec les paramètres, et met à jour le noeud de formulaire. Cette méthode sera appelée à la création des actions.

### `save()`

Appelle le service de sauvegarde par défaut avec la valeur courante du noeud de formulaire, puis enregistre le retour du service (si non vide) dans le **noeud source** du formulaire (qui mettra ensuite le formulaire à jour). Si l'état d'édition du noeud de formulaire n'est pas forcé, elle repassera également le formulaire en consultation.

Les autres services de sauvegarde sont disponibles sous le nom qui leur a été donné, et leur comportement est le même.

### `isLoading`

Précise si le formulaire est en cours de chargement ou de sauvegarde.

### `onClickEdit`/`onClickCancel`

Ce sont les méthodes à passer à des boutons de formulaires pour passer en mode édition / retourner en consultation. Elles appellent aussi les handlers correspondants.

### `forceErrorDisplay`

Ce booléen est renseigné automatiquement lors de l'appel de save, il permet de forcer l'affichage des erreurs sur les champs.

### `panelProps` et `formProps`

Ce sont des propriétés qui regroupent l'ensemble des propriétés du `FormActions` à passer au composant de Panel (boutons, loading, save) et au composant de Formulaire (save, forceErrorDisplay).

## Exemple

Premier exemple : formulaire classique d'édition

```ts
const actions = new FormActionsBuilder(node)
    .params(() => props.id)
    .load(loadStructure)
    .save(saveStructure)
    .on(["save", "cancel"], () => props.close())
    .build();
```
