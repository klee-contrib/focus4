# Module `list`

## ListStore et affiliés
Un `ListStore` ressemble beaucoup à son homologue de la V2, à l'exception près qu'il gère également la sélection en plus du tri. De plus, étant finalement très proche du `SearchStore`, les deux partagent désormais beaucoup de fonctionnalités via le store abstrait commun `ListStoreBase`.

Cela permet de simplifier grandement l'usage des listes (la recherche étant déjà un composant tout intégré, son usage est déjà bien guidé) et de marquer une vraie distinction entre les listes "simples" (posées par des `listFor` à partir d'un bête array) et les listes "complexes" avec tri + sélection, qui seront forcément "backées" par un `ListStore` ou `SearchStore`.

Le `ListStore` à maintenant un deuxième mode de fonctionnement dans lequel on lui donne une liste à la place d'un service de chargement. Ainsi, on pourra bénéficier d'un tri local intégré (et de la sélection) via le store, au lieu d'être obligé de passer par le serveur.

## Composants

Les composants de listes sont maintenant tous basés sur `ListBase`, qui regroupe les fonctionnalités de `MemoryList` (v2) + tout ce qui est commun à toutes les listes (affichage partiel et scroll princiapelement).

On a donc, pour les composants de base :
* `List`, posable par `listFor` (les deux font exactement la même chose), qui est une liste qui prend les données en props. Plus de détail sur la liste dans le paragraphe suivant.
* `Table`, posable par `tableFor` (les deux font exactement la même chose), qui est un tableau qui prend les données en props.
* `Timeline`, posable par `timelineFor` (les deux font exactement la même chose), qui est une timeline qui prend les données en props.

Et pour les composants liés à un `ListStoreBase`:
* `StoreList`, posable par `storeListFor`, équivalent de l'ancien `ListSelection`, qui est lié à un store et peut gérer de la sélection (ou pas) (le tri est géré par une `ActionBar`).
* `StoreTable`, posable par `storeTableFor`, équivalent de l'ancien `ListTable`, qui est lié à un store et peut gérer du tri au niveau des colonnes.

Pour les deux précédents, la liste utilisée est passable en props (obligatoire pour le `SearchStore`, override `ListStore.dataList` sinon).

## La liste
Si les composants de tableau et de timeline sont assez simples, la liste possède quelques fonctionnalités supplémentaires :
- La gestion d'un mode liste et d'un mode mosaïque, avec deux composants séparés. (`LineComponent` et `MosaicComponent`)
- La gestion d'un détail d'élément, dont l'affichage se fait par accordéon. (`DetailComponent` et la prop supplémentaire `openDetail` passée aux lignes.)
- La gestion d'un handler d'ajout d'élément (affiché uniquement en mosaïque). (`addItemHandler`)

Un composant transverse **`ListWrapper`** permet de centraliser les paramètres de mode, de taille de mosaïque et d'handler d'ajout d'élément pour partager cet état entre plusieurs listes (c'est déja nativement utilisé par la recherche groupée). Il suffit de poser toutes les listes dans un `ListWrapper` et elles récupéreront l'état via le contexte.

# Module `search`

Construit sur le module `list`, il définit un `SearchStore` (basé sur `ListStore`) qui pilote les critères de recherche et maintient à jour les résultats, ainsi que des composants de recherche qui s'interface à ce store, interagissant avec les critères et affichant les résultats.

## `SearchStore`
Le `SearchStore` est le point central de la recherche : il contient à la fois les différents critères de recherche ainsi que les résultats, en plus de contenir les fonctionnalités du `ListStore` comme la sélection. Chaque changement de critère va relancer la recherche. Son usage standard est très simple puisqu'il est intégralement piloté et affiché par les composants de recherche, mais il est également possible de manipuler les différents critères à la main, qui sont :
* `query` : le champ texte
* `groupingKey` : le champ sur lequel grouper.
* `selectedFacets` : les facettes sélectionnées.
* `sortAsc` : le sens du tri.
* `sortBy`: le champ sur lequel trier.
* `top` : le nombre de résultats à retourner par requête.

