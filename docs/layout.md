# Module `layout`

Ce module contient le composant racine d'une application Focus : le `Layout`. Il contient l'ensemble des composants de base qui doivent se retrouver dans toutes les pages. Par défaut, il ne pose que l'`ErrorCenter` et le `MessageCenter`, laissant à l'utilisateur le soin de composer son layout comme il le souhaite. Néanmoins, 3 composants sont quasiment toujours présents : le `LayoutContent`, le `Menu` et le `Header`.

## `LayoutContent`

Le composant `LayoutContent` doit encadrer le contenu de l'application. Il permet de le positionner correctement par rapport au `Menu`

## `Menu`

Le composant de `Menu` permet d'afficher un menu fixe à sur la gauche. Il possède un propriété `menus` qui contient la liste de ses éléments (`MenuItem`). Il est possible de faire des sous-menus via la propriété `subMenus` dans un `MenuItem`.

La propriété `activeRoute` du `Menu` va de pair avec la propriété `route` des `MenuItem`s : un item vérifiant `activeRoute === route` sera marqué comme actif.

## `Header`

Le `Header` se construit à partir de tous ses éléments. Un `Header` complet se représente comme ceci :

```tsx
<HeaderScrolling canDeploy={/* ... */}>
    <HeaderTopRow>
        <HeaderBarLeft>{/* ... */}</HeaderBarLeft>
        <HeaderSummary>{/* ... */}</HeaderSummary>
        <HeaderBarRight>{/* ... */}</HeaderBarRight>
    </HeaderTopRow>
    <HeaderContent>{/* ... */}</HeaderContent>
    <HeaderActions primary={/* ... */} secondary={/* ... */} />
</HeaderScrolling>
```

et libre à vous de le personnaliser à votre convenance en ajoutant ou supprimant des éléments, et on contrôlant sont contenu en fonction de la page courante.
