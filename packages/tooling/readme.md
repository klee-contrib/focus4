# `@focus4/tooling`

[![npm version](https://badge.fury.io/js/@focus4%2Ftooling.svg)](https://badge.fury.io/js/@focus4%2Ftooling)

Le module `@focus4/tooling` est lui aussi un méta-package qui contient l'ensemble des outils nécessaires pour packager une application Focus.
En particulier, il inclut [Vite](https://vitejs.dev) et [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) et des configs par défaut à étendre pour ces outils.

De plus, il contient l'outil de génération de types CSS ainsi qu'un utilitaire pour faciliter l'installation et les montées de versions des modules de Focus.
Cet outil s'utilise via la commande `npx focus4 install` ou `npx focus4 update` (les deux commandes sont identiques), et parcourera votre
`package.json` pour récupérer la version la plus récente de chaque module Focus et de ses peer dependencies (React et MobX).
