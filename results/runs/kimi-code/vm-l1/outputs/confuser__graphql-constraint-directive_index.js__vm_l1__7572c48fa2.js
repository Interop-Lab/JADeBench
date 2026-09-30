'use strict';

const {
  GraphQLError,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  TypeInfo,
  getNamedType,
  isListType,
  isNonNullType,
  isScalarType,
  separateOperations,
  valueFromAST,
  visit,
  visitWithTypeInfo,
} = require('graphql');
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils');
const validator = require('validator');

const constraintDirectiveTypeDefs = `
  directive @constraint(
    # String constraints
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    contains: String
    notContains: String
    pattern: String
    format: String

    # Number constraints
    min: Float
    max: Float
    exclusiveMin: Float
    exclusiveMax: Float
    multipleOf: Float

    # Array/List size constraints
    minItems: Int
    maxItems: Int

    # Custom error message when validation fails
    errorMessage: String

    # Shared for Schema wrapper
    uniqueTypeName: String

  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`;

const formatValidators = {
  byte: (value) => value === '' || validator.isBase64(value),
  'date-time': validator.isRFC3339,
  date: validator.isISO8601,
  email: validator.isEmail,
  ipv4: (value) => validator.isIP(value, 4),
  ipv6: (value) => validator.isIP(value, 6),
  uri: validator.isURL,
  uuid: validator.isUUID,
};

const formatMessages = {
  byte: 'Must be in byte format',
  'date-time': 'Must be a date-time in RFC 3339 format',
  date: 'Must be a date in ISO 8601 format',
  email: 'Must be in email format',
  ipv4: 'Must be in IP v4 format',
  ipv6: 'Must be in IP v6 format',
  uri: 'Must be in URI format',
  uuid: 'Must be in UUID format',
};

function fail(constraints, message) {
  throw new GraphQLError(constraints.errorMessage || message);
}

function validateString(value, constraints) {
  const stringValue = String(value);
  if (constraints.minLength != null && stringValue.length < constraints.minLength) {
    fail(constraints, `Must be at least ${constraints.minLength} characters in length`);
  }
  if (constraints.maxLength != null && stringValue.length > constraints.maxLength) {
    fail(constraints, `Must be no more than ${constraints.maxLength} characters in length`);
  }
  if (constraints.startsWith != null && !stringValue.startsWith(constraints.startsWith)) {
    fail(constraints, `Must start with ${constraints.startsWith}`);
  }
  if (constraints.endsWith != null && !stringValue.endsWith(constraints.endsWith)) {
    fail(constraints, `Must end with ${constraints.endsWith}`);
  }
  if (constraints.contains != null && !stringValue.includes(constraints.contains)) {
    fail(constraints, `Must contain ${constraints.contains}`);
  }
  if (constraints.notContains != null && stringValue.includes(constraints.notContains)) {
    fail(constraints, `Must not contain ${constraints.notContains}`);
  }
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(stringValue)) {
    fail(constraints, `Must match ${constraints.pattern}`);
  }
  if (constraints.format != null) {
    const validateFormat = formatValidators[constraints.format];
    if (!validateFormat) fail(constraints, `Invalid format type ${constraints.format}`);
    if (!validateFormat(stringValue)) fail(constraints, formatMessages[constraints.format]);
  }
  return stringValue;
}

function isMultipleOf(value, factor) {
  const decimalPlaces = Math.max(
    (String(value).split('.')[1] || '').length,
    (String(factor).split('.')[1] || '').length,
  );
  const scale = 10 ** decimalPlaces;
  return Math.round(value * scale) % Math.round(factor * scale) === 0;
}

function validateNumber(value, constraints) {
  const numberValue = Number(value);
  if (constraints.min != null && numberValue < constraints.min) fail(constraints, `Must be at least ${constraints.min}`);
  if (constraints.max != null && numberValue > constraints.max) fail(constraints, `Must be no greater than ${constraints.max}`);
  if (constraints.exclusiveMin != null && numberValue <= constraints.exclusiveMin) fail(constraints, `Must be greater than ${constraints.exclusiveMin}`);
  if (constraints.exclusiveMax != null && numberValue >= constraints.exclusiveMax) fail(constraints, `Must be less than ${constraints.exclusiveMax}`);
  if (constraints.multipleOf != null && !isMultipleOf(numberValue, constraints.multipleOf)) {
    fail(constraints, `Must be a multiple of ${constraints.multipleOf}`);
  }
  return numberValue;
}

function constraintTypeName(fieldName, typeName, constraints) {
  if (constraints.uniqueTypeName) return constraints.uniqueTypeName;
  const parts = [fieldName, typeName];
  for (const [name, value] of Object.entries(constraints)) {
    if (name !== 'errorMessage' && name !== 'uniqueTypeName' && value != null) parts.push(name, String(value));
  }
  return parts.join('_').replaceAll('.', 'dot').replace(/[^_0-9A-Za-z]/g, '');
}

function constrainedScalar(fieldName, scalar, constraints, typeName = scalar.name) {
  const validate = scalar.name === 'String' || scalar.name === 'ID' ? validateString : validateNumber;
  const serialize = (value) => validate(scalar.serialize(value), constraints);
  const parseValue = (value) => validate(scalar.serialize(value), constraints);
  const parseLiteral = (node, variables) => validate(scalar.parseLiteral(node, variables), constraints);
  return new GraphQLScalarType({
    name: constraintTypeName(fieldName, typeName, constraints),
    serialize,
    parseValue,
    parseLiteral,
  });
}

