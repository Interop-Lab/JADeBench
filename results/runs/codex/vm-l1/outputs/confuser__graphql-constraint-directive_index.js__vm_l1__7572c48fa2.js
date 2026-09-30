"use strict";

const validator = require("validator");
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
  getDirectiveValues,
  getNamedType,
  getVariableValues,
  isInputObjectType,
  isListType,
  isNonNullType,
  isScalarType,
  separateOperations,
  typeFromAST,
  valueFromASTUntyped,
  visit,
  visitWithTypeInfo,
} = require("graphql");
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");

const DIRECTIVE_NAME = "constraint";
const CONSTRAINT_EXTENSION = "graphqlConstraintDirective";

class ConstraintDirectiveError extends Error {
  constructor(message, fieldName, context, originalError) {
    super(message);
    this.name = this.constructor.name;
    this.code = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";
    this.fieldName = fieldName;
    this.context = context;
    this.originalError = originalError;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

const formatValidators = {
  byte(value) {
    return validator.isBase64(value) || "Must be in byte format";
  },
  date(value) {
    return validator.isISO8601(value) || "Must be a date in ISO 8601 format";
  },
  "date-time": function dateTime(value) {
    return validator.isRFC3339(value) || "Must be a date-time in RFC 3339 format";
  },
  email(value) {
    return validator.isEmail(value) || "Must be in email format";
  },
  ipv4(value) {
    return validator.isIP(value, 4) || "Must be in IP v4 format";
  },
  ipv6(value) {
    return validator.isIP(value, 6) || "Must be in IP v6 format";
  },
  uri(value) {
    return validator.isURL(value) || "Must be in URI format";
  },
  uuid(value) {
    return validator.isUUID(value) || "Must be in UUID format";
  },
};

function constraintMessage(constraints, fallback) {
  return constraints.errorMessage || fallback;
}

function validateString(value, constraints, pluginOptions = {}) {
  if (constraints.minLength != null && !validator.isLength(value, { min: constraints.minLength })) {
    return constraintMessage(constraints, `Must be at least ${constraints.minLength} characters in length`);
  }
  if (constraints.maxLength != null && !validator.isLength(value, { max: constraints.maxLength })) {
    return constraintMessage(constraints, `Must be no more than ${constraints.maxLength} characters in length`);
  }
  if (constraints.startsWith != null && !value.startsWith(constraints.startsWith)) {
    return constraintMessage(constraints, `Must start with ${constraints.startsWith}`);
  }
  if (constraints.endsWith != null && !value.endsWith(constraints.endsWith)) {
    return constraintMessage(constraints, `Must end with ${constraints.endsWith}`);
  }
  if (constraints.contains != null && !value.includes(constraints.contains)) {
    return constraintMessage(constraints, `Must contain ${constraints.contains}`);
  }
  if (constraints.notContains != null && value.includes(constraints.notContains)) {
    return constraintMessage(constraints, `Must not contain ${constraints.notContains}`);
  }
  if (constraints.pattern != null && !new RegExp(constraints.pattern).test(value)) {
    return constraintMessage(constraints, `Must match ${constraints.pattern}`);
  }
  if (constraints.format != null) {
    const formats = { ...formatValidators, ...(pluginOptions.formats || {}) };
    const formatValidator = formats[constraints.format];
    if (typeof formatValidator !== "function") {
      return constraintMessage(constraints, `Invalid format type ${constraints.format}`);
    }
    const result = formatValidator(value);
    if (result !== true) {
      return constraintMessage(constraints, result && result.message ? result.message : result);
    }
  }
  return undefined;
}

function isMultipleOf(value, multiple) {
  const quotient = value / multiple;
  return Math.abs(quotient - Math.round(quotient)) <= Number.EPSILON * 3;
}

function validateNumber(value, constraints) {
  if (constraints.min != null && value < constraints.min) {
    return constraintMessage(constraints, `Must be at least ${constraints.min}`);
  }
  if (constraints.max != null && value > constraints.max) {
    return constraintMessage(constraints, `Must be no greater than ${constraints.max}`);
  }
  if (constraints.exclusiveMin != null && value <= constraints.exclusiveMin) {
    return constraintMessage(constraints, `Must be greater than ${constraints.exclusiveMin}`);
  }
  if (constraints.exclusiveMax != null && value >= constraints.exclusiveMax) {
    return constraintMessage(constraints, `Must be less than ${constraints.exclusiveMax}`);
  }
  if (constraints.multipleOf != null && !isMultipleOf(value, constraints.multipleOf)) {
    return constraintMessage(constraints, `Must be a multiple of ${constraints.multipleOf}`);
  }
  return undefined;
}

function createConstrainedScalar(name, scalarType, constraints, pluginOptions) {
  const validate = scalarType === GraphQLString || scalarType === GraphQLID
    ? value => validateString(value, constraints, pluginOptions)
    : value => validateNumber(value, constraints);

  function validateValue(value) {
    const message = validate(value);
    if (message) throw new ConstraintDirectiveError(message);
    return value;
  }

  const constrainedType = new GraphQLScalarType({
    name,
    description: scalarType.description,
    specifiedByURL: scalarType.specifiedByURL,
    serialize(value) {
      return validateValue(scalarType.serialize(value));
    },
    parseValue(value) {
      return validateValue(scalarType.parseValue(value));
    },
    parseLiteral(node, variables) {
      return validateValue(scalarType.parseLiteral(node, variables));
    },
  });
  constrainedType.extensions = {
    ...(scalarType.extensions || {}),
    [CONSTRAINT_EXTENSION]: constraints,
  };
  return constrainedType;
}

function getScalarType(type) {
  let currentType = type;
  let list = false;
  let listNotNull = false;
  let scalarNotNull = false;

  if (isNonNullType(currentType)) {
    currentType = currentType.ofType;
    if (isListType(currentType)) listNotNull = true;
    else scalarNotNull = true;
  }
  if (isListType(currentType)) {
    list = true;
    currentType = currentType.ofType;
    if (isNonNullType(currentType)) {
      scalarNotNull = true;
      currentType = currentType.ofType;
    }
  }
  if (!isScalarType(currentType)) throw new Error(`Not a valid scalar type: ${type.toString()}`);
  return { scalarType: currentType, scalarNotNull, list, listNotNull };
}

function getConstraintValidateFn(scalarType, constraints, pluginOptions) {
  if (scalarType === GraphQLString || scalarType === GraphQLID) {
    return value => validateString(value, constraints, pluginOptions);
  }
  if (scalarType === GraphQLFloat || scalarType === GraphQLInt) {
    return value => validateNumber(value, constraints);
  }
  throw new Error(`Not a valid scalar type: ${scalarType.toString()}`);
}

function constraintTypeName(typeInfo, constraints) {
  if (constraints.uniqueTypeName) return constraints.uniqueTypeName.replace(/\W/g, "_");
  const constraintName = Object.entries(constraints)
    .filter(([key, value]) => value != null && key !== "errorMessage" && key !== "uniqueTypeName")
    .map(([key, value]) => `${key}_${value.toString().replace(/\W/g, "dot")}`)
    .join("_");
  const prefix = typeInfo.list
    ? typeInfo.listNotNull ? "ListNotNull_" : "List_"
    : typeInfo.scalarNotNull ? "NotNull_" : "";
  return `${prefix}${typeInfo.scalarType.name}_${constraintName}`;
}

function getConstraintTypeObject(type, constraints, pluginOptions = {}) {
  const typeInfo = getScalarType(type);
  const name = constraintTypeName(typeInfo, constraints);
  const constrainedScalar = createConstrainedScalar(
    name,
    typeInfo.scalarType,
    constraints,
    pluginOptions,
  );

  let constrainedType = typeInfo.scalarNotNull
    ? new GraphQLNonNull(constrainedScalar)
    : constrainedScalar;
  if (typeInfo.list) constrainedType = new GraphQLList(constrainedType);
  if (typeInfo.listNotNull) constrainedType = new GraphQLNonNull(constrainedType);

  constrainedType.extensions = {
    ...(constrainedType.extensions || {}),
    [CONSTRAINT_EXTENSION]: constraints,
  };
  return constrainedType;
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

  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`;

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: DIRECTIVE_NAME,
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

function constraintDirective(pluginOptions = {}) {
  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: fieldConfig => applyConstraint(schema, fieldConfig, pluginOptions),
    [MapperKind.ARGUMENT]: argumentConfig => applyConstraint(schema, argumentConfig, pluginOptions),
  });
}

function applyConstraint(schema, config, pluginOptions) {
  const constraints = getDirective(schema, config, DIRECTIVE_NAME)?.[0];
  if (!constraints) return config;
  return {
    ...config,
    type: getConstraintTypeObject(config.type, constraints, pluginOptions),
  };
}

const constraintDescriptions = {
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

function addConstraintDocumentation(schema, config, header) {
  const constraints = getDirective(schema, config, DIRECTIVE_NAME)?.[0];
  if (!constraints) return config;
  const lines = Object.entries(constraints)
    .filter(([key, value]) => value != null && constraintDescriptions[key])
    .map(([key, value]) => `* ${constraintDescriptions[key]}: \`${value}\``);
  if (!lines.length) return config;
  const constraintDocumentation = `${header}\n${lines.join("\n")}`;
  return {
    ...config,
    description: config.description
      ? `${config.description}\n\n${constraintDocumentation}`
      : constraintDocumentation,
  };
}

function constraintDirectiveDocumentation(options = {}) {
  const header = options.header || "*Constraints:*";
  return schema => mapSchema(schema, {
    [MapperKind.FIELD]: fieldConfig => addConstraintDocumentation(schema, fieldConfig, header),
    [MapperKind.ARGUMENT]: argumentConfig => addConstraintDocumentation(schema, argumentConfig, header),
  });
}

function operationDocument(document, operationName) {
  if (!operationName) return document;
  return separateOperations(document)[operationName] || document;
}

function getTypeConstraints(type) {
  let currentType = type;
  while (isNonNullType(currentType) || isListType(currentType)) {
    if (currentType.extensions?.[CONSTRAINT_EXTENSION]) {
      return currentType.extensions[CONSTRAINT_EXTENSION];
    }
    currentType = currentType.ofType;
  }
  return currentType.extensions?.[CONSTRAINT_EXTENSION];
}

function constraintsFromAst(astNode) {
  return astNode ? getDirectiveValues(constraintDirectiveTypeDefsObj, astNode) : undefined;
}

function validateInputValue(value, type, path, errors, pluginOptions, directConstraints) {
  if (value == null) return;
  const constraints = directConstraints || getTypeConstraints(type) || {};
  if (Array.isArray(value)) {
    let message;
    if (constraints.minItems != null && value.length < constraints.minItems) {
      message = constraintMessage(constraints, `must be at least ${constraints.minItems} in length`);
    } else if (constraints.maxItems != null && value.length > constraints.maxItems) {
      message = constraintMessage(constraints, `must be no more than ${constraints.maxItems} in length`);
    }
    if (message) errors.push(new ConstraintDirectiveError(`${path} ${message}`, path, { arg: constraints }));
  }

  let nullableType = isNonNullType(type) ? type.ofType : type;
  if (isListType(nullableType)) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => validateInputValue(
        item,
        nullableType.ofType,
        `${path}[${index}]`,
        errors,
        pluginOptions,
      ));
    }
    return;
  }
  const namedType = getNamedType(nullableType);
  if (isInputObjectType(namedType) && value && typeof value === "object") {
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      validateInputValue(
        value[fieldName],
        field.type,
        `${path}.${fieldName}`,
        errors,
        pluginOptions,
        constraintsFromAst(field.astNode),
      );
    }
    return;
  }
  if (isScalarType(namedType) && Object.keys(constraints).length) {
    const message = typeof value === "string"
      ? validateString(value, constraints, pluginOptions)
      : typeof value === "number"
        ? validateNumber(value, constraints)
        : undefined;
    if (message) errors.push(new ConstraintDirectiveError(`${path} ${message}`, path, { arg: constraints }));
  }
}

