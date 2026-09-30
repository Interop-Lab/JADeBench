"use strict";

const {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLError,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  Kind,
  TypeInfo,
  ValidationContext,
  getDirectiveValues,
  getNamedType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isScalarType,
  separateOperations,
  valueFromAST,
  visit,
  visitWithTypeInfo,
} = require("graphql");
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");
const validator = require("validator");

const DIRECTIVE_NAME = "constraint";
const ERROR_CODE = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";

class ConstraintError extends Error {
  constructor(fieldName, message, context) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = ERROR_CODE;
    this.fieldName = fieldName;
    this.context = context;
    this.originalError = undefined;
  }
}

const formatValidators = {
  byte(value) {
    if (!validator.isBase64(value)) throw new GraphQLError("Must be in byte format");
    return true;
  },
  date(value) {
    if (!validator.isISO8601(value)) throw new GraphQLError("Must be a date in ISO 8601 format");
    return true;
  },
  "date-time"(value) {
    if (!validator.isRFC3339(value)) throw new GraphQLError("Must be a date-time in RFC 3339 format");
    return true;
  },
  email(value) {
    if (!validator.isEmail(value)) throw new GraphQLError("Must be in email format");
    return true;
  },
  ipv4(value) {
    if (!validator.isIP(value, 4)) throw new GraphQLError("Must be in IP v4 format");
    return true;
  },
  ipv6(value) {
    if (!validator.isIP(value, 6)) throw new GraphQLError("Must be in IP v6 format");
    return true;
  },
  uri(value) {
    if (!validator.isURL(value)) throw new GraphQLError("Must be in URI format");
    return true;
  },
  uuid(value) {
    if (!validator.isUUID(value)) throw new GraphQLError("Must be in UUID format");
    return true;
  },
};

function messageFor(constraints, fallback) {
  return constraints.errorMessage || fallback;
}

