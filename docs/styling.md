# Module `styling`

## Gestion du CSS

Gérer le style de composants est un problème compliqué à résoudre correctement. Bien sûr, il est totalement trivial d'écrire des classes en CSS et de les appliquer à des balises HTML, mais il faut beaucoup de bonne volonté et de rigueur pour le faire de façon propre et maintenable. Etant bien souvent victime de négligence de la part des développeurs, on se retrouve rapidement en enfer.

Il existe des tonnes de librairies et de pratiques différentes pour tenter de mettre de l'ordre dans notre CSS. La solution mise en oeuvre dans Focus V4 se base sur différentes idées piochées un peu partout :

### Modules CSS

Un [module CSS](https://github.com/css-modules/css-modules) est un fichier CSS que l'on importe directement dans un fichier de composant. Le contenu de l'import est un object contenant les noms de toutes les classes CSS définies dans le fichier, que l'on peut utiliser directement en tant que `className` sur un tag HTML. L'intérêt de cet usage est que l'on peut demander à Webpack de **brouiller le nom de classes** à la compilation pour ainsi effectivement "scoper" le CSS aux composants qui l'ont importé. Ainsi, on obtient une isolation du CSS que l'on écrit et on peut simplifier beaucoup les noms de classes, quasiment supprimer le nesting et se forcer à regrouper les styles avec les composants qui les utilisent car ils sont liés par le code.

Il est également possible de générer automatiquement des types pour ces imports CSS (un fichier \*.d.ts contenant le nom de toutes les classes globalement) avec [`typed-css-modules`](https://github.com/Quramy/typed-css-modules), ce qui permet de contrôler le nom des classes que l'on importe et de planter à la compilation si on se trompe/on supprime/on refactore du CSS. C'est quasiment gratuit (une commande `tcm` à lancer régulièrement) et c'est pratique.

### Injection de classes CSS

Le scoping des classes est une fonctionnalité à double tranchant, car elle va nous empêcher de surcharger directement le CSS des composants de la librairie. Pour résoudre ce problème, on s'inspire de la librairie [`react-css-themr`](https://github.com/javivelasco/react-css-themr), mise au point avec react-toolbox et réécrite pour Focus, qui permet de faire de la fusion de modules CSS. Avec l'aide de l'API de Context de React, on va construire un combo _Provider_/_Consumer_ (`ThemeProvider` et `useTheme()`) autour d'une propriété `theme` qui contient les classes CSS à utiliser dans un composant. Le hook `useTheme` va aller chercher le CSS du contexte (via `useContext()`) et le fusionner les classes issues du style par défaut (celui du framework), celui passé dans le `ThemeProvider` (le vôtre) et celui passé en Props.

Exemple :

```tsx
// Imports
import displayCss from "./__style__/display.css";

function Display(props) {
    const theme = useTheme("display", displayCss, props.theme);
    /* bla bla */
    return (
        <div data-focus="display" className={theme.display}>
            {(formatter && formatter(displayed)) || displayed}
        </div>
    );
}
```

_Remarque : Pour les composants classes, il existe une fonction `themr` qui permet de créer un composant qui permettra d'injecter le CSS dans vos rendus, selon la même API qu'un `Context.Consumer`._

Le `Layout` inclus déjà le `ThemeProvider`, donc pour surcharger du CSS de manière globale il suffit donc d'ajouter vos propres classes dans la propriété `appTheme` :

```tsx
import {Layout} from "focus4/layout";
import {deployed, scrolling} from "./styles.css";

ReactDOM.render(
    <Layout
        appTheme={{
            display: {
                display
            }
        }}
    >
        {/* Votre appli */}
    </Layout>
);
```
