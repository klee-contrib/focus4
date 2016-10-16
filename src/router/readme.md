# Module `router`

Le router proposé par autofocus est un peu particulier et est basé sur les [idées proposées](https://medium.com/@mweststrate/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37#.hwq43wau0) par le créateur de MobX.

Il s'articule autour d'un store (le `ViewStore`) qui sert d'intermédiaire entre le "vrai" routeur et le reste de l'application. Ce store expose une propriété observable `currentView`, qui est le miroir de l'état de l'URL. Modifier l'URL va mettre `currentView` à jour en conséquence, et inversement.

Exemple :
```ts
interface View {
    page: string;
    id: string;
    subPage: string;
    subId: string;
}
const viewStore = new ViewStore<View>(["page", "id", "subPage", "subId"]);
startRouter(viewStore);
```
```
navigation vers "/structure/1/detail" -> viewStore.currentView = {page: "structure", id: "1", subPage: "detail"}
action utilisateur viewStore.currentView.id = 5 -> URL = "/structure/5/detail"
```
Il est ensuite très facile dans des composants de réagir aux changements de route en utilisant `store.currentView`, comme n'importe quelle autre observable.

Il est également possible d'avoir plusieurs `ViewStore`s sur le même routeur, à condition de spécifier un préfixe d'URL pour tous les stores (pour éviter les collisions de route et identifier quelle URL correspond à quel store). Il suffit de passer ce préfixe en deuxième paramètre du constructeur.
