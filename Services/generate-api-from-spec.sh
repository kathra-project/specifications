export DIR=$(dirname $(readlink -f "$0"))
cd $DIR/../puml2swagger
node . $DIR/binaryrepositorymanager/service.puml $DIR/binaryrepositorymanager/swagger-generated.yaml