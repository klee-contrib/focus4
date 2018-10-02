# Module `collections`

Le module `collections` contient les composants et les stores permettant de gérer et d'afficher de la simple liste jusqu'à une recherche avancée complète.

## Composants de base : `listFor`, `tableFor` (et `timelineFor`)

Ces composants permettent respectivement d'afficher une liste, un tableau ou une timeline. Ils partagent tous la même base qui leur permet de gérer de la pagination (par défaut en "scroll infini"). Leur usage minimal est très simple, il suffit de renseigner la liste en question dans la prop `data` et le composant de ligne `LineComponent`/`MosaicComponent` (resp. `RowComponent` et `TimelineComponent`).

### La liste

Si les composants de tableau et de timeline sont assez simples, la liste possède quelques fonctionnalités supplémentaires :

*   On peut passer et afficher des actions sur chaque élement (`operationList`).
*   Elle peut gérer d'un mode liste et d'un mode mosaïque, avec deux composants séparés. (`LineComponent` et `MosaicComponent`)
*   Elle peut gérer un détail d'élément, dont l'affichage se fait par accordéon. (`DetailComponent` et la prop supplémentaire `openDetail` passée aux lignes.)
*   Les lignes de la liste peuvent être des sources de drag and drop.
*   On peut ajouter un handler d'ajout d'élément (affiché uniquement en mosaïque). (`addItemHandler`)

Un composant transverse **`ListWrapper`** permet de centraliser les paramètres de mode, de taille de mosaïque et d'handler d'ajout d'élément pour partager cet état entre plusieurs listes (ce qui est utilisé nativement par la recherche groupée). Il suffit de poser toutes les listes dans un `ListWrapper` et elles récupéreront l'état via le contexte.

## Stores dédiés : ListStore et SearchStore

Les composants présentés sont suffisants pour un grand nombre de cas simples, mais ils sont incapables d'interagir avec la donnée. Pour se faire, on utilise des **stores de collections**, qui sont au nombre de deux : le `ListStore` et le `SearchStore`.

Les deux stores partagent la même base qui leur permet de gérer de la **sélection** d'élements, et qui définit certains éléments de l'API commune (compteurs, **tri**, **filtrage**).

### `ListStore`

Le `ListStore` est le store le plus simple : on lui affecte une liste pré-chargée dans la propriété `list` et il offre les possibilités de l'API commune précisées au-dessus (le tri et le filtrage sont réalisés à la volée donc).

### `SearchStore`

Le `SearchStore` est prévu pour être associé à un service de recherche, la plupart du temps connecté à un serveur ElasticSearch. Il contient à la fois les différents critères de recherche ainsi que les résultats, en plus de contenir les fonctionnalités communes comme la sélection. Chaque changement de critère va relancer la recherche. Son usage standard est très simple puisqu'il sera intégralement piloté et affiché par les composants de recherche, mais il est également possible de manipuler les différents critères à la main, qui sont :

*   `query` : le champ texte
*   `groupingKey` : le champ sur lequel grouper.
*   `selectedFacets` : les facettes sélectionnées.
*   `sortAsc` : le sens du tri.
*   `sortBy`: le champ sur lequel trier.
*   `top` : le nombre de résultats à retourner par requête.

A ces critères-là, on peut ajouter un objet de critère `criteria` personnalisé pour ajouter d'autres champs à utiliser pour la recherche. Cet objet sera stocké sous la forme d'un `StoreNode` pour pouvoir construire des champs, avec de la validation, de manière immédiate (par exemple pour des champs de date, de montant...). Ou bien, simplement pour ajouter des critères simples comme un scope ou un ID d'objet pour restreindre la recherche.

Le constructeur prend jusqu'à 3 paramètres :

*   `searchService` (obligatoire) : le service de recherche, qui soit respecter impérativement l'API de recherche prévue : `(query: QueryInput) => Promise<QueryOutput<T>>`
*   `initialQuery` (facultatif) : les valeurs des critères par défaut à la création du store.
*   `criteria` (facultatif) : la description du critère personnalisé. Doit être de la forme `[{} as MyObjectNode, MyObjectEntity]`

_(Note : les deux derniers paramètres sont interchangeables)_

