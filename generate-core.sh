#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
cd $SCRIPT_DIR/puml2swagger
node . 
cp build/swagger.yaml ../Services/core/swagger.yaml 

#./../Services/script/update-api.sh --start-codegen
./../Services/script/update-api.sh --generateSource --component=core --lib=model