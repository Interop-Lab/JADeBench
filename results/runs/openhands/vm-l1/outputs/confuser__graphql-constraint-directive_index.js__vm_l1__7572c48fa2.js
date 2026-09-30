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
  Kind,
  TypeInfo,
  ValidationContext,
  getDirectiveValues,
  getVariableValues,
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
  locations: [
    DirectiveLocation.FIELD_DEFINITION,
    DirectiveLocation.INPUT_FIELD_DEFINITION,
    DirectiveLocation.ARGUMENT_DEFINITION,
  ],
  args: {
    minLength: { type: GraphQLInt },
    maxLength: { type: GraphQLInt },
    startsWith: { type: GraphQLString },
    endsWith: { type: GraphQLString },
    contains: { type: GraphQLString },
    notContains: { type: GraphQLString },
    pattern: { type: GraphQLString },
    format: { type: GraphQLString },
    min: { type: GraphQLFloat },
    max: { type: GraphQLFloat },
    exclusiveMin: { type: GraphQLFloat },
    exclusiveMax: { type: GraphQLFloat },
    multipleOf: { type: GraphQLFloat },
    minItems: { type: GraphQLInt },
    maxItems: { type: GraphQLInt },
    errorMessage: { type: GraphQLString },
    uniqueTypeName: { type: GraphQLString },
  },
});

class ConstraintDirectiveError extends Error {
  constructor(message, fieldName, context) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.code = 'ERR_GRAPHQL_CONSTRAINT_VALIDATION';
    this.fieldName = fieldName;
    this.context = context;
    this.originalError = this;
  }
}

const formatValidators = {
  byte: {
    message: 'Must be in byte format',
    validate: (value) => validator.isBase64(value),
  },
  date: {
    message: 'Must be a date in ISO 8601 format',
    validate: (value) => validator.isISO8601(value, { strict: true }),
  },
  'date-time': {
    message: 'Must be a date-time in RFC 3339 format',
    validate: (value) => validator.isRFC3339(value),
  },
  email: {
    message: 'Must be in email format',
    validate: (value) => validator.isEmail(value),
  },
  ipv4: {
    message: 'Must be in IP v4 format',
    validate: (value) => validator.isIP(value, 4),
  },
  ipv6: {
    message: 'Must be in IP v6 format',
    validate: (value) => validator.isIP(value, 6),
  },
  uri: {
    message: 'Must be in URI format',
    validate: (value) => validator.isURL(value),
  },
  uuid: {
    message: 'Must be in UUID format',
    validate: (value) => validator.isUUID(value),
  },
};

function validationMessage(constraints, fallback) {
  return constraints.errorMessage || fallback;
}

function throwValidationError(constraints, fallback, fieldName, context) {
  throw new ConstraintDirectiveError(
    validationMessage(constraints, fallback),
    fieldName,
    context,
  );
}

function validateString(value, constraints, options = {}, fieldName, context) {
  if (value == null) return value;
  const stringValue = String(value);

  if (
    constraints.minLength != null
    && !validator.isLength(stringValue, { min: constraints.minLength })
  ) {
    throwValidationError(
      constraints,
      `Must be at least ${constraints.minLength} characters in length`,
      fieldName,
      context,
    );
  }
  if (
    constraints.maxLength != null
    && !validator.isLength(stringValue, { max: constraints.maxLength })
  ) {
    throwValidationError(
      constraints,
      `Must be no more than ${constraints.maxLength} characters in length`,
      fieldName,
      context,
    );
  }
  if (constraints.startsWith != null && !stringValue.startsWith(constraints.startsWith)) {
    throwValidationError(
      constraints,
      `Must start with ${constraints.startsWith}`,
      fieldName,
      context,
    );
  }
  if (constraints.endsWith != null && !stringValue.endsWith(constraints.endsWith)) {
    throwValidationError(
      constraints,
      `Must end with ${constraints.endsWith}`,
      fieldName,
      context,
    );
  }
  if (constraints.contains != null && !validator.contains(stringValue, constraints.contains)) {
    throwValidationError(
      constraints,
      `Must contain ${constraints.contains}`,
      fieldName,
      context,
    );
  }
  if (
    constraints.notContains != null
    && validator.contains(stringValue, constraints.notContains)
  ) {
    throwValidationError(
      constraints,
      `Must not contain ${constraints.notContains}`,
      fieldName,
      context,
    );
  }
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(stringValue)) {
    throwValidationError(
      constraints,
      `Must match ${constraints.pattern}`,
      fieldName,
      context,
    );
  }
  if (constraints.format != null) {
    const format = (options.formats && options.formats[constraints.format])
      || formatValidators[constraints.format];
    if (!format || typeof format.validate !== 'function') {
      throw new Error(`Invalid format type ${constraints.format}`);
    }
    if (!format.validate(stringValue)) {
      throwValidationError(constraints, format.message, fieldName, context);
    }
  }
  return value;
}