function validateString(fieldName, constraints, value, options = {}) {
  if (constraints.minLength && !validator.isLength(value, { min: constraints.minLength })) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be at least ${constraints.minLength} characters in length`), [
      { arg: "minLength", value: constraints.minLength },
    ]);
  }
  if (constraints.maxLength && !validator.isLength(value, { max: constraints.maxLength })) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be no more than ${constraints.maxLength} characters in length`), [
      { arg: "maxLength", value: constraints.maxLength },
    ]);
  }
  if (constraints.startsWith && !value.startsWith(constraints.startsWith)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must start with ${constraints.startsWith}`), [
      { arg: "startsWith", value: constraints.startsWith },
    ]);
  }
  if (constraints.endsWith && !value.endsWith(constraints.endsWith)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must end with ${constraints.endsWith}`), [
      { arg: "endsWith", value: constraints.endsWith },
    ]);
  }
  if (constraints.contains && !validator.contains(value, constraints.contains)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must contain ${constraints.contains}`), [
      { arg: "contains", value: constraints.contains },
    ]);
  }
  if (constraints.notContains && validator.contains(value, constraints.notContains)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must not contain ${constraints.notContains}`), [
      { arg: "notContains", value: constraints.notContains },
    ]);
  }
  if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must match ${constraints.pattern}`), [
      { arg: "pattern", value: constraints.pattern },
    ]);
  }
  if (constraints.format) {
    const formats = { ...formatValidators, ...(options.pluginOptions?.formats || {}) };
    const checkFormat = formats[constraints.format];
    if (!checkFormat) {
      throw new ConstraintError(fieldName, messageFor(constraints, `Invalid format type ${constraints.format}`), [
        { arg: "format", value: constraints.format },
      ]);
    }
    try {
      checkFormat(value, constraints);
    } catch (error) {
      throw new ConstraintError(fieldName, messageFor(constraints, error.message), [
        { arg: "format", value: constraints.format },
      ]);
    }
  }
}

function isMultipleOf(value, divisor) {
  const epsilon = Number.EPSILON * 3;
  return value % divisor < epsilon || value % divisor > divisor - epsilon;
}

function validateNumber(fieldName, constraints, value) {
  if (constraints.min !== undefined && value < constraints.min) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be at least ${constraints.min}`), [{ arg: "min", value: constraints.min }]);
  }
  if (constraints.max !== undefined && value > constraints.max) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be no greater than ${constraints.max}`), [{ arg: "max", value: constraints.max }]);
  }
  if (constraints.exclusiveMin !== undefined && value <= constraints.exclusiveMin) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be greater than ${constraints.exclusiveMin}`), [
      { arg: "exclusiveMin", value: constraints.exclusiveMin },
    ]);
  }
  if (constraints.exclusiveMax !== undefined && value >= constraints.exclusiveMax) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be less than ${constraints.exclusiveMax}`), [
      { arg: "exclusiveMax", value: constraints.exclusiveMax },
    ]);
  }
  if (constraints.multipleOf !== undefined && !isMultipleOf(value, constraints.multipleOf)) {
    throw new ConstraintError(fieldName, messageFor(constraints, `Must be a multiple of ${constraints.multipleOf}`), [
      { arg: "multipleOf", value: constraints.multipleOf },
    ]);
  }
}

class ConstraintStringType extends GraphQLScalarType {
  constructor(fieldName, typeName, scalarType, constraints, options = {}) {
    super({
      name: typeName,
      serialize(value) {
        value = scalarType.serialize(value);
        validateString(fieldName, constraints, value, options);
        return value;
      },
      parseValue(value) {
        value = scalarType.serialize(value);
        validateString(fieldName, constraints, value, options);
        return scalarType.parseValue(value);
      },
      parseLiteral(node) {
        const value = scalarType.parseLiteral(node);
        validateString(fieldName, constraints, value, options);
        return value;
      },
    });
  }
}

class ConstraintNumberType extends GraphQLScalarType {
  constructor(fieldName, typeName, scalarType, constraints) {
    super({
      name: typeName,
      serialize(value) {
        value = scalarType.serialize(value);
        validateNumber(fieldName, constraints, value);
        return value;
      },
      parseValue(value) {
        value = scalarType.serialize(value);
        validateNumber(fieldName, constraints, value);
        return scalarType.parseValue(value);
      },
      parseLiteral(node) {
        const value = scalarType.parseLiteral(node);
        validateNumber(fieldName, constraints, value);
        return value;
      },
    });
  }
}

function getConstraintTypeObject(fieldName, scalarType, typeName, constraints, options = {}) {
  if (scalarType === GraphQLString || scalarType === GraphQLID) {
    return new ConstraintStringType(fieldName, typeName, scalarType, constraints, options);
  }
  if (scalarType === GraphQLFloat || scalarType === GraphQLInt) {
    return new ConstraintNumberType(fieldName, typeName, scalarType, constraints);
  }
  throw new Error(`Not a valid scalar type: ${scalarType.toString()}`);
}

function getConstraintValidateFn(scalarType) {
  if (scalarType === GraphQLString || scalarType === GraphQLID) return validateString;
  if (scalarType === GraphQLFloat || scalarType === GraphQLInt) return validateNumber;
  throw new Error(`Not a valid scalar type: ${scalarType.toString()}`);
}

function getScalarType(type) {
  if (isScalarType(type)) return { scalarType: type };
  if (isListType(type)) return { ...getScalarType(type.ofType), list: true };
  if (isNonNullType(type) && isScalarType(type.ofType)) return { scalarType: type.ofType, scalarNotNull: true };
  if (isNonNullType(type)) return { ...getScalarType(type.ofType), list: true, listNotNull: true };
  throw new Error(`Not a valid scalar type: ${type.toString()}`);
}

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
  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION
`;

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: DIRECTIVE_NAME,
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION],
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

