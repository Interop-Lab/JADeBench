var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (moduleFactories, cachedModule) => function() {
    if (!cachedModule) {
        cachedModule = { exports: {} };
        moduleFactories[__getOwnPropNames(moduleFactories)[0]](cachedModule.exports, cachedModule);
    }
    return cachedModule.exports;
};
var require_error = __commonJS({
    '../work/confuser__graphql-constraint-directive/lib/error.js'(unused, module) {
        module.exports = class extends Error {
            constructor(fieldName, message, context) {
                super(message);
                this.name = this.constructor.name;
                Error.captureStackTrace(this, this.constructor);
                this.code = 'ERR_GRAPHQL_CONSTRAINT_VALIDATION';
                this.fieldName = fieldName;
                this.context = context;
                this.originalError = void 0;
            }
        };
    }
}), require_byte = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/byte.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isBase64: isBase64} = require('validator');
        module.exports = value => {
            if (isBase64(value)) {
                return !0;
            }
            throw new GraphQLError('Must be in byte format');
        };
    }
}), require_date = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/date.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isISO8601: isISO8601} = require('validator');
        module.exports = value => {
            if (isISO8601(value)) {
                return !0;
            }
            throw new GraphQLError('Must be a date in ISO 8601 format');
        };
    }
}), require_date_time = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isRFC3339: isRFC3339} = require('validator');
        module.exports = value => {
            if (isRFC3339(value)) {
                return !0;
            }
            throw new GraphQLError('Must be a date-time in RFC 3339 format');
        };
    }
}), require_email = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/email.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isEmail: isEmail} = require('validator');
        module.exports = value => {
            if (isEmail(value)) {
                return !0;
            }
            throw new GraphQLError('Must be in email format');
        };
    }
}), require_ipv4 = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isIP: isIP} = require('validator');
        module.exports = value => {
            if (isIP(value, 4)) {
                return !0;
            }
            throw new GraphQLError('Must be in IP v4 format');
        };
    }
}), require_ipv6 = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isIP: isIP} = require('validator');
        module.exports = value => {
            if (isIP(value, 6)) {
                return !0;
            }
            throw new GraphQLError('Must be in IP v6 format');
        };
    }
}), require_uri = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/uri.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isURL: isURL} = require('validator');
        module.exports = value => {
            if (isURL(value)) {
                return !0;
            }
            throw new GraphQLError('Must be in URI format');
        };
    }
}), require_uuid = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js'(unused, module) {
        var {GraphQLError: GraphQLError} = require('graphql/error'), {isUUID: isUUID} = require('validator');
        module.exports = value => {
            if (isUUID(value)) {
                return !0;
            }
            throw new GraphQLError('Must be in UUID format');
        };
    }
}), require_formats = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/formats/index.js'(unused, module) {
        var validateByte = require_byte(), validateDate = require_date(), validateDateTime = require_date_time(), validateEmail = require_email(), validateIPv4 = require_ipv4(), validateIPv6 = require_ipv6(), validateURI = require_uri(), validateUUID = require_uuid(), formats = {};
        formats.byte = validateByte, formats['date-time'] = validateDateTime, formats.date = validateDate, 
        formats.email = validateEmail, formats.ipv4 = validateIPv4, formats.ipv6 = validateIPv6, 
        formats.uri = validateURI, formats.uuid = validateUUID, module.exports = formats;
    }
}), require_string = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/string.js'(unused, module) {
        function constraintMessage(constraints, defaultMessage) {
            return constraints.errorMessage || defaultMessage;
        }
        function validateString(fieldName, constraints, value, options = {}) {
            if (constraints.minLength && !isLength(value, {
                min: constraints.minLength
            })) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be at least ' + constraints.minLength + ' characters in length'), [ {
                    arg: 'minLength',
                    value: constraints.minLength
                } ]);
            }
            if (constraints.maxLength && !isLength(value, {
                max: constraints.maxLength
            })) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be no more than ' + constraints.maxLength + ' characters in length'), [ {
                    arg: 'maxLength',
                    value: constraints.maxLength
                } ]);
            }
            if (constraints.startsWith && !value.startsWith(constraints.startsWith)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must start with ' + constraints.startsWith), [ {
                    arg: 'startsWith',
                    value: constraints.startsWith
                } ]);
            }
            if (constraints.endsWith && !value.endsWith(constraints.endsWith)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must end with ' + constraints.endsWith), [ {
                    arg: 'endsWith',
                    value: constraints.endsWith
                } ]);
            }
            if (constraints.contains && !contains(value, constraints.contains)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must contain ' + constraints.contains), [ {
                    arg: 'contains',
                    value: constraints.contains
                } ]);
            }
            if (constraints.notContains && contains(value, constraints.notContains)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must not contain ' + constraints.notContains), [ {
                    arg: 'notContains',
                    value: constraints.notContains
                } ]);
            }
            if (constraints.pattern && !RegExp(constraints.pattern).test(value)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must match ' + constraints.pattern), [ {
                    arg: 'pattern',
                    value: constraints.pattern
                } ]);
            }
            if (constraints.format) {
                const validateFormat = {
                    ...builtInFormats,
                    ...(options.pluginOptions || {}).formats || {}
                }[constraints.format];
                if (!validateFormat) {
                    throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Invalid format type ' + constraints.format), [ {
                        arg: 'format',
                        value: constraints.format
                    } ]);
                }
                try {
                    validateFormat(value, constraints);
                } catch (error) {
                    throw new ConstraintValidationError(fieldName, constraintMessage(constraints, error.message), [ {
                        arg: 'format',
                        value: constraints.format
                    } ]);
                }
            }
        }
        var {GraphQLScalarType: GraphQLScalarType} = require('graphql'), {contains: contains, isLength: isLength} = require('validator'), builtInFormats = require_formats(), ConstraintValidationError = require_error(), stringExports = {};
        stringExports.ConstraintStringType = class extends GraphQLScalarType {
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
                    parseLiteral(ast) {
                        const value = scalarType.parseLiteral(ast);
                        validateString(fieldName, constraints, value, options);
                        return value;
                    }
                });
            }
        }, stringExports.validate = validateString, module.exports = stringExports;
    }
}), require_number = __commonJS({
    '../work/confuser__graphql-constraint-directive/scalars/number.js'(unused, module) {
        function constraintMessage(constraints, defaultMessage) {
            return constraints.errorMessage || defaultMessage;
        }
        function validateNumber(fieldName, constraints, value) {
            if (void 0 !== constraints.min && constraints.min > value) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be at least ' + constraints.min), [ {
                    arg: 'min',
                    value: constraints.min
                } ]);
            }
            if (void 0 !== constraints.max && value > constraints.max) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be no greater than ' + constraints.max), [ {
                    arg: 'max',
                    value: constraints.max
                } ]);
            }
            if (void 0 !== constraints.exclusiveMin && constraints.exclusiveMin >= value) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be greater than ' + constraints.exclusiveMin), [ {
                    arg: 'exclusiveMin',
                    value: constraints.exclusiveMin
                } ]);
            }
            if (void 0 !== constraints.exclusiveMax && value >= constraints.exclusiveMax) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be less than ' + constraints.exclusiveMax), [ {
                    arg: 'exclusiveMax',
                    value: constraints.exclusiveMax
                } ]);
            }
            if (void 0 !== constraints.multipleOf && !1 === function(value, divisor) {
                const epsilon = 3 * Number.EPSILON;
                return epsilon > value % divisor || value % divisor > divisor - epsilon;
            }(value, constraints.multipleOf)) {
                throw new ConstraintValidationError(fieldName, constraintMessage(constraints, 'Must be a multiple of ' + constraints.multipleOf), [ {
                    arg: 'multipleOf',
                    value: constraints.multipleOf
                } ]);
            }
        }
        var {GraphQLScalarType: GraphQLScalarType} = require('graphql'), ConstraintValidationError = require_error(), numberExports = {};
        numberExports.ConstraintNumberType = class extends GraphQLScalarType {
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
                    parseLiteral(ast) {
                        const value = scalarType.parseLiteral(ast);
                        validateNumber(fieldName, constraints, value);
                        return value;
                    }
                });
            }
        }, numberExports.validate = validateNumber, module.exports = numberExports;
    }
}), require_type_utils = __commonJS({
    '../work/confuser__graphql-constraint-directive/lib/type-utils.js'(unused, module) {
        var {GraphQLFloat: GraphQLFloat, GraphQLInt: GraphQLInt, GraphQLString: GraphQLString, isNonNullType: isNonNullType, isScalarType: isScalarType, isListType: isListType, GraphQLID: GraphQLID} = require('graphql'), {ConstraintStringType: ConstraintStringType, validate: validateString} = require_string(), {ConstraintNumberType: ConstraintNumberType, validate: validateNumber} = require_number();
        module.exports = {
            getConstraintTypeObject: function(fieldName, scalarType, typeName, constraints) {
                if (scalarType === GraphQLString || scalarType === GraphQLID) {
                    return new ConstraintStringType(fieldName, typeName, scalarType, constraints);
                }
                if (scalarType === GraphQLFloat || scalarType === GraphQLInt) {
                    return new ConstraintNumberType(fieldName, typeName, scalarType, constraints);
                }
                throw Error('Not a valid scalar type: ' + scalarType);
            },
            getConstraintValidateFn: function(scalarType) {
                if (scalarType === GraphQLString || scalarType === GraphQLID) {
                    return validateString;
                }
                if (scalarType === GraphQLFloat || scalarType === GraphQLInt) {
                    return validateNumber;
                }
                throw Error('Not a valid scalar type: ' + scalarType);
            },
            getScalarType: function getScalarType(type) {
                if (isScalarType(type)) {
                    return { scalarType: type };
                }
                if (isListType(type)) {
                    return {
                        ...getScalarType(type.ofType),
                        list: !0
                    };
                }
                if (isNonNullType(type) && isScalarType(type.ofType)) {
                    return { scalarType: type.ofType, scalarNotNull: true };
                }
                if (isNonNullType(type)) {
                    return {
                        ...getScalarType(type.ofType),
                        list: !0,
                        listNotNull: !0
                    };
                }
                throw Error('Not a valid scalar type: ' + type);
            }
        };
    }
}), require_type_defs = __commonJS({
    '../work/confuser__graphql-constraint-directive/lib/type-defs.js'(unused, module) {
        var {GraphQLString: GraphQLString, GraphQLDirective: GraphQLDirective, DirectiveLocation: DirectiveLocation, GraphQLInt: GraphQLInt, GraphQLFloat: GraphQLFloat} = require('graphql');
        var directiveArgs = {
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
            uniqueTypeName: { type: GraphQLString }
        };
        var directiveConfig = {
            name: 'constraint',
            locations: [ DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION ],
            args: directiveArgs
        };
        var constraintDirectiveTypeDefsObj = new GraphQLDirective(directiveConfig), typeDefExports = {
            constraintDirectiveTypeDefs: '\n  directive @constraint(\n    # String constraints\n    minLength: Int\n    maxLength: Int\n    startsWith: String\n    endsWith: String\n    contains: String\n    notContains: String\n    pattern: String\n    format: String\n\n    # Number constraints\n    min: Float\n    max: Float\n    exclusiveMin: Float\n    exclusiveMax: Float\n    multipleOf: Float\n\n    # Array/List size constraints\n    minItems: Int\n    maxItems: Int\n\n    # Custom error message when validation fails\n    errorMessage: String\n\n    # Shared for Schema wrapper\n    uniqueTypeName: String\n\n  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION'
        };
        typeDefExports.constraintDirectiveTypeDefsObj = constraintDirectiveTypeDefsObj, module.exports = typeDefExports;
    }
}), require_query_validation_visitor = __commonJS({
    '../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js'(unused, module) {
        function validateScalarValue(context, fieldNode, fieldDefinition, fieldType, value, variableName, argumentName, fieldName, valuePath, options = {}) {
            {
                if (!fieldDefinition.astNode) {
                    return;
                }
                const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldDefinition.astNode);
                if (constraints) {
                    const scalarType = getScalarType(fieldType).scalarType, quote = scalarType === GraphQLString ? '"' : '';
                    try {
                        getConstraintValidateFn(scalarType)(fieldName, constraints, value, options);
                    } catch (error) {
                        {
                            const validationError = new ConstraintValidationError(fieldName, constraints.errorMessage || (variableName ? 'Variable "$' + variableName + '" got invalid value ' + quote + value + quote + valuePath + '. ' + error.message : 'Argument "' + argumentName + '" of "' + fieldNode.name.value + '" got invalid value ' + quote + value + quote + valuePath + '. ' + error.message), error.context);
                            validationError.originalError = error, context.reportError(validationError);
                        }
                    }
                }
            }
        }
        function validateInputObject(context, inputObjectType, argumentName, variableName, value, currentField, parentPath, options = {}) {
            {
                if (!inputObjectType.astNode) {
                    return;
                }
                const visitor = new InputObjectValidationVisitor(context, inputObjectType, argumentName, variableName, value, currentField, parentPath, options);
                visit(inputObjectType.astNode, visitor);
            }
        }
        function validateList(context, listType, fieldDefinition, value, currentField, argumentName, variableName, parentPath, options = {}) {
            if (!fieldDefinition.astNode) {
                return;
            }
            let itemType = listType.ofType;
            isNonNullType(itemType) && (itemType = itemType.ofType);
            const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldDefinition.astNode);
            let hasItemConstraints = !1;
            if (constraints) {
                let messagePrefix;
                messagePrefix = variableName ? 'Variable "$' + variableName + '" at "' + parentPath + '" ' : 'Argument "' + argumentName + '" of "' + currentField.name.value + '" ';
                const maxItemsMessage = messagePrefix + 'must be no more than ' + constraints.maxItems + ' in length';
                constraints.minItems && (!value || constraints.minItems > value.length) && context.reportError(new ConstraintValidationError(parentPath, constraints.errorMessage || messagePrefix + 'must be at least ' + constraints.minItems + ' in length', [ {
                    arg: 'minItems',
                    value: constraints.minItems
                } ])), constraints.maxItems && value && value.length > constraints.maxItems && context.reportError(new ConstraintValidationError(parentPath, constraints.errorMessage || maxItemsMessage, [ {
                    arg: 'maxItems',
                    value: constraints.maxItems
                } ]));
                for (const constraintName in constraints) {
                    if ('maxItems' !== constraintName && 'minItems' !== constraintName) {
                        hasItemConstraints = !0;
                        break;
                    }
                }
            }
            value && value.forEach(((item, index) => {
                {
                    if (null == item) {
                        return;
                    }
                    const itemPath = parentPath ? parentPath + '[' + index++ + ']' : '[' + index++ + ']';
                    isInputObjectType(itemType) ? validateInputObject(context, itemType, argumentName, variableName, item, currentField, itemPath, options) : hasItemConstraints && validateScalarValue(context, currentField, fieldDefinition, listType, item, variableName, argumentName, itemPath, ' at "' + itemPath + '"', options);
                }
            }));
        }
        var {getVariableValues: getVariableValues} = require('graphql/execution/values.js'), {GraphQLString: GraphQLString, Kind: Kind, getNamedType: getNamedType, isInputObjectType: isInputObjectType, isListType: isListType, isNonNullType: isNonNullType, BREAK: BREAK, valueFromAST: valueFromAST, typeFromAST: typeFromAST, visit: visit, getDirectiveValues: getDirectiveValues} = require('graphql'), ConstraintValidationError = require_error(), {getConstraintValidateFn: getConstraintValidateFn, getScalarType: getScalarType} = require_type_utils(), {constraintDirectiveTypeDefsObj: constraintDirectiveTypeDefsObj} = require_type_defs();
        module.exports = class {
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
            onOperationDefinitionEnter(operationNode) {
                {
                    if ('string' == typeof this.options.operationName && this.options.operationName !== operationNode.name.value) {
                        return;
                    }
                    let operationType;
                    switch (this.variableValues = getVariableValues(this.context.getSchema(), operationNode.variableDefinitions ? [ ...operationNode.variableDefinitions ] : [], this.options.variables ?? {}).coerced, 
                    operationNode.operation) {
                      case 'query':
                        operationType = this.context.getSchema().getQueryType();
                        break;

                      case 'mutation':
                        operationType = this.context.getSchema().getMutationType();
                        break;

                      case 'subscription':
                        operationType = this.context.getSchema().getSubscriptionType();
                        break;

                      default:
                        throw Error('Query validation could not be performed for operation of type ' + operationNode.operation);
                    }
                    var typeInfo = {};
                    typeInfo.typeDef = operationType, this.currentTypeInfo = typeInfo;
                }
            }
            onFragmentEnter(fragmentNode) {
                {
                    const fragmentType = typeFromAST(this.context.getSchema(), fragmentNode.typeCondition);
                    this.currentTypeInfo = {
                        parent: this.currentTypeInfo,
                        typeDef: fragmentType
                    };
                }
            }
            onFragmentLeave(unusedNode) {
                this.currentTypeInfo = this.currentTypeInfo.parent;
            }
            onFieldEnter(fieldNode) {
                if (this.currentField = fieldNode, this.currentTypeInfo?.typeDef?.getFields && (this.currentFieldDef = this.currentTypeInfo.typeDef.getFields()[fieldNode.name.value]), 
                !this.currentFieldDef) {
                    return BREAK;
                }
                {
                    const fieldType = getNamedType(this.currentFieldDef.type);
                    this.currentTypeInfo = {
                        parent: this.currentTypeInfo,
                        typeDef: fieldType
                    };
                }
            }
            onFieldLeave(unusedNode) {
                this.currentTypeInfo = this.currentTypeInfo.parent;
            }
            onArgumentEnter(argumentNode) {
                const argumentName = argumentNode.name.value, argumentDefinition = this.currentFieldDef?.args.find((argument => argument.name === argumentName));
                if (!argumentDefinition) {
                    return;
                }
                const value = valueFromAST(argumentNode.value, argumentDefinition.type, this.variableValues);
                let variableName;
                argumentNode.value.kind === Kind.VARIABLE && (variableName = argumentNode.value.name.value);
                let argumentType = argumentDefinition.type;
                if (isNonNullType(argumentType) && (argumentType = argumentType.ofType), isInputObjectType(argumentType)) {
                    if (!value) {
                        return;
                    }
                    const inputObjectType = getNamedType(argumentType);
                    validateInputObject(this.context, inputObjectType, argumentName, variableName, value, this.currentField, variableName, this.options);
                } else if (isListType(argumentType)) {
                    validateList(this.context, argumentType, argumentDefinition, value, this.currentField, argumentName, variableName, variableName, this.options);
                } else {
                    if (!value && '' !== value && 0 !== value) {
                        return;
                    }
                    validateScalarValue(this.context, this.currentField, argumentDefinition, argumentType, value, variableName, argumentName, variableName || this.currentField.name.value + '.' + argumentName, '', this.options);
                }
            }
        };
        var InputObjectValidationVisitor = class {
            constructor(context, inputObjectType, argumentName, variableName, value, currentField, parentPath, options = {}) {
                this.context = context;
                this.argName = argumentName;
                this.variableName = variableName;
                this.inputObjectValue = value;
                this.inputObjectTypeDef = inputObjectType;
                this.value = value;
                this.currentField = currentField;
                this.parentNames = parentPath;
                this.options = options;
                this.InputValueDefinition = {
                    enter: this.onInputValueDefinition
                };
            }
            onInputValueDefinition(inputValueNode) {
                const fieldName = inputValueNode.name.value, fieldDefinition = this.inputObjectTypeDef.getFields()[fieldName], fieldPath = this.parentNames ? this.parentNames + '.' + fieldName : fieldName, fieldValue = this.value[fieldName];
                let fieldTypeNode = inputValueNode.type;
                fieldTypeNode.kind === Kind.NON_NULL_TYPE && (fieldTypeNode = fieldTypeNode.type);
                const fieldType = typeFromAST(this.context.getSchema(), fieldTypeNode);
                if (isInputObjectType(fieldType)) {
                    if (!fieldValue) {
                        return;
                    }
                    validateInputObject(this.context, fieldType, this.argName, this.variableName, fieldValue, this.currentField, fieldPath, this.options);
                } else if (isListType(fieldType)) {
                    validateList(this.context, fieldType, fieldDefinition, fieldValue, this.currentField, this.argName, this.variableName, fieldPath, this.options);
                } else {
                    if (!fieldValue && '' !== fieldValue && 0 !== fieldValue) {
                        return;
                    }
                    validateScalarValue(this.context, this.currentField, fieldDefinition, fieldType, fieldValue, this.variableName, this.argName, fieldPath, ' at "' + fieldPath + '"', this.options);
                }
            }
        };
    }
}), require_validate_query = __commonJS({
    '../work/confuser__graphql-constraint-directive/lib/validate-query.js'(unused, module) {
        var {TypeInfo: TypeInfo, ValidationContext: ValidationContext, visit: visit, visitWithTypeInfo: visitWithTypeInfo} = require('graphql'), QueryValidationVisitor = require_query_validation_visitor();
        module.exports = {
            validateQuery: function(schema, document, variables, operationName, pluginOptions = {}) {
                const typeInfo = new TypeInfo(schema);
                const errors = [];
                const validationContext = new ValidationContext(schema, document, typeInfo, error => errors.push(error));
                const visitor = new QueryValidationVisitor(validationContext, {
                    variables,
                    operationName,
                    pluginOptions
                });
                visit(document, visitWithTypeInfo(typeInfo, visitor));
                return errors;
            }
        };
    }
}), {GraphQLNonNull: GraphQLNonNull, GraphQLList: GraphQLList, separateOperations: separateOperations, GraphQLError: GraphQLError, getDirectiveValues: getDirectiveValues} = require('graphql'), QueryValidationVisitor = require_query_validation_visitor(), {validateQuery: validateQuery} = require_validate_query(), {getDirective: getDirective, mapSchema: mapSchema, MapperKind: MapperKind} = require('@graphql-tools/utils'), {getConstraintTypeObject: getConstraintTypeObject, getScalarType: getScalarType} = require_type_utils(), {constraintDirectiveTypeDefs: constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj: constraintDirectiveTypeDefsObj} = require_type_defs(), exportsObject = {
    constraintDirective: function() {
        function applyConstraints(fieldConfig, constraints) {
            const typeInfo = getScalarType(fieldConfig.type);
            fieldConfig.type = function(fieldName, scalarType, scalarNotNull, constraints, isList, listNotNull) {
                let typeName;
                typeName = constraints.uniqueTypeName ? constraints.uniqueTypeName.replace(/\W/g, '') : fieldName + '_' + (isList ? 'List_' : '') + (listNotNull ? 'ListNotNull_' : '') + scalarType.name + '_' + (scalarNotNull ? 'NotNull_' : '') + Object.entries(constraints).filter((([name]) => 'errorMessage' !== name)).map((([name, value]) => 'min' === name || 'max' === name || 'exclusiveMin' === name || 'exclusiveMax' === name || 'multipleOf' === name ? name + '_' + ('' + value).replace(/\W/g, 'dot') : name + '_' + ('' + value).replace(/\W/g, ''))).join('_');
                const cacheKey = Symbol.for(typeName);
                let constraintType = typeCache[cacheKey];
                return constraintType || (constraintType = getConstraintTypeObject(fieldName, scalarType, typeName, constraints), 
                scalarNotNull && (constraintType = new GraphQLNonNull(constraintType)), isList && (constraintType = new GraphQLList(constraintType), 
                listNotNull) && (constraintType = new GraphQLNonNull(constraintType)), typeCache[cacheKey] = constraintType, 
                constraintType);
            }(fieldConfig.astNode.name.value, typeInfo.scalarType, typeInfo.scalarNotNull, constraints, typeInfo.list, typeInfo.listNotNull);
        }
        const typeCache = {};
        return schema => mapSchema(schema, {
            [MapperKind.FIELD]: fieldConfig => {
                const constraints = getDirective(schema, fieldConfig, 'constraint')?.[0];
                if (constraints) {
                    return applyConstraints(fieldConfig, constraints), fieldConfig;
                }
            },
            [MapperKind.ARGUMENT]: argumentConfig => {
                const constraints = getDirective(schema, argumentConfig, 'constraint')?.[0];
                if (constraints) {
                    return applyConstraints(argumentConfig, constraints), argumentConfig;
                }
            }
        });
    },
    constraintDirectiveDocumentation: function(options) {
        function addConstraintDocumentation(fieldConfig, constraints) {
            if (fieldConfig.description) {
                if (fieldConfig.description.includes(header)) {
                    return;
                }
                fieldConfig.description += '\n\n';
            } else {
                fieldConfig.description = '';
            }
            (fieldConfig.description += header + '\n', Object.entries(constraints).forEach((([name, value]) => {
                'uniqueTypeName' === name || 'errorMessage' === name || (fieldConfig.description += '* ' + (descriptions[name] ? descriptions[name] : name) + ': `' + value + '`\n');
            })), fieldConfig.astNode?.description) && (fieldConfig.astNode.description.value = fieldConfig.description);
        }
        let descriptions = {
            minLength: 'Minimal length',
            maxLength: 'Maximal length',
            startsWith: 'Starts with',
            endsWith: 'Ends with',
            contains: 'Contains',
            notContains: 'Doesn\'t contain',
            pattern: 'Must match RegEx pattern',
            format: 'Must match format',
            min: 'Minimal value',
            max: 'Maximal value',
            exclusiveMin: 'Grater than',
            exclusiveMax: 'Less than',
            multipleOf: 'Must be a multiple of',
            minItems: 'Minimal number of items',
            maxItems: 'Maximal number of items'
        };
        options?.descriptionsMap && (descriptions = options.descriptionsMap);
        let header = '*Constraints:*';
        return options?.header && (header = options.header), schema => mapSchema(schema, {
            [MapperKind.FIELD]: fieldConfig => {
                if (fieldConfig?.astNode) {
                    const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode);
                    if (constraints) {
                        return addConstraintDocumentation(fieldConfig, constraints), fieldConfig;
                    }
                }
            },
            [MapperKind.ARGUMENT]: argumentConfig => {
                if (argumentConfig?.astNode) {
                    const constraints = getDirectiveValues(constraintDirectiveTypeDefsObj, argumentConfig.astNode);
                    if (constraints) {
                        return addConstraintDocumentation(argumentConfig, constraints), argumentConfig;
                    }
                }
            }
        });
    }
};

