'use strict';

const {
  DirectiveLocation, GraphQLError, GraphQLDirective, GraphQLFloat, GraphQLID,
  GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLScalarType, GraphQLString,
  Kind, TypeInfo, ValidationContext, getDirectiveValues, getNamedType,
  getVariableValues, isInputObjectType, isListType, isNonNullType, isScalarType,
  separateOperations, valueFromAST, visit, visitWithTypeInfo,
} = require('graphql');
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils');
const validator = require('validator');

const constraintDirectiveTypeDefs = `
  directive @constraint(
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    contains: String
    notContains: String
    pattern: String
    format: String
    min: Float
    max: Float
    exclusiveMin: Float
    exclusiveMax: Float
    multipleOf: Float
    minItems: Int
    maxItems: Int
    errorMessage: String
    uniqueTypeName: String
  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION
`;

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: 'constraint',
  locations: [
    DirectiveLocation.FIELD_DEFINITION,
    DirectiveLocation.INPUT_FIELD_DEFINITION,
    DirectiveLocation.ARGUMENT_DEFINITION,
  ],
  args: {
    minLength: { type: GraphQLInt }, maxLength: { type: GraphQLInt },
    startsWith: { type: GraphQLString }, endsWith: { type: GraphQLString },
    contains: { type: GraphQLString }, notContains: { type: GraphQLString },
    pattern: { type: GraphQLString }, format: { type: GraphQLString },
    min: { type: GraphQLFloat }, max: { type: GraphQLFloat },
    exclusiveMin: { type: GraphQLFloat }, exclusiveMax: { type: GraphQLFloat },
    multipleOf: { type: GraphQLFloat }, minItems: { type: GraphQLInt },
    maxItems: { type: GraphQLInt }, errorMessage: { type: GraphQLString },
    uniqueTypeName: { type: GraphQLString },
  },
});

class ConstraintDirectiveError extends GraphQLError {
  constructor(message, fieldName, context) {
    super(message, { originalError: context });
    this.name = 'ConstraintDirectiveError';
    this.code = 'ERR_GRAPHQL_CONSTRAINT_VALIDATION';
    this.fieldName = fieldName;
    this.context = context;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ConstraintDirectiveError);
  }
}

function validationError(message, constraints, fieldName, context) {
  return new ConstraintDirectiveError(constraints.errorMessage || message, fieldName, context);
}

const formatValidators = {
  byte: value => validator.isBase64(value, { urlSafe: true }),
  date: value => validator.isISO8601(value, { strict: true }),
  'date-time': value => validator.isRFC3339(value),
  email: value => validator.isEmail(value),
  ipv4: value => validator.isIP(value, 4),
  ipv6: value => validator.isIP(value, 6),
  uri: value => validator.isURL(value),
  uuid: value => validator.isUUID(value),
};
const formatMessages = {
  byte: 'Must be in byte format', date: 'Must be a date in ISO 8601 format',
  'date-time': 'Must be a date-time in RFC 3339 format', email: 'Must be in email format',
  ipv4: 'Must be in IP v4 format', ipv6: 'Must be in IP v6 format',
  uri: 'Must be in URI format', uuid: 'Must be in UUID format',
};

function validateString(value, constraints, fieldName, context, pluginOptions = {}) {
  if (typeof value !== 'string') return value;
  const fail = message => { throw validationError(message, constraints, fieldName, context); };
  if (constraints.minLength != null && !validator.isLength(value, { min: constraints.minLength })) fail(`Must be at least ${constraints.minLength} characters in length`);
  if (constraints.maxLength != null && !validator.isLength(value, { max: constraints.maxLength })) fail(`Must be no more than ${constraints.maxLength} characters in length`);
  if (constraints.startsWith != null && !value.startsWith(constraints.startsWith)) fail(`Must start with ${constraints.startsWith}`);
  if (constraints.endsWith != null && !value.endsWith(constraints.endsWith)) fail(`Must end with ${constraints.endsWith}`);
  if (constraints.contains != null && !value.includes(constraints.contains)) fail(`Must contain ${constraints.contains}`);
  if (constraints.notContains != null && value.includes(constraints.notContains)) fail(`Must not contain ${constraints.notContains}`);
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(value)) fail(`Must match ${constraints.pattern}`);
  if (constraints.format != null) {
    const formats = { ...formatValidators, ...(pluginOptions.formats || {}) };
    const validate = formats[constraints.format];
    if (!validate) throw new Error(`Invalid format type ${constraints.format}`);
    if (!validate(value)) fail(formatMessages[constraints.format] || `Must match format ${constraints.format}`);
  }
  return value;
}

function isMultipleOf(value, divisor) {
  const quotient = value / divisor;
  return Math.abs(quotient - Math.round(quotient)) < Number.EPSILON * Math.max(1, Math.abs(quotient));
}

