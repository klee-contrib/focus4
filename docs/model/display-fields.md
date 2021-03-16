# Afficher des champs

Un champ n'est qu'un objet de la forme `{$field, value}`, donc de manière générale il suffira d'utiliser `field.value` pour récupérer la valeur pour en faire ce dont on en a besoin.

En revanche, et c'est bien l'intérêt d'avoir un objet `$field` qui contient les métadonnées du champ, on peut utiliser les fonctions suivantes sur un champ pour obtenir un résultat plus qualitatif.

## `stringFor(field, values?)`

Cette fonction permet d'obtenir la représentation textuelle de la valeur d'un champ.

-   `field`, un `EntityField`
-   `values`, une éventuelle liste de référence.

## `fieldFor(field, options?)`

C'est la fonction principale, elle permet d'afficher un champ avec son libellé, à partir de ses métadonnées (en particulier le domaine). Elle prend comme paramètres :

-   `field`, un `EntityField`
-   `options`, les différentes options à passer au champ. Il ne s'agit uniquement de props pour le composant de Field, et _il n'y est pas possible de surcharger les métadonnées du champ_.

Le composant de Field utilisera ses composants par défaut si le domaine ne les renseignent pas (`Input`, `Display` et `Label` de `@focus4/forms`).

## `selectFor(field, values, options?)`

La fonction `selectFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec une liste de référence. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `values`, la liste de référence à utiliser pour résoudre le code.
-   `options`, comme `fieldFor`, avec une option en plus pour personnaliser le composant de `Select`.

## `autocompleteFor(field, options)`

La fonction `autocompleteFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec un champ d'autocomplétion. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `options`, comme `fieldFor`, où il faut également préciser `keyResolver` et/ou `querySearcher` pour gérer la consultation et/ou la saisie. De plus, il y est possible de personnaliser le composant d'`Autocomplete`.
