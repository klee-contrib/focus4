# Module `router`

## Bases

Le router proposé par Focus V4 est un peu particulier et est basé sur les [idées proposées](https://medium.com/@mweststrate/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37#.hwq43wau0) par le créateur de MobX.

Il s'articule autour d'un ou plusieurs store(s) (le `ViewStore`) qui sert d'intermédiaire entre le "vrai" routeur et le reste de l'application. Ce store expose une propriété observable `currentView`, qui est le miroir de l'état de l'URL. Modifier l'URL va mettre `currentView` à jour en conséquence, et inversement.

Exemple :
```ts
const viewStore = new ViewStore({page: "", id: "", subPage: "", subId: ""});
startRouter([viewStore]);
```
```
navigation vers "/structure/1/detail" -> viewStore.currentView = {page: "structure", id: "1", subPage: "detail"}
action utilisateur viewStore.currentView.id = 5 -> URL = "/structure/5/detail"
```
Il est ensuite très facile dans des composants de se synchroniser au `ViewStore` en utilisant `store.currentView` comme n'importe quelle autre observable. Ainsi, on abstrait entièrement le routing des vues et on interagit à la place avec un store (= de l'état), ce qu'on fait déjà pour tout le reste.

## Plusieurs ViewStores

Pour pouvoir découpler les différentes parties d'une application, on va vite ressentir le besoin de définir un `ViewStore` par module de l'application.

Le constructeur du store prend un deuxième paramètre, le `prefix`, qui représente le nom du store et sera le préfixe de toutes les routes liés à un store. Naturellement, il est obligatoire de spécifier tous les préfixes à partir du moment où on a plusieurs stores.

La fonction `startRouter` prend un array de `ViewStore` comme second paramètre pour cette usage-là. Le premier store de la liste sera le store par défaut : c'est sur ce store-là que l'application va démarrer et c'est sur celui-là que les routes non trouvées vont rediriger.

Un routeur avec plusieurs stores gère la notion de "store actif", c'est-à-dire qu'il va déterminer quel store est actif automatiquement. La règle est très simple : c'est le dernier store modifié qui est actif, et tous les autres stores sont réinitialisés (tous les paramètres de vues sont passés à `undefined`) lorsqu'on change de store. La fonction `startRouter` retourne un objet contenant la listes des stores, une propriété observable `currentStore` qui contient le store actif, et une méthode `to(prefix)` permettant de naviguer vers l'état par défaut du `ViewStore` choisi (cette navigation n'entraînant pas de modification d'état, on est forcé de l'effectuer via le routeur au lieu d'une interaction avec un store).


