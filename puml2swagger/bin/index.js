// CONFIG
const config = require('./config');
console.debug('config : ', config);

// REQUIREMENTS
var path = require('path');
var fs = require('fs');
var uuid = require('uuid-random');
var rimraf = require('rimraf');
var Mustache = require('mustache');
const { parse, parseFile, formatters } = require('plantuml-parser');

var inFile=process.argv[2];
var outFile=process.argv[3];

function resolveIncludes(fileIn) {
  var modelClassDiagramData = fs.readFileSync(fileIn, 'utf8');
  var filesToInclude = modelClassDiagramData.split("\n")
                                            .filter(line => line.match("^!include .*"))
                                            .map(line => line.substr("!include ".length,line.length).trim())
  var dataWithoutIncludes = modelClassDiagramData .split("\n")
                                                  .filter(line => !line.match("^!include .*"))
                                                  .filter(line => !line.match("@startuml") && !line.match("@enduml"))
                                                  .join("\n");
  filesToInclude.forEach(file => {
    fileContent = resolveIncludes(path.dirname(fileIn) + "/" + file);
    dataWithoutIncludes += "\n" + fileContent;
  });
  return dataWithoutIncludes;
}
plantUmlUnified = resolveIncludes(fs.realpathSync(inFile));
plantUmlUnifiedFilePath =  "./build/" + uuid() + ".tmp.puml"
fs.writeFileSync(plantUmlUnifiedFilePath, "@startuml\n" + plantUmlUnified + "\n@enduml", 'utf8');

// parse PlantUML
const ast = parseFile(plantUmlUnifiedFilePath);
fs.unlinkSync(plantUmlUnifiedFilePath)
// Format and print AST
//console.log(
//  formatters.default(ast)
//);

function getInterfacesFromPlantUml(elements, enums, clazz) {
  var interfaces = [];
  var interfacesNotes = [];
  elements.filter(element => element.constructor.name == 'Note').forEach(function(note) {
    interfacesNotes.push(note);
  });
  elements.filter(element => element.constructor.name == 'Interface').forEach(function(interface) {
    interfaces.push(parseInterface(interface, enums, clazz, interfacesNotes));
  });
  return interfaces;
}

function getDependenciesFromPlantUml(elements) {
  var dependencies = [];
  elements.filter(element => element.constructor.name == 'Note').forEach(function(note) {
    var dependency = {}
    note.text.split("\n").forEach(line => {
      [":", "="].forEach(function(separator) {
        if (line.trim().split(separator).length > 1) {
          var key = line.trim().split(separator)[0]
          var value = line.trim().replace(key, "").replace(separator, "").trim()
          switch(key) {
              case "artifactId":
              case "groupId":
              case "artifactVersion":
              case "modelPackage":
                dependency[key] = value;
                break;
          }
        }
      })
      return null;
    })
    if (Object.keys(dependency).length > 0) {
      dependencies.push(dependency)
    }
  });
  return dependencies
}

function parseInterface(element, enums, clazz, notes) {
  var interface = {};
  interface.name = element.name;
  interface.methods = [];
  if (element.members) {
    element.members.filter(member => member.constructor.name == "Method").forEach(function(member) {
      interface.methods.push(parseMethod(element.name, member, enums, clazz, notes))
    });
  }
  return interface;
}

function parseMethod(interfaceName, methodToParse, enums, clazz, notes) {
  var method = {}
  if (methodToParse.accessor == "+") {
    addExtraMethodInfoInNotes(method, interfaceName, methodToParse, notes);
    method.operationId  = methodToParse.name;
    method.output    = parseOutput(methodToParse.returnType)
    method.arguments = parseArgs(methodToParse._arguments);
    return method
  }
  return null;
}

