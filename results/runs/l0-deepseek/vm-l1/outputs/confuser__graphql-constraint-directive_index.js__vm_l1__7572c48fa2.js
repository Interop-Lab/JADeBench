const constraintDirective = /* @__PURE__ */ new GraphQLDirective({
  name: 'constraint',
  description: 'Define constraints for a field',
  args: {
    minLength: { type: GraphQLInt, description: 'Minimum length of a string' },
    maxLength: { type: GraphQLInt, description: 'Maximum length of a string' },
    startsWith: { type: GraphQLString, description: 'String must start with this value' },
    endsWith: { type: GraphQLString, description: 'String must end with this value' },
    contains: { type: GraphQLString, description: 'String must contain this value' },
    notContains: { type: GraphQLString, description: 'String must not contain this value' },
    pattern: { type: GraphQLString, description: 'String must match this regular expression' },
    format: { type: GraphQLString, description: 'String must match this format' },
    min: { type: GraphQLFloat, description: 'Minimum value' },
    max: { type: GraphQLFloat, description: 'Maximum value' },
    exclusiveMin: { type: GraphQLFloat, description: 'Exclusive minimum value' },
    exclusiveMax: { type: GraphQLFloat, description: 'Exclusive maximum value' },
    multipleOf: { type: GraphQLFloat, description: 'Value must be a multiple of this value' },
    uniqueTypeName: { type: GraphQLString, description: 'Unique type name' }
  },
  locations: [
    'FIELD_DEFINITION',
    'ARGUMENT_DEFINITION',
    'INPUT_FIELD_DEFINITION'
  ]
});

