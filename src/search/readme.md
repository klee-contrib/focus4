# Module `search`

Construit sur le module `list`, il définit un `SearchStore` (basé sur `ListStore`) qui pilote les critères de recherche et maintient à jour les résultats, ainsi que des composants de recherche qui s'interface à ce store, interagissant avec les critères et affichant les résultats.

## `SearchStore`
TODO

## `AdvancedSearch`
L'`AdvancedSearch` est l'assemblage des 4 composants qui constituent la recherche : `Results` (+ un `ListWrapper`), `ActionBar`, `ListSummary` et `FacetBox`.

### `Results`
TODO

### `ActionBar`
TODO

### `ListSummary`
Ce composant est affiché en premier, au-dessus de l'`ActionBar` et du `Results`. Il sert à afficher le résumé de la recherche en cours en listant, dans l'ordre :
* Le nombre de résultats
* Le champ de recherche textuel
* Le scope (masquable)
* Les facettes (masquables)
* Les critères (masquables)
* Le groupe
* Le tri

_(Note : le tri et le groupe ne sont jamais effectifs en même temps)_

### `FacetBox`
TODO

## `SearchBar`
TODO