function addExtraMethodInfoInNotes(method, interfaceName, methodToParse, notes) {
  var methodId = interfaceName+"."+methodToParse.name+"("+methodToParse._arguments+")"
  notes.forEach(function(note) {
    var interfaceNameFromNode = null
    note.text.split("\n").forEach(line => {
      if (line.trim().startsWith("Interface:")) {
        interfaceNameFromNode = line.trim().replace("Interface:", "").trim()
      }

      var cells = line.split("|").map(cell => cell.trim()).filter(cell => cell != "")
      if (cells.length <= 3)
        return;

      if (cells.indexOf("Verb") >= 0)
        iVerb = cells.indexOf("Verb")
      if (cells.indexOf("Path") >= 0)
        iPath = cells.indexOf("Path")
      if (cells.indexOf("Method") >= 0)
        iMethod = cells.indexOf("Method")
      if (cells.indexOf("Description") >= 0)
        iDescription = cells.indexOf("Description")
      if (cells.indexOf("Tag") >= 0)
        iTag = cells.indexOf("Tag")
      if (cells.indexOf("Scopes") >= 0)
        iScope = cells.indexOf("Scopes")
      
      methodSignatureFromNote =  interfaceNameFromNode+"."+cells[iMethod]
      if (methodSignatureFromNote == methodId) {
        method.httpSignature  = {verb: cells[iVerb], path: cells[iPath]};
        method.summary        = cells[iDescription]
        if (iTag != null) {
          method.tags           = [ cells[iTag] ]
        }
        if (iScope != null) {
          method.scopes         = cells[iScope].split(",")
        }
      }
    })
  });
  if (method.httpSignature == null) {
    console.error("Unable to find HTTP mapping for interface with signature '" + methodId + "'");
  }
}

function parseOutput(returnType) {
  if (returnType != "void") {
    var output = {type: returnType}
    if (returnType.startsWith("ListOf")) {
      output.type = returnType.replace("ListOf", "");
      output.returnArray = true;
    }
    return output;
  }
  return null;
}

function parseArgs(argsToParse) {
  var argumentsParsed = []
  argsToParse.split(",").forEach(argToParse => {
    if (argToParse == "" || argToParse == null)
      return;
    type = argToParse.trim().split(" ")[0];
    if (type.startsWith("ListOf")) {
      method.type = type.replace("ListOf", "");
      method.returnArray = true;
    }
    name = argToParse.trim().split(" ")[1];
    argumentsParsed.push({type: type, name: name});
  });
  return argumentsParsed;
}


function convertInterfaceToSwaggerFormat(interfaces) {
  var pathsExisting = interfaces.map(interface => interface.methods.map(method => method.httpSignature.path)).flat()
  var pathsUniq = [ ...new Set(pathsExisting)] 
  var swaggerPath = [];
  pathsUniq.forEach(function(path){
    var operations = interfaces.map(interface => interface.methods.filter(method => method.httpSignature.path == path)).flat()
    var verbs = [ ...new Set(operations.map(operation => operation.httpSignature.verb))]
    var httpMethods = verbs.map(verb => {
      var operation = interfaces.map(interface => interface.methods.filter(method => method.httpSignature.path == path && method.httpSignature.verb == verb )).flat()[0]
      var params = getHttpParameters(operation);
      var consumes = params.filter(param => param.in == "body").length > 0 ? [{type:"application/json"}] : null
      var produces =  [{type: "application/json"}]
      return {  
                method: verb.toLowerCase(),
                operationId: operation.operationId, 
                summary: operation.summary, 
                hasTags: operation.tags.length > 0,
                tags: operation.tags,
                hasConsumes: (consumes != null), 
                consumes: consumes,
                hasProduces: (produces != null), 
                produces: produces,
                hasParameters: (params.length > 0),
                parameters: params,
                responses: getHttpResponses(operation),
                scopes: operation.scopes
              };
    })
    swaggerPath.push({path: path, methods: httpMethods});
  });
  return swaggerPath;
}

