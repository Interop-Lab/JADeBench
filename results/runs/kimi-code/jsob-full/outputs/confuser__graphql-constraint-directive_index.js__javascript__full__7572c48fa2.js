'use strict';

const {
  DirectiveLocation,
  GraphQLError,
  GraphQLDirective,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  getDirectiveValues,
  getNamedType,
  isInputObjectType,
  isListType,
  isNonNullType,
  Kind,
  TypeInfo,
  ValidationContext,
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

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: 'constraint',
  locations: [DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION],
  args: {
    minLength: { type: GraphQLInt }, maxLength: { type: GraphQLInt }, startsWith: { type: GraphQLString }, endsWith: { type: GraphQLString },
    contains: { type: GraphQLString }, notContains: { type: GraphQLString }, pattern: { type: GraphQLString }, format: { type: GraphQLString },
    min: { type: GraphQLFloat }, max: { type: GraphQLFloat }, exclusiveMin: { type: GraphQLFloat }, exclusiveMax: { type: GraphQLFloat },
    multipleOf: { type: GraphQLFloat }, minItems: { type: GraphQLInt }, maxItems: { type: GraphQLInt },
    errorMessage: { type: GraphQLString }, uniqueTypeName: { type: GraphQLString },
  },
});

const formats = {
  byte: { validate: validator.isBase64, message: 'Must be in byte format' },
  date: { validate: validator.isISO8601, message: 'Must be a date in ISO 8601 format' },
  'date-time': { validate: validator.isRFC3339, message: 'Must be a date-time in RFC 3339 format' },
  email: { validate: validator.isEmail, message: 'Must be in email format' },
  ipv4: { validate: value => validator.isIP(value, 4), message: 'Must be in IP v4 format' },
  ipv6: { validate: value => validator.isIP(value, 6), message: 'Must be in IP v6 format' },
  uri: { validate: validator.isURL, message: 'Must be in URI format' },
  uuid: { validate: validator.isUUID, message: 'Must be in UUID format' },
};

class ConstraintError extends Error {
  constructor(fieldName, message, context) {
    super(message);
    this.name = 'ConstraintError';
    this.code = 'ERR_GRAPHQL_CONSTRAINT_VALIDATION';
    this.fieldName = fieldName;
    this.context = context;
    this.originalError = undefined;
    Error.captureStackTrace(this, this.constructor);
  }
}

function fail(argument, value, defaultMessage, constraints, fieldName) {
  throw new ConstraintError(fieldName, constraints.errorMessage || defaultMessage, [{ arg: argument, value }]);
}

function validateString(value, constraints, fieldName) {
  if (typeof value !== 'string') return value;
  if (constraints.minLength && value.length < constraints.minLength) fail('minLength', constraints.minLength, `Must be at least ${constraints.minLength} characters in length`, constraints, fieldName);
  if (constraints.maxLength && value.length > constraints.maxLength) fail('maxLength', constraints.maxLength, `Must be no more than ${constraints.maxLength} characters in length`, constraints, fieldName);
  if (constraints.startsWith != null && !value.startsWith(constraints.startsWith)) fail('startsWith', constraints.startsWith, `Must start with ${constraints.startsWith}`, constraints, fieldName);
  if (constraints.endsWith != null && !value.endsWith(constraints.endsWith)) fail('endsWith', constraints.endsWith, `Must end with ${constraints.endsWith}`, constraints, fieldName);
  if (constraints.contains != null && !value.includes(constraints.contains)) fail('contains', constraints.contains, `Must contain ${constraints.contains}`, constraints, fieldName);
  if (constraints.notContains != null && value.includes(constraints.notContains)) fail('notContains', constraints.notContains, `Must not contain ${constraints.notContains}`, constraints, fieldName);
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(value)) fail('pattern', constraints.pattern, `Must match ${constraints.pattern}`, constraints, fieldName);
  if (constraints.format != null) {
    const format = formats[constraints.format];
    if (!format) fail('format', constraints.format, `Invalid format type ${constraints.format}`, constraints, fieldName);
    if (!format.validate(value)) fail('format', constraints.format, format.message, constraints, fieldName);
  }
  return value;
}

function validateNumber(value, constraints, fieldName) {
  if (typeof value !== 'number') return value;
  if (constraints.min != null && value < constraints.min) fail('min', constraints.min, `Must be at least ${constraints.min}`, constraints, fieldName);
  if (constraints.max != null && value > constraints.max) fail('max', constraints.max, `Must be no greater than ${constraints.max}`, constraints, fieldName);
  if (constraints.exclusiveMin != null && value <= constraints.exclusiveMin) fail('exclusiveMin', constraints.exclusiveMin, `Must be greater than ${constraints.exclusiveMin}`, constraints, fieldName);
  if (constraints.exclusiveMax != null && value >= constraints.exclusiveMax) fail('exclusiveMax', constraints.exclusiveMax, `Must be less than ${constraints.exclusiveMax}`, constraints, fieldName);
  if (constraints.multipleOf != null) {
    const quotient = value / constraints.multipleOf;
    if (Math.abs(quotient - Math.round(quotient)) > 1e-12) fail('multipleOf', constraints.multipleOf, `Must be a multiple of ${constraints.multipleOf}`, constraints, fieldName);
  }
  return value;
}

