## Breaking changes
* Some more or less useless stuff has been cut out (lots of stuff in `application`, `util`, `site-description` at least).
* The application store takes directly React Elements as parameters instead of a `{component, props}` object.
* `fetch` replaced by true `fetch` from standard, with baked in manageReponseErrors (yay).
* `listAction` now puts all its parameters in the post body (like seriously it had stuff in both the path and the body, and like seriously people used it?)
* Stores do not have generated methods any more, but instead regular methods that take the node as first parameter (yay!)