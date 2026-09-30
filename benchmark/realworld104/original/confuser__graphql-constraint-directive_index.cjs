var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/confuser__graphql-constraint-directive/lib/error.js
var require_error = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/error.js"(exports2, module2) {
    module2.exports = class ConstraintDirectiveError extends Error {
      constructor(fieldName, message, context) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.code = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";
        this.fieldName = fieldName;
        this.context = context;
        this.originalError = void 0;
      }
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/byte.js
var require_byte = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/byte.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isBase64 } = require("validator");
    module2.exports = (value) => {
      if (isBase64(value)) return true;
      throw new GraphQLError2("Must be in byte format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/date.js
var require_date = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isISO8601 } = require("validator");
    module2.exports = (value) => {
      if (isISO8601(value)) return true;
      throw new GraphQLError2("Must be a date in ISO 8601 format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js
var require_date_time = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isRFC3339 } = require("validator");
    module2.exports = (value) => {
      if (isRFC3339(value)) return true;
      throw new GraphQLError2("Must be a date-time in RFC 3339 format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/email.js
var require_email = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/email.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isEmail } = require("validator");
    module2.exports = (value) => {
      if (isEmail(value)) return true;
      throw new GraphQLError2("Must be in email format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js
var require_ipv4 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isIP } = require("validator");
    module2.exports = (value) => {
      if (isIP(value, 4)) return true;
      throw new GraphQLError2("Must be in IP v4 format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js
var require_ipv6 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isIP } = require("validator");
    module2.exports = (value) => {
      if (isIP(value, 6)) return true;
      throw new GraphQLError2("Must be in IP v6 format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/uri.js
var require_uri = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uri.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isURL } = require("validator");
    module2.exports = (value) => {
      if (isURL(value)) return true;
      throw new GraphQLError2("Must be in URI format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js
var require_uuid = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js"(exports2, module2) {
    var { GraphQLError: GraphQLError2 } = require("graphql/error");
    var { isUUID } = require("validator");
    module2.exports = (value) => {
      if (isUUID(value)) return true;
      throw new GraphQLError2("Must be in UUID format");
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/formats/index.js
var require_formats = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/index.js"(exports2, module2) {
    var byte = require_byte();
    var date = require_date();
    var dateTime = require_date_time();
    var email = require_email();
    var ipv4 = require_ipv4();
    var ipv6 = require_ipv6();
    var uri = require_uri();
    var uuid = require_uuid();
    module2.exports = {
      byte,
      "date-time": dateTime,
      date,
      email,
      ipv4,
      ipv6,
      uri,
      uuid
    };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/string.js
var require_string = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/string.js"(exports2, module2) {
    var { GraphQLScalarType } = require("graphql");
    var { contains, isLength } = require("validator");
    var defaultFormats = require_formats();
    var ValidationError = require_error();
    var ConstraintStringType = class extends GraphQLScalarType {
      constructor(fieldName, uniqueTypeName, type, args, options = {}) {
        super({
          name: uniqueTypeName,
          serialize(value) {
            value = type.serialize(value);
            validate(fieldName, args, value, options);
            return value;
          },
          parseValue(value) {
            value = type.serialize(value);
            validate(fieldName, args, value, options);
            return type.parseValue(value);
          },
          parseLiteral(ast) {
            const value = type.parseLiteral(ast);
            validate(fieldName, args, value, options);
            return value;
          }
        });
      }
    };
    function getMessage(args, defaultMessage) {
      return args.errorMessage || defaultMessage;
    }
    function validate(fieldName, args, value, options = {}) {
      if (args.minLength && !isLength(value, { min: args.minLength })) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be at least ${args.minLength} characters in length`),
          [{ arg: "minLength", value: args.minLength }]
        );
      }
      if (args.maxLength && !isLength(value, { max: args.maxLength })) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be no more than ${args.maxLength} characters in length`),
          [{ arg: "maxLength", value: args.maxLength }]
        );
      }
      if (args.startsWith && !value.startsWith(args.startsWith)) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must start with ${args.startsWith}`),
          [{ arg: "startsWith", value: args.startsWith }]
        );
      }
      if (args.endsWith && !value.endsWith(args.endsWith)) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must end with ${args.endsWith}`),
          [{ arg: "endsWith", value: args.endsWith }]
        );
      }
      if (args.contains && !contains(value, args.contains)) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must contain ${args.contains}`),
          [{ arg: "contains", value: args.contains }]
        );
      }
      if (args.notContains && contains(value, args.notContains)) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must not contain ${args.notContains}`),
          [{ arg: "notContains", value: args.notContains }]
        );
      }
      if (args.pattern && !new RegExp(args.pattern).test(value)) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must match ${args.pattern}`),
          [{ arg: "pattern", value: args.pattern }]
        );
      }
      if (args.format) {
        const pluginOptions = options.pluginOptions || {};
        const formats = { ...defaultFormats, ...pluginOptions.formats || {} };
        const formatter = formats[args.format];
        if (!formatter) {
          throw new ValidationError(
            fieldName,
            getMessage(args, `Invalid format type ${args.format}`),
            [{ arg: "format", value: args.format }]
          );
        }
        try {
          formatter(value, args);
        } catch (e) {
          throw new ValidationError(
            fieldName,
            getMessage(args, e.message),
            [{ arg: "format", value: args.format }]
          );
        }
      }
    }
    module2.exports = { ConstraintStringType, validate };
  }
});

// ../work/confuser__graphql-constraint-directive/scalars/number.js
var require_number = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/number.js"(exports2, module2) {
    var { GraphQLScalarType } = require("graphql");
    var ValidationError = require_error();
    var ConstraintNumberType = class extends GraphQLScalarType {
      constructor(fieldName, uniqueTypeName, type, args) {
        super({
          name: uniqueTypeName,
          serialize(value) {
            value = type.serialize(value);
            validate(fieldName, args, value);
            return value;
          },
          parseValue(value) {
            value = type.serialize(value);
            validate(fieldName, args, value);
            return type.parseValue(value);
          },
          parseLiteral(ast) {
            const value = type.parseLiteral(ast);
            validate(fieldName, args, value);
            return value;
          }
        });
      }
    };
    function divisible(a, b) {
      const eps = Number.EPSILON * 3;
      return a % b < eps || a % b > b - eps;
    }
    function getMessage(args, defaultMessage) {
      return args.errorMessage || defaultMessage;
    }
    function validate(fieldName, args, value) {
      if (args.min !== void 0 && value < args.min) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be at least ${args.min}`),
          [{ arg: "min", value: args.min }]
        );
      }
      if (args.max !== void 0 && value > args.max) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be no greater than ${args.max}`),
          [{ arg: "max", value: args.max }]
        );
      }
      if (args.exclusiveMin !== void 0 && value <= args.exclusiveMin) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be greater than ${args.exclusiveMin}`),
          [{ arg: "exclusiveMin", value: args.exclusiveMin }]
        );
      }
      if (args.exclusiveMax !== void 0 && value >= args.exclusiveMax) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be less than ${args.exclusiveMax}`),
          [{ arg: "exclusiveMax", value: args.exclusiveMax }]
        );
      }
      if (args.multipleOf !== void 0 && divisible(value, args.multipleOf) === false) {
        throw new ValidationError(
          fieldName,
          getMessage(args, `Must be a multiple of ${args.multipleOf}`),
          [{ arg: "multipleOf", value: args.multipleOf }]
        );
      }
    }
    module2.exports = { ConstraintNumberType, validate };
  }
});

// ../work/confuser__graphql-constraint-directive/lib/type-utils.js
var require_type_utils = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-utils.js"(exports2, module2) {
    var {
      GraphQLFloat,
      GraphQLInt,
      GraphQLString,
      isNonNullType,
      isScalarType,
      isListType,
      GraphQLID
    } = require("graphql");
    var { ConstraintStringType, validate: validateStringFn } = require_string();
    var { ConstraintNumberType, validate: validateNumberFn } = require_number();
    function getConstraintTypeObject2(fieldName, type, uniqueTypeName, directiveArgumentMap) {
      if (type === GraphQLString || type === GraphQLID) {
        return new ConstraintStringType(
          fieldName,
          uniqueTypeName,
          type,
          directiveArgumentMap
        );
      } else if (type === GraphQLFloat || type === GraphQLInt) {
        return new ConstraintNumberType(
          fieldName,
          uniqueTypeName,
          type,
          directiveArgumentMap
        );
      } else {
        throw new Error(`Not a valid scalar type: ${type.toString()}`);
      }
    }
    function getConstraintValidateFn(type) {
      if (type === GraphQLString || type === GraphQLID) {
        return validateStringFn;
      } else if (type === GraphQLFloat || type === GraphQLInt) {
        return validateNumberFn;
      } else {
        throw new Error(`Not a valid scalar type: ${type.toString()}`);
      }
    }
    function getScalarType2(fieldConfig) {
      if (isScalarType(fieldConfig)) {
        return { scalarType: fieldConfig };
      } else if (isListType(fieldConfig)) {
        return { ...getScalarType2(fieldConfig.ofType), list: true };
      } else if (isNonNullType(fieldConfig) && isScalarType(fieldConfig.ofType)) {
        return { scalarType: fieldConfig.ofType, scalarNotNull: true };
      } else if (isNonNullType(fieldConfig)) {
        return { ...getScalarType2(fieldConfig.ofType), list: true, listNotNull: true };
      } else {
        throw new Error(`Not a valid scalar type: ${fieldConfig.toString()}`);
      }
    }
    module2.exports = { getConstraintTypeObject: getConstraintTypeObject2, getConstraintValidateFn, getScalarType: getScalarType2 };
  }
});

// ../work/confuser__graphql-constraint-directive/lib/type-defs.js
var require_type_defs = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-defs.js"(exports2, module2) {
    var {
      GraphQLString,
      GraphQLDirective,
      DirectiveLocation,
      GraphQLInt,
      GraphQLFloat
    } = require("graphql");
    var constraintDirectiveTypeDefs2 = (
      /* GraphQL */
      `
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

  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION`
    );
    var constraintDirectiveTypeDefsObj2 = new GraphQLDirective({
      name: "constraint",
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION],
      args: {
        // String constraint
        minLength: {
          type: GraphQLInt
        },
        maxLength: {
          type: GraphQLInt
        },
        startsWith: {
          type: GraphQLString
        },
        endsWith: {
          type: GraphQLString
        },
        contains: {
          type: GraphQLString
        },
        notContains: {
          type: GraphQLString
        },
        pattern: {
          type: GraphQLString
        },
        format: {
          type: GraphQLString
        },
        // Number constraint
        min: {
          type: GraphQLFloat
        },
        max: {
          type: GraphQLFloat
        },
        exclusiveMin: {
          type: GraphQLFloat
        },
        exclusiveMax: {
          type: GraphQLFloat
        },
        multipleOf: {
          type: GraphQLFloat
        },
        // Array/List size constraints
        minItems: {
          type: GraphQLInt
        },
        maxItems: {
          type: GraphQLInt
        },
        // Custom error message when validation fails
        errorMessage: {
          type: GraphQLString
        },
        // Shared for Schema wrapper
        uniqueTypeName: {
          type: GraphQLString
        }
      }
    });
    module2.exports = { constraintDirectiveTypeDefs: constraintDirectiveTypeDefs2, constraintDirectiveTypeDefsObj: constraintDirectiveTypeDefsObj2 };
  }
});

// ../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js
var require_query_validation_visitor = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js"(exports2, module2) {
    var { getVariableValues } = require("graphql/execution/values.js");
    var {
      GraphQLString,
      Kind,
      getNamedType,
      isInputObjectType,
      isListType,
      isNonNullType,
      BREAK,
      valueFromAST,
      typeFromAST,
      visit,
      getDirectiveValues: getDirectiveValues2
    } = require("graphql");
    var ValidationError = require_error();
    var { getConstraintValidateFn, getScalarType: getScalarType2 } = require_type_utils();
    var { constraintDirectiveTypeDefsObj: constraintDirectiveTypeDefsObj2 } = require_type_defs();
    module2.exports = class QueryValidationVisitor {
      constructor(context, options) {
        this.context = context;
        this.options = options;
        this.variableValues = {};
        this.FragmentDefinition = {
          enter: this.onFragmentEnter,
          leave: this.onFragmentLeave
        };
        this.OperationDefinition = {
          enter: this.onOperationDefinitionEnter
        };
        this.Field = {
          enter: this.onFieldEnter,
          leave: this.onFieldLeave
        };
        this.Argument = {
          enter: this.onArgumentEnter
        };
        this.InlineFragment = {
          enter: this.onFragmentEnter,
          leave: this.onFragmentLeave
        };
      }
      onOperationDefinitionEnter(operation) {
        if (typeof this.options.operationName === "string" && this.options.operationName !== operation.name.value) {
          return;
        }
        this.variableValues = getVariableValues(
          this.context.getSchema(),
          // We have to create a new array here because input argument is not readonly in graphql ~14.6.0
          operation.variableDefinitions ? [...operation.variableDefinitions] : [],
          this.options.variables ?? {}
        ).coerced;
        let typeDef;
        switch (operation.operation) {
          case "query":
            typeDef = this.context.getSchema().getQueryType();
            break;
          case "mutation":
            typeDef = this.context.getSchema().getMutationType();
            break;
          case "subscription":
            typeDef = this.context.getSchema().getSubscriptionType();
            break;
          default:
            throw new Error(
              `Query validation could not be performed for operation of type ${operation.operation}`
            );
        }
        this.currentTypeInfo = { typeDef };
      }
      onFragmentEnter(node) {
        const newTypeDef = typeFromAST(this.context.getSchema(), node.typeCondition);
        this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef };
      }
      onFragmentLeave(node) {
        this.currentTypeInfo = this.currentTypeInfo.parent;
      }
      onFieldEnter(node) {
        this.currentField = node;
        if (this.currentTypeInfo?.typeDef?.getFields) {
          this.currentrFieldDef = this.currentTypeInfo.typeDef.getFields()[node.name.value];
        }
        if (this.currentrFieldDef) {
          const newTypeDef = getNamedType(this.currentrFieldDef.type);
          this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef };
        } else {
          return BREAK;
        }
      }
      onFieldLeave(node) {
        this.currentTypeInfo = this.currentTypeInfo.parent;
      }
      onArgumentEnter(arg) {
        const argName = arg.name.value;
        const argTypeDef = this.currentrFieldDef?.args.find((d) => d.name === argName);
        if (!argTypeDef) return;
        const value = valueFromAST(arg.value, argTypeDef.type, this.variableValues);
        let variableName;
        if (arg.value.kind === Kind.VARIABLE) variableName = arg.value.name.value;
        let valueTypeDef = argTypeDef.type;
        if (isNonNullType(valueTypeDef)) valueTypeDef = valueTypeDef.ofType;
        if (isInputObjectType(valueTypeDef)) {
          if (!value) return;
          const inputObjectTypeDef = getNamedType(valueTypeDef);
          validateInputTypeValue(this.context, inputObjectTypeDef, argName, variableName, value, this.currentField, variableName, this.options);
        } else if (isListType(valueTypeDef)) {
          validateArrayTypeValue(this.context, valueTypeDef, argTypeDef, value, this.currentField, argName, variableName, variableName, this.options);
        } else {
          if (!value && value !== "" && value !== 0) return;
          const fieldNameForError = variableName || this.currentField.name.value + "." + argName;
          validateScalarTypeValue(this.context, this.currentField, argTypeDef, valueTypeDef, value, variableName, argName, fieldNameForError, "", this.options);
        }
      }
    };
    function validateScalarTypeValue(context, currentQueryField, typeDefWithDirective, valueTypeDef, value, variableName, argName, fieldNameForError, errMessageAt, options = {}) {
      if (!typeDefWithDirective.astNode) {
        return;
      }
      const directiveArgumentMap = getDirectiveValues2(constraintDirectiveTypeDefsObj2, typeDefWithDirective.astNode);
      if (directiveArgumentMap) {
        const st = getScalarType2(valueTypeDef).scalarType;
        const valueDelim = st === GraphQLString ? '"' : "";
        try {
          getConstraintValidateFn(st)(fieldNameForError, directiveArgumentMap, value, options);
        } catch (e) {
          const message = directiveArgumentMap.errorMessage || (variableName ? `Variable "$${variableName}" got invalid value ${valueDelim}${value}${valueDelim}${errMessageAt}. ` + e.message : `Argument "${argName}" of "${currentQueryField.name.value}" got invalid value ${valueDelim}${value}${valueDelim}${errMessageAt}. ` + e.message);
          const error = new ValidationError(fieldNameForError, message, e.context);
          error.originalError = e;
          context.reportError(error);
        }
      }
    }
    function validateInputTypeValue(context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames, options = {}) {
      if (!inputObjectTypeDef.astNode) {
        return;
      }
      const visitor = new InputObjectValidationVisitor(context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames, options);
      visit(inputObjectTypeDef.astNode, visitor);
    }
    function validateArrayTypeValue(context, valueTypeDef, typeDefWithDirective, value, currentField, argName, variableName, iFieldNameFull, options = {}) {
      if (!typeDefWithDirective.astNode) {
        return;
      }
      let valueTypeDefArray = valueTypeDef.ofType;
      if (isNonNullType(valueTypeDefArray)) valueTypeDefArray = valueTypeDefArray.ofType;
      const directiveArgumentMap = getDirectiveValues2(constraintDirectiveTypeDefsObj2, typeDefWithDirective.astNode);
      let hasNonListValidation = false;
      if (directiveArgumentMap) {
        let errMessageBase;
        if (variableName) {
          errMessageBase = `Variable "$${variableName}" at "${iFieldNameFull}" `;
        } else {
          errMessageBase = `Argument "${argName}" of "${currentField.name.value}" `;
        }
        const defaultMinItemsMessage = errMessageBase + `must be at least ${directiveArgumentMap.minItems} in length`;
        const defaultMaxItemsMessage = errMessageBase + `must be no more than ${directiveArgumentMap.maxItems} in length`;
        if (directiveArgumentMap.minItems && (!value || value.length < directiveArgumentMap.minItems)) {
          context.reportError(new ValidationError(
            iFieldNameFull,
            directiveArgumentMap.errorMessage || defaultMinItemsMessage,
            [{ arg: "minItems", value: directiveArgumentMap.minItems }]
          ));
        }
        if (directiveArgumentMap.maxItems && value && value.length > directiveArgumentMap.maxItems) {
          context.reportError(new ValidationError(
            iFieldNameFull,
            directiveArgumentMap.errorMessage || defaultMaxItemsMessage,
            [{ arg: "maxItems", value: directiveArgumentMap.maxItems }]
          ));
        }
        for (const key in directiveArgumentMap) {
          if (key !== "maxItems" && key !== "minItems") {
            hasNonListValidation = true;
            break;
          }
        }
      }
      if (value) {
        value.forEach((element, index) => {
          if (element === null || element === void 0) {
            return;
          }
          const iFieldNameFullIndexed = iFieldNameFull ? `${iFieldNameFull}[${index++}]` : `[${index++}]`;
          if (isInputObjectType(valueTypeDefArray)) {
            validateInputTypeValue(context, valueTypeDefArray, argName, variableName, element, currentField, iFieldNameFullIndexed, options);
          } else if (hasNonListValidation) {
            const atMessage = ` at "${iFieldNameFullIndexed}"`;
            validateScalarTypeValue(context, currentField, typeDefWithDirective, valueTypeDef, element, variableName, argName, iFieldNameFullIndexed, atMessage, options);
          }
        });
      }
    }
    var InputObjectValidationVisitor = class {
      constructor(context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames, options = {}) {
        this.context = context;
        this.argName = argName;
        this.variableName = variableName;
        this.inputObjectValue = value;
        this.inputObjectTypeDef = inputObjectTypeDef;
        this.value = value;
        this.currentField = currentField;
        this.parentNames = parentNames;
        this.options = options;
        this.InputValueDefinition = {
          enter: this.onInputValueDefinition
        };
      }
      onInputValueDefinition(node) {
        const iFieldName = node.name.value;
        const iFieldTypeDef = this.inputObjectTypeDef.getFields()[iFieldName];
        const iFieldNameFull = this.parentNames ? this.parentNames + "." + iFieldName : iFieldName;
        const value = this.value[iFieldName];
        let valueTypeAst = node.type;
        if (valueTypeAst.kind === Kind.NON_NULL_TYPE) {
          valueTypeAst = valueTypeAst.type;
        }
        const valueTypeDef = typeFromAST(this.context.getSchema(), valueTypeAst);
        if (isInputObjectType(valueTypeDef)) {
          if (!value) return;
          validateInputTypeValue(this.context, valueTypeDef, this.argName, this.variableName, value, this.currentField, iFieldNameFull, this.options);
        } else if (isListType(valueTypeDef)) {
          validateArrayTypeValue(this.context, valueTypeDef, iFieldTypeDef, value, this.currentField, this.argName, this.variableName, iFieldNameFull, this.options);
        } else {
          if (!value && value !== "" && value !== 0) return;
          validateScalarTypeValue(this.context, this.currentField, iFieldTypeDef, valueTypeDef, value, this.variableName, this.argName, iFieldNameFull, ` at "${iFieldNameFull}"`, this.options);
        }
      }
    };
  }
});

// ../work/confuser__graphql-constraint-directive/lib/validate-query.js
var require_validate_query = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/validate-query.js"(exports2, module2) {
    var {
      TypeInfo,
      ValidationContext,
      visit,
      visitWithTypeInfo
    } = require("graphql");
    var QueryValidationVisitor2 = require_query_validation_visitor();
    function validateQuery2(schema, query, variables, operationName, pluginOptions = {}) {
      const typeInfo = new TypeInfo(schema);
      const errors = [];
      const context = new ValidationContext(
        schema,
        query,
        typeInfo,
        (error) => errors.push(error)
      );
      const visitor = new QueryValidationVisitor2(context, {
        variables,
        operationName,
        pluginOptions
      });
      visit(query, visitWithTypeInfo(typeInfo, visitor));
      return errors;
    }
    module2.exports = { validateQuery: validateQuery2 };
  }
});

// ../work/confuser__graphql-constraint-directive/index.js
var {
  GraphQLNonNull,
  GraphQLList,
  separateOperations,
  GraphQLError,
  getDirectiveValues
} = require("graphql");
var QueryValidationVisitor = require_query_validation_visitor();
var { validateQuery } = require_validate_query();
var { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");
var { getConstraintTypeObject, getScalarType } = require_type_utils();
var { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj } = require_type_defs();
function constraintDirective() {
  const constraintTypes = {};
  function getConstraintType(fieldName, type, notNull, directiveArgumentMap, list, listNotNull) {
    let uniqueTypeName;
    if (directiveArgumentMap.uniqueTypeName) {
      uniqueTypeName = directiveArgumentMap.uniqueTypeName.replace(/\W/g, "");
    } else {
      uniqueTypeName = `${fieldName}_${list ? "List_" : ""}${listNotNull ? "ListNotNull_" : ""}${type.name}_${notNull ? "NotNull_" : ""}` + Object.entries(directiveArgumentMap).filter(([key2]) => key2 !== "errorMessage").map(([key2, value]) => {
        if (key2 === "min" || key2 === "max" || key2 === "exclusiveMin" || key2 === "exclusiveMax" || key2 === "multipleOf") {
          return `${key2}_${value.toString().replace(/\W/g, "dot")}`;
        }
        return `${key2}_${value.toString().replace(/\W/g, "")}`;
      }).join("_");
    }
    const key = Symbol.for(uniqueTypeName);
    let constraintType = constraintTypes[key];
    if (constraintType) return constraintType;
    constraintType = getConstraintTypeObject(fieldName, type, uniqueTypeName, directiveArgumentMap);
    if (notNull) {
      constraintType = new GraphQLNonNull(constraintType);
    }
    if (list) {
      constraintType = new GraphQLList(constraintType);
      if (listNotNull) {
        constraintType = new GraphQLNonNull(constraintType);
      }
    }
    constraintTypes[key] = constraintType;
    return constraintType;
  }
  function wrapType(fieldConfig, directiveArgumentMap) {
    const result = getScalarType(fieldConfig.type);
    const fieldName = fieldConfig.astNode.name.value;
    fieldConfig.type = getConstraintType(
      fieldName,
      result.scalarType,
      result.scalarNotNull,
      directiveArgumentMap,
      result.list,
      result.listNotNull
    );
  }
  return (schema) => mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const directiveArgumentMap = getDirective(schema, fieldConfig, "constraint")?.[0];
      if (directiveArgumentMap) {
        wrapType(fieldConfig, directiveArgumentMap);
        return fieldConfig;
      }
    },
    [MapperKind.ARGUMENT]: (fieldConfig) => {
      const directiveArgumentMap = getDirective(schema, fieldConfig, "constraint")?.[0];
      if (directiveArgumentMap) {
        wrapType(fieldConfig, directiveArgumentMap);
        return fieldConfig;
      }
    }
  });
}
function constraintDirectiveDocumentation(options) {
  let DESCRIPTINS_MAP = {
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
    maxItems: "Maximal number of items"
  };
  if (options?.descriptionsMap) {
    DESCRIPTINS_MAP = options.descriptionsMap;
  }
  let HEADER = "*Constraints:*";
  if (options?.header) {
    HEADER = options.header;
  }
  function documentConstraintDirective(fieldConfig, directiveArgumentMap) {
    if (fieldConfig.description) {
      if (fieldConfig.description.includes(HEADER)) return;
      fieldConfig.description += "\n\n";
    } else {
      fieldConfig.description = "";
    }
    fieldConfig.description += HEADER + "\n";
    Object.entries(directiveArgumentMap).forEach(([key, value]) => {
      if (key === "uniqueTypeName" || key === "errorMessage") return;
      fieldConfig.description += `* ${DESCRIPTINS_MAP[key] ? DESCRIPTINS_MAP[key] : key}: \`${value}\`
`;
    });
    if (fieldConfig.astNode?.description) {
      fieldConfig.astNode.description.value = fieldConfig.description;
    }
  }
  return (schema) => mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      if (fieldConfig?.astNode) {
        const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode);
        if (directiveArgumentMap) {
          documentConstraintDirective(fieldConfig, directiveArgumentMap);
          return fieldConfig;
        }
      }
    },
    [MapperKind.ARGUMENT]: (fieldConfig) => {
      if (fieldConfig?.astNode) {
        const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode);
        if (directiveArgumentMap) {
          documentConstraintDirective(fieldConfig, directiveArgumentMap);
          return fieldConfig;
        }
      }
    }
  });
}
function createApolloQueryValidationPlugin({ schema }, options = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          const query = request.operationName ? separateOperations(document)[request.operationName] : document;
          const errors = validateQuery(
            schema,
            query,
            request.variables,
            request.operationName,
            options
          );
          if (errors.length > 0) {
            throw errors.map((err) => {
              const { UserInputError } = require("apollo-server-errors");
              return new UserInputError(err.message, { field: err.fieldName, context: err.context });
            });
          }
        }
      };
    }
  };
}
function createEnvelopQueryValidationPlugin(options = {}) {
  return {
    onExecute({ args, setResultAndStopExecution }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, options);
      if (errors.length > 0) {
        setResultAndStopExecution({ errors: errors.map((err) => {
          return new GraphQLError(err.message, { extensions: { code: err.code, field: err.fieldName, context: err.context } });
        }) });
      }
    }
  };
}
function createQueryValidationRule(options) {
  return (context) => {
    return new QueryValidationVisitor(context, options);
  };
}
module.exports = { constraintDirective, constraintDirectiveDocumentation, constraintDirectiveTypeDefs, validateQuery, createApolloQueryValidationPlugin, createEnvelopQueryValidationPlugin, createQueryValidationRule };
