# Module `forms`

Il contient :

-   Les composants de champs et de formulaires module `stores`
-   Les spécialisations "React" des "builders" de formulaires de `stores`

## Composants

### `fieldFor(field, options?)`

C'est la fonction principale, elle permet d'afficher un champ avec son libellé, à partir de ses métadonnées (en particulier le domaine). Elle prend comme paramètres :

-   `field`, un `EntityField`
-   `options`, les différentes options à passer au champ. Il ne s'agit uniquement de props pour le composant de Field, et _il n'y est pas possible de surcharger les métadonnées du champ_.

Le composant de Field utilisera ses composants par défaut si le domaine ne les renseignent pas (`Input`, `Display` et `Label` de `forms`).

### `selectFor(field, values, options?)`

La fonction `selectFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec une liste de référence. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `values`, la liste de référence à utiliser pour résoudre le code.
-   `options`, comme `fieldFor`, avec une option en plus pour personnaliser le composant de `Select`.

### `autocompleteFor(field, options)`

La fonction `autocompleteFor` est une version spécialisée de `fieldFor` pour l'affichage de champ avec un champ d'autocomplétion. Elle prend comme paramètres :

-   `field`, le champ contenant le code
-   `options`, comme `fieldFor`, où il faut également préciser `keyResolver` et/ou `querySearcher` pour gérer la consultation et/ou la saisie. De plus, il y est possible de personnaliser le composant d'`Autocomplete`.

#### `<Form>`

`Form` est un composant qui sert à poser le formulaire dans un composant React. Il utilise l'objet d'actions dans son cycle de vie (en particulier, il appelle `load` pendant son `componentWillMount`) et peut poser un formulaire HTML dont l'action est le `save`.

La propriété `formProps` de `FormActions` contient toutes les props nécessaires au `Form`, donc en pratique son utilisation est très simple :

```tsx
render() {
    return (
        <Form {...this.actions.formProps}>
            {/* blablabla */}
        </Form>
    );
}
```

On peut y passer également la prop `noForm` pour désactiver le form HTML, et contrôler les `labelRatio` de tous champs qu'il contient.

#### `<Panel>`

C'est un composant qui permet de poser un panel avec un titre et des boutons d'actions. Il n'est pas spécialement lié aux formulaires (il se trouve dans le module `components`), mais en pratique il est quasiment toujours utilisé avec.

Comme pour `<Form>`, `FormActions` expose `actions.panelProps`, qui contient les méthodes et les états nécessaires à son fonctionnements.

### Création de formulaire

### `makeFormNode`

`makeFormNode` est la fonction a utiliser pour créer un noeud de formulaire dans un **composant classe**. Ses paramètres sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de synchronisation lorsque le composant sera démonté).
-   `node`, le noeud à partir duquel on construit le formulaire. Il n'y a aucune restriction sur la nature de ce noeud (simple, liste, composé...). Il n'est juste pas possible de créer un `FormNode` à partir d'un autre `FormNode`.
-   `builder` : il s'agit d'une fonction qui sera appellée avec le `Form(List)Builder`, pour pouvoir paramétrer le noeud de formulaire.
-   `initialData` : Pour renseigner une valeur initiale au formulaire (par défaut, il sera vide).

### `useFormNode`

`useFormNode` est la fonction a utiliser pour créer un noeud de formulaire dans un **composant fonction**. Ses paramètres sont les mêmes que `makeFormNode`, sauf qu'il n'y a pas besoin de lui passer `this`.

### `makeFormActions`

`makeFormActions` est la fonction a utiliser pour créer des actions de formulaire dans un **composant classe**. Ses paramètres sont :

-   `componentClass` : passer `this` (permet de disposer de la réaction de chargement lorsque le composant sera démonté).
-   `formNode`, le `Form(List)Node` sur lequel les actions vont interagir.
-   `builder` : il s'agit d'une fonction qui sera appellée avec le `FormActions`, pour pouvoir paramétrer les actions

### `useFormActions`

`useFormActions` est la fonction a utiliser pour créer les actions d'un formulaire dans un **composant fonction**. Ses paramètres sont les mêmes que `makeFormActions`, sauf qu'il n'y a pas besoin de lui passer `this`.
