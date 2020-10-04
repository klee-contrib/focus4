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

_Note : il s'agit de `router2`, l'ancien routeur est documenté [ici](./router)_

**TODO**

## Gestion des libellés

L'ensemble des libellés de tous les modules de Focus est contenu dans `translation`. Il n'y a qu'une version en français de disponible, n'hésitez pas à ouvrir une PR pour les autres langues (genre l'anglais)... :)

Toutes les icônes utilisées par Focus sont également décrites dans les fichiers de traduction, ce qui permet de les surcharger. De plus, chaque composant qui utilise des traductions expose une propriété **`i18nPrefix`**, qui est toujours renseignée par défaut à `focus`, qui définit à quel endroit du fichier de traduction il faut chercher les libellés et les icônes. Il est donc possible, pour un composant en particulier, de modifier les libellés et icônes qui y sont utilisées. En général, on remplace quelques entrées, puis on recomplète par les libellés et icônes par défaut.

## Store d'utilisateur

Focus propose une base de store utilisateur, pour y stocker les données de la session. La seule fonctionnalité prévue est la gestion des rôles / permissions (avec `roles` et `hasRole()`), et c'est à chaque application d'y rajouter leurs informations métiers pertinentes.
