# Liste des composants
## Cas d'usage
L'utilisateur peut lister l'ensemble des composants auxquels il a accès.
Le prérequis est la récupération des composants depuis le contexte de l'utilisateur courant.

| Property                | Type de donnée | Description                                                     | Exemples                             |
|---------------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| uuid         | uuid | UUID du composant           | "bb3c9942-bb64-4cd7-9bd1-0f9a29f68619"                                  |
| name | string         | Label du composant | "ApplicationManager"  |
| group | string         | Label du groupe du composant | "MSM/WP1" |
| status | enum         | Status du composant [PENDING, READY, UPDATE, UNSTABLE, ERROR | "PENDING"  |
| description | string         | Description du composant | "This is a good component!" |
| lastVersion | string         | Numéro de la dernière version | "1.5.2" |
| dateLastVersion | Date         | Date de la dernière version | "2018-11-23 18:02" |
| countVersion | int         | Nombre de versions | "5" |
| author | string         | Auteur du composant | "M. Xyz" |



Le formulaire de recherche propose les champs suivants :

| Label               | Granularité | Type de donnée | Description                                                     | Exemples                             |
|---------------------|-------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| search-text          | 1           | string | Recherche par mot clef            | TAS                                  |
| search-scope | 1           | enum         | Scope de recherche (utilisateur, équipe, tous SMITE) |   |

Après selection du scope, l'ensemble des components est filtré à l'aide du search-text

## Listing

Les informations suivantes doivent être affichées :
 - Nom de composant,
 - Groupe du composant,
 - Descriptif du composant,
 - Dernière version d'API disponible [optionnel],
 - Status du composant,
