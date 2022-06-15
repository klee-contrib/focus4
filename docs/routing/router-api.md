# API de `Router`

L'objet construit par `makeRouter` contient les propriétés et méthodes suivantes :

## `start()`

La méthode asynchrone `start()` permet de démarrer le routeur. C'est la première chose à faire pour lancer l'application et pour que le routeur soit fonctionnel.

Généralement, le fichier racine de la SPA ressemble à quelque chose du style :

```ts
router.start().then(() => {
    import("./init"); // Initialisation des locales et autres...
    import("./views"); // Fichier racine des vues, où il y a le "ReactDOM.render()" par exemple.
});
```

## `state`

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

## `query`

La propriété `query` est l'**objet qui contient les valeurs courantes de tous les query params du routeur**. Les query params étant transverses au routeur, ils sont recopiés tels quels dans les sous-routeurs.

Naturellement, les valeurs des query params sont observables.

## `is(url)`

La méthode `is` permet de vérifier si **la section d'URL demandée est active** (= l'URL courante contient cette section). Pour décrire une section d'URL, au lieu d'écrire simplement l'URL, on utilise un construction de lambdas qui permet de décrire l'URL morceau par morceau de façon **typée** (et avec de la complétion), en fonction de la définition du routeur.

Exemples :

```ts
router.is(a => a("operation")("ofaId"));
router.is(a => a("operation")("ofaId")("echeance")("echId")("reglement")("regId"));
```

`is` vérifiant que la **section** demandée est active, ce qui veut dire que dans l'exemple du dessus, si la deuxième condition est vraie alors la première l'est aussi. `is` ne vérifie pas la valeur des paramètres, il vérifie simplement qu'ils sont renseignés (car actifs dans l'URL avec une valeur quelconque).

`is` est une fonction "computed", ce qui veut dire qu'elle a vocation a être utilisée dans des réactions (y compris un `render()`) et donc que tout changement de résultat (true > false ou false > true) relancera la réaction.

## `get(url)`

La fonction `get` prend **une section d'URL** comme `is`, et renvoie **la section de route suivante** dans l'URL active. Si la section d'URL demandée n'est pas active, où bien si l'URL active est exactement égale à la section, alors `get` renvoie naturellement `undefined`.

Par exemple, `router.get(x => x("operation")("ofaId"))` peut renvoyer :

-   `"pret"` -> si l'URL active commence par `/operation/:ofaId/pret`
-   `"garantie"` -> si l'URL active commence par `/operation/:ofaId/garantie`
-   `"tam"` -> si l'URL active commence par `/operation/:ofaId/tam`
-   `"echeance"`-> si l'URL active commence par `/operation/:ofaId/echeance`
-   `undefined` -> sinon

`get` peut être utilisé dans un switch, pour afficher un composant différent par valeur par exemple, où bien plus directement pour récupérer la valeur pour l'utiliser dans un libellé ou une classe CSS.

Comme `is`, `get` est une fonction "computed".

## `to(url, replace?, query?)`

La fonction `to` permet de **changer la route active** par une navigation vers l'URL demandée. L'URL se définit également d'une façon similaire à `is` et `get`, sauf que cette fois-ci on doit renseigner les valeurs des paramètres.

Par exemple :

```ts
router.to(a => a("operation")(1)("tam")("COURANT")(4));
router.to(a => a("operation")(1)("echeance")(4)("reglement")(3));
```

C'est tout à fait équivalent à faire une navigation vers `#/operation/1/tam/COURANT/4` ou
`#/operation/1/echeance/4/reglement/3`, par exemple via une balise `<a>` ou en écrivant l'URL dans la barre d'adresse du navigateur.

Le deuxième paramètre `replace`, si renseigné à `true`, remplacera l'ancienne URL dans l'historique par la nouvelle, au lieu de l'ajouter à suivre. Cela implique que si on a remplacé, on ne pourra pas revenir à l'ancienne URL en faisant "précédent" : on ira directement à la valeur d'avant.

Le troisième paramètre `query`, si renseigné, modifiera également les query params du routeur par les valeurs dans l'objet donné. Sinon, les query params sont **inchangés** lors d'une navigation avec `to`.

## `href(url, query?)`

La fonction `href` prend en paramètre une description d'URL avec paramètres, la même que `to`, et renvoie l'URL correspondante (au lieu de naviguer). Cela permet de construire des liens "classiques" via une balise `<a>`. Utiliser des liens "classiques" est une bonne pratique puisqu'ils permettent au navigateur de pouvoir proposer des interactions à l'utilisateur avec (par exemple : ouvrir dans un autre onglet).

L'URL générée peut être complétée de query params avec le deuxième paramètre (puisqu'il s'agit d'une URL complète, ne pas spécifier de query params ici va les vider, à l'inverse de `to`).

## `sub(url)`

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
