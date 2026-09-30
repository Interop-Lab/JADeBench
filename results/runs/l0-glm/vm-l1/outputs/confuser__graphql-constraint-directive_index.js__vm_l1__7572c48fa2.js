var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_error = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/error.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidationError = void 0;
    class ValidationError extends Error {
      constructor(ast, msg, context) {
        super(msg);
        this.context = context;
        this.originalError = void 0;
        this.path = void 0;
        this.locations = void 0;
        this.nodes = void 0;
        this.source = void 0;
        this.positions = void 0;
        this.extensions = void 0;
        this.ast = ast;
        if (ast && ast.loc) {
          this.locations = [ast.loc.start];
          this.source = ast.loc.source;
          this.positions = [ast.loc.start];
        }
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, ValidationError);
        }
      }
    }
    exports.ValidationError = ValidationError;
  }
});

var require_byte = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/byte.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.byte = void 0;
    const byte = (value) => {
      if (typeof value !== "string") {
        throw new TypeError("Byte value must be a string");
      }
      const decoded = Buffer.from(value, "base64");
      return decoded.toString("utf8");
    };
    exports.byte = byte;
  }
});

var require_date = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.date = void 0;
    const date = (value) => {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new TypeError("Invalid date");
      }
      return parsed;
    };
    exports.date = date;
  }
});

var require_date_time = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dateTime = void 0;
    const dateTime = (value) => {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new TypeError("Invalid date-time");
      }
      return parsed;
    };
    exports.dateTime = dateTime;
  }
});

var require_email = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/email.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.email = void 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = (value) => {
      if (!emailRegex.test(value)) {
        throw new TypeError("Invalid email");
      }
      return value;
    };
    exports.email = email;
  }
});

var require_ipv4 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ipv4 = void 0;
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv4 = (value) => {
      if (!ipv4Regex.test(value)) {
        throw new TypeError("Invalid IPv4");
      }
      const parts = value.split(".");
      for (const part of parts) {
        if (parseInt(part, 10) > 255) {
          throw new TypeError("Invalid IPv4");
        }
      }
      return value;
    };
    exports.ipv4 = ipv4;
  }
});

var require_ipv6 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ipv6 = void 0;
    const ipv6 = (value) => {
      if (!value.includes(":")) {
        throw new TypeError("Invalid IPv6");
      }
      return value;
    };
    exports.ipv6 = ipv6;
  }
});

var require_uri = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uri.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uri = void 0;
    const uri = (value) => {
      try {
        new URL(value);
      } catch {
        throw new TypeError("Invalid URI");
      }
      return value;
    };
    exports.uri = uri;
  }
});

var require_uuid = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uuid = void 0;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuid = (value) => {
      if (!uuidRegex.test(value)) {
        throw new TypeError("Invalid UUID");
      }
      return value;
    };
    exports.uuid = uuid;
  }
});

var require_formats = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const byte_1 = require_byte();
    const date_1 = require_date();
    const date_time_1 = require_date_time();
    const email_1 = require_email();
    const ipv4_1 = require_ipv4();
    const ipv6_1 = require_ipv6();
    const uri_1 = require_uri();
    const uuid_1 = require_uuid();
    exports.byte = byte_1.byte;
    exports.date = date_1.date;
    exports.dateTime = date_time_1.dateTime;
    exports.email = email_1.email;
    exports.ipv4 = ipv4_1.ipv4;
    exports.ipv6 = ipv6_1.ipv6;
    exports.uri = uri_1.uri;
    exports.uuid = uuid_1.uuid;
  }
});

