### Puisque un exemple parle souvent mieux que des mots dans le vent, le [starter kit](http://www.github.com/get-focus/focus4-starter-kit) fait également office de démo et présente les usages les plus simples de `focus4`.

# Référence d'API
## [Module `application`](application)
## [Module `entity`](entity)
## [Module `list`](list)
## [Module `message`](message)
## [Module `network`](network)

## Module `reference`
### `ReferenceStore`
Un `ReferenceStore` de Focus V4 est construit par la fonction `makeReferenceStore(serviceFactory, refConfig)` :
* `serviceFactory` est une fonction qui prend en paramètre un nom de référence et renvoie un service (sans paramètre) permettant de récupérer la liste de référence (qui renvoie donc une Promise)
* `refConfig` est un objet dont les propriétés seront les noms des listes de références à charger. Pour typer le store de référence, il suffit de typer ces propriétés avec le type correspondant :

```ts
const referenceStore = makeReferenceStore(serviceFactory, {
    product: {} as Product,
    line: {} as Line
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

*Note: Du coup, tout ce qui avait attrait au fonctionnement des références dans `focus-components` est obsolète (car plus nécessaire). `selectFor` prend simplement la liste de référence en paramètre à la place de son nom.*

## [Module `router`](router)
## [Module `search`](search)
## [Module `testing`](testing)

## Module `user`
Le store d'utilisateur est le même que `focus-core`, à la différence près que la fonction `hasRole` est située sur l'instance du `UserStore` (ce qui est plus logique).