function validateQuery(schema, document, variables = {}, operationName, pluginOptions = {}) {
  const errors = [];
  const selectedDocument = operationDocument(document, operationName);
  const operation = selectedDocument.definitions.find(definition => definition.kind === Kind.OPERATION_DEFINITION);
  let coercedVariables = variables;

  if (operation) {
    const coercion = getVariableValues(schema, operation.variableDefinitions || [], variables);
    if (coercion.errors) errors.push(...coercion.errors);
    if (coercion.coerced) coercedVariables = coercion.coerced;
    for (const definition of operation.variableDefinitions || []) {
      const variableName = definition.variable.name.value;
      const variableType = typeFromAST(schema, definition.type);
      if (variableType) validateInputValue(
        coercedVariables[variableName],
        variableType,
        `Variable "$${variableName}"`,
        errors,
        pluginOptions,
      );
    }
  }

  const typeInfo = new TypeInfo(schema);
  visit(selectedDocument, visitWithTypeInfo(typeInfo, {
    Argument: {
      leave(node) {
        const inputType = typeInfo.getInputType();
        if (!inputType) return;
        try {
          const fieldDefinition = typeInfo.getFieldDef();
          const argumentDefinition = fieldDefinition?.args.find(argument => argument.name === node.name.value);
          const value = node.value.kind === Kind.VARIABLE
            ? coercedVariables[node.value.name.value]
            : valueFromASTUntyped(node.value, coercedVariables);
          validateInputValue(
            value,
            inputType,
            `Argument "${node.name.value}"`,
            errors,
            pluginOptions,
            constraintsFromAst(argumentDefinition?.astNode),
          );
        } catch (error) {
          errors.push(error instanceof GraphQLError ? error : new GraphQLError(error.message, { originalError: error }));
        }
      },
    },
  }));
  return errors;
}