var require_string = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/string.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateString = void 0;
    const validateString = (value, directives) => {
      if (directives.minLength !== void 0 && value.length < directives.minLength) {
        throw new TypeError(`String length must be >= ${directives.minLength}`);
      }
      if (directives.maxLength !== void 0 && value.length > directives.maxLength) {
        throw new TypeError(`String length must be <= ${directives.maxLength}`);
      }
      if (directives.startsWith !== void 0 && !value.startsWith(directives.startsWith)) {
        throw new TypeError(`String must start with ${directives.startsWith}`);
      }
      if (directives.endsWith !== void 0 && !value.endsWith(directives.endsWith)) {
        throw new TypeError(`String must end with ${directives.endsWith}`);
      }
      if (directives.contains !== void 0 && !value.includes(directives.contains)) {
        throw new TypeError(`String must contain ${directives.contains}`);
      }
      if (directives.notContains !== void 0 && value.includes(directives.notContains)) {
        throw new TypeError(`String must not contain ${directives.notContains}`);
      }
      if (directives.pattern !== void 0) {
        const re = new RegExp(directives.pattern);
        if (!re.test(value)) {
          throw new TypeError(`String must match pattern ${directives.pattern}`);
        }
      }
      if (directives.format !== void 0) {
        const formats = require_formats();
        const fn = formats[directives.format];
        if (fn) {
          fn(value);
        }
      }
    };
    exports.validateString = validateString;
  }
});

var require_number = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/number.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateNumber = void 0;
    const validateNumber = (value, directives) => {
      if (directives.min !== void 0 && value < directives.min) {
        throw new TypeError(`Number must be >= ${directives.min}`);
      }
      if (directives.max !== void 0 && value > directives.max) {
        throw new TypeError(`Number must be <= ${directives.max}`);
      }
      if (directives.exclusiveMin !== void 0 && value <= directives.exclusiveMin) {
        throw new TypeError(`Number must be > ${directives.exclusiveMin}`);
      }
      if (directives.exclusiveMax !== void 0 && value >= directives.exclusiveMax) {
        throw new TypeError(`Number must be < ${directives.exclusiveMax}`);
      }
      if (directives.multipleOf !== void 0 && value % directives.multipleOf !== 0) {
        throw new TypeError(`Number must be a multiple of ${directives.multipleOf}`);
      }
    };
    exports.validateNumber = validateNumber;
  }
});

var require_type_utils = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-utils.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getScalarType = exports.getConstraintTypeObject = void 0;
    const graphql_1 = require("graphql");
    const getConstraintTypeObject = (typeName, fieldName, type, directiveArgumentMap) => {
      return new graphql_1.GraphQLScalarType({
        name: `${typeName}_${fieldName}_Constraint`,
        description: `${typeName}.${fieldName} constraint`,
        serialize(value) {
          return value;
        },
        parseValue(value) {
          return value;
        },
        parseLiteral(ast) {
          return ast.value;
        }
      });
    };
    exports.getConstraintTypeObject = getConstraintTypeObject;
    const getScalarType = (type) => {
      if (type instanceof graphql_1.GraphQLNonNull) {
        return type.ofType;
      }
      return type;
    };
    exports.getScalarType = getScalarType;
  }
});

var require_type_defs = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-defs.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.constraintDirectiveTypeDefsObj = exports.constraintDirectiveTypeDefs = void 0;
    const constraintDirectiveTypeDefs = `
    directive @constraint(
      minLength: Int
      maxLength: Int
      startsWith: String
      endsWith: String
      notContains: String
      pattern: String
      format: String
      min: Int
      max: Int
      exclusiveMin: Int
      exclusiveMax: Int
      multipleOf: Int
    ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION
  `;
    exports.constraintDirectiveTypeDefs = constraintDirectiveTypeDefs;
    const constraintDirectiveTypeDefsObj = {
      constraint: {
        args: {
          minLength: { type: "Int" },
          maxLength: { type: "Int" },
          startsWith: { type: "String" },
          endsWith: { type: "String" },
          notContains: { type: "String" },
          pattern: { type: "String" },
          format: { type: "String" },
          min: { type: "Int" },
          max: { type: "Int" },
          exclusiveMin: { type: "Int" },
          exclusiveMax: { type: "Int" },
          multipleOf: { type: "Int" }
        },
        locations: ["INPUT_FIELD_DEFINITION", "FIELD_DEFINITION"]
      }
    };
    exports.constraintDirectiveTypeDefsObj = constraintDirectiveTypeDefsObj;
  }
});

