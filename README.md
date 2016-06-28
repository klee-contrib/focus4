# autofocus
C'est pour l'instant une "recopie" de focus-core intégralement réécrit et remis au propre. Il y aura bientôt aussi les composants déjà réécrits (les anciens mixins constituant du form repackagés en classes et le gros de la recherche), et dans un futur un peu moins proche tous les autres composants dépendant de stores (de tête je dirais qu'il faudra le Layout et la ListPage).

Il faudra aussi rajouter de la documentation au sein du code, et peut-être réorganiser certaines parties.

## Pourquoi ?
Parce que le focus-core existant il est pas si mal et qu'on a pas besoin de tout refaire pour avoir un truc moderne, stable et utilisable. En particulier, Typescript est d'une aide inestimable. D'autant plus que si on veut plus tard refondre certaines parties (genre remplacer Flux par Redux, même si au fond c'est quand même vraiment la même chose), on peut partir de la. D'autant plus, encore une fois grâce à Typescript, la migration de projets existants (pour peu qu'ils soient écrits en Typescript aussi, pardi) serait très facilitée : idéalement, il suffirait que le projet compile à nouveau pour avoir résolu tous les problèmes... 

## Changements de rupture
* Il manque des bouts, qui ont été volontairement non copiés : pas mal de choses dans `application`, les modules `util`, `site-description` et `router`.
* L'`ApplicationStore` prend un `ReactElement` (ie du JSX) à la place d'un objet `{component, props}`. C'est discutable de prendre une régression là-dessus je suis d'accord.
* Le module `network` utilise maintenant le nouveau `fetch` du standard et ne contient plus qu'un léger wrapper autour. En particulier, ce wrapper appelle directement `manageResponseErrors` en cas d'erreur dans la requête, et la méthode est exposée via 4 méthodes `httpGet`, `httpPost`, `httpPut` et `httpDelete` qui ont pour but de largement simplifier l'usage. En contre-partie, c'est moins customisable et les requêtes ne sont plus annulables (ça ne fait pas partie du standard). A discuter également.
* Peut-être le truc le plus gros (mais aussi le plus nécessaire) : les stores n'ont plus de méthodes générées pour accéder à leurs noeurds, mais une méthode statique équivalente qui prend le nom du noeud en premier paramètre. Genre `addNodeChangeListener(cb)` devient `addChangeListener('node', cb)`.

## Une petite note pour finir
Le projet utilise Typescript 2.0, qui n'est même pas encore en bêta, et il manque encore une fonctionnalité dedans pour pouvoir compiler directement en ES5. Donc en l'état (cible en ES2015) ça ne doit marcher que sur les toutes dernières versions des navigateurs. J'utilise aussi toutes les options les plus strictes (dont la toute nouvelle non-nullité par défaut), ce qui veut dire qu'il y a beaucoup de vérifications qui sont laissées au langage. Ca veut dire qu'il est plus facilement possible de se tirer dans le pied si on se borgne à vouloir coder les yeux fermés avec deux mains dans le dos. Ca veut aussi dire que dans les bonnes conditions, c'est quasiment impossible. 

Et c'est évidemment pas du tout testé. J'ai commit dès que j'avais fini de tout réécrire et que la build passait. #YOLO. 