function isMultipleOf(value, multiple) {
  const quotient = value / multiple;
  return Math.abs(quotient - Math.round(quotient)) < Number.EPSILON;
}

function validateNumber(value, constraints, fieldName, context) {
  if (value == null) return value;
  if (constraints.min != null && value < constraints.min) {
    throwValidationError(constraints, `Must be at least ${constraints.min}`, fieldName, context);
  }
  if (constraints.max != null && value > constraints.max) {
    throwValidationError(
      constraints,
      `Must be no greater than ${constraints.max}`,
      fieldName,
      context,
    );
  }
  if (constraints.exclusiveMin != null && value <= constraints.exclusiveMin) {
    throwValidationError(
      constraints,
      `Must be greater than ${constraints.exclusiveMin}`,
      fieldName,
      context,
    );
  }
  if (constraints.exclusiveMax != null && value >= constraints.exclusiveMax) {
    throwValidationError(
      constraints,
      `Must be less than ${constraints.exclusiveMax}`,
      fieldName,
      context,
    );
  }
  if (constraints.multipleOf != null && !isMultipleOf(value, constraints.multipleOf)) {
    throwValidationError(
      constraints,
      `Must be a multiple of ${constraints.multipleOf}`,
      fieldName,
      context,
    );
  }
  return value;
}

function unwrapConstraintType(type) {
  let current = type;
  const outerNotNull = current instanceof GraphQLNonNull;
  if (outerNotNull) current = current.ofType;

  const list = current instanceof GraphQLList;
  if (!list) {
    if (!(current instanceof GraphQLScalarType)) {
      throw new Error(`Not a valid scalar type: ${current}`);
    }
    return {
      scalarType: current,
      scalarNotNull: outerNotNull,
      list: false,
      listNotNull: false,
    };
  }

  current = current.ofType;
  const scalarNotNull = current instanceof GraphQLNonNull;
  if (scalarNotNull) current = current.ofType;
  if (!(current instanceof GraphQLScalarType)) {
    throw new Error(`Not a valid scalar type: ${current}`);
  }
  return {
    scalarType: current,
    scalarNotNull,
    list: true,
    listNotNull: outerNotNull,
  };
}

function getConstraintValidateFn(type, constraints, options) {
  const { scalarType } = unwrapConstraintType(type);
  if (scalarType === GraphQLString || scalarType.name === 'String' || scalarType.name === 'ID') {
    return (value, fieldName, context) => validateString(
      value,
      constraints,
      options,
      fieldName,
      context,
    );
  }
  if (
    scalarType === GraphQLFloat
    || scalarType === GraphQLInt
    || scalarType.name === 'Float'
    || scalarType.name === 'Int'
  ) {
    return (value, fieldName, context) => validateNumber(
      value,
      constraints,
      fieldName,
      context,
    );
  }
  throw new Error(`Not a valid scalar type: ${scalarType}`);
}

function validateList(value, type, constraints, options, fieldName, context) {
  if (value == null) return value;

  let currentType = type;
  if (currentType instanceof GraphQLNonNull) currentType = currentType.ofType;
  if (!(currentType instanceof GraphQLList)) {
    if (currentType instanceof GraphQLScalarType) {
      return getConstraintValidateFn(currentType, constraints, options)(
        value,
        fieldName,
        context,
      );
    }
    return value;
  }

  if (constraints.minItems != null && value.length < constraints.minItems) {
    throwValidationError(
      constraints,
      `must be at least ${constraints.minItems} in length`,
      fieldName,
      context,
    );
  }
  if (constraints.maxItems != null && value.length > constraints.maxItems) {
    throwValidationError(
      constraints,
      `must be no more than ${constraints.maxItems} in length`,
      fieldName,
      context,
    );
  }

  let itemType = currentType.ofType;
  if (itemType instanceof GraphQLNonNull) itemType = itemType.ofType;
  if (itemType instanceof GraphQLScalarType) {
    const validateScalar = getConstraintValidateFn(itemType, constraints, options);
    value.forEach((item) => validateScalar(item, fieldName, context));
  }
  return value;
}

