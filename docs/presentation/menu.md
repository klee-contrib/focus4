# Menu principal

Le composant `MainMenu` permet d'afficher un menu vertical. En général, il se pose via la propriété `menu` du composant de `Layout`.

Ce composant s'attend à ce qu'on lui pose des `MainMenuItem` comme enfants pour gérer les différents liens du menu, mais il est également possible de passer d'autres enfants pour qu'ils soient également affichés dans le menu (par exemple un logo).

Chaque `MainMenuItem` doit être rattaché à une route, qui sera comparé à la valeur de la prop `activeRoute` qui est passée au `MainMenu`. Si `route === activeRoute`, alors l'item sera affiché comme "actif" dans le menu.

Il est possible de gérer des sous menus : pour se faire, il suffit de passer d'autres `MainMenuItem` en enfants d'un `MainMenuItem`. Comme pour le `MainMenu`, il est possible également de passer d'autres éléments en enfant d'un `MainMenuItem`.

[Exemple sur le starter kit](https://github.com/KleeGroup/focus4-starter-kit/blob/master/src/views/menu.tsx)