function validateValue(value, constraints, fieldName) {
  if (value == null || Array.isArray(value)) return value;
  return typeof value === 'string' ? validateString(value, constraints, fieldName) : validateNumber(value, constraints, fieldName);
}

function constraintTypeName(fieldName, baseType, constraints) {
  if (constraints.uniqueTypeName) return constraints.uniqueTypeName;
  const suffix = Object.entries(constraints)
    .filter(([key]) => key !== 'errorMessage' && key !== 'uniqueTypeName')
    .map(([key, value]) => `${key}_${String(value).replace('.', 'dot').replace(/\W/g, '')}`)
    .join('_');
  return `${fieldName}_${baseType.name}_${suffix}`;
}

function constrainedBaseName(type) {
  if (type instanceof GraphQLList) return `List_${constrainedBaseName(type.ofType)}`;
  if (type instanceof GraphQLNonNull) {
    if (type.ofType instanceof GraphQLList) {
      const listName = constrainedBaseName(type.ofType);
      return listName.replace('List_', 'List_ListNotNull_');
    }
    return `${constrainedBaseName(type.ofType)}_NotNull`;
  }
  return type.name;
}

function wrapConstrainedType(type, fieldName, constraints, typeName = constrainedBaseName(type)) {
  if (type instanceof GraphQLNonNull) return new GraphQLNonNull(wrapConstrainedType(type.ofType, fieldName, constraints, typeName));
  if (type instanceof GraphQLList) return new GraphQLList(wrapConstrainedType(type.ofType, fieldName, constraints, typeName));
  if (!(type instanceof GraphQLScalarType)) return type;
  const originalConfig = type.toConfig();
  return new GraphQLScalarType({
    ...originalConfig,
    name: constraintTypeName(fieldName, { name: typeName }, constraints),
    serialize(value) { return validateValue(originalConfig.serialize(value), constraints, fieldName); },
    parseValue(value) { return validateValue(originalConfig.parseValue(value), constraints, fieldName); },
    parseLiteral(node, variables) { return validateValue(originalConfig.parseLiteral(node, variables), constraints, fieldName); },
  });
}

function constraintDirective() {
  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: fieldConfig => {
      const constraints = getDirective(schema, fieldConfig, 'constraint')?.[0];
      if (!constraints) return undefined;
      fieldConfig.type = wrapConstrainedType(fieldConfig.type, fieldConfig.astNode?.name.value || 'field', constraints);
      return fieldConfig;
    },
    [MapperKind.ARGUMENT]: argumentConfig => {
      const constraints = getDirective(schema, argumentConfig, 'constraint')?.[0];
      if (!constraints) return undefined;
      argumentConfig.type = wrapConstrainedType(argumentConfig.type, argumentConfig.astNode?.name.value || 'argument', constraints);
      return argumentConfig;
    },
  });
}

function constraintDirectiveDocumentation(_options) {
  return schema => {
    const documentConstraints = config => {
      if (!config?.astNode) return undefined;
      const constraints = getDirective(schema, config, 'constraint')?.[0];
      if (!constraints) return undefined;
      config.description = `${config.description ? `${config.description}\n\n` : ''}${describeConstraints(constraints)}`;
      return config;
    };
    return mapSchema(schema, {
      [MapperKind.FIELD]: documentConstraints,
      [MapperKind.ARGUMENT]: documentConstraints,
    });
  };
}

function describeConstraints(constraints) {
  const descriptions = {
    minLength: 'Minimal length', maxLength: 'Maximal length', startsWith: 'Starts with', endsWith: 'Ends with',
    contains: 'Contains', notContains: "Doesn't contain", pattern: 'Must match RegEx pattern', format: 'Must match format',
    min: 'Minimal value', max: 'Maximal value', exclusiveMin: 'Grater than', exclusiveMax: 'Less than',
    multipleOf: 'Must be a multiple of', minItems: 'Minimal number of items', maxItems: 'Maximal number of items',
  };
  const lines = Object.entries(descriptions)
    .filter(([name]) => constraints[name] != null)
    .map(([name, description]) => `* ${description}: \`${constraints[name]}\``);
  return `*Constraints:*\n${lines.join('\n')}\n`;
}

