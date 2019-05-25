# Module `toolbox`

Réexporte `react-toolbox` dans le but de :

-   Retrouver tous les composants sous le même import (au lieu de tous les "/lib/component")
-   Utiliser le module `styling` pour fournir le CSS aux composants (au lieu du `ThemeProvider` custom et des HoC sans forward ref)
-   Packager le CSS pour éviter de forcer le consommateur à le faire (comme le reste de Focus)
-   Et potentiellement apporter nos propres modifications sur les composants de base (vu que la librairie n'a pas bougé depuis un bail...) sans impacter les utilisateurs
