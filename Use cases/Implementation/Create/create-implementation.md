# Créer une implémentation
## Cas d'usage
L’utilisateur peut enregistrer une nouvelle implémentation pour un de ses groupes. Cette implémentation est ensuite visualisable dans la liste de ses implémentations.
Le formulaire de saisie propose les champs suivants :

| Label               | Granularité | Type de donnée | Description                                                     | Exemples                             |
|---------------------|-------------|----------------|-----------------------------------------------------------------|--------------------------------------|
| Group          | 1           | text | Groupe pour lequel l'implémentation sera créée. Renseigné automatiquement (non éditable)               | MSM/WP1                                  |
| Component          | 1           | text | Composant de l'implémentation à créer. Renseigné automatiquement (non éditable)               |  TrainManager                                 |
| API Version          | 1           | text | API version de l'implémentation à créer. Renseigné automatiquement (non éditable)               | 1.0.0-SNAPSHOT                                  |
| Implementation name | 1           | string         | Nom de l'implémentation (à utiliser en suffixe du nom de l'API) | RabbitMQ - MessageControllerRabbitMQ |
| Implementation version | 1           | string         | Version de l'implémentation | 1.0.0 |
| Language            | 1           | select(string) | Langage dans lequel générer les sources de l'implémentation     | Python                               |
| Description         | 1           | string         | Description de l'implémentation (spécificités du choix d'implem)| Controleur de msg utilisant RabbitMQ |

La création d'une nouvelle implémentation se fait depuis la page de visualisation des détails d'une API.
Le nom de l'API Version utilisée pour cette implémentation est donc **déduit**.


## Règles de gestion:

**RG_CREATEIMPLEM_01**: L'utilisateur doit pouvoir renseigner le nom de son implémentation. celui-ci sera accolé au nom de l'API pour générer un nom d'implémentation unique.  
*ex:* API UserManager, Implémentation: LDAP -> usermanager-ldap

**RG_CREATEIMPLEM_02**: L'utilisateur doit pouvoir choisir le langage dans lequel sera généré son implémentation, parmis la liste des langages proposés par SMITE.  
*ex:* Python

**RG_CREATEIMPLEM_03**: L'utilisateur doit pouvoir choisir la version pour laquelle l'implémentation sera développée (chiffres séparés par des points). Selon le langage choisi, un suffixe nécessaire aux versions en développement sera ajouté (Java : -SNAPSHOT). 
Cette version d'implémentation ne doit pas déjà exister dans le système.
*ex:* 1.0.0

**RG_CREATEIMPLEM_04**: L'utilisateur doit pouvoir renseigner la description de son implémentation. Il est convenu que ce champ servira notamment à renseigner les spécificités des choix du langage et du type d'implémentation retenus.
*ex:* Ce gestionnaire d'utilisateurs en python interface un Active Directory pour permettre la lecture, l'édition ou la création d'informations relatives aux utilisateurs qui y sont référencés.

**RG_CREATEIMPLEM_05**: L'utilisateur doit pouvoir valider la création de son implémentation, une fois tous les champs renseignés, et recevoir un feedback, positif ou négatif (réussi, échoué), par exemple à l'aide d'une notification.

**RG_CREATEIMPLEM_06**: L'utilisateur doit pouvoir être redirigé sur la page de détails de l'implémentation qu'il vient de créer en cas de succès.

**RG_CREATEIMPLEM_07**: L'utilisateur doit pouvoir être notifié de la nature de l'erreur survenue lorsque la création de son implémentation échoue.

**RG_CREATEIMPLEM_08**: L'utilisateur doit pouvoir à tout moment annuler l'opération en cours et retourner aux détails de l'API Version à partir de laquelle il souhaitait créer une nouvelle implémentation.