# Composants de listes

Focus propose trois composants de liste : `listFor`, `tableFor` et `timelineFor`.

Ces composants permettent respectivement d'afficher une liste, un tableau ou une timeline. Ils partagent tous la même base qui leur permet de gérer de la pagination (par défaut en "scroll infini"). Leur usage minimal est très simple, il suffit de renseigner la liste en question dans la prop `data` et le composant de ligne `LineComponent`/`MosaicComponent` (resp. `RowComponent` et `TimelineComponent`).

## La liste

Si les composants de tableau et de timeline sont assez simples, la liste possède quelques fonctionnalités supplémentaires :

-   On peut passer et afficher des actions sur chaque élement (`operationList`).
-   Elle peut gérer d'un mode liste et d'un mode mosaïque, avec deux composants séparés. (`LineComponent` et `MosaicComponent`)
-   Elle peut gérer un détail d'élément, dont l'affichage se fait par accordéon. (`DetailComponent` et la prop supplémentaire `openDetail` passée aux lignes.)
-   Les lignes de la liste peuvent être des sources de drag and drop.
-   On peut ajouter un handler d'ajout d'élément (affiché uniquement en mosaïque). (`addItemHandler`)
