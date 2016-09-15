# Référence d'API
## [Module `application`](application)

## Module `defaults`
`autofocus` est une réécriture de `focus-core` et *partielle* de `focus-components` (pré-V3), parce qu'il y a un grand nombre de composants dont une réécriture n'aurait que peu d'intérêt. Néanmoins, des composants comme un simple Bouton sont indispensables pour une grande parties des composants proposés par `autofocus`, donc on a besoin d'un mécanisme pour les importer, ce que propose ce module. On ne prend pas `focus-components` comme dépendance parce que c'est une dépendance beaucoup trop importante alors qu'on n'en veut qu'un petit peu. En revanche, la future v3 sera beaucoup plus légère et enlèvera tout ce dont on avait pas besoin, donc à ce moment-là on prendra la dépendance. (D'ailleurs, en ce moment, `autofocus` ne fournit aucun CSS et suppose que vous avez le `focus-components` en entier avec.)

### `setDefaultComponents(config)`
La fonction prend un objet comportant tous les composants nécessaires (à priori issus de `focus-components`, mais pas nécéessairement). Aujourd'hui, on attend:
- ActionBar
- Button
- ButtonBackToTop
- Checkbox
- ContextualActions
- Dropdown
- Field
- Icon
- InputText
- Scope
- TopicDisplayer
Cette liste est amenée à évoluer au fil des versions.

## [Module `entity`](entity)

## Module `history`
C'est exactement le même que `focus-core`.

## [Module `list`](list)
## [Module `message`](message)
## [Module `network`](network)

## Module `reference`
### `ReferenceStore`
Un `referenceStore` d'autofocus-mobx est construit par la fonction `makeReferenceStore(serviceFactory, refConfig)` :
* `serviceFactory` est une fonction qui prend en paramètre un nom de référence et renvoie un service (sans paramètre) permettant de récupérer la liste de référence (qui renvoie donc une Promise)
* `refConfig` est un objet dont les propriétés seront les listes de références à charger. Pour typer le store de référence, il suffit de typer ces propriétés avec le type correspondant :

```ts
const referenceStore = makeReferenceStore(serviceFactory, {
    product: [] as Product[],
    line: [] as Line[]
});
```

Le `referenceStore` résultant peut êtere utilisé tel quel dans un `observer`: lorsqu'on veut récupérer une liste de références, le store regarde dans le cache et renvoie la valeur s'il la trouve. Sinon, il lance le service de chargement qui mettra à jour le cache et renvoie une liste vide. Une fois la liste chargée, l'observable sera modifiée et les composants mis à jour automatiquement.

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

(Note: Du coup, tout ce qui avait attrait au fonctionnement des références dans `focus-components` est obsolète (car inutile). `selectFor` prend simplement la liste de référence en paramètre à la place de son nom.)

## [Module `search`](search)
## [Module `testing`](testing)

## Module `translation`
C'est exactement le même que `focus-core`.

## Module `user`
Le store d'utilisateur est le même que `focus-core`, à la différence près que la fonction `hasRole` est située sur l'instance du `UserStore` (ce qui est plus logique).

## Module `validation`
Idem `focus-core/definition/validation` (à peu près).