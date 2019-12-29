// CONFIG
const config = require('./config');
console.debug('config : ', config);

// REQUIREMENTS
var fs = require('fs');
var rimraf = require('rimraf');
var Mustache = require('mustache');
const { parse, parseFile, formatters } = require('plantuml-parser');


var modelClassDiagramData = fs.readFileSync(config.modelClassDiagram, 'utf8');

// parse PlantUML
const ast = parseFile(config.modelClassDiagram);


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

function parseRelationshipComposition(relationship, clazzArray) {
  console.log(relationship)
  var leftTypeField = relationship.right;
  if (relationship.rightCardinality.includes("N")) {
    leftTypeField = "ListOf"+leftTypeField
  }
  var rightTypeField = relationship.left;
  if (relationship.leftCardinality.includes("N")) {
    rightTypeField = "ListOf"+rightTypeField
  }

  clazzArray.filter(clazz => clazz.clazzName == relationship.left).forEach(function(clazz) {
    clazz.fields.filter(field => field.type == leftTypeField).forEach(function(field) {
      field.type = null;
      if (relationship.rightCardinality.includes("N")) {
        field.arrayRef = relationship.right
      } else {
        field.objectRef = relationship.right
      }
    })
  })
  clazzArray.filter(clazz => clazz.clazzName == relationship.right).forEach(function(clazz) {
    clazz.fields.filter(field => field.type == rightTypeField).forEach(function(field) {
      field.type = null;
      if (relationship.rightCardinality.includes("N")) {
        field.arrayRef = relationship.left
      } else {
        field.objectRef = relationship.left
      }
    })
  })
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
      field.type = 'string'
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

      additionalProperties
  }
  if (enums.filter(i => i.enumName == field.type).length > 0) {
    field.type = "*"+field.type;
  }
  return field;
}

var enums = getEnumFromPlantUml(ast);
var clazz = getClazzFromPlantUml(ast, enums);

function generateFromTemplate(clazz, enums) {
  var template = fs.readFileSync(config.templateClazz, 'utf8');
  return Mustache.to_html(template, {"clazz":clazz, 'enums': enums})
}

fs.writeFileSync(config.destPath, generateFromTemplate(clazz, enums), 'utf8');

