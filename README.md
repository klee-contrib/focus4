# (auto)focus
*(on peut toujours espérer)*

> Normalement cette fois-ci c'est la bonne.

**`autofocus`** est une libre réimplémentation de Focus V2 (`focus-core` et `focus-components`) en **[Typescript](http://www.typescriptlang.org)** qui utilise **[MobX](http://mobxjs.github.io/mobx)** comme conteneur de state (à la place de `flux` ou `redux`).
Son but principal est de proposer le framework le plus simple, efficace et robuste pour effectuer les mêmes tâches que le Focus original, tout en restant proche au niveau de l'API et de la structure de l'application (à l'inverse de Focus V3 qui est totalement différent). Pour ne pas non plus trop s'éparpiller, `autofocus` dépend de `focus-components@3.0`.

## Typescript
Typescript est un **superset typé** du Javascript courant (ES2016+). Il vient avec son propre compilateur qui effectue, comme son nom l'indique, du **typage statique** via de l'inférence (ie. automatiquement) ou des annotations explicites. Son usage est totalement **facultatif** (il n'est pas nécessaire d'utiliser du Typescript pour consommer la librairie) et totalement "à la carte" (il n'est pas nécessaire d'utiliser du typage partout). Néanmoins, la surcouche est suffisament fine et intuitive pour ne pas causer une surcharge de travail notable (le "langage" peut s'apprendre en 2 heures) et les bénéfices peuvent être énormes, du moins si on se décide à utiliser les options les plus strictes.

Il n'est pas non plus nécessaire d'avoir des libraries en Typescript pour faire du Typescript puisqu'il est possible d'écrire des définitions de librairies (la plupart sont déjà écrites et disponibles sur `npm`) pour décrire l'architecture de n'importe quel code Javascript. Il n'est pas non plus nécessaire d'utiliser Typescript pour profiter de ses bénéfices, puisqu'en utilisant un éditeur/IDE adapté comme **[Visual Studio Code](http://code.visualstudio.com)**, le service de langage Typescript (qui fournit l'autocomplétion, la navigation...) est également activé par défaut pour le Javascript.

Quelque soit votre intérêt dans Typescript (j'espère vous avoir convaincu !), le fait qu'autofocus soit écrit en Typescript est un plus indéniable.

Je vous renvoie à l'excellente [documentation](http://www.typescriptlang.org/docs/tutorial.html) pour vous lancer (si ce n'est déjà fait).

## MobX
MobX, c'est le futur, dès aujourd'hui dans votre assiette. La communauté React a encore le nez plein dans `redux` (ils sont occupés à écrire des actions, des reducers et des sélecteurs à n'en plus finir, il faut les comprendre) et n'a pas encore eu le temps de réagir (la première "vraie" release date de mars dernier après tout), mais là c'est le moment de s'y mettre.

### En 2 phrases
MobX permet de définir des **observables**, qui peuvent être observées par des **observers** (un component React par exemple). Cet observer va réexécuter la fonction qu'on lui donne (pour un composant React, sa fonction `render`) a chaque fois qu'une observable utilisée dans cette fonction a été modifiée, n'importe où.

### C'est magique
Ce qu'il faut bien comprendre, pour l'intégration avec React, c'est que ces réactions se produisent indépendamment des `props` ou du `state` du composant !

**Ca veut dire qu'on n'a plus besoin :**
* de **mixins/classes de base** pour injecter de l'état dans le `state`, ou de **composants d'ordre supérieur** pour injecter dans les `props`. Un simple décorateur (ou fonction) `@observer` suffit. Plus besoin donc de sélecteur pour récupérer l'état qu'on veut depuis un store.
* de **`state` React local** dans un composant. Une simple propriété de classe marquée d'un `@observable` suffit. Fini le `setState` asynchrone (et [c'est mieux comme ça](https://medium.com/@mweststrate/3-reasons-why-i-stopped-using-react-setstate-ab73fc67a42e#.97vfrg1k0)). Cela veut dire que l'intégralité du `state` dans l'application peut être stockée dans des observables MobX.
* de **dispatcher**: on modifie directement l'observable (qui est peut être un objet, un array, une map ou une primitive boxée) et tout sera mis à jour automatiquement. Du coup, on peut toujours avoir des actions, mais ce sont simplement des fonctions qui mettent à jour une observable.
* d'une **structure rigide** pour contenir le state. Que ça soit un `CoreStore` de `focus` ou le store `redux`, plus besoin, on a des observables et on les range où on veut comme on veut.

La doc est **[ici](http://mobxjs.github.io/mobx)**.

## Ce qu'il y a dans autofocus
MobX permet de simplifier beaucoup les choses, mais ça ne veut pas dire pour autant qu'on a plus besoin de tout ce proposait déjà `focus-core` (loin de là). Voici la liste de tous les différents modules qui composent `autofocus-mobx`:

La doc est disponible [ici](src)