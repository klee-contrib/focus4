[![.github/workflows/docs-and-tests.yaml](https://github.com/klee-contrib/focus4/actions/workflows/docs-and-tests.yaml/badge.svg)](https://github.com/klee-contrib/focus4/actions/workflows/docs-and-tests.yaml)
[![npm version](https://badge.fury.io/js/focus4.svg)](https://www.npmjs.com/package/focus4)

La documentation complète est disponible [ici](https://klee-contrib.github.io/focus4).

# Présentation

**`Focus`** est un framework **[React](https://react.dev/)** modulaire conçu pour accélérer le développement d'application clientes en mettant à disposition un ensemble de
fonctionnalités évoluées conçues pour fonctionner ensemble. Il essaie de fournir une alternative intégrée crédible aux projets React classiques qui accumulent
un très grand nombre de librairies tierces et essaient tant bien que mal de les faire cohabiter.

Par conception, et à l'inverse de la quasi-totalité des frameworks React récents, `Focus` ne se préoccupe pas de votre serveur et n'essaie pas de s'y
imposer ou de vous forcer à maintenir un serveur Node quelque part. C'est un framework "100% front" qui se package avec n'importe quel bundler comme une
application statique (des fichiers HTML, CSS, JS, des images...) et peut se servir par n'importe quel serveur ou système de stockage (S3, Blob Storage...).
`Focus` pourra néanmoins vous demander d'implémenter quelques APIs spécifiques côté serveur pour utiliser certaines de ces fonctionnalités.

Néanmoins, pour maximiser votre productivité avec `Focus`, il est conseillé d'utiliser un outil de génération de code comme [TopModel](https://klee-contrib.github.io/topmodel).

`Focus` utilise extensivement [`TypeScript`](https://www.typescriptlang.org/) et [`MobX`](https://mobx.js.org/) pour réaliser la plupart de ses fonctionnalités. Il est recommandé d'être familier avec ces deux
technologies (et `React` bien sûr) avant de pouvoir commencer avec.

## `focus4`

Ce framework est la 4ème itération du framework `Focus`, et la seule version maintenue depuis 2017. Il est publié sur [npm](https://www.npmjs.com/package/focus4) sous le nom `focus4` pour le
méta-package et dans le scope `@focus4/xxx` pour les différents modules.

Le framework lui-même est aujourd'hui dans sa version majeure **11** (`focus4 v11.x`).

---

## Que fait Focus ?

Focus essaie de simplifier le développement d'une application front en proposant des modules qui adressent les principaux besoins d'une telle application :

-   Gestion des requêtes et des messages
-   Mise en page
-   Navigation
-   Affichage et gestion de listes (avec recherche avancée)
-   Composants de saisie basiques
-   Gestion des données métiers et formulaires
-   Gestion du CSS

L'usage de toutes ces fonctionnalités est toujours **optionnel**. Vous ferez toujours des composants React et vous aurez toujours MobX sous la main, donc si Focus ne peut pas vous aider à faire ce que vous voulez, vous pouvez toujours revenir vers des choses plus classiques.

## Les différents modules

`Focus` est divisé en **7 (+2) modules** NPM, que l'on peut regrouper dans les catégories suivantes :

### Modules de base

Ces modules contiennent les éléments de base d'une application Focus, et servent de fondations aux modules plus avancés.

-   **`@focus4/core`** : fonctionnalités de base, utilisées dans les autres modules.
-   **`@focus4/styling`** : système de CSS utilisé par les composants de Focus.
-   **`@focus4/toolbox`** : composants de base implémentant [Material Design 3](https://m3.material.io/components), utilisé par les autres composants plus avancés.

### Modules de formulaires

Ces deux modules permettent de construire des formulaires, et représentent donc le coeur d'une application Focus. C'est avec ces deux modules-là que vous passerez le plus de temps.

-   **`@focus4/stores`** : gestion des stores de formulaires, collections et de référence.
-   **`@focus4/forms`** : composants de formulaires.

### Modules de présentation

Ces deux modules proposent des composants graphiques de haut niveau qui permettent de structurer la mise en page d'une application Focus, ainsi que l'affichage des listes et de la recherche avancée.

-   **`@focus4/layout`**: composants de mise en page.
-   **`@focus4/collections`** : composants de listes et de recherche avancée.

### `@focus4/tooling`

Le module `@focus4/tooling` est lui aussi un méta-package qui contient l'ensemble des outils nécessaires pour packager une application Focus.
En particulier, il inclut [Vite](https://vitejs.dev) et [ESLint](https://eslint.org/) et des configs par défaut à étendre pour ces outils.

De plus, il contient l'outil de génération de types CSS.

## Starter Kit

Vous pouvez commencer un projet en utilisant le [starter kit](http://www.github.com/klee-contrib/focus4-starter-kit), qui sert également de démo et présente les usages les plus courants de Focus.

La version packagée est également disponible [ici](https://focus4-starter-kit.fly.dev).
