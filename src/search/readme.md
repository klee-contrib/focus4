# Module `search`

Comme le module `list`, c'est `focus-core/search` + `focus-components/search` + `focus-components/page/search`.

## Différences avec la v2
* Le `SearchStore` est un store unique (pas de distinction quick/advanced) et prend la définition de services `{scoped, unscoped}` (ainsi que le nombre d'éléments de recherche) dans son constructeur. Ce sont les éléments qui étaient auparavent dans l'`actionBuilder`.
* Toutes les actions sont sur le store.
* Un effort (très) important à été réalisé pour typer fortement la recherche, ce qui ne se voit pas beaucoup de l'extérieur mais à permis de clarifier énormément le code source. Beaucoup de petits segments ont été réécrits/optimisés suite à ce travail, mais le fonctionnement global est à peu près inchangé (outre des corrections de bugs).