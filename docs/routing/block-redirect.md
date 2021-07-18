# Blocages et redirections

L'ensemble du périmètre d'une application est rarement accessible à tous les utilisateurs. Pour répondre à cette problématique, il est possible de définir des règles de **blocage** et de **redirection** dans le routeur.

`makeRouter` accepte un second paramètre, qui est lambda avec un configurateur qui expose 3 méthodes :

## `block(url, condition)`

`block` permet d'interdire l'accès à une route, définie par le premier paramètre comme `is`, `get` ou `sub` si la condition en deuxième paramètre (un fonction sans paramètre qui renvoie un booléen) est respectée. La condition est évaluée lors de la navigation uniquement. Une route interdite se comporte comme si elle n'existait pas.

Une règle définie par `block` s'applique à toutes les routes qui commencent par la section de route qui la définit (comme `is`). Il est possible de définir plusieurs règles qui s'appliquent à une même route. Si une condition parmi toutes celles qui sont définies est valide, la route sera bloquée.

## `redirect(url, condition, to)`

`redirect` se comporte comme `block`, sauf qu'elle a un paramètre supplémentaire qui permet, au lieu de bloquer complètement la route, de rediriger vers une autre route. Le paramètre `to` se définit donc comme le descripteur d'URL de la méthode `to` (avec les valeurs de paramètres).

Puisqu'il est possible de définir plusieurs règles de blocage/redirection qui s'appliquent à une même route, c'est la première règle "valide", par ordre de définition, qui sera appliquée, ce qui va donc influer sur la redirection qui sera effectuée ou non si plusieurs auraient pu être valides.

## `sub(url)`

Comme pour le routeur en lui-même, on peut aussi se définir une **vue du configurateur de contraintes**, qui pourrait permettre de définir les différentes règles au niveau de chaque "module", comme on peut déjà le faire pour la définition du routeur. Cela reste moins utile puisque cette configuration ne sera utilisée que lors de l'initialisation du routeur, mais cela permet d'être cohérent avec le reste de la définition.

## Exemple

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