Exemple d'usage :
```tsx
export const homeView = new ViewStore({page: "" as undefined | "test" | "list", id: "" as string | undefined}, "home");
export const testView = new ViewStore({lol: ""}, "test");

const router = startRouter([homeView, testView]);

const Main = observer(() => {
    const {currentStore} = router;
    if (currentStore.prefix === "home") {
        switch (currentStore.currentView.page) {
            case "test": return <Test />;
            case "list": return <List />;
            default: return <Home />;
        }
    } else if (currentStore.prefix === "test") {
        return <div>Test Store "{currentStore.currentView.lol}"</div>;
    } else {
        return <div>déso</div>;
    }
});
```
(oui oui, le `currentStore` est statiquement typé avec le bon store lorsqu'on distingue par préfixe !)

## Etendre un `ViewStore`

Un `ViewStore` représente l'état global du module de l'application auquel il est associé, et est par conséquent visible et utilisable par tous les composants de ce module. Par défaut, il ne contient que l'état stocké dans l'URL, mais il peut être intéressant d'y stocker également d'autres informations liées, qui dérivent fonctionnellement de l'état de la vue courante.

Par exemple, si le `ViewStore` gère un module qui concerne un objet métier en particulier, on va certainement stocker son ID dans l'URL. De plus, il y aura probablement d'autres infos générales sur cet objet métier que l'on va vouloir partager dans tout le module, comme son nom, son identifiant métier, son état... Des infos que l'on peut récupérer facilement via une requête au serveur la plupart du temps. L'idéal, ça serait de les garder toujours à portée de main dans le `ViewStore`. On pourrait donc faire quelque chose du genre de :

```ts
class MyViewStore extends ViewStore<{id: string}, "objet"> {
    @observable resume: ObjetResume = {};
    constructor() {
        super({id: ""}; "objet");
        reaction(() => +this.currentView.id, async id => this.resume = await loadObjetResume(id));
    }
}
```

Ainsi, à chaque fois que je change l'id de la `currentView`, mon résumé est rechargé et le reste du module pourra toujours compter sur ces informations à jour.

## Synchroniser un composant sur un `ViewStore`

Puisque l'on vient d'établir un `ViewStore` comme étant l'unique source de vérité sur les informations de base du module courant, il faudrait donc faire dépendre tous les composants directement du `ViewStore`, quitte à devoir l'importer (ou l'injecter si on veut vraiment être rigoureux) partout.

Par exemple, si je veux charger des données qui dépendent de l'ID courant dans un composant, alors il serait idéal de faire comme ceci :

```tsx
class Component extends React.Component {
    loadDisposer = autorun(async () => this.data = await loadData(+viewStore.currentView.id));
    componentWillUnmount() {
        this.loadDisposer();
    }
}
```

à la place d'un `componentWillMount` classique.

On est d'accord pour dire que ce n'est pas la chose la plus simple à écrire (en [attendant](https://github.com/mobxjs/mobx/issues/835) de [pouvoir](https://github.com/mobxjs/mobx-react/issues/181) [utiliser](https://github.com/mobxjs/mobx-react/issues/122) [`@autorun`](https://github.com/mobxjs/mobx/pull/559) un jour), mais ce fonctionnement permet d'assurer la synchronisation du composant avec le store sans passer par une prop `id` et gère directement l'initialisation comme la mise à jour (on aurait eu besoin d'à la fois `componentWillMount` et `componentWillReceiveProps` pour obtenir le même comportement sans réaction, du coup ça fait relativiser la syntaxe).

Le gros point fort en faisant ça, c'est qu'on peut librement modifier l'id dans le `ViewStore` (via l'URL ou dans le code) et voir tous nos composants se remettre à jour sans remonter le moindre composant, sans effort supplémentaire.

L'`AutoForm` créé nativement une réaction pour le chargement à partir de la fonction `getLoadParams` qu'on lui passe dans la configuration. Donc si cette fonction ressemble à quelque chose comme `() => [+viewStore.currentView.id]`, alors il bénificiera de la synchronisation.

*Note : la synchronisation par réaction n'est pas à faire en toute circonstances. Par exemple, si un module affiche des composants différents selon un état global qui peut changer avec l'ID, alors ces composants ne doivent pas être synchronisés. Dans ce cas, la meilleure solution est de synchroniser le composant racine et de s'assurer que l'on remonte tous les composants enfants à chaque changement d'ID. [fromPromise](https://github.com/mobxjs/mobx-utils#frompromise) est pratique pour ça.*

## A propos de ce qu'on vient de faire

Cela veut dire que l'on va utiliser de moins en moins de `props` à nos composants et que l'on va d'avantage s'appuyer directement sur l'état de stores définis globalement. Il faut bien comprendre que MobX est infiniment meilleur que React pour décrire et déterminer comment un composant doit réagir à des changements de state ou de props, donc on va essayer de l'utiliser le plus possible. Rien n'empêche de définir des stores spécialisés dérivés pour restreindre l'accès au state global pour des composants spécialisés si on veut être plus propre, l'important est bien de n'avoir aucun intermédiaire entre la source de vérité (le store) et son usage.

En gros, si on exagérait un peu, on pourrait dire qu'**il ne faudrait surtout pas faire ça** :

```tsx
render() {
    return <MyComponent id={+viewStore.currentView.id} />;
}
```

Cela isole `MyComponent` de `viewStore`, bloque l'établissement de réactions sur le changement d'ID (forçant à utiliser du cycle de vie genre `componentWillReceiveProps` à la place) et force un intermédiaire non nécessaire entre les deux, qui sera inclus dans la chaîne de réaction alors qu'il n'utilise pas la valeur. Après, **il y aura bien un moment où il faudra se dissocier du store**. L'important c'est d'essayer de le faire **le plus tard possible**.

Si on ne veut pas coupler en dur `MyComponent` avec `viewStore`, il vaut mieux faire :

```tsx
render() {
    return <MyComponent view={+viewStore.currentView} />;
}
```

`currentView` est à priori immutable (elle est au moins définie comme `readonly`, après ce n'est pas enforcé à l'exécution), donc cette prop est fixe et délègue l'utilisation de la vue au composant qui en fera ce qu'il veut.

Ces recommandations ne sont pas absolues et à utiliser en tout circonstances, mais ce sont des idées qu'il faut avoir en tête.