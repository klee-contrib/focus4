# Module `theming`
Gérer le style de composants est un problème compliqué à résoudre correctement. Bien sûr, il est totalement trivial d'écrire des classes en CSS et de les appliquer à des balises HTML, mais il faut beaucoup de bonne volonté et de rigueur pour le faire de façon propre et maintenable. Etant bien souvent victime de négligence de la part des développeurs, on se retrouve rapidement en enfer.

Il existe des tonnes de librairies et de pratiques différentes pour tenter de mettre de l'ordre dans notre CSS. La solution mise en oeuvre dans Focus V4 se base sur différentes idées piochées un peu partout :

## Modules CSS
Un [module CSS](https://github.com/css-modules/css-modules) est un fichier CSS que l'on importe directement dans un fichier de composant. Le contenu de l'import est un object contenant les noms de toutes les classes CSS définies dans le fichier, que l'on peut utiliser directement en tant que `className` sur un tag HTML. L'intérêt de cet usage est que l'on peut demander à Webpack de **brouiller le nom de classes** à la compilation pour ainsi effectivement "scoper" le CSS aux composants qui l'ont importé. Ainsi, on obtient une isolation du CSS que l'on écrit et on peut simplifier beaucoup les noms de classes, quasiment supprimer le nesting et se forcer à regrouper les styles avec les composants qui les utilisent car ils sont liés par le code.

Il est également possible de générer automatiquement des types pour ces imports CSS (un fichier *.d.ts contenant le nom de toutes les classes globalement) avec [`typed-css-modules`](https://github.com/Quramy/typed-css-modules), ce qui permet de contrôler le nom des classes que l'on importe et de planter à la compilation si on se trompe/on supprime/on refactore du CSS. C'est quasiment gratuit (une commande `tcm` à lancer régulièrement) et c'est pratique.

## Injection de classes CSS
Le scoping des classes est une fonctionnalité à double tranchant, car elle va nous empêcher de surcharger directement le CSS des composants de la librairie. Pour résoudre ce problème, en prenant inspiration de [`material-ui`](http://www.materialui.com) qui lui le fait avec de styles inline, Focus V4 propose un mécanisme de "Provider" / "Injecter" (HoC) pour injecter des classes CSS additionnelles dans des composants. Par exemple, cela fonctionne ainsi :

```tsx
import {StyleProvider, injectStyle} from "focus4/theming";
import {list, line} from "./style.css";

ReactDOM.render(
    <StyleProvider listClasses={list, line}>
        <MyComponent />
    </StyleProvider>
)

// Cas fonction
const MyComponent = injectStyle("listClasses", ({classNames}) => (
    <ul className={classNames.list}>
        <li className={classNames.line}>Hello</li>
    </ul>
))

// Cas décorateur
@injectStyle("listClasses")
class MyComponent extends React.Component {
    render() {
        // Idem au dessus...
    }
}
```

Globalement, il n'y a pas vraiment besoin de sortir le combo `StyleProvider`/`injectStyle` pour vos propres composants (à moins qu'il y ai besoin de gérer plusieurs thèmes). Par contre, l'intégralité des classes CSS de Focus V4 sont doublonnées dans un `StyleProvider` intégré au `Layout`, ce qui permet effectivement de surcharger le CSS de base. Chaque composant utilisant du CSS est muni de son `injectStyle`, qui lui fourni une prop `classNames`, dont chaque propriété est utilisée en plus de celle récupérée par le CSS de base.

Par exemple, le header est défini ainsi:

```tsx
import styles from "./style/header.css";
export type HeaderStyle = Partial<typeof styles>;

export const Header = injectStyle("header",
    ({classNames}: {classNames?: HeaderStyle}) => {
        return (
            <HeaderScrolling classNames={{
                deployed: `${styles.deployed} ${classNames!.deployed || ""}`,
                scrolling: `${styles.scrolling} ${classNames!.scrolling || ""}`,
                undeployed: `${styles.undeployed} ${classNames!.undeployed || ""}`
            }}>
    /* Suite du composant... */
```

Pour surcharger le CSS du header, il suffit donc d'ajouter vos propres classes dans le `Layout` :

```tsx
import {Layout} from "focus4/application";
import {deployed, scrolling} from "./styles.css";

ReactDOM.render(
    <Layout injectedStyles={{
        header: {
            deployed
            scrolling
        }
    }}>
        {/* Votre appli */}
    </Layout>
);
```