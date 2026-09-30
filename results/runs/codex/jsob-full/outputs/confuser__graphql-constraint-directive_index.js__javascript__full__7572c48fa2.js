const {
  BREAK,
  DirectiveLocation,
  GraphQLError,
  GraphQLDirective,
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
  typeFromAST,
  valueFromAST,
  visit,
  visitWithTypeInfo,
} = require("graphql");
const { getVariableValues } = require("graphql/execution/values.js");
const {
  contains,
  isBase64,
  isEmail,
  isIP,
  isISO8601,
  isLength,
  isRFC3339,
  isURL,
  isUUID,
} = require("validator");
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");

class ConstraintValidationError extends Error {
  constructor(fieldName, message, context) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";
    this.fieldName = fieldName;
    this.context = context;
    this.originalError = undefined;
  }
}

function formatValidator(validate, message) {
  return value => {
    if (validate(value)) return true;
    throw new GraphQLError(message);
  };
}

const formatValidators = {
  byte: formatValidator(isBase64, "Must be in byte format"),
  date: formatValidator(isISO8601, "Must be a date in ISO 8601 format"),
  "date-time": formatValidator(isRFC3339, "Must be a date-time in RFC 3339 format"),
  email: formatValidator(isEmail, "Must be in email format"),
  ipv4: formatValidator(value => isIP(value, 4), "Must be in IP v4 format"),
  ipv6: formatValidator(value => isIP(value, 6), "Must be in IP v6 format"),
  uri: formatValidator(isURL, "Must be in URI format"),
  uuid: formatValidator(isUUID, "Must be in UUID format"),
};

function errorMessage(options, fallback) {
  return options.errorMessage || fallback;
}

