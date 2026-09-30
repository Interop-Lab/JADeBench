const {
  GraphQLNonNull,
  GraphQLList,
  GraphQLError,
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
  Kind,
  getNamedType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isScalarType,
  valueFromAST,
  typeFromAST,
  visit,
  visitWithTypeInfo,
  TypeInfo,
  ValidationContext,
  BREAK,
  separateOperations,
  getDirectiveValues,
  getVariableValues,
} = require("graphql");
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");
const formats = require("./scalars/formats");
const { GraphQLError: ConstraintGraphQLError } = require("./lib/error");
const { GraphQLScalarType: GraphQLScalarTypeBase } = require("graphql");
const { contains, isLength } = require("validator");

function getScalarType(type) {
  if (isNonNullType(type)) return getScalarType(type.ofType);
  if (isListType(type)) return getScalarType(type.ofType);
  return type;
}

function validateString(field, args, value, options = {}) {
  if (args.minLength != null && !isLength(value, { min: args.minLength })) {
    throw new ConstraintGraphQLError(field, `String is shorter than the minimum length ${args.minLength}`, [
      { arg: "minLength", value: args.minLength },
    ]);
  }
  if (args.maxLength != null && !isLength(value, { max: args.maxLength })) {
    throw new ConstraintGraphQLError(field, `String is longer than the maximum length ${args.maxLength}`, [
      { arg: "maxLength", value: args.maxLength },
    ]);
  }
  if (args.startsWith != null && !value.startsWith(args.startsWith)) {
    throw new ConstraintGraphQLError(field, `String does not start with "${args.startsWith}"`, [
      { arg: "startsWith", value: args.startsWith },
    ]);
  }
  if (args.endsWith != null && !value.endsWith(args.endsWith)) {
    throw new ConstraintGraphQLError(field, `String does not end with "${args.endsWith}"`, [
      { arg: "endsWith", value: args.endsWith },
    ]);
  }
  if (args.contains != null && !contains(value, args.contains)) {
    throw new ConstraintGraphQLError(field, `String does not contain "${args.contains}"`, [
      { arg: "contains", value: args.contains },
    ]);
  }
  if (args.pattern != null && !new RegExp(args.pattern).test(value)) {
    throw new ConstraintGraphQLError(field, `String does not match the pattern "${args.pattern}"`, [
      { arg: "pattern", value: args.pattern },
    ]);
  }
  if (args.format != null) {
    const validator = { ...formats, ...(options.formats || {}) }[args.format];
    if (!validator) {
      throw new ConstraintGraphQLError(field, `Unknown format "${args.format}"`, [
        { arg: "format", value: args.format },
      ]);
    }
    try {
      validator(value);
    } catch (error) {
      throw new ConstraintGraphQLError(field, error.message, [
        { arg: "format", value: args.format },
      ]);
    }
  }
}

function validateNumber(field, args, value) {
  if (args.min != null && value < args.min) {
    throw new ConstraintGraphQLError(field, `Number is less than the minimum ${args.min}`, [
      { arg: "min", value: args.min },
    ]);
  }
  if (args.max != null && value > args.max) {
    throw new ConstraintGraphQLError(field, `Number is greater than the maximum ${args.max}`, [
      { arg: "max", value: args.max },
    ]);
  }
  if (args.multipleOf != null && value % args.multipleOf !== 0) {
    throw new ConstraintGraphQLError(field, `Number is not a multiple of ${args.multipleOf}`, [
      { arg: "multipleOf", value: args.multipleOf },
    ]);
  }
}

class ConstraintStringType extends GraphQLScalarTypeBase {
  constructor(field, name, type, validate, options = {}) {
    super({
      name,
      serialize(value) {
        const result = type.serialize(value);
        validate(field, options, result);
        return result;
      },
      parseValue(value) {
        const result = type.parseValue(value);
        validate(field, options, result);
        return result;
      },
      parseLiteral(node, variables) {
        const result = type.parseLiteral(node, variables);
        validate(field, options, result);
        return result;
      },
    });
  }
}

class ConstraintNumberType extends GraphQLScalarTypeBase {
  constructor(field, name, type, validate, options = {}) {
    super({
      name,
      serialize(value) {
        const result = type.serialize(value);
        validate(field, options, result);
        return result;
      },
      parseValue(value) {
        const result = type.parseValue(value);
        validate(field, options, result);
        return result;
      },
      parseLiteral(node, variables) {
        const result = type.parseLiteral(node, variables);
        validate(field, options, result);
        return result;
      },
    });
  }
}

