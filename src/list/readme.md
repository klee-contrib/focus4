# Module `list`
## Branche list-search-revamp
L'idée derrière le travail réalisé dans cette branche est d'unifier le `ListStore` et le `SearchStore` via un store abstrait commun et d'y regrouper toutes les actions (et états) de listes: principalement le tri et la sélection.

Cela va permettre de simplifier grandement l'usage des listes (la recherche étant déjà un composant tout intégré, son API ne changera pas) et de marquer une vraie distinction entre les listes "simples" (à priori posées par des `listFor` à partir d'un bête array) et les listes "complexes" avec tri + sélection, qui seront forcément dans un `ListStore`. Ce dernier aura maintenant un deuxième mode de fonctionnement dans lequel on lui donne une liste à la place d'un service de chargement. Ainsi, on pourra bénéficier d'un tri local intégré (et de la sélection qui monte dans le store) au lieu de faire des requêtes au serveur pour le faire.

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