function validateQuery(schema, document, variables, operationName, options = {}) {
  const typeInfo = new TypeInfo(schema);
  const errors = [];
  const context = new ValidationContext(schema, document, typeInfo, error => errors.push(error));
  const visitor = new QueryValidationVisitor(context, { variables, operationName, options });
  visit(document, visitWithTypeInfo(typeInfo, visitor));
  return errors;
}

class QueryValidationVisitor {
  constructor(context, settings = {}) {
    this.context = context;
    this.variables = settings.variables || {};
    this.operationName = settings.operationName;
    this.options = settings.options || {};
  }

  Argument(node) {
    const argument = this.context.getArgument();
    const field = this.context.getFieldDef();
    if (!argument || node.value.kind === Kind.VARIABLE) return;
    const constraints = getDirective(this.context.getSchema(), argument, 'constraint')?.[0];
    const value = valueFromAST(node.value, argument.type, this.variables);
    const fieldName = `${field.name}.${argument.name}`;
    if (constraints) this.reportValidation(() => validateValue(value, constraints, fieldName), argument.name, field.name, JSON.stringify(value));
    this.validateNestedInput(argument.type, value, argument.name, field.name);
  }

  validateNestedInput(type, value, argumentName, parentField, path = '') {
    if (isNonNullType(type)) return this.validateNestedInput(type.ofType, value, argumentName, parentField, path);
    if (isListType(type)) return;
    const namedType = getNamedType(type);
    if (!isInputObjectType(namedType) || value == null || typeof value !== 'object') return;
    for (const [fieldName, inputField] of Object.entries(namedType.getFields())) {
      const fieldPath = path ? `${path}.${fieldName}` : fieldName;
      const fieldValue = value[fieldName];
      const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, inputField.astNode);
      if (constraints) {
        if (constraints.minItems != null || constraints.maxItems != null) {
          const length = Array.isArray(fieldValue) ? fieldValue.length : 0;
          if (constraints.minItems != null && length < constraints.minItems) this.reportListValidation('minItems', constraints.minItems, `must be at least ${constraints.minItems} in length`, constraints, fieldName, argumentName, parentField);
          if (constraints.maxItems != null && length > constraints.maxItems) this.reportListValidation('maxItems', constraints.maxItems, `must be no more than ${constraints.maxItems} in length`, constraints, fieldName, argumentName, parentField);
        } else {
          this.reportValidation(() => validateValue(fieldValue, constraints, fieldPath), argumentName, parentField, `${JSON.stringify(fieldValue)} at "${fieldPath}"`);
        }
      }
      this.validateNestedInput(inputField.type, fieldValue, argumentName, parentField, fieldPath);
    }
  }

  reportListValidation(argument, value, message, constraints, fieldName, argumentName, parentField) {
    const validationError = new ConstraintError(fieldName, `Argument "${argumentName}" of "${parentField}" ${constraints.errorMessage || message}`, [{ arg: argument, value }]);
    this.context.reportError(validationError);
  }

  reportValidation(validate, argumentName, parentField, valueDescription) {
    try { validate(); }
    catch (error) {
      const prefix = valueDescription == null ? `Argument "${argumentName}" of "${parentField}"` : `Argument "${argumentName}" of "${parentField}" got invalid value ${valueDescription}.`;
      const message = valueDescription == null ? `${prefix} ${error.message}` : `${prefix} ${error.message}`;
      const validationError = new ConstraintError(error.fieldName, message, error.context);
      validationError.originalError = error;
      this.context.reportError(validationError);
    }
  }
}

function literalValue(node, variables) {
  if (node.kind === Kind.VARIABLE) return variables[node.name.value];
  if (node.kind === Kind.STRING || node.kind === Kind.ENUM) return node.value;
  if (node.kind === Kind.INT || node.kind === Kind.FLOAT) return Number(node.value);
  if (node.kind === Kind.BOOLEAN) return node.value;
  if (node.kind === Kind.NULL) return null;
  if (node.kind === Kind.LIST) return node.values.map(value => literalValue(value, variables));
  if (node.kind === Kind.OBJECT) return Object.fromEntries(node.fields.map(field => [field.name.value, literalValue(field.value, variables)]));
  return undefined;
}

function createQueryValidationRule(options) {
  return context => new QueryValidationVisitor(context, options);
}

function createApolloQueryValidationPlugin({ schema }, options = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          const operation = request.operationName ? separateOperations(document)[request.operationName] : document;
          const errors = validateQuery(schema, operation, request.variables, request.operationName, options);
          if (errors.length) {
            const { UserInputError } = require('apollo-server-errors');
            throw errors.map(error => new UserInputError(error.message, {
              field: error.fieldName,
              context: error.context,
            }));
          }
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin(options = {}) {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, options);
      if (errors.length) {
        setResultAndStopExecution({
          errors: errors.map(error => new GraphQLError(error.message, {
            extensions: { code: error.code, field: error.fieldName, context: error.context },
          })),
        });
      }
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