function getHttpParameters(operation) {
  var parameters = [];
  if (operation.arguments == null) {
    return null;
  }
  operation.arguments.forEach(function(argument) {
    var name = argument.name;
    var type = null;
    var description = "undefined";
    var paramIn = null;
    var required = true;
    var schema = null;
    if (operation.httpSignature.path.includes("{"+name+"}")) {
      paramIn = "path"
      type = "string"
      required = true
    } else {
      paramIn = "body"
      switch(argument.type) {
        case "string":
        case "integer":
          break;
        default:
          schema = {objectRef: argument.type}
          break;
      }
    }

    parameters.push({ name: name, 
                      in: paramIn, 
                      required: required, 
                      schema: schema,
                      type: type, 
                      "x-exportParamName": name, 
                      description: description })
  })
  return parameters;
}

function getHttpResponses(operation) {
  var responses = [];
  responses.push({httpCode: 400, description: "Bad request", schema: {type: "string"}})
  responses.push({httpCode: 404, description: "Not found", schema: {type:"string"}})
  responses.push({httpCode: 500, description: "Internal error", schema: {type:"string"}})
  if (operation.output != null) {
    if (operation.output.returnArray) {
      if (operation.output != "string") {
        responses.push({httpCode: 200, 
                      description: "Get list of " + operation.output.type, 
                      schema: {arrayRef: operation.output.type } })
      } else {
        responses.push({httpCode: 200, 
          description: "Get list of " + operation.output.type, 
          schema: {arrayType: operation.output.type } })
      }
    } else {
      if (operation.output != "string") {
        responses.push({httpCode: 200, 
                        description: "Get " + operation.output.type, 
                        schema: {objectRef: operation.output.type}})
      } else {
        responses.push({httpCode: 200, 
                        description: "Get " + operation.output.type, 
                        schema: { type: "string"}})
      }
    }
  } else {
    responses.push({httpCode: 200, description: "Ok", schema: {type: "string"}})
  }
  return responses;
}

function getClazzFromPlantUml(elements, enums, dependencies) {
  var clazzArray = [];

  elements.filter(element => element.constructor.name == 'Class').forEach(function(clazz) {
    clazzArray.push(parseClazz(clazz, enums));
  });
  elements.filter(element => element.constructor.name == 'Relationship').forEach(function(relationship) {
    clazzArray = parseRelationship(relationship, clazzArray);
  });
  elements.filter(element => element.constructor.name == 'Group')
          .filter(element => element.type == 'package')
          .forEach(function(package) {
            getClazzFromPlantUml(package.elements, enums, dependencies).forEach(function(clazz) {
              var dependency = dependencies.filter(dependency => dependency.groupId+"."+dependency.modelPackage)[0]
              if (dependency) {
                clazz["x-artifactId"] = dependency.artifactId
              }
              clazzArray.push(clazz)
            })
          });
  return clazzArray;
}

function getEnumFromPlantUml(elements) {
  return elements.filter(element => element.constructor.name == 'Enum').map(function(clazz) {
    return parseEnum(clazz);
  });
}

function getInfoFromPlantUml(elements) {
  var infos = {}
  elements.filter(element => element.constructor.name == 'Note').map(function(note) {
    return note.text.split("\n").forEach(line => {
      [":", "="].forEach(function(separator) {
        if (line.trim().split(separator).length > 1) {
          var key = line.trim().split(separator)[0]
          var value = line.trim().replace(key, "").replace(separator, "").trim()
          switch(key) {
              case "info.x-groupId":
              case "info.x-artifactName":
              case "info.description":
              case "info.version":
              case "info.title":
                infos[key.replace("info.", "")] = value;
                break;
          }
        }
      })
      return null;
    })
  });
  return infos;
}

function parseRelationshipInherit(relationship, clazzArray) {
  if (relationship.rightArrowHead == '<|') {
    clazzArray.filter(clazz => clazz.clazzName == relationship.left).forEach(function(clazz) {
      clazz.noParentClazz = null;
      clazz.parentClazz = relationship.left;
    })
  } else if (relationship.leftArrowHead == '<|') {
    clazzArray.filter(clazz => clazz.clazzName == relationship.right).forEach(function(clazz) {
      clazz.noParentClazz = null;
      clazz.parentClazz = relationship.left;
    })
  }
  return clazzArray;
}

function cardinalityIsList(cardinality) {
  return cardinality.includes("N") || cardinality.includes("*");
}

