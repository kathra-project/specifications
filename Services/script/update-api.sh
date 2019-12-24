#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
export CODEGEN_URL="http://localhost:8080/api/v1"
export VERSION="1.1.0-SNAPSHOT"
export APIS=( core resourcemanager appmanager binaryrepositorymanager catalogmanager pipelinemanager )
export PROJECT_BASE=$SCRIPT_DIR/../../../

docker run -p 8080:8080 -e ARTIFACT_REPOSITORY_URL="none" -e ARTIFACT_PIP_REPOSITORY_NAME="none" kathra/codegen-swagger:dev

function updateSwaggerSpecsToSourceRepository() {
    for apiName in "${APIS[@]}"
    do
        fileApi=$SCRIPT_DIR/../$apiName/swagger.yaml
        echo "Update $fileApi to $PROJECT_BASE/kathra-$apiName-api/swagger.yml"
        cp $fileApi $PROJECT_BASE/kathra-$apiName-api/swagger.yml
        [ $? -ne 0 ] && echo "Error" && exit 1
        [ -d $PROJECT_BASE/kathra-$apiName-model ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-model $VERSION $apiName "model"
        [ -d $PROJECT_BASE/kathra-$apiName-client ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-client $VERSION $apiName "client"
        [ -d $PROJECT_BASE/kathra-$apiName-interface ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-interface $VERSION $apiName "interface"
    done
}
export -f updateSwaggerSpecsToSourceRepository

function codegen() {
    local apiFile=$1
    local dirLib=$2
    local version=$3
    local artifactName=$4
    local type=$5

    cd $dirLib
    [ $? -ne 0 ] && echo "Error" && exit 1

    curl --fail -X POST \
    "${CODEGEN_URL}/${type}?language=JAVA&artifactName=${artifactName}&groupId=org.kathra&artifactVersion=${version}" \
    -H 'Content-Type: multipart/form-data' \
    -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
    -F "apiFile=@$apiFile" > generated-code.zip
    [ $? -ne 0 ] && echo "Error" && exit 1
    
    unzip -o generated-code.zip
    [ $? -ne 0 ] && echo "Error" && exit 1
    rm generated-code.zip
}
export -f codegen

updateSwaggerSpecsToSourceRepository