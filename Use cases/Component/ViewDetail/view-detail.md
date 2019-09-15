# Visualiser un composant
## Cas d'usage
L’utilisateur visualise le détail d’un composant précédemment créée. Il y trouve également le détail d'une des API version du composant (la dernière en date par défault) s'il en existe au moins une.

| Label               | Granularité | Type de donnée | Description                                                     | Exemples                             |
|---------------------|-------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Name          | 1           | text | Nom du composant             | TrainLineManager                                  |
| Group | 1           | text         | Groupe auquel appartient le composant | MSM | 
| Description | 1           | text         | Description fonctionnelle du composant |  |
| Status          | 1           | Statut  | Statut du composant             | PENDING / ERROR / UNSTABLE / READY / UPDATING  |
| Version | 0..1           | text         | Version de l'API sélectionnée | 1.2.0-SNAPSHOT |
| API Versions| 0..*           | liste       | Nom de la version, date de dernière mise à jour | 1.1 10/02/2019 |
| API Version description | 0..1           | text area format .yml       | Description de l'API au format OpenAPI 2.0 |  |
| Selected API version implementations | 0..*           | liste       | Nom de l'implémentation, version de l'implémentation, date de dernière mise à jour | TrainLineManager-impl V2.0.0-SNAPSHOT 10/02/2019 |
| Other API version implementations | 0..*           | listes (1 par version d'API)       | Nom de l'implémentation, version de l'implémentation, date de dernière mise à jour  | TrainLineManager-impl V1.0.0 10/01/2019 |
| API status         | 0..1           | Statut  | Statut de l'API sélectionnée             |  PENDING / ERROR / UNSTABLE / READY / UPDATING                                 |
| New API Version         | 0..1           | bouton  | Permet la création d'une nouvelle version d'API pour le composant             |                                   |
| New selected API implementation         | 0..1           | bouton  | Permet la création d'une nouvelle implémentation pour la version d'API            |                                   |


## Règles de gestion:

**RG_DETAILCOMPO_01**: Si aucune version d'API n'existe pour ce composant, seuls les champs Nom, Groupe, Description et Status sont renseignés

**RG_DETAILCOMPO_02**: Si au moins une version d'API existe pour ce composant, la plus récente (date de mise à jour) est sélectionnée par défaut lorsque l'utilisateur arrive sur cette page

**RG_DETAILCOMPO_03**: La liste des versions d'API sont triés par défaut par ordre décroissant de date de dernière mise à jour 

**RG_DETAILCOMPO_04**: La liste des implémentations sont triées par défaut par ordre décroissant de date de dernière mise à jour 

**RG_DETAILCOMPO_05**: L'utilisateur a la possibilité de créer une nouvelle version d'API uniquement si le statut du composant est READY, et qu'il n'existe pas déjà une version d'API en développement.

**RG_DETAILCOMPO_06**: L'utilisateur a la possibilité de mettre à jour une API uniquement si son statut est READY, et que cette version est de développement

**RG_DETAILCOMPO_07**: L'utilisateur a la possibilité de créer une nouvelle implémentation uniquement si l'API sélectionnée est au statut READY

**RG_DETAILCOMPO_08**: Le bouton "New API Version" redirige l'utilisateur vers la page de création d'une nouvelle version d'API, pour le composant

**RG_DETAILCOMPO_09**: Le bouton "New selected API implementation" redirige l'utilisateur vers la page de création d'une nouvelle implémentation, pour la version d'API sélectionnée
