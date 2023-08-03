# Composants de listes

Focus propose trois composants de liste : `listFor`, `tableFor` et `timelineFor`.

Ces composants permettent respectivement d'afficher une liste, un tableau ou une timeline. Ils partagent tous la même base qui leur permet de gérer de la pagination (par défaut en "scroll infini"). Leur usage minimal est très simple, il suffit de renseigner la liste en question dans la prop `data`, un getter pour la clé à utiliser pour identifier les éléments (obligatoire pour React) `itemKey`, et le composant de ligne `LineComponent`/`MosaicComponent` (resp. `columns` et `TimelineComponent`).

`data` peut être n'importe quel type de liste. En particulier, il peut s'agir aussi bien d'une liste "JS native" que d'un `(Store|Form)ListNode` (ou une liste de `(Form|Store)Node`). Cela impactera bien évidemment le type de la prop `data` du composant de ligne (ou de la définition de colonne), donc le type de liste doit être choisi en fonction de ce qu'il y a besoin d'afficher.

Si le besoin va au-delà d'un simple affichage de liste (pour y inclure du tri ou de la sélection par exemple), il faut utiliser un [`CollectionStore`](/collections/store.md), qui doit se passer dans la prop `store` au lieu de `data`.

## La liste

Si les composants de tableau et de timeline sont assez simples, la liste possède quelques fonctionnalités supplémentaires :

-   On peut passer et afficher des actions sur chaque élement (`operationList`).
-   Elle peut gérer d'un mode liste et d'un mode mosaïque, avec deux composants séparés. (`LineComponent` et `MosaicComponent`)
-   Elle peut gérer un détail d'élément, dont l'affichage se fait par accordéon. (`DetailComponent` et la prop supplémentaire `openDetail` passée aux lignes.)
-   Les lignes de la liste peuvent être des sources de drag and drop.
-   On peut ajouter un handler d'ajout d'élément (affiché uniquement en mosaïque). (`addItemHandler`)

Exemple :

```tsx
listFor({
    data: mainStore.itemList,
    itemKey: e => e.id.value,
    LineComponent: ({data}) => <ItemLine data={data} onLineClick={onItemClick} />,
    EmptyComponent: () => (
        <div>
            <br />
            {i18next.t("page.main.items.empty")}
        </div>
    )
});
```

## Le tableau

Le tableau ne prend pas de composant de colonnes mais une définition de colonnes dans `columns` qui doit contenir au moins un titre (`title`), un contenu (`content`).

Exemple :

```ts
tableFor({
    data: adminStore.health.diagnostics,
    itemKey: i => i.name.value,
    lineClassName: data => (data.status.value === "KO" ? "line--error" : undefined),
    columns: [
        {content: data => stringFor(data.name), title: HealthCheckDiagnosticEntity.name.label},
        {content: data => stringFor(data.status), title: HealthCheckDiagnosticEntity.status.label},
        {content: data => stringFor(data.duration), title: HealthCheckDiagnosticEntity.duration.label},
        {content: data => stringFor(data.error), title: HealthCheckDiagnosticEntity.error.label}
    ]
});
```

## La timeline

La timeline doit include un `dateSelector` pour déterminer quel champ doit être utilisé pour la date.

Exemple :

```ts
timelineFor({
    data: adminStore.historique,
    dateSelector: item => item.date,
    itemKey: item => item.id.value,
    TimelineComponent: HistoriqueAdministrationLine
});
```