function getConstraintTypeObject(field, name, type, args, options = {}) {
  const scalar = getScalarType(type);
  let constrained;
  if (scalar === GraphQLString || scalar === GraphQLID) {
    constrained = new ConstraintStringType(field, name, scalar, validateString, args);
  } else if (scalar === GraphQLInt || scalar === GraphQLFloat) {
    constrained = new ConstraintNumberType(field, name, scalar, validateNumber, args);
  } else {
    throw new Error(`Unsupported scalar type ${scalar.name}`);
  }
  if (type instanceof GraphQLNonNull) constrained = new GraphQLNonNull(constrained);
  if (type instanceof GraphQLList) constrained = new GraphQLList(constrained);
  return constrained;
}

function getConstraintValidateFn(type) {
  const scalar = getScalarType(type);
  if (scalar === GraphQLString || scalar === GraphQLID) return validateString;
  if (scalar === GraphQLInt || scalar === GraphQLFloat) return validateNumber;
  throw new Error(`Unsupported scalar type ${scalar.name}`);
}

function validateQuery(schema, document, rules = [], operationName, options = {}) {
  const typeInfo = new TypeInfo(schema);
  const errors = [];
  const context = new ValidationContext(schema, document, typeInfo, error => errors.push(error));
  const visitor = new QueryValidationVisitor(context, { rules, operationName, ...options });
  visit(document, visitWithTypeInfo(typeInfo, visitor));
  return errors;
}

class QueryValidationVisitor {
  constructor(context, options = {}) {
    this.context = context;
    this.options = options;
    this.errors = [];
    this.typeInfo = context.getTypeInfo?.();
    this.enter = {};
    this.leave = {};
    this.document = null;
    this.operation = null;
    this.variableValues = {};
  }

  Document(node) {
    this.document = node;
  }

  OperationDefinition(node) {
    this.operation = node;
  }

  Field(node) {
    const parentType = this.context.getParentType();
    const fieldDef = parentType && this.context.getFieldDef();
    if (!fieldDef) return;
    const args = getDirectiveValues(constraintDirectiveTypeDefsObj, node);
    if (!args) return;
    const field = node.alias ? node.alias.value : node.name.value;
    const type = getScalarType(fieldDef.type);
    if (isInputObjectType(type) || isListType(type)) return;
    const valueNode = node.arguments?.find(argument => argument.name.value === "value")?.value;
    if (!valueNode) return;
    const value = valueFromAST(valueNode, type);
    if (value == null) return;
    try {
      getConstraintValidateFn(type)(field, args, value, this.options);
    } catch (error) {
      this.errors.push(error);
    }
  }
}

const constraintDirectiveTypeDefs = `
  directive @constraint(
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    contains: String
    pattern: String
    format: String
    min: Float
    max: Float
    multipleOf: Float
  ) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
`;

const constraintDirectiveTypeDefsObj = {
  name: "constraint",
  args: {},
};

function constraintDirective() {
  return schema => mapSchema(schema, {
    [MapperKind.INPUT_OBJECT_FIELD]: fieldConfig => {
      const directive = getDirective(schema, fieldConfig, "constraint")?.[0];
      if (!directive) return fieldConfig;
      const field = fieldConfig.astNode?.name?.value || fieldConfig.name;
      return {
        ...fieldConfig,
        type: getConstraintTypeObject(field, fieldConfig.type.name, fieldConfig.type, directive),
      };
    },
  });
}

function constraintDirectiveDocumentation(options = {}) {
  return options;
}

function createApolloQueryValidationPlugin({ schema }, options = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          const operation = request.operationName
            ? separateOperations(document)[request.operationName]
            : document;
          const errors = validateQuery(schema, operation, [], request.operationName, options);
          if (errors.length) {
            const { UserInputError } = require("apollo-server-errors");
            throw errors.map(error => new UserInputError(error.message, {
              field: error.field,
              context: error.context,
            }))[0];
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
        args.validationRules || [],
        args.operationName,
        options,
      );
      if (errors.length) {
        setResultAndStopExecution({ errors });
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
