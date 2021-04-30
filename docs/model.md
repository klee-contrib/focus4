# Modèle métier <!-- {docsify-ignore-all} -->

## Définitions

### Entité

Au sein de Focus, on appelle **entité** tout objet "métier" d'une application, à priori issu du (et généré à partir du) modèle de données. C'est un objet d'échange entre le client et le serveur, à partir duquel on va construire tous les rendus et formulaires qui vont peupler une application Focus.

### Champ

Une entité est constituée de **champs**, objet primitif représentant une des valeurs qui la constitue. Une entité peut également contenir d'autres entités, mais en fin de compte toute la donnée sera représentée comme un ensemble de champs. Un champ est défini par son nom, son caractère obligatoire, son type (au choix parmi `string`, `number`, `boolean`, ou un array de ceux-ci) et son domaine.

### Domaine

Le **domaine** d'un champ représente le type de donnée métier qui lui est associé (par exemple : une date, un numéro de téléphone, un montant...). On se sert du domaine pour définir des validateurs de saisie, des formateurs, ou encore des composants de saisie/présentation/libellé personnalisés.

## Principes généraux

-   Le concept central autour de la gestion de modèle dans Focus, contrairement à ce qu'on pourrait penser, est le **champ**. Une entité n'est qu'un ensemble de champs comme un autre, et les différentes APIs proposées n'agissent directement que sur des champs (ou parfois sur des ensembles de champs).
-   Un champ est **autonome** et n'a jamais besoin d'un contexte extérieur pour compléter sa définition, ce qui permet justement aux APIs d'utiliser des champs directement. Même s'il est en pratique rattaché à un conteneur, ce rattachement est transparent à l'utilisation.

## Sommaire

-   [Stores d'entité](model/store.md)
-   [Chargement des données](model/load.md)
-   [Afficher des champs](model/display-fields.md)
-   [Création et modification de champs](model/make-field.md)
-   [Stores de formulaires](model/form-store.md)
-   [Transformations de noeuds et champs](model/form-transforms.md)
-   [Actions de formulaires](model/form-actions.md)
-   [Utilisation dans un composant](model/form-usage.md)
