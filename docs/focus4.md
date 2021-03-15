Ce méta-module contient l'ensemble des modules de `Focus v4`, à l'exception du module `legacy`.

Il permet également de simplifier l'initialisation d'une application via l'import `import "focus4"` qui peut être mis en entête du fichier racine de la SPA.

Cet import permet d'importer :

-   les polyfills nécessaires
-   la police Material Icons
-   Le CSS de Focus

Il réexporte également certaines APIs des différents modules, selon la même API que les versions précédentes (v9.x), qui n'étaient pas divisées en module. Il est en revanche déconseillé de les utiliser puisqu'elles disparaîtront lors de la prochaine version majeure (v11), au profit des APIs de chaque module. Le but initial était de faciliter la migration 9 -> 10.
