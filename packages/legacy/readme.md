# Module `legacy`

Le module `legacy` contient les anciens utilitaires pour utiliser Focus avec des composants classe de React, comme c'était encore possible avec les versions < 12 :

- `makeFormNode`
- `makeFormActions`
- `classAutorun`
- `classReaction`
- `classWhen`

A noter que l'usage de ce module ne vous exempte **pas** de faire toutes les mises à jour liées à la montée de version `mobx-react 9` faite avec la version 12, en particulier :

- Mettre à jour les décorateurs vers la version non expérimentale
- Se débarasser de tous les usages de `this.props` dans des contextes réactifs