function validateString(fieldName, constraints, value, options = {}) {
  if (constraints.minLength && !isLength(value, { min: constraints.minLength })) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be at least ${constraints.minLength} characters in length`),
      [{ arg: "minLength", value: constraints.minLength }],
    );
  }
  if (constraints.maxLength && !isLength(value, { max: constraints.maxLength })) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be no more than ${constraints.maxLength} characters in length`),
      [{ arg: "maxLength", value: constraints.maxLength }],
    );
  }
  if (constraints.startsWith && !value.startsWith(constraints.startsWith)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must start with ${constraints.startsWith}`),
      [{ arg: "startsWith", value: constraints.startsWith }],
    );
  }
  if (constraints.endsWith && !value.endsWith(constraints.endsWith)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must end with ${constraints.endsWith}`),
      [{ arg: "endsWith", value: constraints.endsWith }],
    );
  }
  if (constraints.contains && !contains(value, constraints.contains)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must contain ${constraints.contains}`),
      [{ arg: "contains", value: constraints.contains }],
    );
  }
  if (constraints.notContains && contains(value, constraints.notContains)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must not contain ${constraints.notContains}`),
      [{ arg: "notContains", value: constraints.notContains }],
    );
  }
  if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must match ${constraints.pattern}`),
      [{ arg: "pattern", value: constraints.pattern }],
    );
  }
  if (constraints.format) {
    const pluginOptions = options.pluginOptions || {};
    const validators = { ...formatValidators, ...(pluginOptions.formats || {}) };
    const validateFormat = validators[constraints.format];
    if (!validateFormat) {
      throw new ConstraintValidationError(
        fieldName,
        errorMessage(constraints, `Invalid format type ${constraints.format}`),
        [{ arg: "format", value: constraints.format }],
      );
    }
    try {
      validateFormat(value, constraints);
    } catch (validationError) {
      throw new ConstraintValidationError(
        fieldName,
        errorMessage(constraints, validationError.message),
        [{ arg: "format", value: constraints.format }],
      );
    }
  }
}

class ConstraintStringType extends GraphQLScalarType {
  constructor(fieldName, typeName, scalarType, constraints, options = {}) {
    super({
      name: typeName,
      serialize(value) {
        const serialized = scalarType.serialize(value);
        validateString(fieldName, constraints, serialized, options);
        return serialized;
      },
      parseValue(value) {
        const serialized = scalarType.serialize(value);
        validateString(fieldName, constraints, serialized, options);
        return scalarType.parseValue(serialized);
      },
      parseLiteral(ast) {
        const value = scalarType.parseLiteral(ast);
        validateString(fieldName, constraints, value, options);
        return value;
      },
    });
  }
}

function isMultipleOf(value, divisor) {
  const tolerance = Number.EPSILON * 3;
  const remainder = value % divisor;
  return remainder < tolerance || remainder > divisor - tolerance;
}

function validateNumber(fieldName, constraints, value) {
  if (constraints.min !== undefined && value < constraints.min) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be at least ${constraints.min}`),
      [{ arg: "min", value: constraints.min }],
    );
  }
  if (constraints.max !== undefined && value > constraints.max) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be no greater than ${constraints.max}`),
      [{ arg: "max", value: constraints.max }],
    );
  }
  if (constraints.exclusiveMin !== undefined && value <= constraints.exclusiveMin) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be greater than ${constraints.exclusiveMin}`),
      [{ arg: "exclusiveMin", value: constraints.exclusiveMin }],
    );
  }
  if (constraints.exclusiveMax !== undefined && value >= constraints.exclusiveMax) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be less than ${constraints.exclusiveMax}`),
      [{ arg: "exclusiveMax", value: constraints.exclusiveMax }],
    );
  }
  if (constraints.multipleOf !== undefined && !isMultipleOf(value, constraints.multipleOf)) {
    throw new ConstraintValidationError(
      fieldName,
      errorMessage(constraints, `Must be a multiple of ${constraints.multipleOf}`),
      [{ arg: "multipleOf", value: constraints.multipleOf }],
    );
  }
}

class ConstraintNumberType extends GraphQLScalarType {
  constructor(fieldName, typeName, scalarType, constraints) {
    super({
      name: typeName,
      serialize(value) {
        const serialized = scalarType.serialize(value);
        validateNumber(fieldName, constraints, serialized);
        return serialized;
      },
      parseValue(value) {
        const serialized = scalarType.serialize(value);
        validateNumber(fieldName, constraints, serialized);
        return scalarType.parseValue(serialized);
      },
      parseLiteral(ast) {
        const value = scalarType.parseLiteral(ast);
        validateNumber(fieldName, constraints, value);
        return value;
      },
    });
  }
}

function getConstraintTypeObject(fieldName, scalarType, typeName, constraints) {
  if (scalarType === GraphQLString || scalarType === GraphQLID) {
    return new ConstraintStringType(fieldName, typeName, scalarType, constraints);
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
  if (isNonNullType(type) && isScalarType(type.ofType)) {
    return { scalarType: type.ofType, scalarNotNull: true };
  }
  if (isNonNullType(type)) {
    return { ...getScalarType(type.ofType), list: true, listNotNull: true };
  }
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

  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`;