function parseRelationshipComposition(relationship, clazzArray) {

  rightTypeField = cardinalityIsList(relationship.rightCardinality) ? "ListOf"+relationship.right : relationship.right
  leftTypeField = cardinalityIsList(relationship.leftCardinality) ? "ListOf"+relationship.left : relationship.left

  clazzArray.filter(clazz => clazz.clazzName == relationship.left).forEach(function(clazz) {
    clazz.fields.filter(field => field.type == rightTypeField).forEach(function(field) {
      field.type = null;
      if (cardinalityIsList(relationship.rightCardinality)) {
        field.arrayRef = relationship.right
      } else {
        field.objectRef = relationship.right
      }
    })
  });
  
  clazzArray.filter(clazz => clazz.clazzName == relationship.right).forEach(function(clazz) {
    clazz.fields.filter(field => field.type == leftTypeField).forEach(function(field) {
      field.type = null;
      if (cardinalityIsList(relationship.leftCardinality)) {
        field.arrayRef = relationship.left
      } else {
        field.objectRef = relationship.left
      }
    })
  });
  return clazzArray;
}

function parseRelationship(relationship, clazzArray) {
  if (relationship.leftArrowHead == '<|' || relationship.rightArrowHead == '<|') {
    return parseRelationshipInherit(relationship, clazzArray);
  } else {
    return parseRelationshipComposition(relationship, clazzArray);
  }
}

function parseEnum(element) {
  var enumItem = {'enumType': 'string', 'enumName': element.name, values: []};
  element.members.forEach(function(value) {
    enumItem.values.push(value.name);
  });
  return enumItem;
}

function parseClazz(element, enums) {
  var clazz = {'noParentClazz': 'yes'};
  clazz.clazzName = element.name;
  clazz.fields = [];
  if (element.members) {
    element.members.forEach(function(member) {
      clazz.fields.push(parseClazzField(member, enums))
    });
  }
  clazz.hasProperties = clazz.fields.length > 0
  return clazz;
}

function parseClazzField(member, enums) {
  var field= {};
  field.name = member.name;
  field.type = member.type;
  switch(field.type) {
    case 'String':
    case 'string':
      field.type = 'string'
      break;
    case 'int64':
    case 'long':
    case 'Long':
      field.type = 'integer'
      field.format = 'int64'
      break;
    case 'int32':
    case 'int':
    case 'Integer':
    case 'integer':
      field.type = 'integer'
      field.format = 'int32'
      break;
    case 'ListOfString':
      field.type = null
      field.arrayType = 'string'
      break;
    case 'MapOfObject':
      field.type = null
      field.additionalProperties = 'string'
      break;
    case 'Boolean':
      field.type = 'boolean'
      break;
  }
  if (enums.filter(i => i.enumName == field.type).length > 0) {
    field.enum = "*"+field.type;
    field.type = null;
  }
  return field;
}

var info = getInfoFromPlantUml(ast[0].diagrams[0].elements)
var enums = getEnumFromPlantUml(ast[0].diagrams[0].elements);
var dependencies = getDependenciesFromPlantUml(ast[0].diagrams[0].elements);
var clazz = getClazzFromPlantUml(ast[0].diagrams[0].elements, enums, dependencies);
var interfaces = getInterfacesFromPlantUml(ast[0].diagrams[0].elements, enums, clazz);
var tags = [ ...new Set(interfaces .map(interface => interface.methods.map(method => method.tags).flat())
  .flat())];
tags.map(function(tag, i){
  tags[i] = {name: tag, description: tag}
})

var template = fs.readFileSync(config.templateClazz, 'utf8');
var data = {  
              "info": info,
              "hasTags": tags.length > 0, 
              "tags": tags,
              "clazz":clazz, 
              'enums': enums,
              'paths': convertInterfaceToSwaggerFormat(interfaces),
              "hasDependencies": dependencies.length > 0,
              "dependencies": dependencies
            }
yamlContent = Mustache.to_html(template, data)
fs.writeFileSync(outFile, yamlContent, 'utf8');

