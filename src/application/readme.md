# Module `application`

## `Layout`
Le Layout a été globablement repris de Focus v2 et est censé fonctionner de la même façon, à la gestion du CSS près.

Il contient également les composants de `Menu`, `Popin` et `PopinConfirmation`.

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

## Gestion du CSS
Gérer le style de composants est un problème compliqué à résoudre correctement. Bien sûr, il est totalement trivial d'écrire des classes en CSS et de les appliquer à des balises HTML, mais il faut beaucoup de bonne volonté et de rigueur pour le faire de façon propre et maintenable. Etant bien souvent victime de négligence de la part des développeurs, on se retrouve rapidement en enfer.

Il existe des tonnes de librairies et de pratiques différentes pour tenter de mettre de l'ordre dans notre CSS. La solution mise en oeuvre dans Focus V4 se base sur différentes idées piochées un peu partout :

### Modules CSS
Un [module CSS](https://github.com/css-modules/css-modules) est un fichier CSS que l'on importe directement dans un fichier de composant. Le contenu de l'import est un object contenant les noms de toutes les classes CSS définies dans le fichier, que l'on peut utiliser directement en tant que `className` sur un tag HTML. L'intérêt de cet usage est que l'on peut demander à Webpack de **brouiller le nom de classes** à la compilation pour ainsi effectivement "scoper" le CSS aux composants qui l'ont importé. Ainsi, on obtient une isolation du CSS que l'on écrit et on peut simplifier beaucoup les noms de classes, quasiment supprimer le nesting et se forcer à regrouper les styles avec les composants qui les utilisent car ils sont liés par le code.

Il est également possible de générer automatiquement des types pour ces imports CSS (un fichier *.d.ts contenant le nom de toutes les classes globalement) avec [`typed-css-modules`](https://github.com/Quramy/typed-css-modules), ce qui permet de contrôler le nom des classes que l'on importe et de planter à la compilation si on se trompe/on supprime/on refactore du CSS. C'est quasiment gratuit (une commande `tcm` à lancer régulièrement) et c'est pratique.

### Injection de classes CSS
Le scoping des classes est une fonctionnalité à double tranchant, car elle va nous empêcher de surcharger directement le CSS des composants de la librairie. Pour résoudre ce problème, on va utilise la librairie [`react-css-themr`](https://github.com/javivelasco/react-css-themr) qui permet de fournir un combo *Provider*/*Injector* (`ThemeProvider` et `themr`) autour d'une propriété `theme` qui contient les classes CSS à utiliser dans un composant. L'injecteur va permettre de fusionner les classes issues du Provider (le vôtre), du style par défaut (celui du framework) et celui passé en Props.

Par exemple, le header est défini ainsi:

```tsx
import styles from "./style/header.css";
export type HeaderStyle = Partial<typeof styles>;

export const Header = themr("header", styles)(
    ({classNames}: {classNames?: HeaderStyle}) => {
        return (
            <HeaderScrolling classNames={{
                deployed: theme!.deployed!,
                scrolling: theme!.scrolling!,
                undeployed: theme!.undeployed!
            }}>
    /* Suite du composant... */
```


Le `Layout` inclus déjà le `ThemeProvider`, donc our surcharger le CSS du header, il suffit donc d'ajouter vos propres classes dans la propriété `injectedStyle` :

```tsx
import {Layout} from "focus4/application";
import {deployed, scrolling} from "./styles.css";

ReactDOM.render(
    <Layout injectedStyle={{
        header: {
            deployed
            scrolling
        }
    }}>
        {/* Votre appli */}
    </Layout>
);
```