exportsObject.constraintDirectiveTypeDefs = constraintDirectiveTypeDefs, exportsObject.validateQuery = validateQuery, 
exportsObject.createApolloQueryValidationPlugin = function({schema: schema}, pluginOptions = {}) {
    return {
        requestDidStart: async () => ({
            async didResolveOperation({request: request, document: document}) {
                {
                    const operationDocument = request.operationName ? separateOperations(document)[request.operationName] : document, errors = validateQuery(schema, operationDocument, request.variables, request.operationName, pluginOptions);
                    if (errors.length > 0) {
                        throw errors.map((error => {
                            {
                                const {UserInputError: UserInputError} = require('apollo-server-errors');
                                return new UserInputError(error.message, {
                                    field: error.fieldName,
                                    context: error.context
                                });
                            }
                        }));
                    }
                }
            }
        })
    };
}, exportsObject.createEnvelopQueryValidationPlugin = function(pluginOptions = {}) {
    return {
        onExecute({args: args, setResultAndStopExecution: setResultAndStopExecution}) {
            const errors = validateQuery(args.schema, args.document, args.variableValues, args.operationName, pluginOptions);
            errors.length > 0 && setResultAndStopExecution({
                errors: errors.map((error => new GraphQLError(error.message, {
                    extensions: {
                        code: error.code,
                        field: error.fieldName,
                        context: error.context
                    }
                })))
            });
        }
    };
}, exportsObject.createQueryValidationRule = function(options) {
    return context => new QueryValidationVisitor(context, options);
}, module.exports = exportsObject;
