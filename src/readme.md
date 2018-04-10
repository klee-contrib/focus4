### Puisque un exemple parle souvent mieux que des mots dans le vent, le [starter kit](http://www.github.com/get-focus/focus4-starter-kit) fait également office de démo et présente les usages les plus simples de `focus4`.

# Référence d'API

## [Module `collections`](collections)
## [Module `components`](components)
## [Module `entity`](entity)

## Module `ioc`
Ce module contient un container d'injection de dépendances ([InversifyJS](https://github.com/inversify/InversifyJS)) ainsi que deux décorateurs pour injecter une dépendance par propriété dans une classe.

Exemple d'usage :

```ts
import {container} from "focus4/ioc";
import {adminService} from "../services";

container.bind("adminService").toConstantValue(adminService);

//////////////////////////////////

import {injectByName, injectByPropName} from "focus4/ioc";
import {AdminService} from "../services";

class Component {

    @injectByName("adminService")
    monService: AdminService;

    @injectByPropName
    adminService: AdminService;
}
```

Comme son nom l'indique, le décorateur `@injectByPropName` utilise le nom de la propriété comme identifiant de l'objet à injecter.

## [Module `layout`](layout)
## [Module `message`](message)
## [Module `network`](network)

## Module `reference`
### `ReferenceStore`
Un `ReferenceStore` de Focus V4 est construit par la fonction `makeReferenceStore(referenceLoader, refConfig)` :
* `referenceLoader` est une fonction qui prend en paramètre un nom de référence et la liste de référence (qui renvoie donc une Promise)
* `refConfig` est un objet dont les propriétés sont des définitions de listes de référence, à priori générés avec le reste du modèle. Ce sont des objets de la forme `{type, valueKey, labelKey}` qui servent à définir totalement comme la référence doit s'utiliser.

Un store de référence se construit de la manière suivante :
```ts
const referenceStore = makeReferenceStore(referenceLoader, {
    product,
    line
});
```

Le `referenceStore` résultant peut être utilisé tel quel dans un composant `observer`: lorsqu'on veut récupérer une liste de références, le store regarde dans le cache et renvoie la valeur s'il la trouve. Sinon, il lance le service de chargement qui mettra à jour le cache et renvoie une liste vide. Une fois la liste chargée, l'observable sera modifiée et les composants mis à jour automatiquement.

Exemple d'usage :

```tsx
@observer
class View extends React.Component {
    render() {
        return (
            <ul>
                {referenceStore.product.map(product => <li>product.code</li>)}
                {referenceStore.line.map(line => <li>line.label</li>)}
            </ul>
        );
    }
}
```

Ce composant sera initialement rendu 3 fois:
* La première fois, les deux utilisations de `product` et de `line` vont lancer les appels de service (les deux listes sont vides)
* La deuxième fois, l'une des deux listes aura été chargée et sera affichée.
* La troisième fois, l'autre liste aura également été chargée et les deux seront affichées.

Les fois suivantes (dans la mesure que les listes sont toujours en cache), il n'y aura qu'un seul rendu avec les deux listes déjà chargées.

Et voilà, ça marche tout seul.

### `makeReferenceList(list, {valueKey, labelKey})`
Cette fonction permet de transformer une liste classique en une liste utilisable comme liste de référence (pour `selectFor`).

## [Module `router`](router)

## Module `user`
Ce module propose une base de store utilisateur, pour y stocker les données de la session. La seule fonctionnalité prévue est la gestion des rôles / permissions (avec `roles` et `hasRole()`), et c'est à chaque application d'y rajouter leurs informations métiers pertinentes.

## Module `util`
Ce module contient deux décorateurs `@classAutorun` et `@classReaction` pour créer un `autorun`/`reaction` sur une méthode de classe React (en attendant que ça soit nativement supporté par MobX ?).
