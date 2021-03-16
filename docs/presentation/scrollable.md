# `Scrollable`

## Présentation

Le composant **`Scrollable`**, qui pose un **`ScrollableContext`**, est le composant central du système de présentation et mise en page de Focus. C'est un composant que vous n'utiliserez jamais directement (où alors avec une très bonne raison), mais il est posé par le `Layout` et les `Popin`, qui sont des constituants basiques de votre application.

Le `Scrollable` permet de gérer les fonctionnalités suivantes :

-   Le Header "sticky" en haut de page
-   Le scroll infini des listes
-   Le menu "sticky" sur la gauche
-   Les popins

Le `Scrollable` **pose son propre contexte de scroll sur la page**. En particulier, pour celui du `Layout`, il faut bien comprendre que le scroll général de l'application n'est pas celui de le page mais celui du `Scrollable` qui prend 100% de l'espace de l'écran (sauf la partie dédiée au `MainMenu` s'il y'en a un). Il faut bien prendre cela en compte lorsque vous essaierez de personnaliser le CSS général de votre application.

## API du `ScrollableContext`

Le `ScrollableContext` propose une API "publique", dans le sens ou vous pouvez l'utiliser dans votre projet mais qu'elle existe surtout pour les composants internes de Focus :

-   **`scrollTo(options)`**: même chose que `window.scrollTo`, pour le `<Scrollable>`. Vous pouvez toujours essayer d'utiliser `window.scrollTo` mais ça ne marchera plus, puisque la fenêtre est fixe. C'est à priori la seule raison "standard" (et encore) pour laquelle vous pourriez avoir besoin d'utiliser le contexte.

-   **`portal(node: JSX.Element)`**: cette méthode permet de poser un élément à la racine du `<Scrollable>`. C'est utilisé par les popins.

-   **`menu(node: JSX.Element, parentNode: HTMLElement | null, retractable: boolean)`** : cette méthode sert à poser un menu "sticky" (potentiellement repliable) dans le `<Scrollable>` Il sera positionné automatiquement au même niveau que le `parentNode`, jusqu'à ce que le nœud arrive au sommet du `<Scrollable>` : il sera bloqué en sticky à ce moment-là.

-   **`registerIntersect(node, onIntersect)`** : cette méthode permet d'enregistrer un handler d'évènement sur un nœud HTML, qui sera appelé régulièrement quand la section visible de ce noeud dans le viewport du `<Scrollable>` change. En général, via un évènement de scroll, mais pas nécessairement. Cela permet de faire des choses lorsqu'un élément entre ou quitte le viewport par exemple (utilisé par le scroll infini par exemple).

-   **`registerHeader(nonStickyElement: HTMLElement, canDeploy: boolean)`** et **`registerHeaderProps(headerProps: HTMLProps<HTMLElement>)`** : méthodes utilisées par le `<HeaderScrolling>` pour s'enregistrer dans le `<Scrollable>`. A priori il n'y a aucune raison de l'utiliser directement puisque c'est presque la seule utilité du composant associé.
