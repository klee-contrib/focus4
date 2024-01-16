# Chargement des données

Une fois un `StoreNode` créé, on va rapidement vouloir insérer des données dedans en provenance du serveur.

A première vue, rien de plus simple : on appelle un service quelconque, on récupère son résultat et on appelle `node.replace(data)` pour y enregistrer des données. Il n'y a rien de mal à procéder de cette manière.

En revanche, le besoin lié au chargement des données n'est en général pas simplement l'affaire d'appeler un service une fois pour toute. Bien souvent, il va falloir :

-   Recharger les données quand les paramètres changent (par exemple : un id différent)
-   Recharger les données quand elles ont été rendues obsolètes par une action utilisateur, par exemple une sauvegarde.

Le premier point peut être facilement résolu via une combinaison de `useEffect` et/ou `autorun`, qui permettra de relancer un `node.replace(await loadService(id))` à chaque fois que `id` change. Pour le deuxième, il faudra de toute façon recharger manuellement les données aux bons endroits, ce que l'on peut faire en rappelant `node.replace(await loadService(id))` la ou il faut (en s'assurant que l'id est le même).

Néanmoins, c'est un peu fastidieux, donc on va abstraire une bonne partie de cette mécanique et l'intégrer directement au `StoreNode` :

## `useLoad` et `node.load()`

Focus met à disposition le hook **`useLoad`**, à utiliser dans un composant React, pour attacher un service de chargement à un `StoreNode`. Il s'utilise de la manière suivante :

```ts
const [isLoading] = useLoad(storeNode, a => a.params(() => state.id).load(loadService));
```

Il prend le `StoreNode` en premier paramètre et la description du service de chargement (le service et ses paramètres) en deuxième paramètre, via un `NodeLoadBuilder`, décrit en dessous. Il retourne un état de chargement qui indique si la requête est en cours.

_Remarque : En dehors d'un composant fonction React, il est possible d'utiliser la primitive `registerLoad` qui fait la même chose, à intégrer soi-même._

`useLoad` répond aux deux problématiques précédentes :

-   Il définit la fonction `load()` sur le `StoreNode` en premier paramètre, qui pourra être appelée n'importe ou, et qui va appeler le service de chargement avec les paramètres qui ont été définis.
-   Une réaction est posée, qui va appeler `node.load()` à chaque fois que les paramètres changent (ainsi qu'au premier rendu).

`node.load()` est donc défini dès lors qu'un composant avec `useLoad` est affiché à l'écran. Dans le cas inverse, `node.load()` videra simplement le store. Si jamais plusieurs `useLoad` sont actifs en même temps (ce qui n'a pas spécialement de sens mais qui pourrait arriver dans un état transitoire, par exemple d'une popin de création vers une page de détail), c'est le dernier `useLoad` appelé qui sera effectif.

## API de `NodeLoadBuilder`

Il dispose des deux méthodes suivantes :

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

**La réaction de chargement n'est crée que si `params` est appelé avec une fonction.** Cette fonction est équivalente à un "computed" MobX. Si vous voulez quand même bénéficier de la réaction alors que vos paramètres ne sont pas observables, il est possible de spécifier un array de dépendances à `useLoad` comme n'importe quel hook React (ex : `useEffect`) à la place. Cette fonctionnalité n'est disponible qu'avec `useLoad`.

Il est possible d'appeler `params()` tel quel, sans arguments, pour indiquer que le service de chargement ne prend pas de paramètres.

Si vous devez renvoyer plusieurs paramètres non fixes, alors il faudra marquer l'array renvoyé comme `as const` (cf. `load` juste en dessous). Exemple : `params(() => [this.props.id, "test"] as const)`

_Remarque : Si `params` est appelé avec `undefined` ou si la fonction passée renvoie `undefined`, la service de chargement **ne sera pas appelé**. Cela permet par exemple de gérer des formulaires en mode création et modification en désactivant simplement le service de chargement s'il n'y a pas d'id, par exemple. Attention tout de même à `params([])` qui correspond à `params()` et qui appelle sans paramètres le service, et à `params([undefined])` qui appellera quand même le service avec `undefined` comme paramètre._

### `load(service)`

Permet de préciser le service de chargement. **params() doit être appelé avant car il type les paramètres de load**.
