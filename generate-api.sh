#!/bin/bash
export DIR=$(dirname $(readlink -f "$0"))
cd $DIR/../puml2swagger
npm install
node . $DIR/Services/binaryrepositorymanager/service.puml $DIR/Services/binaryrepositorymanager/swagger.yaml