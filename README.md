[![Build Status](https://dev.azure.com/klee-focus/focus4/_apis/build/status/CI)](https://dev.azure.com/klee-focus/focus4/_build/latest?definitionId=1&view=logs)
[![npm version](https://badge.fury.io/js/focus4.svg)](https://www.npmjs.com/package/focus4)

# Focus v4

**`Focus v4`** est en ensemble de modules conçu pour simplifier et de généraliser au maximum la réalisation de SPA, principalement basées sur [React](http://www.reactjs.org), mais pas que. Ces modules s'appuient fortement sur **[Typescript](http://www.typescriptlang.org)** et **[MobX](http://mobx.js.org)** pour maximiser la productivité du développeur, tout en lui laissant la flexibilité de sortir du standard si nécessaire.

L'usage de Focus v4 est conditionné par la capacité de pouvoir générer automatiquement les modèles qu'il utilise dans ses stores de données. Des librairies comme [Vertigo](http://www.github.com/KleeGroup/vertigo) ou [Kinetix](http://www.github.com/KleeGroup/kinetix-tools) proposent de tels générateurs (en Java et C#, respectivement), mais recoder un générateur pour mieux s'insérer dans une stack différente reste tout à fait abordable.

## Les différents modules

-   [**`@focus4/core`**](./packages/core) : il contient tous les petits bouts "génériques" de Focus comme le fetch, le routeur, et les petits stores. Il ne dépend d'aucun autre module, ni de React.
-   [**`@focus4/stores`**](./packages/stores) : il contient les stores d'entités, de formulaires, de références, et de listes. Il dépend de `core` mais toujours pas de React.
-   [**`@focus4/styling`**](./packages/styling): il contient les différents outils liés au CSS ainsi que toutes les variables (y compris celles de React Toolbox, on y reviendra plus tard). Il dépend de `core` et de React (comme tous les modules suivants).
-   [**`@focus4/forms`**](./packages/forms): il contient les composants de saisie, de champs et de formulaires. Il dépend de `stores` et `styling`.
-   [**`@focus4/collections`**](./packages/collections): il contient tous les composants de liste de et recherche. Il dépend de `forms`, puisqu'il existe un formulaire de saisie de critères de recherche.
-   [**`@focus4/layout`**](./packages/layout): il contient tous les composants de layout. Il dépend de `styling` (mais pas de `forms` ou `collections`).
-   [**`@focus4/toolbox`**](./packages/toolbox): il s'agit d'un repackaging de [react-toolbox](http://www.react-toolbox.io) à partir du module de `styling`, pour une intégration optimale avec le reste des modules.
