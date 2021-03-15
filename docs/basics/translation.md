# Gestion des libellés

L'ensemble des libellés de tous les modules de Focus est contenu dans `translation`. Il n'y a qu'une version en français de disponible, n'hésitez pas à ouvrir une PR pour les autres langues (genre l'anglais)... :)

Toutes les icônes utilisées par Focus sont également décrites dans les fichiers de traduction, ce qui permet de les surcharger. De plus, chaque composant qui utilise des traductions expose une propriété **`i18nPrefix`**, qui est toujours renseignée par défaut à `focus`, qui définit à quel endroit du fichier de traduction il faut chercher les libellés et les icônes. Il est donc possible, pour un composant en particulier, de modifier les libellés et icônes qui y sont utilisées. En général, on remplace quelques entrées, puis on recomplète par les libellés et icônes par défaut.
