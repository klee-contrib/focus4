# Module `stores`

Le module **`stores`** contient les 4 types de stores proposés par Focus :

-   Les [stores d'entités](#stores-dentités), ainsi que les [stores de formulaires](#Stores-de-formulaires) associés
-   Les [stores de collections](#Stores-de-collections)
-   Les [stores de références](#Stores-de-références)

Ce module est générique, c'est-à-dire que son contenu n'est pas lié à un framework de SPA en particulier. Pour React, le module **[`forms`](../forms)** contient les méthodes pour instancier des formulaires ainsi que les différents composants de rendu, et le module **[`collections`](../collections)** contient tous les composants de listes.

## Stores d'entités

### Définitions

#### Entité

Au sein de Focus, on appelle **entité** tout objet "métier" d'une application, à priori issu du (et généré à partir du) modèle de données. C'est un objet d'échange entre le client et le serveur, à partir duquel on va construire tous les rendus et formulaires qui vont peupler une application Focus.

#### Champ

Une entité est constituée de **champs**, objet primitif représentant une des valeurs qui la constitue. Une entité peut également contenir d'autres entités, mais en fin de compte toute la donnée sera représentée comme un ensemble de champs. Un champ est défini par son nom, son caractère obligatoire, son type (au choix parmi `string`, `number`, `boolean`, ou un array de ceux-ci) et son domaine.

#### Domaine

Le **domaine** d'un champ répresente le type de donnée métier qui lui est associé (par exemple : une date, un numéro de téléphone, un montant...). On se sert du domaine pour définir des validateurs de saisie, des formatteurs, ou encore des composants de saisie/présentation/libellé personnalisés.

### Principes généraux

-   Le concept central autour des stores d'entités, comme leur nom ne l'indique pas, est le **champ**. Une entité n'est qu'un ensemble de champs comme un autre, et les différentes APIs proposées n'agissent directement que sur des champs (ou parfois sur des ensembles de champs).
-   Un champ est **autonome** et n'a jamais besoin d'un contexte extérieur pour compléter sa définition, ce qui permet justement aux APIs d'utiliser des champs directement. Même s'il est en pratique rattaché à un conteneur, ce rattachement est transparant à l'utilisation.

### `StoreNode`

#### Présentation

Une entité retournée directement depuis le serveur est, comme tout le reste, un objet JSON simple. Parfois, pour diverses raisons, c'est bien la donnée seule qui nous intéresse. Dans ce cas, il suffit de stocker cette donnée dans une simple observable et de l'utiliser comme n'importe quel autre état. Dans d'autres cas, cette donnée est une liste que l'on voudra manipuler. Ici, il faudra s'orienter vers un [store de liste](#Stores-de-collections).

Dans le cas où la donnée a besoin d'être consommée sous forme de champs, par exemple pour construire un quelconque formulaire ou simplement pour afficher quelques champs formattés avec leurs libellés, Focus met à disposition un **`store d'entités`**. C'est un store construit à partir de définitions d'entités (et donc des champs qui la composent), qui présente toute la structure de données sous forme d'un "arbre" de champs, prêts à être renseigns avec des valeurs chargées depuis le serveur ou saisies dans l'application.

Par exemple, un objet `operation` de la forme:

```ts
{
    id: 1,
    number: "1.3",
    amount: 34.3
}
```

sera stocké dans un **`StoreNode`** sous la forme :

```ts
{
    operation: {
        id: {
            $field: {type: "field", fieldType: "number", isRequired: false, domain: DO_ID, label: "operation.id"},
            value: 1
        },
        number: {
            $field: {type: "field", fieldType: "string", isRequired: false, domain: DO_NUMBER, label: "operation.number"},
            value: "1.3"
        },
        amount: {
            $field: {type: "field", fieldType: "number", isRequired: true, domain: DO_AMOUNT, label: "operation.amount"},
            value: 34.3
        }
    }
}
```

A partir des champs ainsi déclarés (dans un objet qu'on appelera par la suite `EntityField`), on va pouvoir construire des méthodes simples pour les consommer.

Construire un `StoreNode` est une façon de créer des champs mais n'est pas la seule. Il n'est adapté que si les champs sont liés à une entité et que l'on aura besoin de plusieurs champs de cette dernière.

Il est également possible de créer et utiliser des **`StoreListNode`**, qui sont des listes de `StoreNode`. Ce sont des arrays observables avec quelques propriétés en plus.

#### Constitution et APIs des noeuds (`StoreNode` et `StoreListNode`)

Un chaque objet contenu dans un `StoreNode` ne peut être que l'un des trois objets suivants :

-   Un `EntityField`, objet représentant un champ, détaillé dans le paragraphe précédent. La propriété `value` d'un champ est observable.
-   Un autre `StoreNode`
-   Un `StoreListNode`

Le `StoreNode` et le `StoreListNode` ont une API similaire, qui contient les méthodes suivantes :

-   `replace(data)`/`replaceNodes(data)`, qui remplace le noeud (récursivement) intégralement par l'objet (sous forme "JSON") passé en paramètre. `replace` sur un array observable existe déjà et est la méthode utilisée pour remplacer l'array par l'array donné : `replaceNodes` réalise la construction des `StoreNode`s en plus.
-   `set(data)`/`setNodes(data)`, qui met à jour le noeud (récursivement) avec les champs renseignés dans `data` (c'est un "merge"). Pour un noeud de liste, si l'objet à l'index passé n'existe pas encore dans la liste, il sera créé en même temps.
-   `clear()`, qui vide récursivement le noeud et son contenu.

Le `StoreListNode` possède également une méthode `pushNode(...items)`, qui est à `push(...items)` ce qu'est `replaceNode` à `replace`.

C'est aussi l'occasion de préciser que, contrairement à de la donnée brute sous forme de JSON, un `StoreNode` contient toujours l'ensemble de tous les champs du noeud. Si une valeur n'est pas renseignée, la propriété `value` du champ a simplement pour valeur `undefined`. De même, il faut toujours garder à l'esprit que `store.operation.id` est un _`EntityField`_ (qui est donc toujours "vrai") et non un _`number | undefined`_. La valeur est bien toujours `store.operation.id.value`.

De plus, il convient également de rappeler que la modification d'un noeud ou de l'un de ses champs n'est pas limité à l'usage des méthodes `replace()`, `set()` ou `clear()`. Ce sont des méthodes utilitaires qui permettent simplement d'affecter plusieurs valeurs en même temps à des champs. Il est parfaitement possible de faire l'affection manuellement, par exemple `store.operation.id.value = undefined`. Les valeurs des champs et les listes sont observables, donc MobX se chargera de mettre à jour les dépendances.

#### APIs globales

##### `makeEntityStore(config)`

La fonction `makeEntityStore` permet de créer un `StoreNode` composite à partir de plusieurs entités. Son unique paramètre est un objet de configuration, qui permet de décrire le contenu du `StoreNode` que l'on souhaite créer. Il peut donc contenir :

-   Des objets de définition d'entité (généralement générés sous le nom `OperationEntity`), pour générér les `StoreNode`s correspondants.
-   Des arrays contenants un objet d'entité (`[OperationEntity]`), pour générer les `StoreListNode`s correspondants.
-   Des `StoreNode`s pré-existants. Cela permet de les rattacher aux méthodes `replace`, `set` et `clear` du store, pour associer des ensembles d'entités liées par exemple.

##### `buildNode(entity)`

La fonction `buildNode` permet de créer un `StoreNode` ou un `StoreListNode` à partir d'un objet de définition d'entité. Comme pour `makeEntityStore`, un `StoreListNode` s'obtient en passant un array.

Cette fonction est plutôt préconisée lorsqu'on a besoin de créer un noeud unique à la volée (pour des données provenant d'un store de liste, par exemple). `makeEntityStore` est plus adapté pour des stores stables qui seront utilisés à travers plusieurs composants.

##### `toFlatValues(node)`

Cette fonction prend un noeud quelconque en paramètre et récupère toutes les valeurs de champs dans son objet "JSON" équivalent.

### Afficher des champs

La seule API fournie par le module `stores` est la fonction **`stringFor`**, qui permet d'obtenir la valeur textuelle en utilisant le formatteur (du domaine), ainsi qu'une éventuelle [liste de référence](#Stores-de-références). Sa signature est donc `stringFor(field, values?)`.

Tous les composants d'affichages de champs dépendent du framework de SPA utilisé, donc il ne seront pas présent dans ce module (voir [`forms`](../forms) pour React).

### Création et modification de champs

Jusqu'ici, les champs que l'on manipule font partis d'un `StoreNode`, et ces champs ont été initialisés et figés par la définition initiale des entités générées depuis le modèle. Or, bien souvent, on peut avoir besoin de modifier une métadonnée en particulier, ou bien d'avoir à remplacer un composant dans un écran précis pour un champ donné. Et même, on peut vouloir créer un champ à la volée sans avoir besoin de créer un `StoreNode` tout entier.

Pour répondre à ces problématiques, Focus propose trois fonctions utilitaires :

#### `fromField(field, $field)`

Cette fonction permet de dupliquer un champ en remplaçant certaines métadonnées par celles précisées dans `$field`. Cette fonction ne sert qu'à de l'affichage (et en passant, on n'a bien parlé que de ça depuis le début).

#### `makeField(value, $field?)`

Cette fonction permet de créer un field à partir d'une valeur. L'objet optionnel `$field` peut contenir toutes les métadonnées (ainsi que celles portées par le domaine) à ajouter au champ ainsi créé. Par défaut, le champ n'a pas de nom, pas de domaine et n'est pas obligatoire.

Cet usage de `makeField` (il y en aura d'autres plus bas) peut servir à récréer rapidement un champ entier à partir d'une valeur, ou simplement pour ajouter un domaine, un formatteur ou juste un libellé et profiter des fonctions et composants d'affichage.

### Gestion de l'édition.

Le sujet n'a pas réellement été abordé jusque ici pour une raison simple : **les champs ne gèrent pas l'édition nativement**.

Du moins, une propriété `isEdit` peut être ajoutée aux champs, qui pourra être lue par des composants de champs, mais elle est presque toujours gérée par un noeud de formulaire. En l'absence de cette propriété, il n'est pas possible d'afficher un champ en édition.

Il existe deux possibilités (_en dehors d'un formulaire, voir section suivante_) pour gérer un champ en édition :

#### `makeField(getter, $field, setter, isEdit?)`

Cette deuxième signature de `makeField` permet de créer un champ "à la volée" à partir d'un getter et d'un setter. Les paramètres sont les suivants :

-   `getter` est une fonction sans paramètre représant une dérivation qui retourne la valeur.
-   `$field` pour y renseigner des métadonnées.
-   `setter` est une fonction qui prend la valeur comme paramètre et qui doit se charger de mettre à jour la valeur retournée par le getter.
-   `isEdit` peut être renseigné à `true` pour afficher le champ en édition.

#### `cloneField(field, isEdit?)`

Cette méthode est un raccourci pour le `makeField` du dessus pour créer un champ (à priori en édition) à partir d'un champ existant, en réutilisant son getter, son setter et ses métadonnées.

## Stores de formulaires

L'affichage de champs est certes une problématique intéressante à résoudre, mais le coeur d'une application de gestion reste tout de même constitué d'écrans de saisie, ou **formulaires**.

Pour réaliser un formulaire, les entités et champs dont on dispose vont devoir être complétés d'un état d'**édition** ainsi qu'un état (dérivé) de **validation**. C'est le rôle du `FormNode`, présenté ci-après.

### Le noeud de formulaire : `Form(List)Node`

Un formulaire sera toujours construit à partir d'un `Store(List)Node`, qui sera ici quasiment toujours une entité ou une liste d'entité. Définir un formulaire à ce niveau là fait sens puisque on se base sur des objets d'échange avec le serveur (qui est en passant toujours responsable de la validation et de la sauvegarde des données), et on ne fait pas vraiment de formulaires basés sur un champ unique.

Un `Form(List)Node`, construit via les classes `FormNodeBuilder` ou `FormListNodeBuilder`, est une copie conforme du noeud à partir duquel il a été créé, qui sera "abonné" aux modifications de ce noeud. Il représentera **l'état interne du formulaire**, qui sera modifié lors de la saisie de l'utilisateur, **sans impacter l'état du noeud initial**.

En pratique, un `Form(List)Node` sera créé via [**`makeFormNode`**](../forms#makeFormNode)

#### Contenu

Tous les objets contenus dans un `FormNode` (et y compris le `FormNode` lui-même) sont complétés de propriétés supplémentaires représentant les états d'édition et de validation de l'objet. Ils prennent la forme :

-   Sur un `Form(List)Node`
    -   `form`, un objet muni des trois propriétés `isEdit`, `isValid` et `errors`.
    -   `sourceNode`, une référence vers le noeud source équivalent du `FormNode`
    -   `reset()`, une méthode pour réinitialiser le `FormNode` sur son `sourceNode`.
-   Des trois propriétés additionnelles `isEdit`, `isValid` et `error` sur un `EntityField`.

Les propriétés `error(s)` et `isValid` sont en lecture seule et sont calculées automatiquement. `error` est le message d'erreur de validation sur un champ et vaut `undefined` si il n'y a pas d'erreur. `errors` est l'objet qui contient l'ensemble des erreurs des champs contenu dans un noeud. `isValid` sur un noeud est le résultat de validation de tous les champs qu'il contient, valant donc `true` seulement si toutes les propriétés `isValid` des champs valent `true`. A noter cependant que si le noeud/champ n'est pas en édition, alors `isValid` vaut forcément `true` (en effet, il n'y a pas besoin de la validation si on n'est pas en cours de saisie).

Les propriétés `isEdit` sont modifiables, mais chaque `isEdit` est l'intersection de l'état d'édition du noeud/champ et de celui de son parent, ce qui veut dire qu'un champ de formulaire ne peut être en édition (et donc modifiable) que si le formulaire est en édition _et_ que son éventuel noeud parent est en édition _et_ que lui-même est en édition. En pratique, le seul état d'édition que l'on manipule directement est celui du `FormNode`, dont l'état initial peut être passé à la création (par défaut, ce sera `false`). Tous les sous-états d'édition sont initialisés à `true`, pour laisser l'état global piloter toute l'édition.

Les composants de champ utiliseront ces deux propriétés pour gérer le mode édition et afficher les erreurs de validation, comme attendu.

### Transformations de noeuds et champs pour un formulaire

Un noeud de formulaire n'est pas contraint d'être une simple copie conforme du noeud initial. Il est très souvent nécessaire d'adapter, plus ou moins finement, le noeud qui va être créer, pour par exemple :

-   Définir un état d'édition initial
-   Désactiver l'édition sur un ou plusieurs champs
-   Rendre certains champs obligatoires (ou non)
-   Implémenter des validateurs supplémentaires
-   Modifier des métadonnées comme un libellé ou un composant d'affichage/saisie
-   Rendre n'importe lequel de ces exemples dépendant de la valeur d'un champ en particulier
-   ...

Les cas d'usages sont très nombreux, et puisqu'on a choisi de faire porter les états d'éditions et la validation sur le noeud de formulaire (au lieu d'un composant externe), il va falloir pouvoir effectuer des **transformations** lors de la construction du formulaire.

Si on crée un noeud de formulaire avec un `Form(List)NodeBuilder`, il y a bien une raison. Leurs APIs sont les suivantes :

#### `FormNodeBuilder`

Il permet de construire un FormNode à partir d'un StoreNode. Il sera le paramètre de toute fonction de configuration sur un FormNode (celle de `makeFormNode`, ou de `patch` et `items` qu'on vera plus bas).

Il dispose des méthodes suivantes :

##### `edit(value)`

La fonction `edit`, qui prend en paramètre soit un booléen, soit une fonction retournant un booléen, permet de modifier l'état d'édition initial (si booléen), ou bien de forcer l'état d'édition (si fonction). Si `edit` n'est pas renseigné, la valeur par défaut pour un noeud sera `false` pour le noeud racine et `true` pour tout le reste.

##### `edit(value, ...props)`

Il est également possible de passer des propriétés de l'objet à la fonction `edit`. Dans ce cas, **la valeur initiale/fonction sera appliquée aux champs/listes/objets demandés au lieu de l'objet en lui-même**. Il est donc parfaitement possible d'utiliser `edit` plusieurs fois, tant que ça s'applique à des propriétés différentes.

Exemple :

```ts
s.edit(!this.props.egfId) // objet en entier
    .edit(false, "id", "isValide", "totalEngagementFinancier", "totalVersementsRecus") // valeur par défaut sur certains champs
    .edit(() => !this.props.egfId, "typeEngagementPartenaireCode"); // édition forcée sur un champ
```

La façon standard de modifier l'état d'édition d'un membre d'objet est de passer par `patch` (ou `add`), décrits en dessous, mais cette version de `edit()` permet de spécifier le même état d'édition à plusieurs champs à la fois (désactiver l'édition sur plusieurs champs est un usage très courant). C'est aussi une version plus courte pour un seul champ si l'édition est la seule chose à modifier dessus.

##### `add(name, fieldBuilder)`

La fonction `add` permet d'ajouter un nouveau champ au `FormNode` en cours de construction. Elle prend comme paramètres :

-   `name`, qui est le nom du champ à créer
-   `fieldBuilder`, une fonction qui sera appelée avec un `FormEntityFieldBuilder` et le `FormNode` courant pour paramétrer le champ.

##### `patch(name, builder)`

La fonction `patch` permet de modifier un membre du `FormNode`, que ça soit un champ, une sous-liste ou un sous-objet. Elle prend comme paramètres :

-   `name`, qui est le nom du champ/sous-objet/sous-liste. **Ce nom est typé et changera la signature en fonction de ce à quoi il correspond**.
-   `builder`, qui peut être un `fieldBuilder`, `listBuilder` ou un `objectBuilder` en fonction du membre choisi. Ces fonctions seront appelé avec le builder correspondant (`FormEntityFieldBuilder`, `FormNodeBuilder` ou `FormListNodeBuilder`), ainsi que le `FormNode` courant.

##### `build()`

La fonction `build` permet de construire le `FormNode`. Elle est appelée à la fin de `makeFormNode` et à priori il n'y aura jamais besoin de l'appeler manuellement.

#### `FormListNodeBuilder`

Il permet de construire un FormListNode à partir d'un StoreListNode. Il sera le paramètre de toute fonction de configuration sur un FormListNode (celle de `makeFormNode` ou de `patch`)

Il dispose des méthodes suivantes :

##### `edit(value)`

Idem `FormNodeBuilder`

##### `items(objectBuilder)`

La fonction `items` permet de modifier les items de la liste (qui sont, pour rappel, des `FormNode`s). Elle prend comme unique paramètre `objectBuilder`, pour préciser la configuration. Comme toujours, cette fonction est donc appelée avec un `FormNodeBuilder` ainsi que le `FormListNode` courant.

##### `build()`

Idem `FormNodeBuilder`.

#### `FormEntityFieldBuilder`

Il permet de construire un FormEntityField à partir d'un EntityField. Il sera le paramètre de `add` et `patch` sur le `FormNodeBuilder`.

Il dispose des méthodes suivantes :

##### `edit(value)`

Idem `FormNodeBuilder`

##### `value(get, set?)`

La fonction `value` permet de remplacer la valeur d'un champ (ou bien de la définir pour un champ ajouté) par une valeur calculée, avec un setter éventuel. Elle prend comme paramètres :

-   `get`, pour spécifier le nouveau getter du champ
-   `set`, pour spécifier le nouveau setter du champ

##### `metadata($field)`

La fonction `metadata` permet de remplacer les métadonnées d'un champ (ou bien de les définir pour un champ ajouté). Elle prend un seul paramètre, `$field`, qui contient soit toutes les métadonnées à remplacer (champ et contenu du domaine), soit une fonction qui les renvoie qui sera utilisée pour initialiser un champ "computed".

#### Exemple

Cet exemple est peu réaliste, mais il montre bien tout ce qu'on peut faire à la création d'un `FormNode` :

```ts
const formNode = new FormNodeBuilder(storeNode)
    // On change le domaine et le isRequired d'un champ.
    .patch("denominationSociale", (f, node) =>
        f.metadata(() => ({
            domain: DO_COMMENTAIRE,
            isRequired: !!node.capitalSocial.value
        }))
    )
    // On modifie un autre champ pour
    .patch("capitalSocial", (f, node) =>
        f
            // Ecraser sa valeur.
            .value(() => (node.denominationSociale.value && node.denominationSociale.value.length) || 0)
            // Ajouter un validateur.
            .metadata({validator: {type: "number", max: 20000}})
            // Et ne le rendre éditable que pour une seule valeur d'un autre champ.
            .edit(() => node.statutJuridiqueCode.value !== "EARL")
    )
    // On rend un sous noeud complètement non éditable.
    .patch("adresse", s => s.edit(() => false))

    // On ajoute un champ supplémentaire calculé.
    .add("email", (f, node) =>
        f
            .value(
                () => node.denominationSociale.value,
                value => (node.denominationSociale.value = value)
            )
            .metadata({
                domain: DO_LIBELLE_100,
                label: "structure.email",
                validator: {type: "email"}
            })
    )
    .build();
```

### Les actions de formulaires : `FormActions`

Une fois le `FormNode` créé, on aura besoin d'un deuxième objet pour gérer le cycle de vie du formulaire : un `FormActions`.

Il se crée à partir d'un `FormNode` via un `FormActionsBuilder`. En pratique, un `FormActions` sera créé via [**`makeFormActions`**](../forms#makeFormActions).

Il contiendra et gérera les actions de chargement et de sauvegarde.

#### Chargement des données

Pour pouvoir charger des données dans un formulaire, il faudra renseigner un service de chargement. En plus du service de chargement, il faudra aussi lui donner des **paramètres**. Ces paramètres pourront être soit statiques, soit obtenus par une fonction, qui sera utilisée comme une **dérivation MobX** pour créer une réaction qui rechargera le formulaire à chaque fois qu'ils changent.

Définir les paramètres comme une dérivation permettra de synchroniser le contenu du formulaire (en particulier en consultation) sur la valeur d'une observable externe, qui peut être un état global de l'application (dans un `ViewStore` par exemple), ou tout simplement des props du composant React.

#### `FormActionsBuilder`

Il dispose des méthodes suivantes :

##### `params(() => params)`/`params(params)`

Cette méthode permet de définir les paramètres de la fonction de chargement. Ils peuvent prendre la forme :

-   D'une valeur simple, par exemple `params(data.id)`.
-   D'un array, par exemple `params([data.id, data.type])`, pour gérer le cas ou la fonction de chargement prend plusieurs paramètres
-   D'une fonction qui renvoie une valeur simple, par exemple `params(() => data.id)`, pour créer la réaction de rechargement
-   D'une fonction qui renvoie un array, par exemple `params(() => [data.id, data.type])`.

Pour information, cela veut dire que tout ça est identique :

```ts
params(() => [1]);
params(() => 1);
params([1]);
params(1);
```

Il est possible d'appeler `params()` tel quel, sans arguments, pour indiquer que le service de chargement ne prend pas de paramètres.

Si vous devez renvoyer plusieurs paramètres non fixes, alors il faudra marquer l'array renvoyé comme `as const` (cf. `load` juste en dessous). Exemple : `params(() => [this.props.id, "test"] as const)`

_Remarque : Si `params` est appelé avec `undefined` ou si la fonction passée renvoie `undefined`, la service de chargement **ne sera pas appelé**. Cela permet par exemple de gérer des formulaires en mode création et modification en désactivant simplement le service de chargement s'il n'y a pas d'id, par exemple. Attention tout de même à `params([])` qui correspond à `params()` et qui appelle sans paramètres le service, et à `params([undefined])` qui appellera quand même le service avec `undefined` comme paramètre._

##### `load(service)`

Permet de préciser le service de chargement. **params() doit être appelé avant car il type les paramètres de load**.

##### `save(service, name?)`

Permet de préciser un service de sauvegarde. Il est possible d'en spécifier plusieurs : pour se faire il suffit de renseigner le deuxième paramètre `name` avec le nom du service désiré (le service sans nom est appelé `"default"` et sera accessible sous `actions.save()`)

##### `on(events, handler)`

La fonction `on` permet de définir un handler d'évènements autour des actions et permet de spécifier soit plusieurs fonctions par évènement, soit une fonction pour plusieurs évènements.

Les évènements possibles (premier paramètres) sont : `"error"`, `"load"`, `"save"`, `"cancel"` et `"edit"`. On peut en spécifier un seul ou bien un array d'évènements. Le handler passé en second paramètre sera appelé avec le nom de l'évènement qui l'a déclenché, ainsi que le nom du save pour `"error"` et `"save"`.

##### `i18nPrefix(prefix)`

Après un appel à un service de sauvegarde avec succès, un message sera affiché, dont la clé i18n par défaut est `"focus.detail.saved"`. `i18nPrefix()` permet de remplacer `"focus"` par autre chose.

Par ailleurs, si le contenu du message d'erreur est vide (par exemple avec un préfixe personnalisé), le message ne sera pas affiché après sauvegarde.

##### `useSaveNamesForMessages()`

Cette méthode permet de demander à ce que le nom du service de sauvegarde (ce qui n'est utile que s'il n'y a plusieurs) soit inclus dans le message de succès, comme ceci : `"focus.detail.{saveName}.saved"`.

#### API de `FormActions`

##### `load()`

Appelle le service de chargement, avec les paramètres, et met à jour le noeud de formulaire. Cette méthode sera appelée à la création des actions.

##### `save()`

Appelle le service de sauvegarde par défaut avec la valeur courante du noeud de formulaire, puis enregistre le retour du service (si non vide) dans le **noeud source** du formulaire (qui mettra ensuite le formulaire à jour). Si l'état d'édition du noeud de formulaire n'est pas forcé, elle repassera également le formulaire en consultation.

Les autres services de sauvegarde sont disponibles sous le nom qui leur a été donné, et leur comportement est le même.

##### `isLoading`

Précise si le formulaire est en cours de chargement ou de sauvegarde.

##### `onClickEdit`/`onClickCancel`

Ce sont les méthodes à passer à des boutons de formulaires pour passer en mode édition / retourner en consultation. Elles appellent aussi les handlers correspondants.

##### `forceErrorDisplay`

Ce booléen est renseigné automatiquement lors de l'appel de save, il permet de forcer l'affichage des erreurs sur les champs.

##### `panelProps` et `formProps`

Ce sont des propriétés qui regroupent l'ensemble des propriétés du `FormActions` à passer au composant de Panel (boutons, loading, save) et au composant de Formulaire (save, forceErrorDisplay).

#### Exemple

Premier exemple : formulaire classique d'édition

```ts
const actions = new FormActionsBuilder(node)
    .params(() => props.id)
    .load(loadStructure)
    .save(saveStructure)
    .on(["save", "cancel"], () => props.close())
    .build();
```

## Stores de collections

Si l'on veut interagir avec les données d'une liste, on peut utiliser des **stores de collections**, qui sont au nombre de deux : le `ListStore` et le `SearchStore`.

Les deux stores partagent la même base qui leur permet de gérer de la **sélection** d'élements, et qui définit certains éléments de l'API commune (compteurs, **tri**, **filtrage**).

### `ListStore`

Le `ListStore` est le store le plus simple : on lui affecte une liste pré-chargée dans la propriété `list` et il offre les possibilités de l'API commune précisées au-dessus (le tri et le filtrage sont réalisés à la volée donc).

### `SearchStore`

Le `SearchStore` est prévu pour être associé à un service de recherche, la plupart du temps connecté à un serveur ElasticSearch. Il contient à la fois les différents critères de recherche ainsi que les résultats, en plus de contenir les fonctionnalités communes comme la sélection. Chaque changement de critère va relancer la recherche. Son usage standard est très simple puisqu'il sera intégralement piloté et affiché par les composants de recherche, mais il est également possible de manipuler les différents critères à la main, qui sont :

-   `query` : le champ texte
-   `groupingKey` : le champ sur lequel grouper.
-   `selectedFacets` : les facettes sélectionnées.
-   `sortAsc` : le sens du tri.
-   `sortBy`: le champ sur lequel trier.
-   `top` : le nombre de résultats à retourner par requête.

A ces critères-là, on peut ajouter un objet de critère `criteria` personnalisé pour ajouter d'autres champs à utiliser pour la recherche. Cet objet sera stocké sous la forme d'un `StoreNode` pour pouvoir construire des champs, avec de la validation, de manière immédiate (par exemple pour des champs de date, de montant...). Ou bien, simplement pour ajouter des critères simples comme un scope ou un ID d'objet pour restreindre la recherche.

Le constructeur prend jusqu'à 3 paramètres :

-   `searchService` (obligatoire) : le service de recherche, qui soit respecter impérativement l'API de recherche prévue : `(query: QueryInput) => Promise<QueryOutput<T>>`
-   `initialQuery` (facultatif) : les valeurs des critères par défaut à la création du store.
-   `criteria` (facultatif) : la description du critère personnalisé. Doit être de la forme `[{} as MyObjectNode, MyObjectEntity]`

_(Note : les deux derniers paramètres sont interchangeables)_

## Stores de références

Un `ReferenceStore` est construit par la fonction `makeReferenceStore(referenceLoader, refConfig)` :

-   `referenceLoader` est une fonction qui prend en paramètre un nom de référence et la liste de référence (qui renvoie donc une Promise)
-   `refConfig` est un objet dont les propriétés sont des définitions de listes de référence, à priori générés avec le reste du modèle. Ce sont des objets de la forme `{type, valueKey, labelKey}` qui servent à définir totalement comme la référence doit s'utiliser.

Un store de référence se construit de la manière suivante :

```ts
const referenceStore = makeReferenceStore(referenceLoader, {
    product,
    line
});
```

Le `referenceStore` résultant peut être utilisé tel quel dans un composant `observer`: lorsqu'on veut récupérer une liste de références, le store regarde dans le cache et renvoie la valeur s'il la trouve. Sinon, il lance le service de chargement qui mettra à jour le cache et renvoie une liste vide. Une fois la liste chargée, l'observable sera modifiée et les composants mis à jour automatiquement.

Exemple d'usage :

```tsx
@observer
class View extends React.Component {
    render() {
        return (
            <ul>
                {referenceStore.product.map(product => (
                    <li>product.code</li>
                ))}
                {referenceStore.line.map(line => (
                    <li>line.label</li>
                ))}
            </ul>
        );
    }
}
```

Ce composant sera initialement rendu 3 fois:

-   La première fois, les deux utilisations de `product` et de `line` vont lancer les appels de service (les deux listes sont vides)
-   La deuxième fois, l'une des deux listes aura été chargée et sera affichée.
-   La troisième fois, l'autre liste aura également été chargée et les deux seront affichées.

Les fois suivantes (dans la mesure que les listes sont toujours en cache), il n'y aura qu'un seul rendu avec les deux listes déjà chargées.

### `ReferenceList`

Une `ReferenceList` est une liste contenue dans un `ReferenceStore`. En plus d'être une liste observable classique, elle a contient aussi :

-   Une propriété `$valueKey` qui correspond au nom de la propriété des objets de la liste qui sera utilisée comme valeur
-   Une propriété `$labelKey` qui correspond au nom de la propriété des objets de la liste qui sera utilisée comme libellé
-   Une fonction `getLabel(value)` qui permet de résoudre une valeur
-   Une fonction `filter()` modifiée qui permet de retourner une nouvelle `ReferenceList` avec les mêmes propriétés (au lieu d'un array classique qui n'aurait plus `$valueKey`/`$labelKey`/`getLabel()`);

### `makeReferenceList(list, {valueKey, labelKey})`

Cette fonction permet de transformer une liste classique en une liste de référence. Elle contrôlera que `valueKey` et `labelKey` existent.
