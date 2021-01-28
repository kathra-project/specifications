#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
cd $SCRIPT_DIR/puml2swagger
node . "$SCRIPT_DIR/Use cases/kathra-diagram-class.puml" "$SCRIPT_DIR/Services/core/swagger.yaml"

#$SCRIPT_DIR/Services/script/update-api.sh --start-codegen
$SCRIPT_DIR/Services/script/update-api.sh --generateSource --component=core --lib=model