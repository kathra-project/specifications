# KATHRA DOCUMENTATION

## Object
This repositoy aims at referencing KATHRA functionnal and technical specifications, per version.
Each branch represents a version (v1.2, v1.3, ...), and the documents it contains reflect the specified version's features.

## Services technical documentation

### Hierarchy

- ./Service/{service-name} : Service directory
- ./Service/{service-name}/diag.puml : Diagram of service
- ./Service/{service-name}/swagger.yaml : Swagger service file

### Services existing
#### app-manager
see documentation [here](./Services/app-mananger/README.md)


## Functionalities technical documentation

### Hierarchy

- ./Use cases/kathra-diagram-class.puml : Kathra diagram class
- ./Use cases/kathra-use-cases.puml : Kathra use cases
- ./Use cases/{resource-name} : Resource directory
- ./Use cases/{resource-name}/[create|update|delete]-*.puml : Sequence diagram resource
- ./Use cases/{resource-name}/[create|update|delete]-*.md : Markdown diagram resource
- ./Use cases/{resource-name}/[create|update|delete]-*.png : Image dummy resource (e.g. screenshots, mock-up)


### Functionalities existing
#### Implementations
see documentation [here](./Use%20cases/Implementation/README.md)
