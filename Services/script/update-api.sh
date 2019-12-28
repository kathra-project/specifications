#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
export CODEGEN_URL="http://localhost:8080/api/v1"
export VERSION="1.1.0-SNAPSHOT"
export APIS=(core resourcemanager appmanager binaryrepositorymanager catalogmanager pipelinemanager)
export PROJECT_BASE=$SCRIPT_DIR/../../../
export CODE_MODEL_CLAZZ_MANAGED=Group,ApiVersion,Assignation,BinaryRepository,CatalogEntry,CatalogEntryPackage,Component,Implementation,ImplementationVersion,KeyPair,Library,LibraryApiVersion,Pipeline,SourceRepository,User

function main() {

    if [ $(findInArgs "--help" $*) ] || [ $(findInArgs "-h" $*) ]
    then
        help
        return 0
    fi
    [ $(findInArgs "--start-codegen" $*) ] && docker run -p 8080:8080 -e ARTIFACT_REPOSITORY_URL="none" -e ARTIFACT_PIP_REPOSITORY_NAME="none" kathra/codegen-swagger:dev

    if [ $(findInArgs "--generateSource" $*) ]
    then
        component=$(findInArgs "--component" $*)
        lib=$(findInArgs "--lib" $*)
        [ "$component" == "" ] && [ "$lib" == "" ] && updateSwaggerSpecsToSourceRepository && return 0
        [ ! "$component" == "" ] && [ ! "$lib" == "" ] && updateComponent "$component" "$lib"
        return 0
    fi
    if [ $(findInArgs "--resourceManagerUpdateApiFromCoreApi" $*) ]
    then
        resourceManagerUpdateApiFromCoreApi
    fi
    if [ $(findInArgs "--resourceManagerGenerateSrc" $*) ]
    then
        resourceManagerGenerateSrc
    fi
}

function help() {
    printInfo "Kathra - Specifications to API"
    printInfo ""
    printInfo "--start-codegen"
    printInfo "Start codegen"
    printInfo ""
    printInfo "--generateSource"
    printInfo "Generate source for all components"
    printInfo "Options : "
    printInfo "     --component=<$(printf "%s|" "${APIS[@]}")>"
    printInfo "     --lib=<client|model|interface>"
    printInfo ""
    printInfo "--resourceManagerUpdateApiFromCoreApi" 
    printInfo "Update $(realpath --relative-to=. $SCRIPT_DIR/../resourcemanager/swagger.yaml) from $(realpath --relative-to=. $SCRIPT_DIR/../core/swagger.yaml) " 
    printInfo ""
    printInfo "--resourceManagerGenerateSrc"
    printInfo "Update ResourceManager ArangoDB [$(realpath --relative-to=. $SCRIPT_DIR/../../kathra-resourcemanager-arangodb)] from Kathra-Core Model [$(realpath --relative-to=. $SCRIPT_DIR/../../kathra-core-model)] [clazz: $CODE_MODEL_CLAZZ_MANAGED] "
}
export -f help

function updateComponent() {
    local component=$1
    local lib=$2
    local fileApi=$SCRIPT_DIR/../$component/swagger.yaml
    local srcDirectory=$PROJECT_BASE/kathra-$component-$lib
    codegen "$fileApi" "$srcDirectory" "$lib"
}

function findInArgs() {
    local keyToFind=$1
    shift 
    POSITIONAL=()
    while [[ $# -gt 0 ]]
    do
        [ "$(echo "$1" | cut -d'=' -f1)" == "${keyToFind}" ] && echo $(echo "$1" | cut -d'=' -f2) && return 0
        shift
    done
    return 1
}


function updateSwaggerSpecsToSourceRepository() {
    for apiName in "${APIS[@]}"
    do
        printInfo "Update API $apiName"
        fileApi=$SCRIPT_DIR/../$apiName/swagger.yaml
        cp $fileApi $PROJECT_BASE/kathra-$apiName-api/swagger.yaml

        [ $? -ne 0 ] && echo "Error" && exit 1
        [ -d $PROJECT_BASE/kathra-$apiName-model ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-model "model"
        [ ! "$apiName" == "core" ] && [ -d $PROJECT_BASE/kathra-$apiName-client ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-client "client"
        [ ! "$apiName" == "core" ] && [ -d $PROJECT_BASE/kathra-$apiName-interface ] && codegen $fileApi $PROJECT_BASE/kathra-$apiName-interface "interface"
    done
}
export -f updateSwaggerSpecsToSourceRepository


function resourceManagerUpdateApiFromCoreApi() {
    cd $PROJECT_BASE/kathra-resourcemanager-api
    #npm install
    #sudo npm install -g swagger-spec-validator
    node index.js && swagger-merger -i builds/temp/index.yaml -o builds/swagger.yml && echo 'Merged file : builds/swagger.yml' && swagger-spec-validator builds/swagger.yml
    cp builds/swagger.yml $SCRIPT_DIR/../resourcemanager/swagger.yaml
}
export -f resourceManagerUpdateApiFromCoreApi

function resourceManagerGenerateSrc() {
    cd $PROJECT_BASE/kathra-resourcemanager-arangodb/resource-db-generator
    node index.js clazzName=${CODE_MODEL_CLAZZ_MANAGED}
}
export -f resourceManagerGenerateSrc

function codegen() {
    printInfo "codegen($*)"
    local apiFile=$1
    local dirLib=$2
    local type=$3
    local version=$(yq r $fileApi info.version)
    local artifactName=$(yq r $fileApi info.x-artifactName)
    local groupId=$(yq r $fileApi info.x-groupId)
    cd $dirLib
    [ $? -ne 0 ] && echo "Error" && exit 1

    curl --fail -X POST \
    "${CODEGEN_URL}/${type}?language=JAVA&artifactName=${artifactName}&groupId=${groupId}&artifactVersion=${version}" \
    -H 'Content-Type: multipart/form-data' \
    -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
    -F "apiFile=@$apiFile" > generated-code.zip
    [ $? -ne 0 ] && echo "Error" && exit 1
    # clean
    rm -Rf src
    # Backup pom
    mv pom.xml pom.xml.backup
    unzip -o generated-code.zip
    mv pom.xml.backup pom.xml
    [ $? -ne 0 ] && echo "Error" && exit 1
    rm generated-code.zip
}
export -f codegen


function printError(){
    echo -e "\033[31;1m $* \033[0m" 1>&2
}
export -f printError
function printWarn(){
    echo -e "\033[33;1m $* \033[0m" 1>&2
}
export -f printWarn
function printInfo(){
    echo -e "\033[33;1m $* \033[0m" 1>&2
}
export -f printInfo
function printDebug(){
    echo -e "\033[94;1m $* \033[0m" 1>&2
}
export -f printDebug

function printAlert(){
    echo -e "\e[41m $* \033[0m" 1>&2
}
export -f printAlert

main "$1" "$2" "$3" "$4" "$5"