function makeTypeName(fieldName, scalarType, constraints, scalarNotNull, list, listNotNull) {
  if (constraints.uniqueTypeName) return constraints.uniqueTypeName.replace(/\W/g, "");
  const prefix = `${fieldName}_${list ? "List_" : ""}${listNotNull ? "ListNotNull_" : ""}${scalarType.name}_${scalarNotNull ? "NotNull_" : ""}`;
  const suffix = Object.entries(constraints)
    .filter(([name]) => name !== "errorMessage")
    .map(([name, value]) => `${name}_${String(value).replace(/\W/g, ["min", "max", "exclusiveMin", "exclusiveMax", "multipleOf"].includes(name) ? "dot" : "")}`)
    .join("_");
  return prefix + suffix;
}

function constraintDirective() {
  const typeCache = Object.create(null);

  function wrapType(fieldName, scalarType, constraints, scalarNotNull, list, listNotNull) {
    const typeName = makeTypeName(fieldName, scalarType, constraints, scalarNotNull, list, listNotNull);
    const cacheKey = Symbol.for(typeName);
    if (typeCache[cacheKey]) return typeCache[cacheKey];
    let type = getConstraintTypeObject(fieldName, scalarType, typeName, constraints);
    if (scalarNotNull) type = new GraphQLNonNull(type);
    if (list) {
      type = new GraphQLList(type);
      if (listNotNull) type = new GraphQLNonNull(type);
    }
    typeCache[cacheKey] = type;
    return type;
  }

  function applyConstraint(field, constraints) {
    const info = getScalarType(field.type);
    const fieldName = field.astNode.name.value;
    field.type = wrapType(fieldName, info.scalarType, constraints, info.scalarNotNull, info.list, info.listNotNull);
  }

  return (schema) => mapSchema(schema, {
    [MapperKind.FIELD]: (field) => {
      const constraints = getDirective(schema, field, DIRECTIVE_NAME)?.[0];
      if (constraints) {
        applyConstraint(field, constraints);
        return field;
      }
    },
    [MapperKind.ARGUMENT]: (argument) => {
      const constraints = getDirective(schema, argument, DIRECTIVE_NAME)?.[0];
      if (constraints) {
        applyConstraint(argument, constraints);
        return argument;
      }
    },
  });
}

const defaultDescriptions = {
  minLength: "Minimal length",
  maxLength: "Maximal length",
  startsWith: "Starts with",
  endsWith: "Ends with",
  contains: "Contains",
  notContains: "Doesn't contain",
  pattern: "Must match RegEx pattern",
  format: "Must match format",
  min: "Minimal value",
  max: "Maximal value",
  exclusiveMin: "Grater than",
  exclusiveMax: "Less than",
  multipleOf: "Must be a multiple of",
  minItems: "Minimal number of items",
  maxItems: "Maximal number of items",
};

function constraintDirectiveDocumentation(options = {}) {
  const descriptions = options.descriptionsMap || defaultDescriptions;
  const header = options.header || "*Constraints:*";

  function addDocumentation(field, constraints) {
    if (field.description) {
      if (field.description.includes(header)) return;
      field.description += "\n\n";
    } else {
      field.description = "";
    }
    field.description += `${header}\n`;
    for (const [name, value] of Object.entries(constraints)) {
      if (name === "uniqueTypeName" || name === "errorMessage") continue;
      field.description += `* ${descriptions[name] || name}: \`${value}\`\n`;
    }
    if (field.astNode?.description) field.astNode.description.value = field.description;
  }

  return (schema) => mapSchema(schema, {
    [MapperKind.FIELD]: (field) => {
      if (!field.astNode) return;
      const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, field.astNode);
      if (constraints) {
        addDocumentation(field, constraints);
        return field;
      }
    },
    [MapperKind.ARGUMENT]: (argument) => {
      if (!argument.astNode) return;
      const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, argument.astNode);
      if (constraints) {
        addDocumentation(argument, constraints);
        return argument;
      }
    },
  });
}

