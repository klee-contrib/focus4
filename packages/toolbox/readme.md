# Module `toolbox`

Réexporte `react-toolbox` dans le but de :

-   Retrouver tous les composants sous le même import (au lieu de tous les "/lib/component")
-   Utiliser le module `styling` pour fournir le CSS aux composants (au lieu du `ThemeProvider` custom et des HoC sans forward ref)
-   Packager le CSS pour éviter de forcer le consommateur à le faire (comme le reste de Focus)
-   Et potentiellement apporter nos propres modifications sur les composants de base (vu que la librairie n'a pas bougé depuis un bail...) sans impacter les utilisateurs

## Documentation

Quasiment tout ce qui est présenté ici est applicable : [https://react-toolbox.io/#/components](https://react-toolbox.io/#/components)

Différences :

-   Dialog a été recopié/réimplémenté dans `layout` (l'overlay aussi)
-   Seuls `Calendar` et `Clock` sont exposés (les pickers entiers utilise le dialog qui n'est pas disponible). `InputDate` et `InputTime` de `components` est probablement ce que vous cherchez de toute manière.
-   `Checkbox` et `Switch` peuvent prendre `value` à la place de `checked`
-   `ButtonMenu` a été ajouté en plus de `IconMenu`
-   Les ripples et tooltips ont été recopiés/réimplémentés (parce qu'ils incluaient d'office le CSS)
