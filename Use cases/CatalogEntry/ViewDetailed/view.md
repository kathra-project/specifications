# Détail d'une implémentation
## Cas d'usage
L'utilisateur peut consulter le détail d'une implémentation.
Cette vue permet d'obtenir une vision synthétique d'une implémentation.

Fonctionnalités :
 - Afficher nom, version, description et status d'une implémentation,
 - Afficher nom composant et version api (avec bouton retour),
 - Lister des branches disponibles :
    - La sélection d'une branche change le listing des commits et des builds
 - Source Repository feature :
     - Lister des commits [ selon de la branche/tag selectionnée ] :
        * Id,
        * date,
        * Auteur,
        * Msg
 - Pipeline feature :
     - Lister les builds [ selon de la branche/tag selectionnée ] :
        * Numéro build,
        * Date,
        * Status,
        * Commit id ou branche
     - Lancer le build d'un pipeline [ selon de la branche/tag selectionnée ]


Données nécessaires :
 - Component (id, nom, nom du groupe),
 - Implémentation (id, nom, description) avec une implémentation version (id, version)
 - SourceRepository (id, url) et Pipeline (id)
 - Commits (auteur, date, message, hash)
 - Builds (date, status, number, commit/branch/branch)

## Review

QSE

**RG_DETAILIMPLEM_01**: L'utilisateur doit pouvoir accéder à l'écran de détail du composant, en cliquant sur son nom. La version d'API sélectionnée sur cet écran est alors celle de l'implémentation.

Je pense qu'il manque sur cet écran l'URL du dépôt git, pour que l'utilisateur puisse cloner les sources et développer son implémentation + possibilité de lancer un build

Quid des logs des builds. Si ces derniers sont en échec, l'utilisateur voudra les voir. Soit les builds sont des lien vers Jenkins, soit il faut les afficher d'une manière ou d'une autre.
