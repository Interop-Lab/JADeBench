'use strict';

const {
  GraphQLError,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  Kind,
  validate,
  specifiedRules
} = require('graphql');

const {
  getDirective,
  mapSchema,
  MapperKind
} = require('@graphql-tools/utils');

const DEFAULT_DIRECTIVE_NAME = 'constraint';

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
) on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`;

const constraintDirectiveTypeDefsObj = {
  name: DEFAULT_DIRECTIVE_NAME,
  typeDefs: constraintDirectiveTypeDefs
};

const FORMAT_NAMES = [
  'byte',
  'date',
  'date-time',
  'email',
  'ipv4',
  'ipv6',
  'uri',
  'uuid'
];

function constraintError(message, value, constraint) {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      value,
      constraint
    }
  });
}

function assertConstraint(condition, message, value, constraint) {
  if (!condition) {
    throw constraintError(message, value, constraint);
  }
}

function isValidBase64(value) {
  if (typeof value !== 'string' || value.length % 4 !== 0) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}

function isValidDate(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidDateTime(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const dateTimePattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  return dateTimePattern.test(value) && !Number.isNaN(Date.parse(value));
}

function isValidEmail(value) {
  return (
    typeof value === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function isValidIPv4(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const parts = value.split('.');
  return (
    parts.length === 4 &&
    parts.every(part => {
      if (!/^\d{1,3}$/.test(part)) {
        return false;
      }

      if (part.length > 1 && part[0] === '0') {
        return false;
      }

      const octet = Number(part);
      return octet >= 0 && octet <= 255;
    })
  );
}

function isValidIPv6(value) {
  if (typeof value !== 'string' || value.includes(':::')) {
    return false;
  }

  let address = value;
  const ipv4Index = address.lastIndexOf(':');

  if (address.includes('.') && ipv4Index !== -1) {
    const ipv4 = address.slice(ipv4Index + 1);
    if (!isValidIPv4(ipv4)) {
      return false;
    }

    const octets = ipv4.split('.').map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    address = `${address.slice(0, ipv4Index)}:${high}:${low}`;
  }

  const compressed = address.includes('::');
  const groups = address.split(':');

  if (compressed) {
    const firstEmpty = groups.indexOf('');
    const lastEmpty = groups.lastIndexOf('');

    if (firstEmpty !== lastEmpty && lastEmpty !== firstEmpty + 1) {
      return false;
    }
  }

  const nonEmptyGroups = groups.filter(Boolean);
  if ((!compressed && nonEmptyGroups.length !== 8) || (compressed && nonEmptyGroups.length >= 8)) {
    return false;
  }

  return nonEmptyGroups.every(group => /^[0-9a-fA-F]{1,4}$/.test(group));
}

function isValidUri(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol);
  } catch (_) {
    return /^[A-Za-z][A-Za-z0-9+.-]*:[^\s]+$/.test(value);
  }
}

function isValidUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function validateFormat(value, format) {
  switch (String(format).toLowerCase()) {
    case 'byte':
      return isValidBase64(value);
    case 'date':
      return isValidDate(value);
    case 'date-time':
      return isValidDateTime(value);
    case 'email':
      return isValidEmail(value);
    case 'ipv4':
      return isValidIPv4(value);
    case 'ipv6':
      return isValidIPv6(value);
    case 'uri':
      return isValidUri(value);
    case 'uuid':
      return isValidUuid(value);
    default:
      return false;
  }
}

function validateConstraintValue(value, constraints) {
  if (value == null) {
    return value;
  }

  if (constraints.minLength != null) {
    assertConstraint(
      value != null &&
        typeof value.length === 'number' &&
        value.length >= constraints.minLength,
      `Must be at least ${constraints.minLength} characters in length`,
      value,
      'minLength'
    );
  }

  if (constraints.maxLength != null) {
    assertConstraint(
      value != null &&
        typeof value.length === 'number' &&
        value.length <= constraints.maxLength,
      `Must be no more than ${constraints.maxLength} characters in length`,
      value,
      'maxLength'
    );
  }

  if (constraints.startsWith != null) {
    assertConstraint(
      typeof value === 'string' && value.startsWith(constraints.startsWith),
      `Must start with "${constraints.startsWith}"`,
      value,
      'startsWith'
    );
  }

  if (constraints.endsWith != null) {
    assertConstraint(
      typeof value === 'string' && value.endsWith(constraints.endsWith),
      `Must end with "${constraints.endsWith}"`,
      value,
      'endsWith'
    );
  }

  if (constraints.contains != null) {
    assertConstraint(
      typeof value === 'string' && value.includes(constraints.contains),
      `Must contain "${constraints.contains}"`,
      value,
      'contains'
    );
  }

  if (constraints.notContains != null) {
    assertConstraint(
      typeof value === 'string' && !value.includes(constraints.notContains),
      `Must not contain "${constraints.notContains}"`,
      value,
      'notContains'
    );
  }

  if (constraints.pattern != null) {
    let expression;

    try {
      expression = new RegExp(constraints.pattern);
    } catch (_) {
      throw constraintError(
        `Invalid constraint pattern: ${constraints.pattern}`,
        value,
        'pattern'
      );
    }

    assertConstraint(
      typeof value === 'string' && expression.test(value),
      `Must match the pattern ${constraints.pattern}`,
      value,
      'pattern'
    );
  }

  if (constraints.format != null) {
    assertConstraint(
      validateFormat(value, constraints.format),
      `Must be a valid ${constraints.format}`,
      value,
      'format'
    );
  }

  if (constraints.min != null) {
    assertConstraint(
      typeof value === 'number' && value >= constraints.min,
      `Must be greater than or equal to ${constraints.min}`,
      value,
      'min'
    );
  }

  if (constraints.max != null) {
    assertConstraint(
      typeof value === 'number' && value <= constraints.max,
      `Must be less than or equal to ${constraints.max}`,
      value,
      'max'
    );
  }

  if (constraints.exclusiveMin != null) {
    assertConstraint(
      typeof value === 'number' && value > constraints.exclusiveMin,
      `Must be greater than ${constraints.exclusiveMin}`,
      value,
      'exclusiveMin'
    );
  }

  if (constraints.exclusiveMax != null) {
    assertConstraint(
      typeof value === 'number' && value < constraints.exclusiveMax,
      `Must be less than ${constraints.exclusiveMax}`,
      value,
      'exclusiveMax'
    );
  }

  if (constraints.multipleOf != null) {
    const divisor = constraints.multipleOf;
    const quotient = typeof value === 'number' ? value / divisor : NaN;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 8;

    assertConstraint(
      typeof value === 'number' &&
        divisor !== 0 &&
        Math.abs(quotient - Math.round(quotient)) <= tolerance,
      `Must be a multiple of ${divisor}`,
      value,
      'multipleOf'
    );
  }

  return value;
}

function valueFromAST(node, variables) {
  if (!node) {
    return undefined;
  }

  switch (node.kind) {
    case Kind.NULL:
      return null;
    case Kind.INT:
      return parseInt(node.value, 10);
    case Kind.FLOAT:
      return parseFloat(node.value);
    case Kind.STRING:
    case Kind.ENUM:
    case Kind.BOOLEAN:
      return node.value;
    case Kind.LIST:
      return node.values.map(item => valueFromAST(item, variables));
    case Kind.OBJECT: {
      const result = {};
      for (const field of node.fields) {
        result[field.name.value] = valueFromAST(field.value, variables);
      }
      return result;
    }
    case Kind.VARIABLE:
      return variables ? variables[node.name.value] : undefined;
    default:
      return undefined;
  }
}

let constrainedScalarCounter = 0;
const constrainedScalarCache = new WeakMap();

function constraintCacheKey(constraints) {
  return JSON.stringify(
    Object.keys(constraints)
      .sort()
      .reduce((result, key) => {
        result[key] = constraints[key];
        return result;
      }, {})
  );
}

function getConstrainedScalar(type, constraints, directiveName) {
  let typeCache = constrainedScalarCache.get(type);

  if (!typeCache) {
    typeCache = new Map();
    constrainedScalarCache.set(type, typeCache);
  }

  const key = constraintCacheKey(constraints);
  if (typeCache.has(key)) {
    return typeCache.get(key);
  }

  const name = `${type.name}_${directiveName}_${++constrainedScalarCounter}`;
  const parseValue =
    typeof type.parseValue === 'function'
      ? type.parseValue.bind(type)
      : value => value;
  const parseLiteral =
    typeof type.parseLiteral === 'function'
      ? type.parseLiteral.bind(type)
      : valueFromAST;

  const constrainedType = new GraphQLScalarType({
    name,
    description: type.description,
    specifiedByURL: type.specifiedByURL,
    serialize:
      typeof type.serialize === 'function'
        ? type.serialize.bind(type)
        : value => value,
    parseValue(value) {
      return validateConstraintValue(parseValue(value), constraints);
    },
    parseLiteral(node, variables) {
      return validateConstraintValue(parseLiteral(node, variables), constraints);
    },
    extensions: {
      ...(type.extensions || {}),
      constraint: constraints,
      originalScalar: type.name
    }
  });

  typeCache.set(key, constrainedType);
  return constrainedType;
}

function constrainType(type, constraints, directiveName) {
  if (type instanceof GraphQLNonNull) {
    return new GraphQLNonNull(
      constrainType(type.ofType, constraints, directiveName)
    );
  }

  if (type instanceof GraphQLList) {
    return new GraphQLList(
      constrainType(type.ofType, constraints, directiveName)
    );
  }

  if (!(type instanceof GraphQLScalarType)) {
    return type;
  }

  return getConstrainedScalar(type, constraints, directiveName);
}

function readDirective(schema, fieldConfig, directiveName) {
  const directives = getDirective(schema, fieldConfig, directiveName);
  return directives && directives.length ? directives[0] : null;
}

function constraintDirective(options = {}) {
  if (typeof options === 'string') {
    options = { name: options };
  }

  const directiveName =
    options.name || options.directiveName || DEFAULT_DIRECTIVE_NAME;

  return function constraintDirectiveTransformer(schema) {
    return mapSchema(schema, {
      [MapperKind.ARGUMENT]: argumentConfig => {
        const constraints = readDirective(
          schema,
          argumentConfig,
          directiveName
        );

        if (!constraints) {
          return argumentConfig;
        }

        return {
          ...argumentConfig,
          type: constrainType(
            argumentConfig.type,
            constraints,
            directiveName
          )
        };
      },

      [MapperKind.INPUT_OBJECT_FIELD]: fieldConfig => {
        const constraints = readDirective(schema, fieldConfig, directiveName);

        if (!constraints) {
          return fieldConfig;
        }

        return {
          ...fieldConfig,
          type: constrainType(fieldConfig.type, constraints, directiveName)
        };
      }
    });
  };
}

function constraintDirectiveDocumentation(name = DEFAULT_DIRECTIVE_NAME) {
  if (typeof name === 'object' && name) {
    name = name.name || name.directiveName || DEFAULT_DIRECTIVE_NAME;
  }

  return `The @${name} directive validates input values.