function constraintName(typeInfo, constraints) {
  const parts = Object.entries(constraints)
    .filter(([key, value]) => (
      key !== 'errorMessage'
      && key !== 'uniqueTypeName'
      && value != null
    ))
    .map(([key, value]) => `${key}_${String(value).replace(/\W/g, 'dot')}`);
  if (constraints.uniqueTypeName) {
    return constraints.uniqueTypeName.replace(/\W/g, '');
  }

  const listPrefix = typeInfo.list
    ? (typeInfo.listNotNull ? 'ListNotNull_' : 'List_')
    : '';
  const nullabilitySuffix = typeInfo.scalarNotNull ? 'NotNull_' : '';
  return `${listPrefix}${typeInfo.scalarType.name}${nullabilitySuffix}_${parts.join('_')}`;
}

function createConstraintScalar(name, baseType, constraints, options) {
  const validate = getConstraintValidateFn(baseType, constraints, options);
  return new GraphQLScalarType({
    name,
    serialize(value) {
      const serialized = baseType.serialize(value);
      return validate(serialized, name);
    },
    parseValue(value) {
      const parsed = baseType.parseValue(value);
      return validate(parsed, name);
    },
    parseLiteral(node, variables) {
      const parsed = baseType.parseLiteral(node, variables);
      return validate(parsed, name);
    },
  });
}

function getConstraintTypeObject(type, constraints, options = {}, cache = new Map()) {
  const typeInfo = unwrapConstraintType(type);
  const name = constraintName(typeInfo, constraints);
  let constrainedScalar = cache.get(name);
  if (!constrainedScalar) {
    constrainedScalar = createConstraintScalar(
      name,
      typeInfo.scalarType,
      constraints,
      options,
    );
    cache.set(name, constrainedScalar);
  }

  let constrainedType = typeInfo.scalarNotNull
    ? new GraphQLNonNull(constrainedScalar)
    : constrainedScalar;
  if (typeInfo.list) constrainedType = new GraphQLList(constrainedType);
  if (typeInfo.listNotNull) constrainedType = new GraphQLNonNull(constrainedType);
  return constrainedType;
}

function directiveArguments(schema, element) {
  const directives = getDirective(schema, element, 'constraint');
  return directives && directives[0];
}

function constraintDirective(options = {}) {
  return (schema) => {
    const cache = new Map();
    const constrain = (fieldConfig) => {
      const constraints = directiveArguments(schema, fieldConfig);
      if (!constraints) return fieldConfig;
      return {
        ...fieldConfig,
        type: getConstraintTypeObject(fieldConfig.type, constraints, options, cache),
      };
    };

    return mapSchema(schema, {
      [MapperKind.FIELD]: constrain,
      [MapperKind.ARGUMENT]: constrain,
    });
  };
}