function validateNumber(value, constraints, fieldName, context) {
  if (typeof value !== 'number') return value;
  const fail = message => { throw validationError(message, constraints, fieldName, context); };
  if (constraints.min != null && value < constraints.min) fail(`Must be at least ${constraints.min}`);
  if (constraints.max != null && value > constraints.max) fail(`Must be no greater than ${constraints.max}`);
  if (constraints.exclusiveMin != null && value <= constraints.exclusiveMin) fail(`Must be greater than ${constraints.exclusiveMin}`);
  if (constraints.exclusiveMax != null && value >= constraints.exclusiveMax) fail(`Must be less than ${constraints.exclusiveMax}`);
  if (constraints.multipleOf != null && !isMultipleOf(value, constraints.multipleOf)) fail(`Must be a multiple of ${constraints.multipleOf}`);
  return value;
}

function getScalarValidation(scalarType) {
  if (scalarType === GraphQLString || scalarType === GraphQLID || scalarType.name.startsWith('ConstraintString')) return validateString;
  if (scalarType === GraphQLFloat || scalarType === GraphQLInt || scalarType.name.startsWith('ConstraintNumber')) return validateNumber;
  throw new Error(`Not a valid scalar type: ${scalarType.toString()}`);
}

function inspectConstraintType(type) {
  const result = { scalarType: null, scalarNotNull: false, list: false, listNotNull: false };
  let current = type;
  if (isNonNullType(current)) {
    result.listNotNull = isListType(current.ofType);
    result.scalarNotNull = !result.listNotNull;
    current = current.ofType;
  }
  if (isListType(current)) {
    result.list = true;
    current = current.ofType;
    if (isNonNullType(current)) { result.scalarNotNull = true; current = current.ofType; }
  }
  if (!isScalarType(current)) throw new Error(`Not a valid scalar type: ${type.toString()}`);
  result.scalarType = current;
  return result;
}

function constraintTypeName(typeInfo, constraints) {
  if (constraints.uniqueTypeName) return constraints.uniqueTypeName.replace(/\W/g, '_');
  const prefix = `${typeInfo.list ? 'List_' : ''}${typeInfo.listNotNull ? 'ListNotNull_' : ''}${typeInfo.scalarNotNull ? 'NotNull_' : ''}`;
  const suffix = Object.entries(constraints)
    .filter(([key, value]) => key !== 'errorMessage' && key !== 'uniqueTypeName' && value != null)
    .map(([key, value]) => `${key}_${String(value).replace(/\W/g, value === '.' ? 'dot' : '_')}`)
    .join('_');
  return `${prefix}${typeInfo.scalarType.name}_${suffix}`;
}

const constrainedTypes = new Map();
function makeConstrainedType(type, constraints, pluginOptions = {}) {
  const typeInfo = inspectConstraintType(type);
  const validate = getScalarValidation(typeInfo.scalarType);
  const name = constraintTypeName(typeInfo, constraints);
  let constrainedScalar = constrainedTypes.get(name);
  if (!constrainedScalar) {
    const original = typeInfo.scalarType;
    const check = value => validate(value, constraints, name, undefined, pluginOptions);
    constrainedScalar = new GraphQLScalarType({
      ...original.toConfig(), name,
      serialize: value => check(original.serialize(value)),
      parseValue: value => check(original.parseValue(value)),
      parseLiteral: (node, variables) => check(original.parseLiteral(node, variables)),
    });
    constrainedTypes.set(name, constrainedScalar);
  }
  let result = typeInfo.scalarNotNull ? new GraphQLNonNull(constrainedScalar) : constrainedScalar;
  if (typeInfo.list) result = new GraphQLList(result);
  if (typeInfo.listNotNull) result = new GraphQLNonNull(result);
  return result;
}

function firstDirective(schema, config, directiveName) {
  const directives = getDirective(schema, config, directiveName);
  return directives && directives[0];
}

function constraintDirective(options = {}) {
  const directiveName = options.name || 'constraint';
  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: config => {
      const constraints = firstDirective(schema, config, directiveName);
      return constraints ? { ...config, type: makeConstrainedType(config.type, constraints, options) } : config;
    },
    [MapperKind.ARGUMENT]: config => {
      const constraints = firstDirective(schema, config, directiveName);
      return constraints ? { ...config, type: makeConstrainedType(config.type, constraints, options) } : config;
    },
  });
}

function constraintsForNode(node) {
  return node && getDirectiveValues(constraintDirectiveTypeDefsObj, node);
}

