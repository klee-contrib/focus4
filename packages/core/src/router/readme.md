# Routeur legacy

**Ce routeur a été remplacé par le nouveau `router2`**.

## Bases

Le router proposé par Focus V4 est un peu particulier et est basé sur les [idées proposées](https://medium.com/@mweststrate/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37#.hwq43wau0) par le créateur de MobX.

Il s'articule autour d'un ou plusieurs store(s) (le `ViewStore`) qui sert d'intermédiaire entre le "vrai" routeur et le reste de l'application. Ce store expose une propriété observable `currentView`, qui est le miroir de l'état de l'URL. Modifier l'URL va mettre `currentView` à jour en conséquence, et inversement.

Exemple :

```ts
const viewStore = new ViewStore({view: {page: "", id: "", subPage: "", subId: ""}});
const router = makeRouter([viewStore]);

// Démarrage
async function preload() {
    await router.start();
}

// navigation vers "/structure/1/detail" -> viewStore.currentView = {page: "structure", id: "1", subPage: "detail"}
// action utilisateur
viewStore.setView({id: 5}); // -> URL = "/structure/5/detail"
```

Il est ensuite très facile dans des composants de se synchroniser au `ViewStore` en utilisant `store.currentView` comme n'importe quelle autre observable. Ainsi, on abstrait entièrement le routing des vues et on interagit à la place avec un store (= de l'état), ce qu'on fait déjà pour tout le reste.

## Plusieurs ViewStores

Pour pouvoir découpler les différentes parties d'une application, on va vite ressentir le besoin de définir un `ViewStore` par module de l'application.

Le constructeur du store prend un deuxième paramètre, le `prefix`, qui représente le nom du store et sera le préfixe de toutes les routes liés à un store. Naturellement, il est obligatoire de spécifier tous les préfixes à partir du moment où on a plusieurs stores.

La fonction `makeRouter` prend un array de `ViewStore` comme second paramètre pour cette usage-là. Le premier store de la liste sera le store par défaut : c'est sur ce store-là que l'application va démarrer.

Un routeur avec plusieurs stores gère la notion de "store actif", c'est-à-dire qu'il va déterminer quel store est actif automatiquement. La règle est très simple : c'est le dernier store modifié qui est actif. Chaque store possède une propriété `isActive` pour savoir s'il est actif. La fonction `makeRouter` retourne un objet contenant la listes des stores, la méthode `start()`, une propriété observable `currentStore` qui contient le store actif, et une méthode `to(prefix)` permettant de naviguer vers l'état par défaut du `ViewStore` choisi (cette navigation n'entraînant pas de modification d'état, on est forcé de l'effectuer via le routeur au lieu d'une interaction avec un store).

Exemple d'usage :

```tsx
export const homeView = new ViewStore({
    prefix: "home",
    view: {page: "" as undefined | "test" | "list", id: "" as string | undefined}
});
export const testView = new ViewStore({prefix: "test", view: {lol: ""}});

const router = makeRouter([homeView, testView]);

const Main = observer(() => {
    const {currentStore} = router;
    if (currentStore.prefix === "home") {
        switch (currentStore.currentView.page) {
            case "test":
                return <Test />;
            case "list":
                return <List />;
            default:
                return <Home />;
        }
    } else if (currentStore.prefix === "test") {
        return <div>Test Store "{currentStore.currentView.lol}"</div>;
    } else {
        return <div>déso</div>;
    }
});
```

(oui oui, le `currentStore` est statiquement typé avec le bon store lorsqu'on distingue par préfixe !)

## `beforeEnter`

Il est possible de définir un hook `beforeEnter` sur un `ViewStore` (dans le constructeur) qui va s'exécuter juste avant une navigation (que ça soit par URL ou par `setView()`), qui peut retourner 3 choses :

-   `{redirect: view}`, pour rediriger vers la vue retournée. Par exemple : `{redirect: {page: "home"}}`.
-   `{errorCode: "code"}`, pour rediriger vers la page d'erreur avec le code demandé (voir plus bas).
-   `undefined`, pour ne rien faire.
    Ce hook permet d'ajouter de la logique pour par exemple bloquer l'accès à certaines pages si l'utilisateur n'a pas les droits, ou pour combler une URL qui n'existe pas.

## Page d'erreur

Le routeur gère, en plus des différents `ViewStores`, une page spéciale destinée aux erreurs. Cela correspond au cas ou aucun store n'est actif : dans ce cas, `currentStore` vaut `{prefix: "error", errorCode: "your_code"}`. On y accède soit par une erreur personnalisée retournée dans un `beforeEnter`, soit lorsqu'une route n'est pas matchée (`errorCode = "notfound"`). C'est donc a l'utilisateur, dans le switch principal de l'application, de concevoir ses propres pages d'erreurs en fonction du code. (le nom de la page "error" et le code "notfound" sont configurables)

## API du `ViewStore`

```ts
export declare class ViewStore<V, N extends string> {
    /** Préfixe éventuel du store. */
    readonly prefix?: N;

    /**
     * Construit un nouveau ViewStore.
     * @param config La configuration du store.
     */
    constructor({beforeEnter, view, prefix}: ViewStoreConfig<V, N>);

    /** Calcule l'URL en fonction de l'état courant. */
    readonly currentPath: string;

    /** Représente l'état courant de l'URL. */
    readonly currentView: View<V>;

    /** Précise si le store est actuellement actif dans le router. */
    readonly isActive: boolean;

    /**
     * Récupère l'URL pour la vue donnée.
     * @param view La vue à récupérer.
     * @param replace Ne fusionne pas la vue demandée avec la vue courante.
     */
    getUrl(view?: Partial<V>, replace?: boolean): string;

    /**
     * Met à jour la vue courante.
     * @param view La vue souhaitée.
     * @param replace Ne fusionne pas la vue souhaitée avec la vue courante.
     */
    setView(view: Partial<V>, replace?: boolean): void;

    /**
     * Effectue l'action fournie à partir de la vue courante et filtre les résultats "faux".
     * @param block L'action à effectuer.
     */
    withView<T>(block: (view: View<V>) => T | undefined | "" | false): T;
}
```

Il est important de noter que `currentView` est totalement **immutable** et que la seule manière de modifier l'état de la vue est de passer par la fonction `setView()` (ou bien de passer par l'URL directement).