const constraintDirectiveDocumentation = `
Directive @constraint(
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
  uniqueTypeName: String
) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
`;

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
  uniqueTypeName: String
) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
`;

const constraintDirectiveTypeDefsObj = {
  kind: 'Document',
  definitions: [
    {
      kind: 'DirectiveDefinition',
      name: { kind: 'Name', value: 'constraint' },
      arguments: [
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'minLength' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'maxLength' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'startsWith' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'endsWith' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'contains' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'notContains' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'pattern' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'format' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'min' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'max' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'exclusiveMin' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'exclusiveMax' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'multipleOf' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        { kind: 'InputValueDefinition', name: { kind: 'Name', value: 'uniqueTypeName' }, type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } }
      ],
      repeatable: false,
      locations: [
        { kind: 'Name', value: 'FIELD_DEFINITION' },
        { kind: 'Name', value: 'ARGUMENT_DEFINITION' },
        { kind: 'Name', value: 'INPUT_FIELD_DEFINITION' }
      ]
    }
  ]
};

const formats = {
  byte: /^(?:[0-9a-fA-F]{2})+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})$|^:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)$/,
  uri: /^(?:[a-z][a-z0-9+.-]*):(?:\/\/(?:(?:[a-z0-9._~!$&'()*+,;=:-]|%[0-9a-f]{2})*@)?(?:\[[0-9a-f:.]+\]|[a-z0-9._~!$&'()*+,;=:-]|%[0-9a-f]{2})*(?::\d*)?(?:\/(?:[a-z0-9._~!$&'()*+,;=:@/]|%[0-9a-f]{2})*)?|\/(?:[a-z0-9._~!$&'()*+,;=:@/]|%[0-9a-f]{2})*(?:\?(?:[a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?)$/i,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

const getConstraintTypeObject = (type) => {
  if (type instanceof GraphQLNonNull) {
    return getConstraintTypeObject(type.ofType);
  }
  if (type instanceof GraphQLList) {
    return getConstraintTypeObject(type.ofType);
  }
  return type;
};

const getScalarType = (type) => {
  const constraintType = getConstraintTypeObject(type);
  if (constraintType && constraintType.name) {
    return constraintType.name;
  }
  return undefined;
};

const validateQuery = (context) => {
  const visitor = new QueryValidationVisitor(context);
  return {
    enter: visitor.enter.bind(visitor),
    leave: visitor.leave.bind(visitor)
  };
};

class QueryValidationVisitor {
  constructor(context) {
    this.context = context;
    this.variableDefinitions = new Map();
    this.fragments = new Map();
  }

  enter(node) {
    if (node.kind === 'VariableDefinition') {
      this.variableDefinitions.set(node.variable.name.value, node);
    }
    if (node.kind === 'FragmentDefinition') {
      this.fragments.set(node.name.value, node);
    }
    if (node.kind === 'Field') {
      this.validateField(node);
    }
    if (node.kind === 'Argument') {
      this.validateArgument(node);
    }
  }

  leave() {}

  validateField(node) {
    const fieldDef = this.context.getFieldDef();
    if (!fieldDef) return;
    this.validateDirectives(fieldDef.astNode, node);
  }

  validateArgument(node) {
    const argDef = this.context.getArgument();
    if (!argDef) return;
    this.validateDirectives(argDef.astNode, node);
  }

  validateDirectives(astNode, node) {
    if (!astNode || !astNode.directives) return;
    const constraintDirectiveNode = astNode.directives.find(
      (directive) => directive.name.value === 'constraint'
    );
    if (!constraintDirectiveNode) return;
    const args = getDirectiveValues(
      constraintDirective,
      { directives: [constraintDirectiveNode] },
      this.context.getVariableValues()
    );
    if (!args) return;
    this.validateConstraints(args, node);
  }

  validateConstraints(args, node) {
    const value = this.context.getArgumentValue(node);
    if (value === undefined || value === null) return;
    if (args.minLength !== undefined && typeof value === 'string' && value.length < args.minLength) {
      this.reportError(node, `Must be at least ${args.minLength} characters long`);
    }
    if (args.maxLength !== undefined && typeof value === 'string' && value.length > args.maxLength) {
      this.reportError(node, `Must be at most ${args.maxLength} characters long`);
    }
    if (args.startsWith !== undefined && typeof value === 'string' && !value.startsWith(args.startsWith)) {
      this.reportError(node, `Must start with "${args.startsWith}"`);
    }
    if (args.endsWith !== undefined && typeof value === 'string' && !value.endsWith(args.endsWith)) {
      this.reportError(node, `Must end with "${args.endsWith}"`);
    }
    if (args.contains !== undefined && typeof value === 'string' && !value.includes(args.contains)) {
      this.reportError(node, `Must contain "${args.contains}"`);
    }
    if (args.notContains !== undefined && typeof value === 'string' && value.includes(args.notContains)) {
      this.reportError(node, `Must not contain "${args.notContains}"`);
    }
    if (args.pattern !== undefined && typeof value === 'string' && !new RegExp(args.pattern).test(value)) {
      this.reportError(node, `Must match pattern "${args.pattern}"`);
    }
    if (args.format !== undefined && typeof value === 'string' && formats[args.format] && !formats[args.format].test(value)) {
      this.reportError(node, `Must be a valid ${args.format}`);
    }
    if (args.min !== undefined && typeof value === 'number' && value < args.min) {
      this.reportError(node, `Must be at least ${args.min}`);
    }
    if (args.max !== undefined && typeof value === 'number' && value > args.max) {
      this.reportError(node, `Must be at most ${args.max}`);
    }
    if (args.exclusiveMin !== undefined && typeof value === 'number' && value <= args.exclusiveMin) {
      this.reportError(node, `Must be greater than ${args.exclusiveMin}`);
    }
    if (args.exclusiveMax !== undefined && typeof value === 'number' && value >= args.exclusiveMax) {
      this.reportError(node, `Must be less than ${args.exclusiveMax}`);
    }
    if (args.multipleOf !== undefined && typeof value === 'number' && value % args.multipleOf !== 0) {
      this.reportError(node, `Must be a multiple of ${args.multipleOf}`);
    }
  }

  reportError(node, message) {
    this.context.reportError(new GraphQLError(message, node));
  }
}

const createQueryValidationRule = (options) => {
  return (context) => {
    return validateQuery(context);
  };
};

const createEnvelopQueryValidationPlugin = () => {
  return {
    onValidate: ({ context }) => {
      return {
        onOperation: ({ operation }) => {
          const errors = [];
          const visitor = new QueryValidationVisitor({
            getFieldDef: () => undefined,
            getArgument: () => undefined,
            getArgumentValue: () => undefined,
            getVariableValues: () => ({}),
            reportError: (error) => errors.push(error)
          });
          visit(operation, {
            enter: visitor.enter.bind(visitor),
            leave: visitor.leave.bind(visitor)
          });
          return errors;
        }
      };
    }
  };
};

const createApolloQueryValidationPlugin = (options) => {
  return {
    requestDidStart() {
      return {
        validationDidStart({ context }) {
          return {
            validationRules: [createQueryValidationRule(options)]
          };
        }
      };
    }
  };
};

module.exports = {
  constraintDirective,
  constraintDirectiveDocumentation,
  constraintDirectiveTypeDefs,
  validateQuery,
  createApolloQueryValidationPlugin,
  createEnvelopQueryValidationPlugin,
  createQueryValidationRule
};