function reportConstraintError(context, fieldName, constraints, fallback, details, originalError) {
  const error = new ConstraintError(fieldName, constraints.errorMessage || fallback, details);
  error.originalError = originalError;
  context.reportError(error);
}

function validateInputValue(context, type, definition, value, fieldName, options = {}, suffix = "") {
  if (value === null || value === undefined) return;
  if (isNonNullType(type)) type = type.ofType;
  const constraints = definition?.astNode && getDirectiveValues(constraintDirectiveTypeDefsObj, definition.astNode);

  if (isListType(type)) {
    if (constraints) {
      if (constraints.minItems && (!value || value.length < constraints.minItems)) {
        reportConstraintError(context, fieldName, constraints, `${fieldName} must be at least ${constraints.minItems} in length`, [
          { arg: "minItems", value: constraints.minItems },
        ]);
      }
      if (constraints.maxItems && value && value.length > constraints.maxItems) {
        reportConstraintError(context, fieldName, constraints, `${fieldName} must be no more than ${constraints.maxItems} in length`, [
          { arg: "maxItems", value: constraints.maxItems },
        ]);
      }
    }
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item, index) => validateInputValue(context, type.ofType, definition, item, fieldName, options, `${suffix}[${index}]`));
    return;
  }

  const namedType = getNamedType(type);
  if (isInputObjectType(namedType)) {
    for (const [name, inputField] of Object.entries(namedType.getFields())) {
      validateInputValue(context, inputField.type, inputField, value[name], fieldName, options, suffix ? `${suffix}.${name}` : name);
    }
    return;
  }

  if (!constraints) return;
  try {
    getConstraintValidateFn(namedType)(suffix || fieldName, constraints, value, options);
  } catch (error) {
    reportConstraintError(context, suffix || fieldName, constraints, error.message, error.context, error);
  }
}

class QueryValidationVisitor {
  constructor(context, options = {}) {
    this.context = context;
    this.options = options;
    this.variables = options.variables || {};
    this.OperationDefinition = { enter: this.onOperationDefinitionEnter.bind(this) };
    this.Argument = { enter: this.onArgumentEnter.bind(this) };
  }

  onOperationDefinitionEnter(node) {
    if (this.options.operationName && node.name?.value !== this.options.operationName) return false;
  }

  onArgumentEnter(node) {
    const argument = this.context.getArgument();
    if (!argument) return;
    const value = valueFromAST(node.value, argument.type, this.variables);
    if (value === undefined && node.value.kind !== Kind.NULL) return;
    const fieldName = node.value.kind === Kind.VARIABLE ? node.value.name.value : node.name.value;
    validateInputValue(this.context, argument.type, argument, value, fieldName, this.options);
  }
}

function validateQuery(schema, document, variables, operationName, pluginOptions = {}) {
  const typeInfo = new TypeInfo(schema);
  const errors = [];
  const context = new ValidationContext(schema, document, typeInfo, (error) => errors.push(error));
  const visitor = new QueryValidationVisitor(context, { variables, operationName, pluginOptions });
  visit(document, visitWithTypeInfo(typeInfo, visitor));
  return errors;
}

function createApolloQueryValidationPlugin({ schema }, pluginOptions = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          const operation = request.operationName ? separateOperations(document)[request.operationName] : document;
          const errors = validateQuery(schema, operation, request.variables, request.operationName, pluginOptions);
          if (errors.length > 0) {
            const { UserInputError } = require("apollo-server-errors");
            throw errors.map((error) => new UserInputError(error.message, { field: error.fieldName, context: error.context }));
          }
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin(pluginOptions = {}) {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, pluginOptions);
      if (errors.length > 0) {
        setResultAndStopExecution({
          errors: errors.map((error) => new GraphQLError(error.message, {
            extensions: { code: error.code, field: error.fieldName, context: error.context },
          })),
        });
      }
    },
  };
}

function createQueryValidationRule(options) {
  return (context) => new QueryValidationVisitor(context, options);
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
