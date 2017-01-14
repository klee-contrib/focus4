# Module `router`

## Bases

Le router proposé par `autofocus` est un peu particulier et est basé sur les [idées proposées](https://medium.com/@mweststrate/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37#.hwq43wau0) par le créateur de MobX.

Il s'articule autour d'un ou plusieurs store(s) (le `ViewStore`) qui sert d'intermédiaire entre le "vrai" routeur et le reste de l'application. Ce store expose une propriété observable `currentView`, qui est le miroir de l'état de l'URL. Modifier l'URL va mettre `currentView` à jour en conséquence, et inversement.

Exemple :
```ts
const viewStore = new ViewStore({page: "", id: "", subPage: "", subId: ""});
startRouter({}, [viewStore]);
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

Un routeur avec plusieurs stores gère la notion de "store actif", c'est-à-dire qu'il va déterminer quel store est actif automatiquement. La règle est très simple : c'est le dernier store modifié qui est actif, et tous les autres stores sont réinitialisés (tous les paramètres de vues sont passés à `undefined`) lorsqu'on change de store. La fonction `startRouter` retourne un objet contenant la listes des stores et un propriété observable `currentStore` qui contient le store actif.

*Note : Il n'est actuellement pas possible de changer le store actif sans changer l'état de sa vue sans passer par l'URL, c'est-à-dire en faisant quelque chose comme `<a href="#home">` ou `window.location.hash = "#home"`. Je n'ai pas trouvé de solution sans couplage router <-> store ou router <-> vue, mais le problème reste ouvert.*

Exemple d'usage :
```tsx
export const homeView = new ViewStore({page: "" as undefined | "test" | "list", id: "" as string | undefined}, "home");
export const testView = new ViewStore({lol: ""}, "test");

const router = startRouter({}, [homeView, testView]);

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

Ainsi, à chaque fois que je change l'id de la `currentView`, mon résumé est rechargé et le reste du module pourra toujours compter sur ces informations à jour. Cela veut dire également qu'il vaut mieux, dans la mesure du possible, faire dépendre tous les composants directement du `ViewStore`, quitte à devoir l'importer (ou injecter si on veut vraiment être rigoureux) partout. Si l'id de l'objet métier (ou tout autre propriété qui en dérive fonctionnellement) doit être utilisé quelque part, alors il est très souhaitable de le récupérer directement depuis le `ViewStore`.

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