var require_query_validation_visitor = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QueryValidationVisitor = void 0;
    const graphql_1 = require("graphql");
    const error_1 = require_error();
    const string_1 = require_string();
    const number_1 = require_number();
    const type_utils_1 = require_type_utils();
    class QueryValidationVisitor {
      constructor(context, options) {
        this.context = context;
        this.options = options;
      }
      Field(node) {
        const fieldDef = this.context.getFieldDef();
        if (fieldDef) {
          const directives = (0, graphql_1.getDirectiveValues)(fieldDef, "constraint");
          if (directives) {
            try {
              const value = node.value ? node.value.value : void 0;
              if (typeof value === "string") {
                (0, string_1.validateString)(value, directives);
              } else if (typeof value === "number") {
                (0, number_1.validateNumber)(value, directives);
              }
            } catch (e) {
              this.context.reportError(new error_1.ValidationError(node, e.message, this.context));
            }
          }
        }
      }
    }
    exports.QueryValidationVisitor = QueryValidationVisitor;
  }
});

var require_validate_query = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/validate-query.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateQuery = void 0;
    const graphql_1 = require("graphql");
    const query_validation_visitor_1 = require_query_validation_visitor();
    const validateQuery = (schema, query, variables, operationName) => {
      const errors = [];
      const context = new graphql_1.ValidationContext(schema, query, operationName, (err) => errors.push(err));
      const visitor = new query_validation_visitor_1.QueryValidationVisitor(context, {});
      (0, graphql_1.visit)(query, visitor);
      return errors;
    };
    exports.validateQuery = validateQuery;
  }
});

const { GraphQLNonNull, GraphQLList, separateOperations, GraphQLError, getDirectiveValues } = require("graphql");
const QueryValidationVisitor = require_query_validation_visitor();
const { validateQuery } = require_validate_query();
const { getDirective, mapSchema, MapperKind } = require("@graphql-tools/utils");
const { getConstraintTypeObject, getScalarType } = require_type_utils();
const { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj } = require_type_defs();

function constraintDirective() {
  return {
    constraintDirectiveTypeDefs,
    constraintDirectiveTypeDefsObj,
    constraintDirectiveTransformer: (schema) => mapSchema(schema, {
      [MapperKind.FIELD]: (fieldConfig) => {
        const directives = getDirective(schema, fieldConfig, "constraint");
        if (directives && directives.length > 0) {
          const directive = directives[0];
          const newType = getConstraintTypeObject(fieldConfig.type.name, fieldConfig.name, fieldConfig.type, directive);
          fieldConfig.type = newType;
        }
        return fieldConfig;
      }
    })
  };
}

function constraintDirectiveDocumentation() {
  return constraintDirectiveTypeDefs;
}

function createApolloQueryValidationPlugin() {
  return {
    requestDidStart() {
      return {
        didResolveOperation({ request, document, schema }) {
          const errors = validateQuery(schema, document, request.variables, request.operationName);
          if (errors.length > 0) {
            throw errors[0];
          }
        }
      };
    }
  };
}

function createEnvelopQueryValidationPlugin() {
  return {
    onExecute({ args }) {
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName);
      if (errors.length > 0) {
        throw errors[0];
      }
    }
  };
}

function createQueryValidationRule() {
  return (context) => {
    const visitor = new QueryValidationVisitor(context, {});
    return visitor;
  };
}

module.exports = {
  constraintDirective,
  constraintDirectiveDocumentation,
  constraintDirectiveTypeDefs,
  validateQuery,
  createApolloQueryValidationPlugin,
  createEnvelopQueryValidationPlugin,
  createQueryValidationRule
};