function replaceNamedType(type, replacement) {
  if (isNonNullType(type)) return new GraphQLNonNull(replaceNamedType(type.ofType, replacement));
  if (isListType(type)) return new GraphQLList(replaceNamedType(type.ofType, replacement));
  return replacement;
}

function applyConstraint(schema, fieldConfig, fieldName) {
  const constraints = getDirective(schema, fieldConfig, 'constraint')?.[0];
  if (!constraints) return fieldConfig;
  const scalar = getNamedType(fieldConfig.type);
  if (!isScalarType(scalar)) return fieldConfig;
  if (!['String', 'ID', 'Int', 'Float'].includes(scalar.name)) {
    throw new Error(`Not a valid scalar type: ${scalar.name}`);
  }
  const configuredName = fieldConfig.astNode?.name?.value || fieldName;
  const typeName = String(fieldConfig.type).replace(/[\[\]!]/g, (character) => character === '[' ? 'List_' : '');
  const replacement = constrainedScalar(configuredName, scalar, constraints, typeName);
  return { ...fieldConfig, type: replaceNamedType(fieldConfig.type, replacement) };
}

function constraintDirective() {
  return (schema) => mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName) => applyConstraint(schema, fieldConfig, fieldName),
    [MapperKind.INPUT_OBJECT_FIELD]: (fieldConfig, fieldName) => applyConstraint(schema, fieldConfig, fieldName),
    [MapperKind.ARGUMENT]: (argumentConfig, argumentName) => applyConstraint(schema, argumentConfig, argumentName),
  });
}

const documentationLabels = {
  minLength: 'Minimal length',
  maxLength: 'Maximal length',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  contains: 'Contains',
  notContains: "Doesn't contain",
  pattern: 'Must match RegEx pattern',
  format: 'Must match format',
  min: 'Minimal value',
  max: 'Maximal value',
  exclusiveMin: 'Grater than',
  exclusiveMax: 'Less than',
  multipleOf: 'Must be a multiple of',
  minItems: 'Minimal number of items',
  maxItems: 'Maximal number of items',
};

function constraintDescription(constraints) {
  const lines = Object.entries(documentationLabels)
    .filter(([name]) => constraints[name] != null)
    .map(([name, label]) => `* ${label}: \`${constraints[name]}\``);
  return `*Constraints:*\n${lines.join('\n')}${lines.length ? '\n' : ''}`;
}

function addConstraintDocumentation(schema, config) {
  const constraints = getDirective(schema, config, 'constraint')?.[0];
  if (!constraints) return config;
  return { ...config, description: constraintDescription(constraints) };
}

function constraintDirectiveDocumentation() {
  return (schema) => mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (config) => addConstraintDocumentation(schema, config),
    [MapperKind.INPUT_OBJECT_FIELD]: (config) => addConstraintDocumentation(schema, config),
    [MapperKind.ARGUMENT]: (config) => addConstraintDocumentation(schema, config),
  });
}

function argumentValidationError(argumentNode, argument, field, message, quoteValue) {
  const value = argumentNode.value.value;
  const renderedValue = quoteValue ? `"${value}"` : value;
  return new GraphQLError(`Argument "${argument.name}" of "${field.name}" got invalid value ${renderedValue}. ${message}`);
}

function createQueryValidationRule(schema) {
  return (context) => {
    const typeInfo = new TypeInfo(schema);
    return visitWithTypeInfo(typeInfo, {
      Argument(node) {
        const argument = typeInfo.getArgument();
        const field = typeInfo.getFieldDef();
        if (!argument || !field || node.value.kind === 'Variable') return;
        const scalar = getNamedType(argument.type);
        const constraints = getDirective(schema, argument, 'constraint')?.[0];
        if (!constraints) return;

        if (!['String', 'ID', 'Int', 'Float'].includes(scalar.name)) {
          try {
            scalar.parseLiteral(node.value);
            context.reportError(argumentValidationError(
              node,
              argument,
              field,
              `Not a valid scalar type: ${scalar.name}`,
              false,
            ));
          } catch {}
          return;
        }

        const validate = scalar.name === 'String' || scalar.name === 'ID' ? validateString : validateNumber;
        try {
          validate(scalar.parseLiteral(node.value), constraints);
        } catch (error) {
          context.reportError(argumentValidationError(node, argument, field, error.message, node.value.kind === 'StringValue'));
        }
      },
    });
  };
}

function validateQuery(schema, document, variableValues = {}, operationName) {
  const selectedDocument = operationName ? separateOperations(document)[operationName] || document : document;
  const errors = [];
  const visitor = createQueryValidationRule(schema)({ reportError: (error) => errors.push(error) });
  visit(selectedDocument, visitor);
  return errors;
}

function createApolloQueryValidationPlugin({ schema }) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ document, request }) {
          const errors = validateQuery(schema, document, request?.variables, request?.operationName);
          if (errors.length) throw errors;
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin() {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName);
      if (errors.length) setResultAndStopExecution({ errors });
    },
  };
}

module.exports = {
  constraintDirective,
  constraintDirectiveDocumentation,
  constraintDirectiveTypeDefs,
  validateQuery,
  createApolloQueryValidationPlugin,
  createEnvelopQueryValidationPlugin,
  createQueryValidationRule,
};