const constraintDirectiveTypeDefsObj = new GraphQLDirective({
  name: "constraint",
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

function validateScalarValue(
  context,
  currentField,
  argumentDefinition,
  scalarType,
  value,
  variableName,
  argumentName,
  fieldName,
  locationSuffix,
  options = {},
) {
  if (!argumentDefinition.astNode) return;
  const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, argumentDefinition.astNode);
  if (!constraints) return;

  const namedType = getScalarType(scalarType).scalarType;
  const quote = namedType === GraphQLString ? '"' : "";
  try {
    getConstraintValidateFn(namedType)(fieldName, constraints, value, options);
  } catch (validationError) {
    const defaultMessage = variableName
      ? `Variable "$${variableName}" got invalid value ${quote}${value}${quote}${locationSuffix}. ${validationError.message}`
      : `Argument "${argumentName}" of "${currentField.name.value}" got invalid value ${quote}${value}${quote}${locationSuffix}. ${validationError.message}`;
    const error = new ConstraintValidationError(
      fieldName,
      constraints.errorMessage || defaultMessage,
      validationError.context,
    );
    error.originalError = validationError;
    context.reportError(error);
  }
}

function validateInputObject(
  context,
  inputObjectType,
  argumentName,
  variableName,
  value,
  currentField,
  parentNames,
  options = {},
) {
  if (!inputObjectType.astNode) return;
  visit(
    inputObjectType.astNode,
    new InputObjectValidationVisitor(
      context,
      inputObjectType,
      argumentName,
      variableName,
      value,
      currentField,
      parentNames,
      options,
    ),
  );
}

function validateList(
  context,
  listType,
  argumentDefinition,
  value,
  currentField,
  argumentName,
  variableName,
  fieldName,
  options = {},
) {
  if (!argumentDefinition.astNode) return;

  let itemType = listType.ofType;
  if (isNonNullType(itemType)) itemType = itemType.ofType;
  const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, argumentDefinition.astNode);
  let validateItems = false;

  if (constraints) {
    const subject = variableName
      ? `Variable "$${variableName}" at "${fieldName}" `
      : `Argument "${argumentName}" of "${currentField.name.value}" `;
    const minMessage = `${subject}must be at least ${constraints.minItems} in length`;
    const maxMessage = `${subject}must be no more than ${constraints.maxItems} in length`;

    if (constraints.minItems && (!value || value.length < constraints.minItems)) {
      context.reportError(
        new ConstraintValidationError(
          fieldName,
          constraints.errorMessage || minMessage,
          [{ arg: "minItems", value: constraints.minItems }],
        ),
      );
    }
    if (constraints.maxItems && value && value.length > constraints.maxItems) {
      context.reportError(
        new ConstraintValidationError(
          fieldName,
          constraints.errorMessage || maxMessage,
          [{ arg: "maxItems", value: constraints.maxItems }],
        ),
      );
    }
    for (const constraintName in constraints) {
      if (constraintName !== "maxItems" && constraintName !== "minItems") {
        validateItems = true;
        break;
      }
    }
  }

  value?.forEach((item, index) => {
    if (item === null || item === undefined) return;
    const itemFieldName = fieldName ? `${fieldName}[${index}]` : `[${index}]`;
    if (isInputObjectType(itemType)) {
      validateInputObject(
        context,
        itemType,
        argumentName,
        variableName,
        item,
        currentField,
        itemFieldName,
        options,
      );
    } else if (validateItems) {
      validateScalarValue(
        context,
        currentField,
        argumentDefinition,
        listType,
        item,
        variableName,
        argumentName,
        itemFieldName,
        ` at "${itemFieldName}"`,
        options,
      );
    }
  });
}

class InputObjectValidationVisitor {
  constructor(context, inputObjectType, argumentName, variableName, value, currentField, parentNames, options = {}) {
    this.context = context;
    this.argName = argumentName;
    this.variableName = variableName;
    this.inputObjectValue = value;
    this.inputObjectTypeDef = inputObjectType;
    this.value = value;
    this.currentField = currentField;
    this.parentNames = parentNames;
    this.options = options;
    this.InputValueDefinition = { enter: this.onInputValueDefinition };
  }

  onInputValueDefinition(node) {
    const fieldName = node.name.value;
    const fieldDefinition = this.inputObjectTypeDef.getFields()[fieldName];
    const qualifiedName = this.parentNames ? `${this.parentNames}.${fieldName}` : fieldName;
    const value = this.value[fieldName];
    let typeNode = node.type;
    if (typeNode.kind === Kind.NON_NULL_TYPE) typeNode = typeNode.type;
    const type = typeFromAST(this.context.getSchema(), typeNode);

    if (isInputObjectType(type)) {
      if (!value) return;
      validateInputObject(
        this.context,
        type,
        this.argName,
        this.variableName,
        value,
        this.currentField,
        qualifiedName,
        this.options,
      );
    } else if (isListType(type)) {
      validateList(
        this.context,
        type,
        fieldDefinition,
        value,
        this.currentField,
        this.argName,
        this.variableName,
        qualifiedName,
        this.options,
      );
    } else {
      if (!value && value !== "" && value !== 0) return;
      validateScalarValue(
        this.context,
        this.currentField,
        fieldDefinition,
        type,
        value,
        this.variableName,
        this.argName,
        qualifiedName,
        ` at "${qualifiedName}"`,
        this.options,
      );
    }
  }
}

