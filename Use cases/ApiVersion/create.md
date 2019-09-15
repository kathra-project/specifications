# Créer une API version
## Cas d'usage
L’utilisateur peut créer une nouvelle version de l'API pour un composant. Cette nouvelle version est ensuite visualisable dans la liste de ses versions du composant.
Le formulaire de saisie propose les champs suivants :

| Label               | Granularité | Type de donnée | Description                                                     | Exemples                             |
|---------------------|-------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Component          | 1           | component (object) | Composant de l'API version à créer. Renseigné automatiquement (non éditable)               |  TrainManager                                 |
| Group          | 1           | component (object) | Groupe pour lequel l'API sera créée. Renseigné automatiquement (non éditable)               | MSM/WP1                                  |
| api-file | 1           | file-yaml         | Fichier yaml décrivant le service de cette version du composant | https://git.irt-systemx.fr/SMITE/smite-services/smite-appmanager/smite-appmanager-api/blob/master/swagger.yml |
| Create API version | 1           | bouton         | Permet de lancer la création de l'API |  |

La création d'une nouvelle version de l'API est accessible depuis la page de détail d'un composant.

## Règles de gestion:
**RG_CREATEAPIVERSION_01**: Le nom du composant est celui qui était affiché sur la page "détail d'un composant" depuis laquelle l'utilisateur arrive.

**RG_CREATEAPIVERSION_02**: Le nom du groupe est celui du composant qui était affiché sur la page "détail d'un composant" depuis laquelle l'utilisateur arrive.

**RG_CREATEAPIVERSION_03**: Le lancement de la création de l'API n'est possible que si le fichier contient la version à créer (ex : 1.0.0-SNAPSHOT). La version ne doit pas déjà exister pour le composant.

**RG_CREATEAPIVERSION_04**: Après le lancement de la création de l'API, l'utilisateur est redirigé sur la page de détail d'un composant. Il peut alors voir le statut de l'API ("PENDING" au moment de la création)

**RG_CREATEAPIVERSION_05**: Après le lancement de la création de l'API, l'utilisateur doit pouvoir être notifié de la nature de l'erreur survenue lorsque la création de sa nouvelle version d'API échoue.

### Règles de gestion spécifiques à l'implementation swagger/openApi:
**RG_CREATEAPIVERSION_06**: Le lancement de la création de l'API n'est possible que si le fichier api respecte le format OpenAPI 2.0

**RG_CREATEAPIVERSION_07**: Après la création de l'API, la version finale du ficher OpenAPI enregistré dans le système contient, en plus des opérations et modèles, les champs x-artifactName (= nom du composant) et x-groupId (= fr.systemx.<group>) où <group> correspond au group en lowercase et '.' comme séparateur (ex : fr.systemx.msm.wp1)