function validateInputValue(value, type, definition, fieldName, context, pluginOptions, path = '') {
  if (value == null) return;
  let currentType = isNonNullType(type) ? type.ofType : type;
  const constraints = constraintsForNode(definition && definition.astNode);
  if (isListType(currentType)) {
    const values = Array.isArray(value) ? value : [value];
    if (constraints && constraints.minItems != null && values.length < constraints.minItems) throw validationError(`must be at least ${constraints.minItems} in length`, constraints, fieldName, context);
    if (constraints && constraints.maxItems != null && values.length > constraints.maxItems) throw validationError(`must be no more than ${constraints.maxItems} in length`, constraints, fieldName, context);
    values.forEach((item, index) => validateInputValue(item, currentType.ofType, definition, fieldName, context, pluginOptions, `${path}[${index}]`));
  } else if (isInputObjectType(currentType)) {
    const fields = currentType.getFields();
    Object.entries(value).forEach(([key, item]) => {
      if (fields[key]) validateInputValue(item, fields[key].type, fields[key], fieldName, context, pluginOptions, path ? `${path}.${key}` : key);
    });
  } else if (constraints) {
    getScalarValidation(getNamedType(currentType))(value, constraints, fieldName + (path ? ` at "${path}"` : ''), context, pluginOptions);
  }
}

function selectOperation(document, operationName) {
  const operations = document.definitions.filter(definition => definition.kind === Kind.OPERATION_DEFINITION);
  if (operationName) return operations.find(operation => operation.name && operation.name.value === operationName);
  return operations.length === 1 ? operations[0] : undefined;
}

function validateQuery(schema, document, variables = {}, operationName, pluginOptions = {}) {
  const errors = [];
  const operation = selectOperation(document, operationName);
  if (!operation) return errors;
  const variableResult = getVariableValues(schema, operation.variableDefinitions || [], variables);
  const variableValues = variableResult.coerced || variables;
  if (variableResult.errors) errors.push(...variableResult.errors);
  const typeInfo = new TypeInfo(schema);
  const context = new ValidationContext(schema, document, typeInfo, error => errors.push(error));
  visit(document, visitWithTypeInfo(typeInfo, {
    Argument(node) {
      const argument = typeInfo.getArgument();
      const field = typeInfo.getFieldDef();
      if (!argument || !field) return;
      try {
        validateInputValue(valueFromAST(node.value, argument.type, variableValues), argument.type, argument, node.name.value, context, pluginOptions);
      } catch (error) { errors.push(error); }
    },
  }));
  return errors;
}

const descriptionsMap = {
  minLength: 'Minimal length', maxLength: 'Maximal length', startsWith: 'Starts with',
  endsWith: 'Ends with', contains: 'Contains', notContains: "Doesn't contain",
  pattern: 'Must match RegEx pattern', format: 'Must match format', min: 'Minimal value',
  max: 'Maximal value', exclusiveMin: 'Grater than', exclusiveMax: 'Less than',
  multipleOf: 'Must be a multiple of', minItems: 'Minimal number of items',
  maxItems: 'Maximal number of items',
};

function addConstraintDocumentation(config) {
  const constraints = constraintsForNode(config.astNode);
  if (!constraints) return config;
  const lines = Object.entries(constraints)
    .filter(([name, value]) => descriptionsMap[name] && value != null)
    .map(([name, value]) => `* ${descriptionsMap[name]}: \`${value}\``);
  if (lines.length && (!config.description || !config.description.includes('*Constraints:*'))) {
    config.description = [config.description, '*Constraints:*', ...lines].filter(Boolean).join('\n\n');
  }
  return config;
}

function constraintDirectiveDocumentation() {
  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: addConstraintDocumentation,
    [MapperKind.ARGUMENT]: addConstraintDocumentation,
  });
}

function createApolloQueryValidationPlugin(options = {}) {
  return {
    requestDidStart({ schema }) {
      return { didResolveOperation({ request }) {
        const operations = separateOperations(request.document);
        const document = request.operationName ? operations[request.operationName] : request.document;
        const errors = validateQuery(schema, document, request.variables, request.operationName, options);
        if (errors.length) {
          const { UserInputError } = require('apollo-server-errors');
          throw errors.map(error => new UserInputError(error.message, { field: error.fieldName, context: error.context }));
        }
      } };
    },
  };
}

function createEnvelopQueryValidationPlugin(options = {}) {
  return { onExecute({ args, setResultAndStopExecution }) {
    const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, options);
    if (errors.length) setResultAndStopExecution({ errors: errors.map(error => new GraphQLError(error.message, {
      extensions: { code: error.code, field: error.fieldName, context: error.context },
    })) });
  } };
}

function createQueryValidationRule(options = {}) {
  return context => ({
    Argument(node) {
      const argument = context.getArgument();
      const field = context.getFieldDef();
      if (!argument || !field) return;
      const value = valueFromAST(node.value, argument.type, options.variables || {});
      try {
        validateInputValue(
          value,
          argument.type,
          argument,
          node.name.value,
          context,
          options.pluginOptions || options,
        );
      } catch (error) {
        context.reportError(error);
      }
    },
  });
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
