# Module `list`

## ListStore et affiliés
Un `ListStore` ressemble beaucoup à son homologue de la V2, à l'exception près qu'il gère également la sélection en plus du tri. De plus, étant finalement très proche du `SearchStore`, les deux partagent désormais beaucoup de fonctionnalités via le store abstrait commun `ListStoreBase`.

Cela permet de simplifier grandement l'usage des listes (la recherche étant déjà un composant tout intégré, son usage est déjà bien guidé) et de marquer une vraie distinction entre les listes "simples" (posées par des `listFor` à partir d'un bête array) et les listes "complexes" avec tri + sélection, qui seront forcément "backées" par un `ListStore` ou `SearchStore`.

Le `ListStore` à maintenant un deuxième mode de fonctionnement dans lequel on lui donne une liste à la place d'un service de chargement. Ainsi, on pourra bénéficier d'un tri local intégré (et de la sélection) via le store, au lieu d'être obligé de passer par le serveur.

## Composants

Les composants de listes sont maintenant tous basés sur `ListBase`, qui regroupe les fonctionnalités de `MemoryList` + tout ce qui est commun à toutes les listes (affichage partiel et scroll princiapelement).

On a donc, pour les composants de base :
* `List`, posable par `listFor` (les deux font exactement la même chose), qui est une bête liste qui prend les données en props.
* `Table`, posable par `tableFor` (les deux font exactement la même chose), qui est un bête tableau qui prend les données en props.
* `Timeline`, posable par `timelineFor` (les deux font exactement la même chose), qui est un bête timeline qui prend les données en props.

Et pour les composants liés à un `ListStoreBase`:
* `StoreList`, équivalent de l'ancien `ListSelection`, qui est lié à un store et peut gérer de la sélection (ou pas) (le tri est géré par une `ActionBar`).
* `StoreTable`, équivalent de l'ancien `ListTable`, qui est lié à un store et peut gérer du tri au niveau des colonnes.

Pour les deux précédents, la liste utilisée est passable en props (obligatoire pour le `SearchStore`, override `ListStore.dataList` sinon).

**Il n'y a plus de composants/HOC/mixin pour les lignes.** Tout est directement intégré aux composants de listes : le `StoreList` wrappe dans le container de séléction si on active la sélection, le `Timeline` wrappe dans le container de timeline. `renderLineActions` est toujours disponible séparément. S'il y a besoin de comportements particuliers sur certaines lignes, il est toujours possible d'interagir avec le store directement.

Pour faire un composant de liste personnalisé qui reprend tout de même les fonctionalités de `MemoryList`/`ListBase`, il suffit de dériver de `ListBase` et d'implémenter au moins un `render()` (et `get data()`). `List`, `Table` et `Timeline` sont des exemples à suivre. Cela remplace `listFor(data, {ListComponent})`, qui est maintenant uniquement réservé à une liste simple.
