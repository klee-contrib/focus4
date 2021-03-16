# Store de collection

## Présentation

Si l'on veut interagir avec les données d'une liste, on peut utiliser un **store de collection** : le **`CollectionStore`**.

Il permet de gérer :

-   Des compteurs d'éléments
-   De la **sélection** d'élements
-   Du **tri**
-   Du **filtrage** par critère
-   Des **facettes**
-   Une répartition en **groupes**

Deux modes sont disponibles pour ce store :

-   le mode **local** : il gère toutes les fonctionnalité du store à partir d'une liste _complète_ préchargée qu'on lui fournit. Dans ce mode-là, tout est géré côté client (facettes, tri, filtrage...). Les possibilités y sont donc limitées, mais devraient tout de même convenir pour des volumes de données faible et du traitement sumple.
-   le mode **server** : il est prévu pour être associé à un service de recherche, la plupart du temps connecté à un serveur ElasticSearch. Dans ce mode là, tous le traitement est géré côté serveur, donc le store n'effectue aucun traitement. Il est tout à fait adapté pour des volumes de données important, où lors que les critères de recherches ne sont pas simples.

## Usage

Son usage standard est très simple puisqu'il sera intégralement piloté et affiché par les composants de recherche, mais il est également possible de manipuler les différents critères à la main, qui sont :

-   `query` : le champ texte
-   `groupingKey` : le champ sur lequel grouper.
-   `inputFacets` : les facettes sélectionnées.
-   `sortAsc` : le sens du tri.
-   `sortBy`: le champ sur lequel trier.
-   `top` : le nombre de résultats à retourner par requête (utilisé en mode `"server"` uniquement)

A ces critères-là, on peut ajouter un objet de critère `criteria` personnalisé pour ajouter d'autres champs à utiliser pour la recherche. Cet objet sera stocké sous la forme d'un `StoreNode` pour pouvoir construire des champs, avec de la validation, de manière immédiate (par exemple pour des champs de date, de montant...). Ou bien, simplement pour ajouter des critères simples comme un scope ou un ID d'objet pour restreindre la recherche.

Le constructeur, en mode `"server"` prend jusqu'à 3 paramètres :

-   `searchService` (obligatoire) : le service de recherche, qui soit respecter impérativement l'API de recherche prévue : `(query: QueryInput) => Promise<QueryOutput<T>>`
-   `initialQuery` (facultatif) : les valeurs des critères par défaut à la création du store.
-   `criteria` (facultatif) : la description du critère personnalisé. Doit être de la forme `[{} as MyObjectNode, MyObjectEntity]`

_(Note : les deux derniers paramètres sont interchangeables)_

## Limitations du mode `"local"`

-   L'objet de critère n'est pas supporté
-   Le filtre sur la barre de recherche ne fait qu'un simple `includes` de la requête dans chacun des champs listés dans `filterFields` (en minuscule)
-   Le filtrage des facettes, en dehors des nombres et de booléens, se fait avec un simple `==` (sachant que toutes les valeurs dans `inputFacets` sont des strings).
