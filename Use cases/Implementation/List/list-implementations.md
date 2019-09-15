# Visualiser la liste des implémentations
## Cas d'usage
L’utilisateur peut voir la liste des implémentations qui lui sont accessibles. Celles qu'il a créé personellement, celles de ses groupes projet (team), et celles pour lesquelles l'accès lui a été donné quelque soit leur groupe.  

Dans la liste seront présentes, pour chaque entrée, les informations suivantes:

| Label               | Type de donnée | Description                                                     | Exemples                             |
|---------------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Author              | string         | Nom du groupe du créateur de l'implém. (onHover: name/date)     | IVA (onHover: Fabien T., 2018-08-12) |
| Implementation name | string         | Nom complet de l'implémentation (apiVersionName + implemSuffix) | MessageControllerRabbitMQ            |
| Description         | string         | Description de l'implémentation (spécificités du choix d'implem)| Controleur de msg utilisant RabbitMQ |
| Creation date       | Date           | Date de création de l'implementation                            | 2018-08-12                           |
| Latest version      | string         | Numéro de la dernière version de cette implémentation           | v2.1-SNAPSHOT                        |
| Number of versions  | string         | Nombre de versions disponibles pour cette implémentation        | (1 of 8)                             |

La liste sera organisée différement selon le mode d'affichage choisi. 
La liste des implémentation que l'utilisateur a créé sera à plat.
Les listes des implémentations partagées (nativement par appartenance à un groupe projet, ou explicitement partagées explicitement) seront organisées par groupe; un label marquera le nom du groupe, et sous celui-ci apparaitront la liste des implémentations du-dit groupe.

Il exite des options de tri sur ces liste: croissant et décroissant selon le nom de l'implémentation ou le groupe d'appartenance, ou encore selon la date de création.

De plus, un champ de filtrage libre permet de restreindre l'affichage aux éléments comportant dans leurs infos la chaine de charactères choisie.

## Règles de gestion:

**RG_LISTIMPLEM_01**: L'utilisateur doit pouvoir retrouver dans la liste des implémentations, pour chaque entrée, les informations citées dans le tableau ci-dessus.
*ex:* 
| IVA (onHover: Fabien T., 2018-08-12)  | MessageControllerRabbitMQ | Contrôleur de messages utilisant RabbitMQ | v2.1-SNAPSHOT (1 of 8) |

**RG_LISTIMPLEM_02**: L'utilisateur doit pouvoir utiliser les fonctions de tri citées ci-dessus pour changer l'ordre d'affichage des implémentations dans la liste.

**RG_LISTIMPLEM_03**: L'utilisateur doit pouvoir filtrer les éléments de la liste à l'aide du champ de recherche prévu à cet effet.

## Review

QSE

Je pense que cet écran doit être harmonisé avec celui de la liste des composants, afin d'avoir une disposition similaire :

| Property                | Type de donnée | Description                                                     | Exemples                             |
|---------------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Implementation name | string         | Nom complet de l'implémentation (apiVersionName + implemSuffix) | MessageControllerRabbitMQ            |
| Group | string         | Nom du groupe du créateur de l'implém. (onHover: name/date)     | IVA (onHover: Fabien T., 2018-08-12) |
| Description         | string         | Description de l'implémentation (spécificités du choix d'implem)| Controleur de msg utilisant RabbitMQ |
| Creation date       | Date           | Date de création de l'implementation                            | 2018-08-12                           |
| Latest version | string         | Numéro de la dernière version | "1.5.2" |
| Number of versions  | string         | Nombre de versions disponibles pour cette implémentation        | (1 of 8)                             |

Par rapport au tableau de la spec, j'ai remplacé le libellé "Author" par "Group" et l'ordre d'affichage.

L'idée du nom de l'auteur en onHover sur le group est bonne, je pense qu'on devrait la reprendre pour l'affichage des components.

**RG_LISTIMPLEM_04**: L'utilisateur doit pouvoir accéder à l'écran de détail d'une implémentation en cliquant sur l'une d'entre elles.
