# Créer un composant
## Cas d'usage
L’utilisateur peut créer un nouveau composant. Ce composant est ensuite visualisable dans la liste des composants.
Le formulaire de saisie propose les champs suivants:

| Label               | Granularité | Type de donnée | Description                                                     | Exemples                             |
|---------------------|-------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Groupe          | 1           | group (object) | Liste des groupes associés à l'utilisateur courant             | TAS                                  |
| Titre | 1           | string         | Nom du composant (pas d'espace, ni caractère spéciaux) |  |
| Description | 1           | text         | Description fonctionnelle du composant |  |

La création d'une nouvelle version de l'API est réalisée dans le dashboard depuis l'onglet **Applications** après sélection du composant.


## Règles de gestion:

**RG_CREATECOMPO_01**: Le nom du composant doit être unique (au sein du groupe).

**RG_CREATECOMPO_02**: Le nom de doit pas contenir de caractère spéciaux, ni espace, ni chiffres. Le nom final sera en PascalCase.

**RG_CREATECOMPO_03**: L'utilisateur ne peut selectionner que les groupes dont il est membre.
