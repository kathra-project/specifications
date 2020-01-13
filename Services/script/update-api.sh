#!/bin/bash
export SCRIPT_DIR=$(dirname $(readlink -f "$0"))
export CODEGEN_URL="http://localhost:8085/api/v1"
export VERSION="1.1.0-SNAPSHOT"
export APIS=(core resourcemanager appmanager binaryrepositorymanager catalogmanager pipelinemanager codegen)
export PROJECT_BASE=$SCRIPT_DIR/../../../
export CODE_MODEL_CLAZZ_MANAGED=Group,ApiVersion,Assignation,BinaryRepository,CatalogEntry,CatalogEntryPackage,Component,Implementation,ImplementationVersion,KeyPair,Library,LibraryApiVersion,Pipeline,SourceRepository,User

function main() {

    if [ $(findInArgs "--help" $*) ] || [ $(findInArgs "-h" $*) ]
    then
        help
        return 0
    fi
    [ $(findInArgs "--start-codegen" $*) ] && docker run --detach -p 8085:8080 -e ARTIFACT_REPOSITORY_URL="none" -e ARTIFACT_PIP_REPOSITORY_NAME="none" kathra/codegen-swagger:dev

    if [ $(findInArgs "--generateSource" $*) ]
    then
        component=$(findInArgs "--component" $*)
        lib=$(findInArgs "--lib" $*)
        [ "$component" == "" ] && [ "$lib" == "" ] && updateSwaggerSpecsToSourceRepository && return 0
        if [ ! "$component" == "" ] && [ ! "$lib" == "" ] 
        then
            updateComponent "$component" "$lib"
        elif [ ! "$component" == "" ] && [ "$lib" == "" ] 
        then
            updateComponent "$component" "model"
            updateComponent "$component" "client"
            updateComponent "$component" "interface"
        fi
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
export -f main

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
    printInfo "     --lib=<client|model|interface|implementation>"
    printInfo ""
    printInfo "--resourceManagerUpdateApiFromCoreApi" 
    printInfo "Update $(realpath --relative-to=. $SCRIPT_DIR/../resourcemanager/swagger.yaml) from $(realpath --relative-to=. $SCRIPT_DIR/../core/swagger.yaml) " 
    printInfo ""
    printInfo "--resourceManagerGenerateSrc"
    printInfo "Update ResourceManager ArangoDB [$(realpath --relative-to=. $SCRIPT_DIR/../../kathra-resourcemanager-arangodb)] from Kathra-Core Model [$(realpath --relative-to=. $SCRIPT_DIR/../../kathra-core-model)] [clazz: $CODE_MODEL_CLAZZ_MANAGED] "
    printInfo ""
    printInfo "--start-codegen"
    printInfo "Start codegen"
    printInfo ""
}

function updateComponent() {
    local component=$1
    local lib=$2
    local fileApi=$SCRIPT_DIR/../$component/swagger.yaml
    local srcDirectory=$PROJECT_BASE/kathra-$component-$lib

    if [ "$lib" == "implementation" ]
    then
        [ "$component" == "catalogmanager" ] && updateImplementationGo "kathra-$component-helm" "$PROJECT_BASE/kathra-$component-helm" "$fileApi"
    elif [ "$component" == "core" ]
    then
        #codegen "$fileApi" "$srcDirectory" "model"
        updateModelGo "$fileApi" "$srcDirectory-go" "kathra-$component-model-go"
    else
        codegen "$fileApi" "$srcDirectory" "$lib"
        [ "$lib" == "client" ] && [ -d "$srcDirectory-go" ] && updateClientGo "$fileApi" "$srcDirectory-go" "kathra-$component-client-go"
        [ "$lib" == "model" ]  && [ -d "$srcDirectory-go" ] && updateModelGo "$fileApi" "$srcDirectory-go" "kathra-$component-model-go"
    fi
}
export -f updateComponent

function updateModelGo() {
    local fileApi=$1
    local srcDirectory=$2
    local component=$3

    cd $srcDirectory
    [ $? -ne 0 ] && echo "Error $srcDirectory not found" && exit 1
    # backup init code
    [ -d models ] && rm -Rf models
    # generate code
    swagger generate model -f $fileApi
    return $?
}
export -f updateModelGo

function updateClientGo() {
    local fileApi=$1
    local srcDirectory=$2
    local component=$3

    cd $srcDirectory
    [ $? -ne 0 ] && echo "Error $srcDirectory not found" && exit 1
    [ ! -f go.mod ] && go mod init github.com/kathra-project/$component
    swagger generate client -f $fileApi -A $component
    return $?
}
export -f updateClientGo


function updateImplementationGo() {
    local implementationName=$1
    local srcDirectory=$2
    local fileApi=$3

    cd $srcDirectory
    [ $? -ne 0 ] && echo "Error" && exit 1

    # backup init code
    [ -d cmd ] && mv cmd cmd-backup
    [ -d restapi ] && rm -Rf restapi

    # generate code
    swagger generate server -f $fileApi -A $implementationName

    # restore init code
    [ -d cmd-backup ] && rm -Rf cmd && mv cmd-backup cmd
}
export -f updateImplementationGo

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