class QueryValidationVisitor {
  constructor(context, options) {
    this.context = context;
    this.options = options;
    this.variableValues = {};
    this.FragmentDefinition = { enter: this.onFragmentEnter, leave: this.onFragmentLeave };
    this.OperationDefinition = { enter: this.onOperationDefinitionEnter };
    this.Field = { enter: this.onFieldEnter, leave: this.onFieldLeave };
    this.Argument = { enter: this.onArgumentEnter };
    this.InlineFragment = { enter: this.onFragmentEnter, leave: this.onFragmentLeave };
  }

  onOperationDefinitionEnter(node) {
    if (typeof this.options.operationName === "string" && this.options.operationName !== node.name.value) return;
    this.variableValues = getVariableValues(
      this.context.getSchema(),
      node.variableDefinitions ? [...node.variableDefinitions] : [],
      this.options.variables ?? {},
    ).coerced;

    let typeDefinition;
    switch (node.operation) {
      case "query":
        typeDefinition = this.context.getSchema().getQueryType();
        break;
      case "mutation":
        typeDefinition = this.context.getSchema().getMutationType();
        break;
      case "subscription":
        typeDefinition = this.context.getSchema().getSubscriptionType();
        break;
      default:
        throw new Error(`Query validation could not be performed for operation of type ${node.operation}`);
    }
    this.currentTypeInfo = { typeDef: typeDefinition };
  }

  onFragmentEnter(node) {
    const typeDefinition = typeFromAST(this.context.getSchema(), node.typeCondition);
    this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: typeDefinition };
  }

  onFragmentLeave() {
    this.currentTypeInfo = this.currentTypeInfo.parent;
  }

  onFieldEnter(node) {
    this.currentField = node;
    if (this.currentTypeInfo?.typeDef?.getFields) {
      this.currentFieldDef = this.currentTypeInfo.typeDef.getFields()[node.name.value];
    }
    if (!this.currentFieldDef) return BREAK;
    const typeDefinition = getNamedType(this.currentFieldDef.type);
    this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: typeDefinition };
  }

  onFieldLeave() {
    this.currentTypeInfo = this.currentTypeInfo.parent;
  }

  onArgumentEnter(node) {
    const argumentName = node.name.value;
    const argumentDefinition = this.currentFieldDef?.args.find(argument => argument.name === argumentName);
    if (!argumentDefinition) return;

    const value = valueFromAST(node.value, argumentDefinition.type, this.variableValues);
    const variableName = node.value.kind === Kind.VARIABLE ? node.value.name.value : undefined;
    let type = argumentDefinition.type;
    if (isNonNullType(type)) type = type.ofType;

    if (isInputObjectType(type)) {
      if (!value) return;
      validateInputObject(
        this.context,
        getNamedType(type),
        argumentName,
        variableName,
        value,
        this.currentField,
        variableName,
        this.options,
      );
    } else if (isListType(type)) {
      validateList(
        this.context,
        type,
        argumentDefinition,
        value,
        this.currentField,
        argumentName,
        variableName,
        variableName,
        this.options,
      );
    } else {
      if (!value && value !== "" && value !== 0) return;
      const fieldName = variableName || `${this.currentField.name.value}.${argumentName}`;
      validateScalarValue(
        this.context,
        this.currentField,
        argumentDefinition,
        type,
        value,
        variableName,
        argumentName,
        fieldName,
        "",
        this.options,
      );
    }
  }
}

