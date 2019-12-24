#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
export CODEGEN_URL="http://localhost:8080/api/v1"
export VERSION="1.1.0-SNAPSHOT"
export APIS=( core resourcemanager appmanager binaryrepositorymanager catalogmanager pipelinemanager )
export PROJECT_BASE=$SCRIPT_DIR/../../../

function updateSwaggerSpecsToSourceRepository() {
    for apiName in "${APIS[@]}"
    do
        fileApi=$SCRIPT_DIR/../$apiName/swagger.yaml
        echo "Update $fileApi to $PROJECT_BASE/kathra-$apiName-api/swagger.yaml"
        cp $fileApi $PROJECT_BASE/kathra-$apiName-api/swagger.yaml
        [ $? -ne 0 ] && echo "Error" && exit 1
        #[ -d $PROJECT_BASE/kathra-$apiName-model ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-model/swagger.yaml $VERSION $apiName "model"
        #[ -d $PROJECT_BASE/kathra-$apiName-client ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-client/swagger.yaml $VERSION $apiName "client"
        #[ -d $PROJECT_BASE/kathra-$apiName-interface ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-interface/swagger.yaml $VERSION $apiName "interface"
    done
}
export -f updateSwaggerSpecsToSourceRepository

function codegen() {
    local apiFile=$1
    local dirLib=$2
    local version=$3
    local artifactName=$4
    local type=$5

    mv $dirLib
    [ $? -ne 0 ] && echo "Error" && exit 1

    curl -X POST \
    "${CODEGEN_URL}/${type}?language=JAVA&artifactName=${artifactName}&groupId=org.kathra&artifactVersion=${version}" \
    -H 'Content-Type: multipart/form-data' \
    -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
    -F "apiFile=@$apiFile" > code.zip
    [ $? -ne 0 ] && echo "Error" && exit 1
    
    unzip -o code.zip
    [ $? -ne 0 ] && echo "Error" && exit 1
}
export -f codegen

updateSwaggerSpecsToSourceRepository