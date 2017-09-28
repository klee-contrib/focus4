# Module `Layout`

Ce module contient le composant racine d'une application Focus : le `Layout`. Il contient l'ensemble des composants de base qui doivent se retrouver dans toutes les pages. Par défaut, il ne pose que l'`ErrorCenter` et le `MessageCenter`, laissant à l'utilisateur le soin de composer son layout comme il le souhaite. Néanmoins, 3 composants sont quasiment toujours présents : le `LayoutContent`, le `Menu` et le `Header`.

## `LayoutContent`
TODO

## `Menu`
TODO

## `Header`
TODO

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
                deployed: theme!.deployed,
                scrolling: theme!.scrolling,
                undeployed: theme!.undeployed
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