const descriptionsMap = {
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

function documentedDescription(description, constraints, options) {
  const header = options.header || '*Constraints:*';
  const details = Object.entries(constraints)
    .filter(([name, value]) => descriptionsMap[name] && value != null)
    .map(([name, value]) => `* ${descriptionsMap[name]}: \`${value}\``)
    .join('\n');
  if (!details) return description;
  if (description && description.includes(header)) return description;
  return [description, header, details].filter(Boolean).join('\n\n');
}

function constraintDirectiveDocumentation(options = {}) {
  return (schema) => {
    const document = (fieldConfig) => {
      const constraints = directiveArguments(schema, fieldConfig);
      if (!constraints) return fieldConfig;
      return {
        ...fieldConfig,
        description: documentedDescription(fieldConfig.description, constraints, options),
      };
    };
    return mapSchema(schema, {
      [MapperKind.FIELD]: document,
      [MapperKind.ARGUMENT]: document,
    });
  };
}

function constraintValues(astNode) {
  return astNode
    ? getDirectiveValues(constraintDirectiveTypeDefsObj, astNode)
    : undefined;
}

function errorContext(argName, variableName, fieldName, path) {
  return { argName, variableName, fieldName, path };
}

function queryError(error, value, fieldName, context) {
  const location = context.path && context.path !== context.argName
    ? ` at "${context.path}"`
    : '';
  const subject = context.variableName
    ? `Variable "$${context.variableName}"${location}`
    : `Argument "${context.argName}" of "${fieldName}"${location}`;
  const message = error.message.startsWith('must be ')
    ? `${subject} ${error.message}`
    : `${subject} got invalid value ${JSON.stringify(value)}. ${error.message}`;
  return new ConstraintDirectiveError(message, fieldName, context);
}

function validateInputValue({
  value,
  type,
  constraints,
  options,
  errors,
  fieldName,
  argName,
  variableName,
  path,
}) {
  if (value == null) return;
  const context = errorContext(argName, variableName, fieldName, path);
  try {
    if (constraints) {
      validateList(value, type, constraints, options, fieldName, context);
    }
  } catch (error) {
    errors.push(queryError(error, value, fieldName, context));
  }

  let currentType = type;
  if (currentType instanceof GraphQLNonNull) currentType = currentType.ofType;
  if (currentType instanceof GraphQLList) {
    if (!Array.isArray(value)) return;
    let itemType = currentType.ofType;
    if (itemType instanceof GraphQLNonNull) itemType = itemType.ofType;
    if (itemType instanceof GraphQLScalarType) return;
    value.forEach((item, index) => validateInputValue({
      value: item,
      type: currentType.ofType,
      constraints: undefined,
      options,
      errors,
      fieldName,
      argName,
      variableName,
      path: `${path}[${index}]`,
    }));
    return;
  }
  if (!(currentType && typeof currentType.getFields === 'function')) return;

  const fields = currentType.getFields();
  for (const [name, inputField] of Object.entries(fields)) {
    if (value[name] === undefined) continue;
    validateInputValue({
      value: value[name],
      type: inputField.type,
      constraints: constraintValues(inputField.astNode),
      options,
      errors,
      fieldName,
      argName,
      variableName,
      path: path ? `${path}.${name}` : name,
    });
  }
}

function selectOperation(document, operationName) {
  if (!operationName) return document;
  const operations = separateOperations(document);
  return operations[operationName] || document;
}

class QueryValidationVisitor {
  constructor(context, options = {}) {
    this.context = context;
    this.options = options.pluginOptions || options;
    this.rawVariables = options.variables || {};
    this.operationName = options.operationName;
    this.variableValues = this.rawVariables;
    this.currentFieldName = undefined;
  }

  onOperationDefinitionEnter(node) {
    if (
      this.operationName
      && (!node.name || node.name.value !== this.operationName)
    ) {
      return false;
    }
    const result = getVariableValues(
      this.context.getSchema(),
      node.variableDefinitions || [],
      this.rawVariables,
    );
    if (result.coerced) this.variableValues = result.coerced;
    return undefined;
  }

  onFieldEnter(node) {
    this.currentFieldName = node.name.value;
  }

  onFieldLeave() {
    this.currentFieldName = undefined;
  }

  onArgumentEnter(node) {
    const argument = this.context.getArgument();
    if (!argument) return;
    const value = valueFromAST(node.value, argument.type, this.variableValues);
    const variableName = node.value.kind === Kind.VARIABLE
      ? node.value.name.value
      : undefined;
    validateInputValue({
      value,
      type: argument.type,
      constraints: constraintValues(argument.astNode),
      options: this.options,
      errors: {
        push: (error) => this.context.reportError(error),
      },
      fieldName: this.currentFieldName,
      argName: argument.name,
      variableName,
      path: argument.name,
    });
  }

  get visitor() {
    return {
      OperationDefinition: {
        enter: this.onOperationDefinitionEnter.bind(this),
      },
      Field: {
        enter: this.onFieldEnter.bind(this),
        leave: this.onFieldLeave.bind(this),
      },
      Argument: {
        enter: this.onArgumentEnter.bind(this),
      },
    };
  }
}

function validateQuery(schema, document, variables = {}, operationName, pluginOptions = {}) {
  const errors = [];
  const operation = selectOperation(document, operationName);
  const typeInfo = new TypeInfo(schema);
  const context = new ValidationContext(schema, operation, typeInfo, (error) => {
    errors.push(error);
  });
  const visitor = new QueryValidationVisitor(context, {
    variables,
    operationName,
    pluginOptions,
  });
  visit(operation, visitWithTypeInfo(typeInfo, visitor.visitor));
  return errors;
}

function createQueryValidationRule(options = {}) {
  return (context) => new QueryValidationVisitor(context, options).visitor;
}

function createApolloQueryValidationPlugin(options = {}) {
  return {
    requestDidStart() {
      return {
        didResolveOperation(requestContext) {
          const request = requestContext.request || {};
          const errors = validateQuery(
            requestContext.schema,
            requestContext.document,
            request.variables || {},
            request.operationName,
            options,
          );
          if (!errors.length) return;

          let UserInputError;
          try {
            ({ UserInputError } = require('apollo-server-errors'));
          } catch {
            UserInputError = GraphQLError;
          }
          throw errors.map((error) => new UserInputError(error.message, {
            field: error.fieldName,
            context: error.context,
          }));
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin(options = {}) {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(
        args.schema,
        args.document,
        args.variableValues || {},
        args.operationName,
        options,
      );
      if (errors.length) {
        setResultAndStopExecution({
          errors: errors.map((error) => new GraphQLError(error.message, {
            extensions: {
              code: error.code,
              field: error.fieldName,
              context: error.context,
            },
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
