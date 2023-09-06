# Composants Focus <!-- {docsify-ignore-all} -->

En plus des composants de [listes](./collections.md) et de [présentation](./presentation.md), Focus met à disposition quelques composants de base dans les modules `@focus4/toolbox` et `@focus4/forms` pour construire vos écrans. Ces composants n'ont pas la vocation de constituer une librairie exhaustive et vous êtes tout à fait libres d'y intégrer vos propres composants et d'autres librairies (attention tout de même à l'intégration graphique avec le reste du CSS des composants Focus).

## Composants de `@focus4/toolbox`

`@focus4/toolbox` est une réimplémentation en React moderne de [React Toolbox](https://react-toolbox.io/#/components), une librairie qui implémentait Material Design pour le web. Cette librairie avait été choisie au lancement de la v4 de Focus (en 2016), mais son développement a été malheureusement abandonné 2 ans plus tard... Sans autre alternative viable, elle a fini par être intégralement intégrée dans Focus.

### `Autocomplete`

**_A ne pas confondre avec le composant du même nom `Autocomplete` dans le module `@focus4/forms` !_**

Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.

### `Avatar`

Affiche une icône dans un cercle.

### `Button`

Le bouton standard, qui peut être sous plusieurs formats (`raised`, `floating`) et de plusieurs couleurs (`primary`, `accent`), avoir une icône... Un bouton avec juste une icône est un [`IconButton`](#iconbutton)

### `Calendar`

Affiche un calendrier. Utilisé par l'[`InputDate`](#inputdate).

### `Checkbox`

Une checkbox.

### `Chip`

Affiche un chip pour représenter un élément sélectionné, qui peut avoir une action de suppression.

### `Clock`

Affiche une horloge. Utilisé par l'[`InputTime`](#inputdate).

### `Dropdown`

Composant de sélection avec personnalisation de l'affichage des éléments (à l'inverse du [`Select`](#select) qui est un simple `<select>`).

### `FontIcon`

Affiche une icône. Prend directement un nom d'icône Material en enfant, ou bien une icône personnalisée avec `getIcon`.

### `IconButton`

Un bouton avec juste une icône. Les autres types de boutons sont réalisés avec le [`Button`](#button)

### `Input`

**_A ne pas confondre avec le composant du même nom `Input` dans le module `@focus4/forms` !_**

Champ de saisie texte standard. A priori à ne jamais utiliser directement et utiliser celui de `@focus4/forms` qui contient plus de fonctionnalités.

### `Menu`

Ensemble de composants pour réaliser des menus contextuels à partir d'un [`Button`](#button) ou [`IconButton`](#iconbutton) avec une liste d'actions.

Exemple `ButtonMenu` :

```tsx
<ButtonMenu
    button={{
        label: userStore.userName,
        icon: "more_vert"
    }}
    position="topRight"
>
    <MenuItem
        caption={mode.dark ? "Mode clair" : "Mode sombre"}
        icon={mode.dark ? "light_mode" : "dark_mode"}
        onClick={() => (mode.dark = !mode.dark)}
    />
    <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
</ButtonMenu>
```

Exemple `IconMenu` :

```tsx
<IconMenu icon="more_vert" position="topRight">
    <MenuItem
        caption={mode.dark ? "Mode clair" : "Mode sombre"}
        icon={mode.dark ? "light_mode" : "dark_mode"}
        onClick={() => (mode.dark = !mode.dark)}
    />
    <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
</IconMenu>
```

### `ProgressBar`

Une barre de chargement ou un spinner (`linear` ou `circular`). Peut être utilisé de façon déterminée ou indéterminée.

### `Radio`

Ensemble de composants (`RadioGroup` / `RadioButton`) pour faire un composant de sélection en radio. Les composants [`BooleanRadio`](#booleanradio) et [`SelectRadio`](#selectradio) en sont des implémentations pour les usages les plus courants.

### `Slider`

Un composant de saisie pour saisir un nombre avec un slider.

### `Snackbar`

Le composant pour afficher des toasts utilisé par le [`MessageCenter`](./basics/messages.md).

### `Switch`

Un switch, fonctionnellement identique à la [`Checkbox`](#checkbox)

### `Tabs`

Un ensemble de composants pour faire des tabs (`Tabs`, `Tab` et `TabContent`).

### `tooltipFactory`

Une factory pour ajouter une tooltip à un composant ou un élément HTML. Cela permet de créer une version du même composant/élément avec une tooltip de la façon suivante :

```tsx
const TooltippedButton = tooltipFactory()(Button);

<TooltippedButton label="Click" tooltip="Click me" />; // Les props de la tooltip sont ajoutées aux props existantes du composant.
```

### `rippleFactory`

Une factory pour ajouter des "ripples" à un composant. Est utilisé largement par les autres composants pour les divers boutons. S'utilise de la même manière que la [`tooltipFactory`](#tooltipfactory)

## Composants de `@focus4/forms`

`@focus4/forms` contient, en plus des [composants de formulaires](./model/form-usage.md), quelques composants supplémentaires qui s'ajoutent à ceux `@focus4/toolbox` et peuvent parfois les surcharger. Historiquement, ces composants n'étaient pas dans `react-toolbox`, ce qui est la principale raison pour laquelle ils sont dans un module différent...

### `Autocomplete`

**_A ne pas confondre avec le composant du même nom `Autocomplete` dans le module `@focus4/toolbox` !_**

Champ de saisie en autocomplétion à partir d'un **service de recherche**. Il s'agit d'un wrapper autour de l'autre `Autocomplete` pour construire la liste des valeurs disponibles via un appel à une API.

Il s'agit du composant par défaut pour [`autocompleteFor`](./model/display-fields.md#autocompleteforfield-options).

### `BooleanRadio`

Un radio oui/non pour un booléen.

### `ButtonHelp`

Un bouton d'aide (...)

### `Display`

Le composant d'affichage par défaut pour [toutes les fonctions d'affichage de champs](./model/display-fields.md). Résout les listes de références, les autocompletes via `keyResolver`, les traductions i18n et peut afficher des listes de valeurs.

### `InputDate`

Un champ de saisie de date avec double saisie en texte (avec un `Input`) et un calendrier (`Calendar`), qui s'affiche en dessous.

### `InputTime`

Un champ de saisie d'heure avec double saisie en texte (avec un `Input`) et une horloge (`Clock`), qui s'affiche en dessous.

### `Input`

**_A ne pas confondre avec le composant du même nom `Input` dans le module `@focus4/toolbox` !_**

Surcharge du `Input` de `@focus4/toolbox` pour ajouter :

-   La gestion de masques de saisie
-   Une gestion propre de saisie de nombre (avec formattage, restrictions de décimales, et un `onChange` qui renvoie bien un nombre)

Il s'agit du composant par défaut pour [`fieldFor`](./model/display-fields.md#fieldforfield-options).

### `Label`

Le composant d'affichage du libellé par défaut pour [toutes les fonctions d'affichage de champs](./model/display-fields.md). Peut inclure une tooltip à côté du libellé.

### `Panel`

Le composant standard pour afficher un bloc avec un titre, des actions et un contenu. Utilisé largement par les formulaires.

### `Select`

Un composant de saisie pour choisir un élément dans une liste de référence, via un `<select>` HTML natif.

Il s'agit du composant par défaut pour [`selectFor`](./model/display-fields.md#selectforfield-values-options).

### `SelectCheckbox`

Un composant de sélection multiple pour un champ de type liste de valeurs avec plusieurs choix possibles, dans une liste de référence.

### `SelectRadio`

Un composant de saisie pour choisir un élément dans une liste de référence en utilisant un [`Radio`](#radio)