function createApolloQueryValidationPlugin(options = {}) {
  const schema = options.schema;
  return {
    requestDidStart() {
      return {
        didResolveOperation(requestContext) {
          const errors = validateQuery(
            schema || requestContext.schema,
            requestContext.document,
            requestContext.request.variables,
            requestContext.request.operationName,
            options.pluginOptions,
          );
          if (!errors.length) return;
          let UserInputError;
          try {
            ({ UserInputError } = require("apollo-server-errors"));
          } catch {
            UserInputError = GraphQLError;
          }
          throw errors.map(error => new UserInputError(error.message, {
            fieldName: error.fieldName,
            field: error.fieldName,
            context: error.context,
          }));
        },
      };
    },
  };
}

function createEnvelopQueryValidationPlugin() {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(
        args.schema,
        args.document,
        args.variableValues,
        args.operationName,
      );
      if (!errors.length) return;
      setResultAndStopExecution({
        errors: errors.map(error => new GraphQLError(error.message, {
          extensions: {
            code: error.code,
            fieldName: error.fieldName,
            field: error.fieldName,
            context: error.context,
          },
        })),
      });
    },
  };
}

function createQueryValidationRule(options = {}) {
  return context => {
    const errors = [];
    return {
      Document: {
        leave(document) {
          errors.push(...validateQuery(
            context.getSchema(),
            document,
            options.variables,
            options.operationName,
            options.pluginOptions,
          ));
          for (const error of errors) context.reportError(error);
        },
      },
    };
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