## Etendre un `ViewStore`

Un `ViewStore` représente l'état global du module de l'application auquel il est associé, et est par conséquent visible et utilisable par tous les composants de ce module. Par défaut, il ne contient que l'état stocké dans l'URL, mais il peut être intéressant d'y stocker également d'autres informations liées, qui dérivent fonctionnellement de l'état de la vue courante.

Par exemple, si le `ViewStore` gère un module qui concerne un objet métier en particulier, on va certainement stocker son ID dans l'URL. De plus, il y aura probablement d'autres infos générales sur cet objet métier que l'on va vouloir partager dans tout le module, comme son nom, son identifiant métier, son état... Des infos que l'on peut récupérer facilement via une requête au serveur la plupart du temps. L'idéal, ça serait de les garder toujours à portée de main dans le `ViewStore`. On pourrait donc faire quelque chose du genre de :

```ts
class MyViewStore extends ViewStore<{id: string}, "objet"> {
    @observable resume: ObjetResume = {};
    constructor() {
        super({prefix: "objet", view: {id: ""}});
        autorun(() => this.withView(async ({id}) => id && (this.resume = await loadObjetResume(+id))));
    }
}
```

Ainsi, à chaque fois que je change l'id de la `currentView`, mon résumé est rechargé et le reste du module pourra toujours compter sur ces informations à jour.

## Synchroniser un composant sur un `ViewStore`

Puisque l'on vient d'établir un `ViewStore` comme étant l'unique source de vérité sur les informations de base du module courant, il faudrait donc faire dépendre tous les composants directement du `ViewStore`, quitte à devoir l'importer (ou l'injecter si on veut vraiment être rigoureux) partout.

Par exemple, si je veux charger des données qui dépendent de l'ID courant dans un composant, alors il serait idéal de faire comme ceci :

```tsx
class Component extends Component {
    @disposeOnUnmount
    load = autorun(() => {
        viewStore.withView(async ({id}) => id && (this.data = await loadData(+id)));
    });
}
```

à la place d'un `componentWillMount` classique. Ce fonctionnement permet d'assurer la synchronisation du composant avec le store sans passer par une prop `id` et gère directement l'initialisation comme la mise à jour (on aurait eu besoin d'à la fois `componentWillMount` et `componentWillReceiveProps` pour obtenir le même comportement sans réaction, du coup ça fait relativiser la syntaxe).

Le gros point fort en faisant ça, c'est qu'on peut librement modifier l'id dans le `ViewStore` (via l'URL ou dans le code) et voir tous nos composants se remettre à jour sans remonter le moindre composant, sans effort supplémentaire.

L'`AutoForm` créé nativement une réaction pour le chargement à partir de la fonction `getLoadParams` qu'on lui passe dans la configuration. Donc si cette fonction ressemble à quelque chose comme `() => viewStore.withView(({id}) => id && [+id])`, alors il bénificiera de la synchronisation.

_Note : la synchronisation par réaction n'est pas à faire en toute circonstances. Par exemple, si un module affiche des composants différents selon un état global qui peut changer avec l'ID, alors ces composants ne doivent pas être synchronisés. Dans ce cas, la meilleure solution est de synchroniser le composant racine et de s'assurer que l'on remonte tous les composants enfants à chaque changement d'ID. [fromPromise](https://github.com/mobxjs/mobx-utils#frompromise) est pratique pour ça._

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

Ces recommandations ne sont pas absolues et à utiliser en tout circonstances, mais ce sont des idées qu'il faut avoir en tête.
