# Module `list`

Le module liste contient les composants de listes et lignes de `focus-components` v2 ainsi que le `ListStore` de `focus-core`.

## Différences avec la v2
* Le `ListStore` se construit avec le service de chargement de la liste en paramètre du constructeur, et les méthodes `load` et `updateProperties` se situent directement sur le store (pour rappel, on n'a plus d'`actionBuilder` donc tout est directement sur le store et plus simple).
* Le composant `ListPage` n'existe plus et est remplacé par une fonction `connectToListStore(store)` qui renvoie les props à fournir à une liste pour, comme son nom l'indique, à un `ListStore`.
* Les lignes ne sont plus des mixins. Le `table.line` n'existe plus et les `selection.line` et `timeline.line` sont remplacés par des HoC qui intègrent les fonctionnalités des mixins. `fieldFor` et consorts sont des fonctions globales de `autofocus/entity` et `renderLineActions` est également directement exposé par le module `list`.
* Les listes ne passent plus toutes leurs props aux lignes, à la place une propriété `lineProps` contient toutes les props pour la ligne. C'est aussi valable pour `listFor` et `tableFor` du coup.
* Un effort important à été réalisé pour essayer de typer toutes les props de tout le monde. En particulier, les listes sont des composants génériques du type de la liste, et ne sont donc pas utilisables en tant que tel en JSX (on ne peut pas faire `<Tableau<T> data={[]} />` et le type de tableau ne peut pas être inféré). L'utiliser comme non typé en JSX est parfaitement valide, sinon il existe des méthodes `ListXXX.create(props)` qui font la même chose et peuvent être typées.