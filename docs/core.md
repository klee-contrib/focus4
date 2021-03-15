# Module `core`

Le module **`core`** contient les fonctionnalités de base de `focus4`, qui ne dépendent pas d'un framework de vues particulier (en particulier, React).

On y retrouve :

-   La gestion des [messages](#Gestion-des-messages)
-   La gestion des [requêtes](#Gestion-des-requêtes)
-   Le [routeur](#Routeur)
-   La [gestion des libellés](#Gestion-des-libellés) (i18n)
-   Le [store d'utilisateur](#Store-dutilisateur)

## Gestion des messages

Les messages dans une application Focus sont gérés par le **`messageStore`**. Tout message envoyé dans ce store sera transféré au **`MessageCenter`** (posé par le `Layout` du module [`layout`](../layout)), qui les affichera dans une "Snackbar", en bas de l'application.

Les messages peuvent être des messages de succès (affichés en vert), d'erreur (affichés en rouge), ou des warnings (affichés en jaune). Les couleurs sont personnalisables via le module [`styling`](../styling).

Par défaut, tous les formulaires (du module [`forms`](../forms)) envoient des messages de succès lorsqu'une sauvegarde est réalisée avec succès, et toute requête en erreur (voir paragraphe suivant) envoie des messages d'erreurs contenant leurs détails.

Plusieurs messages peuvent être envoyés en même temps ou à suivre, ils seront dépilés un par un par le `MessageCenter`.

## Gestion des requêtes

Focus propose un wrapper à [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) appelé **`coreFetch`**, qui a pour vocation de simplifier son usage dans les cas courants et de traiter automatiquement les erreurs.

Son API est la suivante :

**`coreFetch(method, url, {body?, query?}, options?)`**

-   **`method`** permet de renseigner le verbe HTTP (GET, POST, PUT, DELETE...) de la requête
-   **`url`** permet de renseigner l'URL que l'on veut appeler
-   **`{body?, query?}`** permettent de renseigner le contenu du _body_ de la requête (pour un POST ou un PUT), ainsi que les _query params_ qui devront être ajoutés à l'URL. La méthode s'occupera d'inclure les _query params_ à l'URL et gère donc leur caractère optionnel
-   **`options`** est le paramètre d'options de `window.fetch`. Cet objet d'options est prérempli par `coreFetch` pour y inclure ce qu'on a déjà défini (la méthode et le body en particulier), mais il est surchargeable via ce paramètre.

Cette méthode est accompagnée du **`requestStore`**, qui permettra de suivre la progression de toutes les requêtes. Il pourra être utilisé pour afficher un "spinner" global dans l'application pour indiquer qu'une requête est en cours, ou à fin de debug.

Si `coreFetch` reçoit une erreur et que le corps de la réponse est un JSON, alors le contenu des messages inclus dans `globalErrors` (ou `globalWarnings`) sera poussé dans le `messageStore`.

## Routeur

_Note : il s'agit de `router2`, l'ancien routeur est documenté [ici](./src/router)_

### Présentation

Le routeur est le composant qui permet de gérer les différentes pages d'une application et la navigation entre-elles. Il permet de faire correspondre une URL à son contenu. On retrouve un routeur sur une application "front" pour gérer des pages comme sur une application "back" pour renvoyer la ressource demandée.

Pour un routeur "front", comme pour une SPA, la première idée serait de chercher à faire correspondre nos routes à des pages, ce qui équivaudrait, pour une application React par exemple, à poser des composants en face de chaque route. C'est comme ça que fonctionne la plupart des routeurs existants que les gens utilisent, comme [react-router](https://reactrouter.com/) par exemple. En pratique, relier des composants à des routes entraîne une très forte dépendance entre les deux et peut devenir rapidement limitant en terme de champ des possibles.

Pour Focus, on va donc plutôt remonter d'un cran, et on va plutôt chercher à faire correspondre nos routes à **de l'état**. En utilisant MobX pour cet état, il devient en plus facile à utiliser, et puisque l'on dérive de toute façon nos composants d'état en général, cela s'inclura naturellement dans le reste de l'application. Nous ne sommes pas les seuls à faire ça, mais c'est un système qui est encore peu répandu.

Le routeur qui va être décrit va donc s'occuper de traduire des routes en état (et inversement). Traduire cet état vers un rendu de page via des composants est laissé à la discrétion du dévelopeur pour son application. Les APIs proposées par le routeur posent néanmoins un cadre et vont le guider, tout de même.

### Description du routeur

On va définir notre routeur via un **arbre** qui va décrire **tous les routes possibles**. Tout est défini de manière statique, de façon à ce qu'une route inexistante soit tout simplement inatteignable.

Dans notre arbre de route, on va y trouver à la fois des **sections "fixes"**, qui peuvent par exemple correspondre à des noms de pages (`"operation"`, `"projet"`, `"detail"`...), ainsi que des **paramètres**, à priori liés à une section fixe (`"operation/`**`2`**`"`, `"detail/`**`2020-10-04`**`"`), qui eux sont variables.

Le routeur se définit via les méthodes **`makeRouter2`** et **`param`**, de la façon suivante :

```ts
const echeance = param("echId", p => p.number(), {reglement: param("regId", p => p.number())});

const router = makeRouter2({
    projet: {
        detail: {}
    },
    operation: param("ofaId", p => p.number(), {
        garantie: param("gfaId", p => p.number(true)),
        pret: param("pnfId", p => p.number(true)),
        tam: param(
            "ttaCode",
            p => p.string<"COURANT" | "THEORIQUE">(true),
            param("mprId", p => p.number())
        ),
        echeance
    })
});
```

Les sections fixes sont définis par des propriétés dans un objet JS classique, tandis que les paramètres sont définis par la fonction **`param`**, qui prend les paramètres suivants :

-   **`paramName`**, le nom du paramètre. **Ce nom de paramètre doit être unique** dans tout le routeur, ou du moins il est capital qu'il correspond bien **toujours à la même chose s'il apparaît plusieurs fois**.
-   **`paramType`**, le type du paramètre. Il peut être du type `number` ou `string`. Une URL étant un string, il n'y a aucun problème à définir un paramètre comme étant un string. Pour un nombre en revanche, il sera converti. **Si la conversion en nombre est impossible** (elle donne `NaN`), alors le routeur considèrera que **la route demandée n'existe pas**, puisqu'on attendait un nombre.

    De plus, un paramètre peut être spécifié comme étant **obligatoire** (si on passe `true` à la fonction). Si le paramètre est obligatoire, alors la route définie jusqu'au paramètre mais sans le paramètre n'existe pas. Dans l'exemple ci-dessus, `/operation` et `/operation/1` existent, mais `/operation/1/garantie` n'existe pas, seul `/operation/1/garantie/1` existe pour le paramètre `gfaId` défini comme obligatoire.

-   **`next`**, facultatif, qui permet de définir les éventuelles routes supplémentaires qui seront définies "après" le paramètre. Dans l'exemple, toutes les routes qui commencent par `/operation/:ofaId` sont définies dans ce paramètre.

Il est tout a fait possible (et encouragé !) de subdiviser la définition du routeur en sous-sections, comme on peut le voir dans l'exemple avec `echeance`, ce qui permet par exemple à chaque "module" (si votre application est divisée de cette façon) de définir sa propre section de routeur qui lui correspond. De plus, cela permet aussi de positionner la même section de routeur plusieurs fois à des endroits différents.

Concrètement, cette définition de routeur définit donc toutes les routes suivantes comme étant disponibles :

-   `/`
-   `/projet`
-   `/projet/detail`
-   `/operation`
-   `/operation/:ofaId`
-   `/operation/:ofaId/garantie/:gfaId`
-   `/operation/:ofaId/pret/:pnfId`
-   `/operation/:ofaId/tam/:ttaCode`
-   `/operation/:ofaId/tam/:ttaCode/:mprId`
-   `/operation/:ofaId/echeance`
-   `/operation/:ofaId/echeance/:echId`
-   `/operation/:ofaId/echeance/:echId/reglement`
-   `/operation/:ofaId/echeance/:echId/reglement/:regId`

### API de `Router`

L'objet construit par `makeRouter2` contient les propriétés et méthodes suivantes :

#### `start()`

La méthode asynchrone `start()` permet de démarrer le routeur. C'est la première chose à faire pour lancer l'application et pour que le routeur soit fonctionnel.

Généralement, le fichier racine de la SPA ressemble à quelque chose du style :

```ts
router.start().then(() => {
    import("./init"); // Initialisation des locales et autres...
    import("./views"); // Fichier racine des vues, où il y a le "ReactDOM.render()" par exemple.
});
```

#### `state`

La propriété `state` est l'**objet qui contient les valeurs courantes de tous les paramètres du routeur**. Seuls les paramètres de la route active sont renseignés, tous les autres sont forcés à `undefined` (et de même, un paramètre de la route active ne peut pas être `undefined`).

Pour l'exemple précédent, l'objet `state` a donc la forme suivante :

```ts
interface State {
    projet: {detail: {}};
    operation: {
        ofaId: number;
        pret: {pnfId: number};
        garantie: {gfaId: number};
        tam: {
            ttaCode: "COURANT" | "THEORIQUE";
            mprId: number;
        };
        echeance: {
            echId: number;
            reglement: {regId: number};
        };
    };
}
```

_Remarque : ne vous fiez pas un caractère "non-nullable" des paramètres, ils sont évidemment tous nullables mais c'est difficile à représenter correctement._

_Remarque 2 : Si un même paramètre apparaît plusieurs fois dans le routeur, alors il sera renseigné dans toutes ses occurences dans `state`, d'où l'intérêt de faire en sorte qu'il s'agit bien toujours de la même chose._

Il est possible de modifier une valeur de paramètre manuellement, par exemple `router.state.operation.ofaId = 2`, mais cela ne sera pris en compte que si la route active commence par `/operation/:ofaId`. Cela sera également interprété comme un `replace` pour la navigation (il ne sera pas possible de faire "précédent" pour revenir à la valeur d'avant). De manière générale, l'objet `state` est principalement utilisé en lecture.

Naturellement, les valeurs des paramètres sont observables.

#### `is(url)`

La méthode `is` permet de vérifier si **la section d'URL demandée est active** (= l'URL courante contient cette section). Pour décrire une section d'URL, au lieu d'écrire simplement l'URL, on utilise un construction de lambdas qui permet de décrire l'URL morceau par morceau de façon **typée** (et avec de la complétion), en fonction de la définition du routeur.

Exemples :

```ts
router.is(a => a("operation")("ofaId"));
router.is(a => a("operation")("ofaId")("echeance")("echId")("reglement")("regId"));
```

`is` vérifiant que la **section** demandée est active, ce qui veut dire que dans l'exemple du dessus, si la deuxième condition est vraie alors la première l'est aussi. `is` ne vérifie pas la valeur des paramètres, il vérifie simplement qu'ils sont renseignés (car actifs dans l'URL avec une valeur quelconque).

`is` est une fonction "computed", ce qui veut dire qu'elle a vocation a être utilisée dans des réactions (y compris un `render()`) et donc que tout changement de résultat (true > false ou false > true) relancera la réaction.

#### `get(url)`

La fonction `get` prend **une section d'URL** comme `is`, et renvoie **la section de route suivante** dans l'URL active. Si la section d'URL demandée n'est pas active, où bien si l'URL active est exactement égale à la section, alors `get` renvoie naturellement `undefined`.

Par exemple, `router.get(x => x("operation")("ofaId"))` peut renvoyer :

-   `"pret"` -> si l'URL active commence par `/operation/:ofaId/pret`
-   `"garantie"` -> si l'URL active commence par `/operation/:ofaId/garantie`
-   `"tam"` -> si l'URL active commence par `/operation/:ofaId/tam`
-   `"echeance"`-> si l'URL active commence par `/operation/:ofaId/echeance`
-   `undefined` -> sinon

`get` peut être utilisé dans un switch, pour afficher un composant différent par valeur par exemple, où bien plus directement pour récupérer la valeur pour l'utiliser dans un libellé ou une classe CSS.

Comme `is`, `get` est une fonction "computed".

#### `to(url, replace?)`

La fonction `to` permet de **changer la route active** par une navigation vers l'URL demandée. L'URL se définit également d'une façon similaire à `is` et `get`, sauf que cette fois-ci on doit renseigner les valeurs des paramètres.

Par exemple :

```ts
router.to(a => a("operation")(1)("tam")("COURANT")(4));
router.to(a => a("operation")(1)("echeance")(4)("reglement")(3));
```

C'est tout à fait équivalent à faire une navigation vers `#/operation/1/tam/COURANT/4` ou
`#/operation/1/echeance/4/reglement/3`, par exemple via une balise `<a>` ou en écrivant l'URL dans la barre d'adresse du navigateur.

Le deuxième paramètre `replace`, si renseigné à `true`, remplacera l'ancienne URL dans l'historique par la nouvelle, au lieu de l'ajouter à suivre. Cela implique que si on a remplacé, on ne pourra pas revenir à l'ancienne URL en faisant "précédent" : on ira directement à la valeur d'avant.

#### `href(url)`

La fonction `href` prend en paramètre une description d'URL avec paramètres, la même que `to`, et renvoie l'URL correspondante (au lieu de naviguer). Cela permet de construire des liens "classiques" via une balise `<a>`. Utiliser des liens "classiques" est une bonne pratique puisqu'ils permettent au navigateur de pouvoir proposer des interactions à l'utilisateur avec (par exemple : ouvrir dans un autre onglet).

#### `sub(url)`

Il ne peut y avoir qu'un seul routeur pour toute l'application, puisqu'il n'y a qu'on ne peut utiliser qu'une seule URL en même temps et qu'elle doit être partagée. Cependant, cela forcerait à toute l'application à dépendre du routeur central qui lui même est constitué de toutes les routes de l'application. Un tel système ne serait pas modulaire du tout et serait vite limitant pour une application de taille conséquente.

Pour répondre à ce problème, le routeur dispose d'une méthode `sub` qui permet de construire une **vue du routeur**, qui correspond à **une sous-section**. Ce "sous-routeur" dispose de toutes les méthodes déjà présentées du routeur (`state`, `is()`, `get()`, `to()` et même `sub()`).

```ts
const echRouter = router.sub(a => a("operation")("ofaId")("echeance"));
echRouter.to(a => a(3)("reglement")(4));
echRouter.state.echId = 8;
echRouter.state.reglement.regId = 1;
```

`is` et `get` d'un sous-routeur appeleront `is` et `get` du routeur en y ajoutant la route de base du sous-routeur. `to` appellera `to` du routeur en y ajoutant la route de base, en remplaçant les paramètres de cette route par leur valeur actuelle (c'est le seul usage qui force le sous-routeur a n'être utilisé que lorsque sa route de base est active, mais en pratique ça devrait toujours être le cas par construction).

Si on remonte à la description initiale du routeur, on peut voir que la section `"echeance"` a initialement été décrite via un objet séparé `echeance`. Cela nous permet donc de typer simplement notre sous-routeur via le type **`Router<typeof echeance>`**, qui est un type simple à manipuler, et qui peut être utilisé comme une `prop` du composant racine du "module" échéance. Par conséquent, il est facile de retrouver l'indépendance des différents "modules" malgré le routeur commun : chaque module décrit sa section de routeur, son composant racine attend un routeur du type de la section dans ses `props`, et le tout est assemblé à la racine de l'application.

_Remarque : l'objet `state` d'un sous-routeur qui se termine sur un paramètre (par exemple `router.sub(x => x("operation")("ofaId"))`) contient bien le paramètre (`ofaId`) dans son `state`, mais il n'y est pas dans le type du routeur (`Router<typeof operation>`, en supposant que `operation` est la définition des sous-routes). Il sera donc nécessaire de compléter le type à la main avec quelque chose du genre `& {state: {ofaId: number}}` pour pouvoir l'utiliser._

### Blocages et redirections de routes

L'ensemble du périmètre d'une application est rarement accessible à tous les utilisateurs. Pour répondre à cette problématique, il est possible de définir des règles de **blocage** et de **redirection** dans le routeur.

`makeRouter2` accepte un second paramètre, qui est lambda avec un configurateur qui expose 3 méthodes :

#### `block(url, condition)`

`block` permet d'interdire l'accès à une route, définie par le premier paramètre comme `is`, `get` ou `sub` si la condition en deuxième paramètre (un fonction sans paramètre qui renvoie un booléen) est respectée. La condition est évaluée lors de la navigation uniquement. Une route interdite se comporte comme si elle n'existait pas.

Une règle définie par `block` s'applique à toutes les routes qui commencent par la section de route qui la définit (comme `is`). Il est possible de définir plusieurs règles qui s'appliquent à une même route. Si une condition parmi toutes celles qui sont définies est valide, la route sera bloquée.

#### `redirect(url, condition, to)`

`redirect` se comporte comme `block`, sauf qu'elle a un paramètre supplémentaire qui permet, au lieu de bloquer complètement la route, de rediriger vers une autre route. Le paramètre `to` se définit donc comme le descripteur d'URL de la méthode `to` (avec les valeurs de paramètres).

Puisqu'il est possible de définir plusieurs règles de blocage/redirection qui s'appliquent à une même route, c'est la première règle "valide", par ordre de définition, qui sera appliquée, ce qui va donc influer sur la redirection qui sera effectuée ou non si plusieurs auraient pu être valides.

#### `sub(url)`

Comme pour le routeur en lui-même, on peut aussi se définir une **vue du configurateur de contraintes**, qui pourrait permettre de définir les différentes règles au niveau de chaque "module", comme on peut déjà le faire pour la définition du routeur. Cela reste moins utile puisque cette configuration ne sera utilisée que lors de l'initialisation du routeur, mais cela permet d'être cohérent avec le reste de la définition.

#### Exemple

```ts
function echConstraints(b: RouterConstraintBuilder<typeof echeance>) {
    return b.block(
        a => a("echId")("reglement"),
        () => "yolo".length !== 4
    );
}

makeRouter(
    /* Définition.... */,
    b => {
        b.block(
            a => a("operation")("ofaId"),
            () => "lol".length !== 3
        ).redirect(
            a => a("projet"),
            () => "deso".length !== 4,
            a => a
        );

        echConstraints(b.sub(a => a("operation")("ofaId")("echeance")));
    }
);
```

### Exemples d'utilisation (React)

#### Sélection du composant à afficher

Le composant racine d'une application pourrait ressembler à ça :

```tsx
export function Main() {
    // Cet effet permet de réinitialiser le scroll de la page à chaque changement de module.
    const scrollable = useContext(ScrollableContext);
    useLayoutEffect(() => {
        scrollable.scrollTo({left: 0, top: 0, behavior: "auto"});
    });

    return useObserver(() => {
        const strRouter = router.sub(x => x("structure")("strId")) as StructureRouter;
        const prjRouter = router.sub(x => x("projet")("prjId")) as ProjetRouter;
        const lgnRouter = router.sub(x => x("ligne")("lgnId")) as LigneRouter;

        switch (router.get(x => x)) {
            case "encaissement":
                return <Encaissement router={router.sub(x => x("encaissement"))} />;
            case "decaissement":
                return <Decaissement router={router.sub(x => x("decaissement"))} />;
            case "administration":
                return <AdminPage router={router.sub(x => x("administration"))} />;
            default:
                if (strRouter.is(x => x)) {
                    return <Structure router={strRouter} />;
                } else if (prjRouter.is(x => x)) {
                    return <Projet router={prjRouter} />;
                } else if (lgnRouter.is(x => x)) {
                    return <Ligne router={lgnRouter} />;
                } else {
                    return <Home />;
                }
        }
    });
}
```

On effectue un "switch" sur `router.get(x => x)`, qui permet de choisir le "module" à afficher en fonction de la première section de route active, qui correspond au "module", puis on passe le sous-routeur correspondant à chaque module.

Pour les 4 derniers composants, les modules "Structure", "Projet" et "Ligne" sont liés à des pages de "détail", donc ils contiennent un "id" dans leur routeur de module, à l'inverse des 3 précédents. De plus, le module "Home" inclus les routes de ces modules sans le paramètre (`/structure`, `/projet` et `/ligne`), donc voilà comment cela pourrait être traité.

Ce genre de mécanisme pourra être décliné pour tous les autres écrans de l'application.

#### Chargement de données

Puisque les paramètres du routeur dans le `state` sont observables, il est facile de définir des réactions qui permettent de charger les données correspondante automatiquement.

Par exemple :

```ts
autorun(async () => {
    const {prjId} = router.state.projet;
    if (prjId) {
        data = await loadProjet(prjId);
    }
});
```

Cette réaction peut être posée dans un composant (via `useEffect` ou `@disposeOnUnmount`), ou même dans un "store" externe indépendant si on préfère. Il est **nécessaire de vérifier que le paramètre n'est pas nul**, systématiquement (même dans un composant), au risque d'avoir une mauvaise surprise.

Cela s'intègre parfaitement avec les `FormActions` du module [`stores`](../stores), qui pose une réaction sur les paramètres de la fonction `load` :

```ts
a => a.params(() => router.state.projet.prjId);
```

La fonction `load` n'est déjà appelée que si `params` ne renvoie pas `undefined`, donc il n'y a rien de plus à vérifier.

## Gestion des libellés

L'ensemble des libellés de tous les modules de Focus est contenu dans `translation`. Il n'y a qu'une version en français de disponible, n'hésitez pas à ouvrir une PR pour les autres langues (genre l'anglais)... :)

Toutes les icônes utilisées par Focus sont également décrites dans les fichiers de traduction, ce qui permet de les surcharger. De plus, chaque composant qui utilise des traductions expose une propriété **`i18nPrefix`**, qui est toujours renseignée par défaut à `focus`, qui définit à quel endroit du fichier de traduction il faut chercher les libellés et les icônes. Il est donc possible, pour un composant en particulier, de modifier les libellés et icônes qui y sont utilisées. En général, on remplace quelques entrées, puis on recomplète par les libellés et icônes par défaut.

## Store d'utilisateur

Focus propose une base de store utilisateur, pour y stocker les données de la session. La seule fonctionnalité prévue est la gestion des rôles / permissions (avec `roles` et `hasRole()`), et c'est à chaque application d'y rajouter leurs informations métiers pertinentes.
