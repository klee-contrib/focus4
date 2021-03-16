# `Layout`

Le `Layout` est le composant racine d'une application Focus. Tous vos composants seront à priori posé dans le `Layout`.

Par défaut, il ne pose qu'un `MessageCenter`, qui est le composant qui permet d'afficher les messages.

Le `Layout` pose un `Scrollable` qui prend tout l'écran (100wh x 100vh), mais il est possible d'utiliser la propriété `menu` pour poser un menu qui prendra de l'espace sur la gauche. Si le menu à gauche doit dépasser de l'écran, alors il y aura automatiquement une scrollbar.
