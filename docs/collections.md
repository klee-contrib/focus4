# Module `collections`

Le module `collections` contient les composants et les stores permettant de gérer et d'afficher de la simple liste jusqu'à une recherche avancée complète.

## Composants de base : `listFor`, `tableFor` (et `timelineFor`)

Ces composants permettent respectivement d'afficher une liste, un tableau ou une timeline. Ils partagent tous la même base qui leur permet de gérer de la pagination (par défaut en "scroll infini"). Leur usage minimal est très simple, il suffit de renseigner la liste en question dans la prop `data` et le composant de ligne `LineComponent`/`MosaicComponent` (resp. `RowComponent` et `TimelineComponent`).

### La liste

Si les composants de tableau et de timeline sont assez simples, la liste possède quelques fonctionnalités supplémentaires :

-   On peut passer et afficher des actions sur chaque élement (`operationList`).
-   Elle peut gérer d'un mode liste et d'un mode mosaïque, avec deux composants séparés. (`LineComponent` et `MosaicComponent`)
-   Elle peut gérer un détail d'élément, dont l'affichage se fait par accordéon. (`DetailComponent` et la prop supplémentaire `openDetail` passée aux lignes.)
-   Les lignes de la liste peuvent être des sources de drag and drop.
-   On peut ajouter un handler d'ajout d'élément (affiché uniquement en mosaïque). (`addItemHandler`)

## Composants de stores

S'il est possible d'utiliser les composants de base avec un store, il existe toute une suite de composants destinés à un usage avec un store.

### Listes

Toutes les listes peuvent gérer une pagination serveur si liées à un `SearchStore`. Cette pagination peut être utilisée en plus de la pagination locale. De plus :

-   Le composant de liste `listFor` propose en plus d'afficher des cases de sélection sur chaque ligne
-   Le composant de tableau `tableFor` propose en plus d'afficher des cases de sélection sur chaque ligne et de trier au niveau des colonnes.

### `ActionBar`

C'est le composant principal pour piloter un store (liste ou recherche). On y retrouve, dans l'ordre :

-   La case à cocher de sélection (si `hasSelection = true`).
-   Le menu de tri (si `orderableColumnList` a été renseigné).
-   Le bouton d'ouverture des filtres (si `hasFacetBox = true`).
-   Le menu de groupe (si `hasGroup = true`).
-   La barre de recherche (si `hasSearchBar = true`)
-   Les actions de sélection (si au moins un élément est sélectionné et que `operationList` a été renseigné).

Lorsqu'un élément au moins a été sélectionné, toutes les autres actions disparaissent pour afficher le nombre d'éléments sélectionnés à la place. Ces mêmes actions sont absentes de l'ActionBar d'un groupe et le nom du groupe est affiché à la place.

### `AdvancedSearch`

L'`AdvancedSearch` est l'assemblage des 4 composants qui constituent la recherche : `Results`, `ActionBar`, `ListSummary` et `FacetBox`, ainsi que des actions transverses liés aus listes (mode, ajout). L'intégralité des props de ces composants se retrouve dans ses props, souvent avec le même nom ou parfois avec un nom un peu différent (exemple : `hideFacets` dans le `ListSummary`, `hideSummaryFacets` dans l'`AdvancedSearch`).

### `Results`

Ce composant permet d'afficher les résultats de la recherche, sous la forme d'une liste unique ou bien de groupes si on souhaite en afficher. Chaque groupe est muni d'un header qui peut être soit un header simple avec une case de sélection et le nom du groupe, soit une `ActionBar` si on veut gérer des actions spécifiques au niveau du groupe (prop `useGroupActionBars`). Toutes les listes sont des `storeListFor` et peuvent donc utiliser toutes leurs fonctionnalités.

### `ListSummary`

Ce composant est affiché en premier, au-dessus de l'`ActionBar` et du `Results`. Il sert à afficher le résumé de la recherche en cours en listant, dans l'ordre :

-   Le nombre de résultats
-   Le champ de recherche textuel
-   Les critères (masquables)
-   Les facettes (masquables)
-   Le groupe (masquable)
-   Le tri (masquable)

_(Note : le tri et le groupe ne sont jamais effectifs en même temps)_

### `FacetBox`

Ce composant affiche le résultats des facettes issues du serveur et permet de les sélectionner. Le composant peut être affiché tel quel (à priori sur la gauche des résultats), ou bien à l'intérieur de l'ActionBar pour des écrans où on n'a pas la place de les afficher sur la gauche.

Par défaut, les facettes n'ayant qu'une seule valeur ne sont pas affichées ; il est possible de forcer leur affichage avec la prop `showSingleValuedFacets`.

### `SearchBar`

La `SearchBar` est un composant indépendant de l'`AdvancedSearch` que l'on peut donc poser séparament (par exemple dans le `Header`) pour gérer la partie textuelle de la recherche.

Le composant agit naturellement sur le champ `query`, mais également sur les critères personnalisés `criteria`, qu'il va par défaut ajouter dans le champ texte pour une saisie manuelle (du genre `criteriaName:criteriaValue` ; ce comportement est désactivable via la prop `disableInputCriteria`). Il est possible également de lui passer un composant personnalisé de saisie des critères qu'il va pouvoir afficher à la demande pour saisir de manière plus précise les différents critères. Enfin, il dispose d'un sélecteur de "scope" que l'on peut activer en précisant `scopeKey` et `scopes`, respectivement le nom de la propriété de `criteria` qui correspond au scope et la liste de ses valeurs possibles.
