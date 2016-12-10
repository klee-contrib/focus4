# Module `testing`

Ce module a pour but d'essayer de générer des tests unitaires sur tous les composants d'une application. Un test est très basique et se contente simplement de poser un composant et de vérifier que rien de pète (on passe quand même dans le constructeur, le `componentWillMount` et le `render`, ce qui permet déjà de discerner tout de suite un bon nombre de régressions bloquantes sur une application).

Ces tests sont générés pour les composants d'`autofocus` (et passent), mais il reste encore des bugs à corriger sur le générateur. Il reste encore des problématiques importantes à résoudre sur le principe, en particulier sur la gestion des stores et des appels serveurs dans les `componentWillMount`.

Les tests générés utilisent `tape`, qui est un librairie de test plutôt simple et très facile à utiliser (à côté de l'usine à gaz mocha/chai/xxx c'est très agréable).

Evidemment, la génération de test utilise le compilateur Typescript pour parser les fichiers et se base sur les définitions de types de Props, donc ça ne marche que sur des composants en Typescript.