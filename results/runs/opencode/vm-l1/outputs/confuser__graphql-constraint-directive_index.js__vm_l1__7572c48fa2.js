"use strict";

const {
  GraphQLError,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  Kind,
  separateOperations,
  validate,
} = require("graphql");
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");

const DEFAULT_DIRECTIVE_NAME = "constraint";

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

const constraintDirectiveTypeDefsObj = "@constraint";

class ConstraintDirectiveError extends GraphQLError {
  constructor(message, fieldName, context, originalError) {
    super(message, { originalError });
    this.code = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";
    this.fieldName = fieldName;
    this.context = context;
  }
}

function fail(message, fieldName, arg, value, customMessage) {
  throw new ConstraintDirectiveError(customMessage || message, fieldName, [{ arg, value }]);
}

function validateString(value, constraints, fieldName) {
  if (typeof value !== "string") return value;
  const custom = constraints.errorMessage;
  if (constraints.minLength != null && value.length < constraints.minLength)
    fail(`Must be at least ${constraints.minLength} characters in length`, fieldName, "minLength", constraints.minLength, custom);
  if (constraints.maxLength != null && value.length > constraints.maxLength)
    fail(`Must be no more than ${constraints.maxLength} characters in length`, fieldName, "maxLength", constraints.maxLength, custom);
  if (constraints.startsWith != null && !value.startsWith(constraints.startsWith))
    fail(`Must start with ${constraints.startsWith}`, fieldName, "startsWith", constraints.startsWith, custom);
  if (constraints.endsWith != null && !value.endsWith(constraints.endsWith))
    fail(`Must end with ${constraints.endsWith}`, fieldName, "endsWith", constraints.endsWith, custom);
  if (constraints.contains != null && !value.includes(constraints.contains))
    fail(`Must contain ${constraints.contains}`, fieldName, "contains", constraints.contains, custom);
  if (constraints.notContains != null && value.includes(constraints.notContains))
    fail(`Must not contain ${constraints.notContains}`, fieldName, "notContains", constraints.notContains, custom);
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(value))
    fail(`Must match ${constraints.pattern}`, fieldName, "pattern", constraints.pattern, custom);
  validateFormat(value, constraints.format, fieldName, custom);
  return value;
}

function validateFormat(value, format, fieldName, customMessage) {
  if (!format) return;
  const patterns = {
    byte: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
    date: /^\d{4}-\d{2}-\d{2}(?:$|T)/,
    "date-time": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/,
    ipv6: /^(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i,
    uri: /^(?:[a-z][a-z0-9+.-]*:|[^\s@]+@[^\s@]+\.|(?:\d{1,3}\.){3}\d{1,3})/i,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  };
  const messages = {
    byte: "Must be in byte format",
    date: "Must be a date in ISO 8601 format",
    "date-time": "Must be a date-time in RFC 3339 format",
    email: "Must be in email format",
    ipv4: "Must be in IP v4 format",
    ipv6: "Must be in IP v6 format",
    uri: "Must be in URI format",
    uuid: "Must be in UUID format",
  };
  if (patterns[format] && !patterns[format].test(value))
    fail(messages[format], fieldName, "format", format, customMessage);
}

function validateNumber(value, constraints, fieldName) {
  if (typeof value !== "number") return value;
  const custom = constraints.errorMessage;
  if (constraints.min != null && value < constraints.min)
    fail(`Must be at least ${constraints.min}`, fieldName, "min", constraints.min, custom);
  if (constraints.max != null && value > constraints.max)
    fail(`Must be no more than ${constraints.max}`, fieldName, "max", constraints.max, custom);
  if (constraints.exclusiveMin != null && value <= constraints.exclusiveMin)
    fail(`Must be greater than ${constraints.exclusiveMin}`, fieldName, "exclusiveMin", constraints.exclusiveMin, custom);
  if (constraints.exclusiveMax != null && value >= constraints.exclusiveMax)
    fail(`Must be less than ${constraints.exclusiveMax}`, fieldName, "exclusiveMax", constraints.exclusiveMax, custom);
  if (constraints.multipleOf != null && value % constraints.multipleOf !== 0)
    fail(`Must be a multiple of ${constraints.multipleOf}`, fieldName, "multipleOf", constraints.multipleOf, custom);
  return value;
}

function validateValue(value, constraints, fieldName) {
  if (value == null) return value;
  if (Array.isArray(value)) {
    if (constraints.minItems != null && value.length < constraints.minItems)
      fail(`Must contain at least ${constraints.minItems} items`, fieldName, "minItems", constraints.minItems, constraints.errorMessage);
    if (constraints.maxItems != null && value.length > constraints.maxItems)
      fail(`Must contain no more than ${constraints.maxItems} items`, fieldName, "maxItems", constraints.maxItems, constraints.errorMessage);
    return value;
  }
  return typeof value === "string"
    ? validateString(value, constraints, fieldName)
    : validateNumber(value, constraints, fieldName);
}

function unwrap(type) {
  while (type instanceof GraphQLNonNull || type instanceof GraphQLList) type = type.ofType;
  return type;
}

function constrainedScalar(type, constraints, fieldName) {
  const scalar = unwrap(type);
  if (!(scalar instanceof GraphQLScalarType)) return type;
  const name = constraints.uniqueTypeName || `${scalar.name}_Constraint`;
  const wrapped = new GraphQLScalarType({
    name,
    description: scalar.description,
    serialize(value) { return scalar.serialize(validateValue(value, constraints, fieldName)); },
    parseValue(value) { return validateValue(scalar.parseValue(value), constraints, fieldName); },
    parseLiteral(node, variables) {
      const value = scalar.parseLiteral(node, variables);
      return validateValue(value, constraints, fieldName);
    },
  });
  if (type instanceof GraphQLNonNull) return new GraphQLNonNull(constrainedScalar(type.ofType, constraints, fieldName));
  if (type instanceof GraphQLList) return new GraphQLList(constrainedScalar(type.ofType, constraints, fieldName));
  return wrapped;
}

function constraintDirective(options = {}) {
  const directiveName = options.name || DEFAULT_DIRECTIVE_NAME;
  return (schema) => mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig, fieldName, typeName) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (directive) fieldConfig.type = constrainedScalar(fieldConfig.type, directive, `${typeName}.${fieldName}`);
      return fieldConfig;
    },
    [MapperKind.ARGUMENT]: (argumentConfig, fieldName, typeName) => {
      const directive = getDirective(schema, argumentConfig, directiveName)?.[0];
      if (directive) argumentConfig.type = constrainedScalar(argumentConfig.type, directive, `${fieldName}.${argumentConfig.astNode?.name?.value || typeName}`);
      return argumentConfig;
    },
  });
}