A ces critères-là, on peut ajouter un objet de critère `criteria` personnalisé pour ajouter d'autres champs à utiliser pour la recherche. Cet objet sera stocké sous la forme d'un `StoreNode` pour pouvoir construire des champs, avec de la validation, de manière immédiate (par exemple pour des champs de date, de montant...). Ou bien, simplement pour ajouter des critères simples comme un scope ou un ID d'objet pour restreindre la recherche...

Le constructeur prend jusqu'à 3 paramètres :
* `searchService` (obligatoire) : le service de recherche, qui soit respecter impérativement l'API de recherche prévue : `(query: QueryInput) => Promise<QueryOutput<T>>`
* `initialQuery` (facultatif) : les valeurs des critères par défaut à la création du store.
* `criteria` (facultatif) : la description du critère personnalisé. Doit être de la forme `[{} as MyObjectNode, MyObjectEntity]`

_(Note : les deux derniers paramètres sont interchangeables)_

## `AdvancedSearch`
L'`AdvancedSearch` est l'assemblage des 4 composants qui constituent la recherche : `Results` (+ un `ListWrapper`), `ActionBar`, `ListSummary` et `FacetBox`. L'intégralité des props de ces composants se retrouve dans ses props, souvent avec le même nom ou parfois avec un nom un peu différent (exemple : `hideFacets` dans le `ListSummary`, `hideSummaryFacets` dans l'`AdvancedSearch`).

### `Results`
Ce composant permet d'afficher les résultats de la recherche, sous la forme d'une liste unique ou bien de groupes si on souhaite en afficher. Chaque groupe contient une `ActionBar` pour gérer la sélection et les actions associés ainsi qu'une liste. Toutes les listes sont des `StoreList` du module `list` et peuvent donc utiliser toutes leurs fonctionnalités.

### `ActionBar`
Ce composant permet de gérer les différentes actions que l'on peut effectuer sur la recherche en général, ou sur un groupe en particulier. On y retrouve, dans l'ordre :
* La case à cocher de sélection (si `hasSelection = true`).
* Le menu de tri (si `orderableColumnList` a été renseigné).
* Le bouton d'ouverture des filtres (si `hasFacetBox = true`).
* Le menu de groupe (si `hasGroup = true`).
* La barre de recherche (si `hasSearchBar = true`)
* Les actions de sélection (si au moins un élément est sélectionné et que `operationList` a été renseigné).

Lorsqu'un élément au moins a été sélectionné, toutes les autres actions disparaissent pour afficher le nombre d'éléments sélectionnés à la place. Ces mêmes actions sont absentes de l'ActionBar d'un groupe et le nom du groupe est affiché à la place.

### `ListSummary`
Ce composant est affiché en premier, au-dessus de l'`ActionBar` et du `Results`. Il sert à afficher le résumé de la recherche en cours en listant, dans l'ordre :
* Le nombre de résultats
* Le champ de recherche textuel
* Les critères (masquables)
* Les facettes (masquables)
* Le groupe (masquable)
* Le tri (masquable)

_(Note : le tri et le groupe ne sont jamais effectifs en même temps)_

### `FacetBox`
Ce composant affiche le résultats des facettes issues du serveur et permet de les sélectionner. Le composant peut être affiché tel quel (à priori sur la gauche des résultats), ou bien à l'intérieur de l'ActionBar pour des écrans où on n'a pas la place de les afficher sur la gauche.

Par défaut, les facettes n'ayant qu'une seule valeur ne sont pas affichées ; il est possible de forcer leur affichage avec la prop `showSingleValuedFacets`.

## `SearchBar`
La `SearchBar` est un composant indépendant de l'`AdvancedSearch` que l'on peut donc poser séparament (par exemple dans le `Header`) pour gérer la partie textuelle de la recherche.

Le composant agit naturellement sur le champ `query`, mais également sur les critères personnalisés `criteria`, qu'il va par défaut ajouter dans le champ texte pour une saisie manuelle (du genre `criteriaName:criteriaValue` ; ce comportement est désactivable via la prop `disableInputCriteria`). Il est possible également de lui passer un composant personnalisé de saisie des critères qu'il va pouvoir afficher à la demande pour saisir de manière plus précise les différents critères. Enfin, il dispose d'un sélecteur de "scope" que l'on peut activer en précisant `scopeKey` et `scopes`, respectivement le nom de la propriété de `criteria` qui correspond au scope et la liste de ses valeurs possibles.
