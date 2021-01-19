// CONFIG
const config = require('./config');
console.debug('config : ', config);

// REQUIREMENTS
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var Mustache = require('mustache');
const { parse, parseFile, formatters } = require('plantuml-parser');


function resolveIncludes(fileIn) {
  var modelClassDiagramData = fs.readFileSync(fileIn, 'utf8');
  var filesToInclude = modelClassDiagramData.split("\n")
                                      .filter(line => line.match("^!include .*"))
                                      .map(line => line.substr("!include ".length,line.length).trim())
  var dataWithoutIncludes = modelClassDiagramData.split("\n")
                                                  .filter(line => !line.match("^!include .*"))
                                                  .filter(line => !line.match("@startuml") && !line.match("@enduml"))
                                                  .join("\n");
  filesToInclude.forEach(file => {
    fileContent = resolveIncludes(path.dirname(fileIn) + "/" + file);
    dataWithoutIncludes += "\n" + fileContent;
  });

  return dataWithoutIncludes;
}
plantUmlUnified = resolveIncludes(fs.realpathSync(config.modelClassDiagram));
plantUmlUnifiedFilePath = config.destPath + ".tmp.puml"
fs.writeFileSync(plantUmlUnifiedFilePath, "@startuml\n" + plantUmlUnified + "\n@enduml", 'utf8');

// parse PlantUML
const ast = parseFile(plantUmlUnifiedFilePath);
// Format and print AST
//console.log(
//  formatters.default(ast)
//);

function getClazzFromPlantUml(model, enums) {
  var clazzArray = [];
  var elements = model[0].diagrams[0].elements;
  elements.filter(element => element.constructor.name == 'Class').forEach(function(clazz) {
    clazzArray.push(parseClazz(clazz, enums));
  });
  elements.filter(element => element.constructor.name == 'Relationship').forEach(function(relationship) {
    clazzArray = parseRelationship(relationship, clazzArray);
  });
  return clazzArray;
}
function getEnumFromPlantUml(model, clazz) {
  var elements = model[0].diagrams[0].elements;
  return elements.filter(element => element.constructor.name == 'Enum').map(function(clazz) {
    return parseEnum(clazz);
  });
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

    if (cardinalityIsList(relationship.rightCardinality)) {
      rightTypeField = "ListOf"+relationship.right
    } else {
      rightTypeField = relationship.right
    }
    if (cardinalityIsList(relationship.leftCardinality)) {
      leftTypeField = "ListOf"+relationship.left
    } else {
      leftTypeField = relationship.left
    }

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

var enums = getEnumFromPlantUml(ast);
var clazz = getClazzFromPlantUml(ast, enums);

function generateFromTemplate(clazz, enums) {
  var template = fs.readFileSync(config.templateClazz, 'utf8');
  return Mustache.to_html(template, {"clazz":clazz, 'enums': enums})
}

yamlContent = generateFromTemplate(clazz, enums);
fs.writeFileSync(config.destPath, yamlContent, 'utf8');

