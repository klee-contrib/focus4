[![Build Status](https://dev.azure.com/klee-focus/focus4/_apis/build/status/CI)](https://dev.azure.com/klee-focus/focus4/_build/latest?definitionId=1&view=logs) 
[![npm version](https://badge.fury.io/js/focus4.svg)](https://www.npmjs.com/package/focus4)

# Focus V4

**`Focus V4`** est la version la plus récente du framework Focus, toujours basé sur React, mais cette fois-ci en **[Typescript](http://www.typescriptlang.org)** et **[MobX](http://mobx.js.org)** comme conteneur de state (à la place de `flux` ou `redux`).

Cette nouvelle version a pour but de simplifier et de généraliser au maximum la réalisation de SPA en tandem avec un backend [Vertigo](http://www.github.com/KleeGroup/vertigo) ou [Kinetix](http://www.github.com/KleeGroup/kinetix), tout en laissant le plus possible de liberté (et de temps) aux développeurs pour sortir du standard si nécessaire.

Ci-dessous, une présentation rapide des deux nouvelles technos majeures de Focus v4:

## Typescript

Typescript est un **superset typé** du Javascript courant (ES2016+). Il vient avec son propre compilateur qui effectue, comme son nom l'indique, du **typage statique** via de l'inférence (ie. automatiquement) ou des annotations explicites. Son usage est totalement **facultatif** (il n'est pas nécessaire d'utiliser du Typescript pour consommer la librairie) et totalement "à la carte" (il n'est pas nécessaire d'utiliser du typage partout). Néanmoins, la surcouche est suffisament fine et intuitive pour ne pas causer une surcharge de travail notable (le "langage" peut s'apprendre en 2 heures) et les bénéfices peuvent être énormes, du moins si on se décide à utiliser les options les plus strictes.

Il n'est pas non plus nécessaire d'avoir des libraries en Typescript pour faire du Typescript puisqu'il est possible d'écrire des définitions de librairies (la plupart sont déjà écrites et disponibles sur `npm`) pour décrire l'architecture de n'importe quel code Javascript. Il n'est pas non plus nécessaire d'utiliser Typescript pour profiter de ses bénéfices, puisqu'en utilisant un éditeur/IDE adapté comme **[Visual Studio Code](http://code.visualstudio.com)**, le service de langage Typescript (qui fournit l'autocomplétion, la navigation...) est également activé par défaut pour le Javascript.

Une application Focus v4 n'est donc pas nécessairement écrite en Typescript, mais si c'est bien pour Focus c'est aussi bien pour vous, et pour tout le monde :)

Je vous renvoie à l'excellente [documentation](http://www.typescriptlang.org/docs/tutorial.html) pour vous lancer (si ce n'est déjà fait).

## MobX

### En 3 phrases

MobX permet de définir des objets JS (objet, array, map...) comme **observables**, à partir desquelles on peut écrire **dérivations** (= valeur calculée) et des **réactions** (= évènement lorsqu'une observable est modifiée). MobX va déduire automatiquement à l'exécution d'une dérivation ou d'une réaction de quelles observables elles dépendent, ce qui lui permettra de les réexécuter à chaque fois que l'une d'entre-elle à été modifiée dans l'ensemble de l'application. Ainsi, cela nous permet de maintenir tout notre état et nos composants à jour en permanance, sans avoir d'effort en particulier à founir !

### Avec React

MobX s'intègre très bien avec React : il enregistre toutes les fonctions `render()` des composants comme des dérivations. Cela permet en plus de dissocier le rendu des `props` et du `state` du composant !

**Ca veut dire qu'on n'a plus besoin :**

*   de **mixins/classes de base** pour injecter de l'état dans le `state`, ou de **composants d'ordre supérieur** pour injecter dans les `props` : on peut utiliser directement cet état dans un composant et l'abonnement est automatique, au prix d'un misérable petit décorateur (ou fonction) `@observer` sur le composant.
*   de **`state` React local** dans un composant. Une simple propriété de classe marquée d'un `@observable` suffit. Fini le `setState` asynchrone (et [c'est mieux comme ça](https://medium.com/@mweststrate/3-reasons-why-i-stopped-using-react-setstate-ab73fc67a42e#.97vfrg1k0)). Cela veut dire que l'intégralité du `state` d'une application peut (et devrait) être stocké dans des observables MobX, ce qui permet de tout gérer de la même manière.
*   de **dispatcher**: on modifie directement l'observable (qui est peut être un objet, un array, une map ou une primitive boxée) et tout sera mis à jour automatiquement. Du coup, on pourrait définir des actions, mais ce ne serait que de bêtes fonctions dans lesquelles on effectuerait des modifications de state.
*   d'une **structure rigide** centralisée pour contenir le state. Que ça soit un `CoreStore` de `focus-core` ou le store `redux`, plus besoin, les observables sont trackées par MobX quelque soit la manière ou l'endroit où elles ont été définies.

La doc est **[ici](http://mobx.js.org)**.

## Ce qu'il y a dans Focus V4

Focus V4, c'est :

*   Des modules de bases pour construire la base de votre application (`layout`, `network`, `reference`, `message`)
*   La librairie [react-toolbox](http://www.react-toolbox.io), pour fournir tous les composants _Material Design_ de base, ainsi que quelques composants supplémentaires (`components`)
*   Un module `collections` qui contient des composants et des stores de listes et de recheche.
*   Une gestion du CSS à base de modules et de variables CSS, calquée sur et intégrée avec _react-toolbox_.
*   Un module `entity` qui contient les stores et les composants pour tous vos besoins de formulaires et de champs d'édition ou consultation.
*   Un module `routeur` pour définir la structure et les stores d'état de toute votre application.

La doc est disponible [ici](src)
