# Module `application`

## Layout
Le Layout a été globablement repris de Focus v2 et est censé fonctionner de la même façon, à la gestion du CSS près.

## `ApplicationStore`
Le store expose des observables pour les **composants** `barLeft`, `cartridge`, `summary`, etc. qu'il est possible de modifier directement, à effet immédiat, ou bien de passer par la méthode `setHeader` pour en modifier plusieurs à la fois (ce qui était le seul moyen dans la V2).

Ainsi, appeler à n'importe quel endroit `applicationStore.summary = <h2>Mon application</h2>` suffit à changer le composant de `summary` du header.

### Synchroniser l'`ApplicationStore` avec l'état de l'application (valable aussi pour n'importe quel store)
Deux grandes possibilités émergent pour définir les composants du header en fonction de la page/composant courant :
* Dans un `componentWillMount()`, ce qui est la solution employée par le `cartridgeBehaviour` de la V2.
* Dans un `autorun` de MobX pour le dériver d'un state courant.

Un exemple pour la deuxième (avec les `ViewStore` du module `router`) :

```tsx
class MyComponent extends React.Component {
    updater = autorun(() => {
        switch (viewStore.currentView.page) {
            case "home":
                applicationStore.summary = <h2>Home</h2>
                break;
            case "detail":
                applicationStore.summary = <h2>Détail</h2>
                break;
            default:
                applicationStore.summary = null;
                break;
        }
    })

    componentWillUnmount() {
        this.updater();
    }
}
```

Ou bien, si on peut se permettre de faire tourner la réaction en permanence (dans le cas où elle n'entre en conflit avec d'autres réactions similaires), simplement quelque part dans le code :

```ts
autorun(() => {
    switch (viewStore.currentView.page) {
        // Idem...
    }
})
```

Les cas conflictuels viennent de cas où l'on défini de cette façon plusieurs réactions sur un `ViewStore` vide, un état qui arrive également lorsqu'un autre `ViewStore` est actif. Par exemple, le cas suivant est un conflit et est donc à proscrire :

```tsx
autorun(() => {
    if (!viewStore1.currentView.page) {
        applicationStore.summary = <h2>Salut</h2>;
    }
})

autorun(() => {
    if (!viewStore2.currentView.page) {
        applicationStore.summary = <h2>Bonjour</h2>;
    }
})
```

Il peut y avoir de nombreux cas ou les deux `page` sont vides en même temps (`viewStore1` actif mais vide, `viewStore2` actif mais vide, autre store actif...).

*Note : Le problème ne se pose pas pour les réactions définies dans des composants puisqu'elles ne seront actives que lorsque le composant est monté, donc à priori on n'aura jamais deux réactions en même temps.*