## Composants de stores

S'il est possible d'utiliser les composants de base avec un store, il existe toute une suite de composants destinés à un usage avec un store.

### Listes

*   Le composant de liste `listFor` devient `storeListFor`, et il propose en plus :
    *   L'affichage des cases de sélection sur chaque ligne
    *   La pagination serveur en plus de la pagination locale (les deux peuvent être utilisées en même temps)
*   Le composant de tableau `tableFor` devient `storeTableFor`, et il propose en plus :
    *   Le tri au niveau des colonnes
    *   La pagination serveur (idem `storeListFor`)

### `ActionBar`

C'est le composant principal pour piloter un store (liste ou recherche). On y retrouve, dans l'ordre :

*   La case à cocher de sélection (si `hasSelection = true`).
*   Le menu de tri (si `orderableColumnList` a été renseigné).
*   Le bouton d'ouverture des filtres (si `hasFacetBox = true`).
*   Le menu de groupe (si `hasGroup = true`).
*   La barre de recherche (si `hasSearchBar = true`)
*   Les actions de sélection (si au moins un élément est sélectionné et que `operationList` a été renseigné).

Lorsqu'un élément au moins a été sélectionné, toutes les autres actions disparaissent pour afficher le nombre d'éléments sélectionnés à la place. Ces mêmes actions sont absentes de l'ActionBar d'un groupe et le nom du groupe est affiché à la place.

### `AdvancedSearch`

L'`AdvancedSearch` est l'assemblage des 4 composants qui constituent la recherche : `Results` (+ un `ListWrapper`), `ActionBar`, `ListSummary` et `FacetBox`. L'intégralité des props de ces composants se retrouve dans ses props, souvent avec le même nom ou parfois avec un nom un peu différent (exemple : `hideFacets` dans le `ListSummary`, `hideSummaryFacets` dans l'`AdvancedSearch`).

### `Results`

Ce composant permet d'afficher les résultats de la recherche, sous la forme d'une liste unique ou bien de groupes si on souhaite en afficher. Chaque groupe est muni d'un header qui peut être soit un header simple avec une case de sélection et le nom du groupe, soit une `ActionBar` si on veut gérer des actions spécifiques au niveau du groupe (prop `useGroupActionBars`). Toutes les listes sont des `storeListFor` et peuvent donc utiliser toutes leurs fonctionnalités.

### `ListSummary`

Ce composant est affiché en premier, au-dessus de l'`ActionBar` et du `Results`. Il sert à afficher le résumé de la recherche en cours en listant, dans l'ordre :

*   Le nombre de résultats
*   Le champ de recherche textuel
*   Les critères (masquables)
*   Les facettes (masquables)
*   Le groupe (masquable)
*   Le tri (masquable)

_(Note : le tri et le groupe ne sont jamais effectifs en même temps)_

### `FacetBox`

Ce composant affiche le résultats des facettes issues du serveur et permet de les sélectionner. Le composant peut être affiché tel quel (à priori sur la gauche des résultats), ou bien à l'intérieur de l'ActionBar pour des écrans où on n'a pas la place de les afficher sur la gauche.

Par défaut, les facettes n'ayant qu'une seule valeur ne sont pas affichées ; il est possible de forcer leur affichage avec la prop `showSingleValuedFacets`.

### `SearchBar`

La `SearchBar` est un composant indépendant de l'`AdvancedSearch` que l'on peut donc poser séparament (par exemple dans le `Header`) pour gérer la partie textuelle de la recherche.

Le composant agit naturellement sur le champ `query`, mais également sur les critères personnalisés `criteria`, qu'il va par défaut ajouter dans le champ texte pour une saisie manuelle (du genre `criteriaName:criteriaValue` ; ce comportement est désactivable via la prop `disableInputCriteria`). Il est possible également de lui passer un composant personnalisé de saisie des critères qu'il va pouvoir afficher à la demande pour saisir de manière plus précise les différents critères. Enfin, il dispose d'un sélecteur de "scope" que l'on peut activer en précisant `scopeKey` et `scopes`, respectivement le nom de la propriété de `criteria` qui correspond au scope et la liste de ses valeurs possibles.