function validateQuery(schema, document, variables, operationName, options = {}) {
  const typeInfo = new TypeInfo(schema);
  const errors = [];
  const context = new ValidationContext(schema, document, typeInfo, error => errors.push(error));
  const visitor = new QueryValidationVisitor(context, {
    variables,
    operationName,
    pluginOptions: options,
  });
  visit(document, visitWithTypeInfo(typeInfo, visitor));
  return errors;
}

function constraintDirective() {
  const typeCache = {};

  function createConstraintType(fieldName, scalarType, scalarNotNull, constraints, list, listNotNull) {
    let typeName;
    if (constraints.uniqueTypeName) {
      typeName = constraints.uniqueTypeName.replace(/\W/g, "");
    } else {
      const constraintName = Object.entries(constraints)
        .filter(([name]) => name !== "errorMessage")
        .map(([name, value]) => {
          if (["min", "max", "exclusiveMin", "exclusiveMax", "multipleOf"].includes(name)) {
            return `${name}_${value.toString().replace(/\W/g, "dot")}`;
          }
          return `${name}_${value.toString().replace(/\W/g, "")}`;
        })
        .join("_");
      typeName = `${fieldName}_${list ? "List_" : ""}${listNotNull ? "ListNotNull_" : ""}${scalarType.name}_${scalarNotNull ? "NotNull_" : ""}${constraintName}`;
    }

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

  function applyConstraints(field, constraints) {
    const typeInfo = getScalarType(field.type);
    const fieldName = field.astNode.name.value;
    field.type = createConstraintType(
      fieldName,
      typeInfo.scalarType,
      typeInfo.scalarNotNull,
      constraints,
      typeInfo.list,
      typeInfo.listNotNull,
    );
  }

  return schema =>
    mapSchema(schema, {
      [MapperKind.FIELD]: field => {
        const constraints = getDirective(schema, field, "constraint")?.[0];
        if (constraints) {
          applyConstraints(field, constraints);
          return field;
        }
      },
      [MapperKind.ARGUMENT]: argument => {
        const constraints = getDirective(schema, argument, "constraint")?.[0];
        if (constraints) {
          applyConstraints(argument, constraints);
          return argument;
        }
      },
    });
}

function constraintDirectiveDocumentation(options) {
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
  const descriptions = options?.descriptionsMap || defaultDescriptions;
  const header = options?.header || "*Constraints:*";

  function applyDocumentation(field, constraints) {
    field.description = `${header}\n`;
    Object.entries(constraints).forEach(([name, value]) => {
      if (name === "uniqueTypeName" || name === "errorMessage") return;
      field.description += `* ${descriptions[name] || name}: \`${value}\`\n`;
    });
    if (field.astNode?.description) field.astNode.description.value = "";
  }

  return schema =>
    mapSchema(schema, {
      [MapperKind.FIELD]: field => {
        if (!field?.astNode) return;
        const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, field.astNode);
        if (constraints) {
          applyDocumentation(field, constraints);
          return field;
        }
      },
      [MapperKind.ARGUMENT]: argument => {
        if (!argument?.astNode) return;
        const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, argument.astNode);
        if (constraints) {
          applyDocumentation(argument, constraints);
          return argument;
        }
      },
    });
}

function createApolloQueryValidationPlugin({ schema }, options = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          const operation = request.operationName
            ? separateOperations(document)[request.operationName]
            : document;
          const errors = validateQuery(
            schema,
            operation,
            request.variables,
            request.operationName,
            options,
          );
          if (errors.length > 0) {
            throw errors.map(error => {
              const { UserInputError } = require("apollo-server-errors");
              return new UserInputError(error.message, {
                field: error.fieldName,
                context: error.context,
              });
            });
          }
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
        args.variableValues,
        args.operationName,
        options,
      );
      if (errors.length > 0) {
        setResultAndStopExecution({
          errors: errors.map(
            error =>
              new GraphQLError(error.message, {
                extensions: {
                  code: error.code,
                  field: error.fieldName,
                  context: error.context,
                },
              }),
          ),
        });
      }
    },
  };
}

function createQueryValidationRule(options) {
  return context => new QueryValidationVisitor(context, options);
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