function constraintDirectiveDocumentation(options = {}) {
  const name = options.name || DEFAULT_DIRECTIVE_NAME;
  return constraintDirectiveTypeDefs.replaceAll("@constraint", `@${name}`);
}

function createQueryValidationRule(options) {
  return (context) => ({
    Document: {
      enter(document) {
        const schema = context.getSchema();
        for (const error of validateQuery(schema, document, options?.variableValues || {}, options)) context.reportError(error);
      },
    },
  });
}

function validateQuery(schema, document, variableValues = {}, options = {}) {
  const operationName = options.operationName;
  const operations = separateOperations(document);
  const operation = operationName ? operations[operationName] : Object.values(operations)[0] || document;
  return validate(schema, operation, [createQueryValidationRuleForValues(variableValues, options)]);
}

function createQueryValidationRuleForValues(variableValues, options) {
  return (context) => {
    const errors = [];
    return {
      Argument(node) {
        const definition = context.getArgument();
        const field = context.getFieldDef();
        if (!definition || !field) return;
        const directives = definition.astNode?.directives || [];
        const directive = directives.find(({ name }) => name.value === (options.name || DEFAULT_DIRECTIVE_NAME));
        if (!directive) return;
        const constraints = Object.fromEntries(directive.arguments.map(({ name, value }) => [name.value, literalValue(value, variableValues)]));
        const value = literalValue(node.value, variableValues);
        try { validateValue(value, constraints, `${field.name}.${definition.name}`); }
        catch (error) { errors.push(error); context.reportError(error); }
      },
    };
  };
}

function literalValue(node, variables) {
  if (!node) return undefined;
  if (node.kind === Kind.VARIABLE) return variables[node.name.value];
  if (node.kind === Kind.STRING || node.kind === Kind.ENUM) return node.value;
  if (node.kind === Kind.INT || node.kind === Kind.FLOAT) return Number(node.value);
  if (node.kind === Kind.BOOLEAN) return node.value;
  if (node.kind === Kind.NULL) return null;
  if (node.kind === Kind.LIST) return node.values.map((value) => literalValue(value, variables));
  if (node.kind === Kind.OBJECT) return Object.fromEntries(node.fields.map((field) => [field.name.value, literalValue(field.value, variables)]));
}

function createApolloQueryValidationPlugin({ schema, ...options }) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const errors = validateQuery(schema || requestContext.schema, requestContext.document, requestContext.request.variables, options);
          if (errors.length) throw errors[0];
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin(options = {}) {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, options);
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