String constraints:
- minLength
- maxLength
- startsWith
- endsWith
- contains
- notContains
- pattern
- format (${FORMAT_NAMES.join(', ')})

Number constraints:
- min
- max
- exclusiveMin
- exclusiveMax
- multipleOf`;
}

function createQueryValidationRule() {
  return function ConstraintDirectiveValidationRule() {
    return {};
  };
}

function normalizeValidationArguments(schemaOrOptions, document, variables, operationName) {
  if (
    schemaOrOptions &&
    typeof schemaOrOptions === 'object' &&
    schemaOrOptions.schema
  ) {
    return {
      schema: schemaOrOptions.schema,
      document:
        schemaOrOptions.document ||
        schemaOrOptions.documentAST ||
        schemaOrOptions.operation,
      variables:
        schemaOrOptions.variables ||
        (schemaOrOptions.request && schemaOrOptions.request.variables),
      operationName:
        schemaOrOptions.operationName ||
        (schemaOrOptions.request && schemaOrOptions.request.operationName)
    };
  }

  return {
    schema: schemaOrOptions,
    document,
    variables,
    operationName
  };
}

function validateQuery(schemaOrOptions, document, variables, operationName) {
  const normalized = normalizeValidationArguments(
    schemaOrOptions,
    document,
    variables,
    operationName
  );

  if (!normalized.schema || !normalized.document) {
    return [];
  }

  return validate(normalized.schema, normalized.document, [
    ...specifiedRules,
    createQueryValidationRule({
      variables: normalized.variables,
      operationName: normalized.operationName
    })
  ]);
}

function createApolloQueryValidationPlugin(options = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const errors = validateQuery({
            schema: requestContext.schema,
            document: requestContext.document,
            request: requestContext.request
          });

          if (errors.length) {
            throw errors[0];
          }

          if (typeof options.onValidate === 'function') {
            await options.onValidate(errors, requestContext);
          }
        }
      };
    }
  };
}

function createEnvelopQueryValidationPlugin(options = {}) {
  return {
    onValidate({ addValidationRule, params }) {
      if (typeof addValidationRule === 'function') {
        addValidationRule(createQueryValidationRule(options));
        return;
      }

      if (params && Array.isArray(params.rules)) {
        params.rules.push(createQueryValidationRule(options));
      }
    }
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
