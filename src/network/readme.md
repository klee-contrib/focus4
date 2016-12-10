# Module `network`

Le module propose un `RequestStore` similiaire à celui de Focus V2 pour suivre la progression des requêtes, ainsi qu'un composant pour les afficher.

La fonction custom `fetch` a par contre été remplacée par des wrappers `httpGet`, `httpPost`, `httpPut` et `httpDelete` autour de [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), qui est le nouveau standard pour les requêtes Ajax. En plus d'être des surcharges plus simples à utiliser, elles mettent également à jour le `RequestStore` et gèrent les éventuelles erreurs en parsant les messages pour les reporter sur les champs ou dans le `MessageStore`. Cette dernière reponsabilité était auparavant confiée à l'`actionBuilder` dans la V2.