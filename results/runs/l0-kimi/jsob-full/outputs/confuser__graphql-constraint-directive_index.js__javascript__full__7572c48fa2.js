const { GraphQLNonNull, GraphQLList, separateOperations, GraphQLError, getDirectiveValues } = require('graphql');
const { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils');
const { getConstraintValidateFn, getScalarType } = require('./lib/type-utils');
const { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj } = require('./lib/type-defs');
const QueryValidationVisitor = require('./lib/query-validation-visitor');
const { validateQuery } = require('./lib/validate-query');

function constraintDirective() {
  const constraintTypeCache = {};

  function getConstraintType(name, baseType, config, isList, isNonNull, listNotNull) {
    let cacheKey = name + '_' + (isList ? 'list_' : '') + (listNotNull ? 'listNotNull_' : '') + baseType.name + '_' + (isNonNull ? 'nonNull' : '');
    
    if (config?.format) {
      cacheKey = cacheKey.replace(/\W/g, '');
    } else {
      cacheKey = (name + '_' + (isList ? 'list_' : '') + (listNotNull ? 'listNotNull_' : '') + baseType.name + '_' + (isNonNull ? 'nonNull' : '') + '_' + Object.entries(config).filter(([k]) => k !== 'format').map(([k, v]) => {
        if (k === 'min' || k === 'max' || k === 'minLength' || k === 'maxLength' || k === 'pattern' || k === 'contains' || k === 'notContains' || k === 'startsWith' || k === 'endsWith') {
          return k + '_' + v.toString().replace(/\W/g, '_');
        }
        return k + '_' + v;
      }).join('_')).replace(/\W/g, '_');
    }

    const symbolKey = Symbol.for(cacheKey);
    let cached = constraintTypeCache[symbolKey];
    if (cached) return cached;

    cached = getConstraintTypeObject(name, baseType, cacheKey, config);
    if (isNonNull) cached = new GraphQLNonNull(cached);
    if (isList) {
      cached = new GraphQLList(cached);
      if (listNotNull) cached = new GraphQLNonNull(cached);
    }

    constraintTypeCache[symbolKey] = cached;
    return cached;
  }

  function applyConstraint(fieldConfig, directiveArgs) {
    const baseType = getScalarType(fieldConfig.type);
    const originalName = fieldConfig.astNode?.name?.value;
    fieldConfig.type = getConstraintType(originalName, baseType.type, baseType.config, directiveArgs.list, directiveArgs.listNotNull);
  }

  return schema => mapSchema(schema, {
    [MapperKind.FIELD_DEFINITION]: fieldConfig => {
      const directive = getDirective(schema, fieldConfig, 'constraint')?.[0];
      if (directive) {
        applyConstraint(fieldConfig, directive);
        return fieldConfig;
      }
    },
    [MapperKind.ARGUMENT]: argConfig => {
      const directive = getDirective(schema, argConfig, 'constraint')?.[0];
      if (directive) {
        applyConstraint(argConfig, directive);
        return argConfig;
      }
    }
  });
}

function constraintDirectiveDocumentation(options) {
  const constraintDescriptions = {
    min: 'Minimum value',
    max: 'Maximum value',
    minLength: 'Minimum length',
    maxLength: 'Maximum length',
    pattern: 'Regular expression pattern',
    contains: 'Must contain substring',
    notContains: 'Must not contain substring',
    startsWith: 'Must start with',
    endsWith: 'Must end with',
    format: 'Must match format',
    uniqueTypeName: 'Unique type name',
    list: 'List constraint',
    listNotNull: 'List not null constraint'
  };

  let header = '## Constraints\n\n';
  if (options?.header) header = options.header;

  let footer = '';
  if (options?.footer) footer = options.footer;

  function addDocumentation(type, config) {
    if (type.description) {
      if (type.description.includes(header)) return;
      type.description += '\n\n';
    } else {
      type.description = '';
    }

    type.description += header;
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'format' || key === 'uniqueTypeName') return;
      const description = constraintDescriptions[key] || key;
      type.description += `* ${description}: \`${value}\`\n`;
    });

    if (type.astNode?.description?.value) {
      type.astNode.description.value = type.description;
    }
  }

  return schema => mapSchema(schema, {
    [MapperKind.FIELD_DEFINITION]: fieldConfig => {
      if (fieldConfig?.astNode?.directives) {
        const directive = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode.directives);
        if (directive) {
          addDocumentation(fieldConfig, directive);
          return fieldConfig;
        }
      }
    },
    [MapperKind.ARGUMENT]: argConfig => {
      if (argConfig?.astNode?.directives) {
        const directive = getDirectiveValues(constraintDirectiveTypeDefsObj, argConfig.astNode.directives);
        if (directive) {
          addDocumentation(argConfig, directive);
          return argConfig;
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
          const operation = request.operationName ? separateOperations(document)[request.operationName] : document;
          const errors = validateQuery(schema, operation, request.variables, request.query, options);
          if (errors.length > 0) {
            throw errors.map(error => {
              const { UserInputError } = require('apollo-server-errors');
              return new UserInputError(error.message, {
                field: error.field,
                context: error.context
              });
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
      const errors = validateQuery(args.schema, args.document, args.variableValues, args.query, options);
      if (errors.length > 0) {
        setResultAndStopExecution({ errors: errors.map(error => new GraphQLError(error.message, {
          extensions: {
            code: error.code,
            field: error.field,
            context: error.context
          }
        })) });
      }
    }
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
  createQueryValidationRule
};
