# Module `router`

## Bases

Le router proposé par autofocus est un peu particulier et est basé sur les [idées proposées](https://medium.com/@mweststrate/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37#.hwq43wau0) par le créateur de MobX.

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
Il est ensuite très facile dans des composants de réagir aux changements de route en utilisant `store.currentView`, comme n'importe quelle autre observable.

## Plusieurs ViewStores

Pour pouvoir découpler les différentes parties d'une application, on va vite ressentir le besoin de définir un `ViewStore` par module de l'application.

Le constructeur du store prend un deuxième paramètre, le `prefix`, qui représente le nom du store et sera le préfixe de toutes les routes liés à un store. Naturellement, il est obligatoire de spécifier tous les préfixes à partir du moment où on a plusieurs stores.

La fonction `startRouter` prend un array de `ViewStore` comme second paramètre pour cette usage-là. Le premier store de la liste sera le store par défaut : c'est sur ce store-là que l'application va démarrer et c'est sur celui-là que les routes non trouvées vont rediriger.

Un routeur avec plusieurs stores gère la notion de "store actif", c'est-à-dire qu'il va déterminer quel store est actif "à la main" à tout moment. La règle est très simple : c'est le dernier store modifié qui est actif, et tous les autres stores sont réinitialisés (tous les paramètres de vues sont passés à `undefined`). La fonction `startRouter` retourne un objet contenant la listes des stores et un propriété observable `currentStore` qui contient le store actif.

*Note : Il n'est actuellement pas possible de changer le store actif sans changer l'état de sa vue sans passer par l'URL*

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
