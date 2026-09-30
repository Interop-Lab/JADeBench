var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, module) => function() {
  var exports = {};
  var m = {};
  m.exports = {};
  if (!module) {
    module = {};
    cb(__getOwnPropNames(cb), module);
  }
  return module.exports;
};

var require_error = __commonJS({'../work/confuser__graphql-constraint-directive/lib/error.js'(_0x264129, _0x199fb4) {
  _0x199fb4.exports = class ValidationError extends Error {
    constructor(_0x1a058b, _0x387ea5, _0x4d1989) {
      super(_0x387ea5);
      this.name = 'ValidationError';
      this.context = void 0;
      this.argName = _0x1a058b;
      this.context = _0x4d1989;
      Error.captureStackTrace(this, this.constructor);
      this.message = this.constructor.name;
    }
  };
}});

var require_byte = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/byte.js'(_0x3f2e56, _0x350da1) {
  var { GraphQLError: _0x3c9d3c } = require('graphql');
  var { isBase64: _0x1090e2 } = require('validator');
  _0x350da1.exports = _0x1238cb => {
    if (_0x1090e2(_0x1238cb)) return true;
    throw new _0x3c9d3c('Must be in Base64 format');
  };
}});

var require_date = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/date.js'(_0x22a0b5, _0x2c14b7) {
  var { GraphQLError: _0x40b648 } = require('graphql');
  var { isISO8601: _0xa9b0be } = require('validator');
  _0x2c14b7.exports = _0x3887ae => {
    if (_0xa9b0be(_0x3887ae)) return true;
    throw new _0x40b648('Must be in ISO8601 date format');
  };
}});

var require_date_time = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js'(_0x202ece, _0x3d99d9) {
  var { GraphQLError: _0x1c1aa9 } = require('graphql');
  var { isRFC3339: _0x168fda } = require('validator');
  _0x3d99d9.exports = _0x4cf3ae => {
    if (_0x168fda(_0x4cf3ae)) return true;
    throw new _0x1c1aa9('Must be in RFC3339 date-time format');
  };
}});

var require_email = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/email.js'(_0x126ff6, _0x5dfd25) {
  var { GraphQLError: _0x5f0fef } = require('graphql');
  var { isEmail: _0x3f34fa } = require('validator');
  _0x5dfd25.exports = _0x7e27be => {
    if (_0x3f34fa(_0x7e27be)) return true;
    throw new _0x5f0fef('Must be in email format');
  };
}});

var require_ipv4 = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js'(_0x350ce2, _0x9bdf7a) {
  var { GraphQLError: _0xd753bf } = require('graphql');
  var { isIP: _0xa7b63b } = require('validator');
  _0x9bdf7a.exports = _0x5f3b5d => {
    if (_0xa7b63b(_0x5f3b5d, 4)) return true;
    throw new _0xd753bf('Must be in IPv4 format');
  };
}});

var require_ipv6 = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js'(_0x2cc422, _0x5010d0) {
  var { GraphQLError: _0x4f0549 } = require('graphql');
  var { isIP: _0x5a733a } = require('validator');
  _0x5010d0.exports = _0x491a92 => {
    if (_0x5a733a(_0x491a92, 6)) return true;
    throw new _0x4f0549('Must be in IPv6 format');
  };
}});

var require_uri = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/uri.js'(_0x8eceb4, _0x512ffc) {
  var { GraphQLError: _0x44d7ab } = require('graphql');
  var { isURL: _0x4fcb19 } = require('validator');
  _0x512ffc.exports = _0x158195 => {
    if (_0x4fcb19(_0x158195)) return true;
    throw new _0x44d7ab('Must be in URI format');
  };
}});

var require_uuid = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js'(_0x36f47a, _0x4d2747) {
  var { GraphQLError: _0x305ece } = require('graphql');
  var { isUUID: _0x1852e9 } = require('validator');
  _0x4d2747.exports = _0x1ab6e5 => {
    if (_0x1852e9(_0x1ab6e5)) return true;
    throw new _0x305ece('Must be in UUID format');
  };
}});

var require_formats = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/formats/index.js'(_0x97d8fa, _0x40993e) {
  var _0x905ad2 = require_byte();
  var _0x19fab0 = require_date_time();
  var _0x97451 = require_date();
  var _0x2cc36c = require_email();
  var _0x55a266 = require_ipv4();
  var _0x25e444 = require_ipv6();
  var _0x421720 = require_uri();
  var _0x2077af = require_uuid();
  var _0x25b208 = {};
  _0x25b208.byte = _0x905ad2;
  _0x25b208['date-time'] = _0x19fab0;
  _0x25b208.date = _0x97451;
  _0x25b208.email = _0x2cc36c;
  _0x25b208.ipv4 = _0x55a266;
  _0x25b208.ipv6 = _0x25e444;
  _0x25b208.uri = _0x421720;
  _0x25b208.uuid = _0x2077af;
  _0x40993e.exports = _0x25b208;
}});

var require_string = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/string.js'(_0x2655f9, _0x3d9793) {
  var { GraphQLScalarType: _0xec8a33 } = require('graphql');
  var { contains: _0x3b7f65, isLength: _0x55deb3 } = require('validator');
  var _0x1c39c1 = require_formats();
  var _0x313517 = require_error();

  var _0x164da4 = class extends _0xec8a33 {
    constructor(_0x53be40, _0x23761d, _0x3be5fe, _0x365b6e, _0x4af604 = {}) {
      super({
        name: _0x23761d,
        serialize(_0x480d30) {
          _0x480d30 = _0x3be5fe.serialize(_0x480d30);
          _0x1969bf(_0x53be40, _0x365b6e, _0x480d30, _0x4af604);
          return _0x480d30;
        },
        parseValue(_0x55cd37) {
          _0x55cd37 = _0x3be5fe.parseValue(_0x55cd37);
          _0x1969bf(_0x53be40, _0x365b6e, _0x55cd37, _0x4af604);
          return _0x3be5fe.parseValue(_0x55cd37);
        },
        parseLiteral(_0x359dac) {
          const _0x40057f = _0x3be5fe.parseLiteral(_0x359dac);
          _0x1969bf(_0x53be40, _0x365b6e, _0x40057f, _0x4af604);
          return _0x40057f;
        }
      });
    }
  };

  function _0x3cfbf9(_0x4ebcf7, _0x3bfeba) {
    return _0x4ebcf7.errorMessage || _0x3bfeba;
  }

  function _0x1969bf(_0x230277, _0x83a2bf, _0x2db66d, _0x232568 = {}) {
    if (_0x83a2bf.minLength && !_0x55deb3(_0x2db66d, { min: _0x83a2bf.minLength })) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must be at least ' + _0x83a2bf.minLength + ' characters in length'), [{ arg: 'minLength', value: _0x83a2bf.minLength }]);
    }
    if (_0x83a2bf.maxLength && !_0x55deb3(_0x2db66d, { max: _0x83a2bf.maxLength })) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must be no more than ' + _0x83a2bf.maxLength + ' characters in length'), [{ arg: 'maxLength', value: _0x83a2bf.maxLength }]);
    }
    if (_0x83a2bf.startsWith && !_0x2db66d.startsWith(_0x83a2bf.startsWith)) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must start with ' + _0x83a2bf.startsWith), [{ arg: 'startsWith', value: _0x83a2bf.startsWith }]);
    }
    if (_0x83a2bf.endsWith && !_0x2db66d.endsWith(_0x83a2bf.endsWith)) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must end with ' + _0x83a2bf.endsWith), [{ arg: 'endsWith', value: _0x83a2bf.endsWith }]);
    }
    if (_0x83a2bf.contains && !_0x3b7f65(_0x2db66d, _0x83a2bf.contains)) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must contain ' + _0x83a2bf.contains), [{ arg: 'contains', value: _0x83a2bf.contains }]);
    }
    if (_0x83a2bf.notContains && _0x3b7f65(_0x2db66d, _0x83a2bf.notContains)) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must not contain ' + _0x83a2bf.notContains), [{ arg: 'notContains', value: _0x83a2bf.notContains }]);
    }
    if (_0x83a2bf.pattern && !new RegExp(_0x83a2bf.pattern).test(_0x2db66d)) {
      throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Must match pattern ' + _0x83a2bf.pattern), [{ arg: 'pattern', value: _0x83a2bf.pattern }]);
    }
    if (_0x83a2bf.format) {
      const _0xf678d2 = _0x232568.formats || {};
      var _0x103189 = { ..._0x1c39c1, ..._0xf678d2.formats || {} };
      const _0x530d76 = _0x103189;
      const _0xeadfaa = _0x530d76[_0x83a2bf.format];
      if (!_0xeadfaa) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, 'Invalid format ' + _0x83a2bf.format), [{ arg: 'format', value: _0x83a2bf.format }]);
      }
      try {
        _0xeadfaa(_0x2db66d, _0x83a2bf);
      } catch (_0x706876) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, _0x706876.message), [{ arg: 'format', value: _0x83a2bf.format }]);
      }
    }
  }

  var _0x2430c1 = {};
  _0x2430c1.ConstraintStringType = _0x164da4;
  _0x2430c1.validate = _0x1969bf;
  _0x3d9793.exports = _0x2430c1;
}});

var require_number = __commonJS({'../work/confuser__graphql-constraint-directive/scalars/number.js'(_0x2e756e, _0x41a202) {
  var { GraphQLScalarType: _0x156d93 } = require('graphql');
  var _0x22e830 = require_error();

  var _0x25d9a3 = class extends _0x156d93 {
    constructor(_0x28df5c, _0x31b822, _0x45a862, _0x1510fb) {
      super({
        name: _0x31b822,
        serialize(_0x1e62b9) {
          _0x1e62b9 = _0x45a862.serialize(_0x1e62b9);
          _0x565b53(_0x28df5c, _0x1510fb, _0x1e62b9);
          return _0x1e62b9;
        },
        parseValue(_0x5a23d2) {
          _0x5a23d2 = _0x45a862.parseValue(_0x5a23d2);
          _0x565b53(_0x28df5c, _0x1510fb, _0x5a23d2);
          return _0x45a862.parseValue(_0x5a23d2);
        },
        parseLiteral(_0x2f8788) {
          const _0xc6a14f = _0x45a862.parseLiteral(_0x2f8788);
          _0x565b53(_0x28df5c, _0x1510fb, _0xc6a14f);
          return _0xc6a14f;
        }
      });
    }
  };

  function _0x41fe06(_0x1ecdf8, _0x3d0abe) {
    const _0x11396d = Number.MAX_SAFE_INTEGER;
    return _0x1ecdf8 * _0x3d0abe <= _0x11396d || _0x1ecdf8 * _0x3d0abe >= -_0x11396d;
  }

  function _0x241640(_0x22fda7, _0x176e31) {
    return _0x22fda7.errorMessage || _0x176e31;
  }

  function _0x565b53(_0x128bdc, _0x192669, _0x4af403) {
    if (_0x192669.min !== undefined && _0x4af403 < _0x192669.min) {
      throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, 'Must be at least ' + _0x192669.min), [{ arg: 'min', value: _0x192669.min }]);
    }
    if (_0x192669.max !== undefined && _0x4af403 > _0x192669.max) {
      throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, 'Must be no greater than ' + _0x192669.max), [{ arg: 'max', value: _0x192669.max }]);
    }
    if (_0x192669.exclusiveMin !== undefined && _0x4af403 <= _0x192669.exclusiveMin) {
      throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, 'Must be greater than ' + _0x192669.exclusiveMin), [{ arg: 'exclusiveMin', value: _0x192669.exclusiveMin }]);
    }
    if (_0x192669.exclusiveMax !== undefined && _0x4af403 >= _0x192669.exclusiveMax) {
      throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, 'Must be less than ' + _0x192669.exclusiveMax), [{ arg: 'exclusiveMax', value: _0x192669.exclusiveMax }]);
    }
    if (_0x192669.multipleOf !== undefined && !_0x41fe06(_0x4af403, _0x192669.multipleOf)) {
      throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, 'Must be a multiple of ' + _0x192669.multipleOf), [{ arg: 'multipleOf', value: _0x192669.multipleOf }]);
    }
  }

  var _0x3fc2b3 = {};
  _0x3fc2b3.ConstraintNumberType = _0x25d9a3;
  _0x3fc2b3.validate = _0x565b53;
  _0x41a202.exports = _0x3fc2b3;
}});

var require_type_utils = __commonJS({'../work/confuser__graphql-constraint-directive/lib/type-utils.js'(_0x187b39, _0x81dce) {
  var { GraphQLFloat, GraphQLInt, GraphQLString, isNonNullType, isScalarType, isListType, GraphQLID } = require('graphql');
  var { ConstraintStringType, validate: _0x4b4c13 } = require_string();
  var { ConstraintNumberType, validate: _0x44dee9 } = require_number();

  function getConstraintTypeObject(_0x475cfd, _0x547522, _0x5b2505, _0x58c33c) {
    if (_0x547522 === GraphQLString || _0x547522 === GraphQLID) {
      return new ConstraintStringType(_0x475cfd, _0x5b2505, _0x547522, _0x58c33c);
    } else {
      if (_0x547522 === GraphQLFloat || _0x547522 === GraphQLInt) {
        return new ConstraintNumberType(_0x475cfd, _0x5b2505, _0x547522, _0x58c33c);
      } else {
        throw new Error('Type ' + _0x547522.name + ' is not supported by constraint directive');
      }
    }
  }

  function getScalarType(_0x3ddd99) {
    if (_0x3ddd99 === GraphQLString || _0x3ddd99 === GraphQLID) {
      return _0x4b4c13;
    } else {
      if (_0x3ddd99 === GraphQLFloat || _0x3ddd99 === GraphQLInt) {
        return _0x44dee9;
      } else {
        throw new Error('Type ' + _0x3ddd99.name + ' is not supported by constraint directive');
      }
    }
  }

  function getConstraintTypeMetadata(_0x568012) {
    if (isScalarType(_0x568012)) {
      var _0x40fc75 = {};
      _0x40fc75.type = _0x568012;
      return _0x40fc75;
    } else {
      if (isListType(_0x568012)) {
        return { ...getConstraintTypeMetadata(_0x568012.ofType), list: true };
      } else {
        if (isNonNullType(_0x568012) && isScalarType(_0x568012.ofType)) {
          var _0x36bd81 = {};
          _0x36bd81.type = _0x568012.ofType;
          _0x36bd81.notNull = true;
          return _0x36bd81;
        } else {
          if (isNonNullType(_0x568012)) {
            return { ...getConstraintTypeMetadata(_0x568012.ofType), list: true, listNotNull: true };
          } else {
            throw new Error('Type ' + _0x568012.name + ' is not supported by constraint directive');
          }
        }
      }
    }
  }

  var _0x250543 = {};
  _0x250543.getConstraintTypeObject = getConstraintTypeObject;
  _0x250543.getScalarType = getScalarType;
  _0x250543.getConstraintTypeMetadata = getConstraintTypeMetadata;
  _0x81dce.exports = _0x250543;
}});

var require_type_defs = __commonJS({'../work/confuser__graphql-constraint-directive/lib/type-defs.js'(_0x513b11, _0x427880) {
  var { GraphQLString, GraphQLDirective, DirectiveLocation, GraphQLInt, GraphQLFloat } = require('graphql');

  var constraintDirectiveTypeDefs = 'directive @constraint(minLength: Int, maxLength: Int, startsWith: String, endsWith: String, contains: String, notContains: String, pattern: String, format: String, min: Float, max: Float, exclusiveMin: Float, exclusiveMax: Float, multipleOf: Float, minItems: Int, maxItems: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION';

  var _0xc1aaa1 = {};
  _0xc1aaa1.minLength = GraphQLInt;
  var _0x1e2746 = {};
  _0x1e2746.maxLength = GraphQLInt;
  var _0x98db03 = {};
  _0x98db03.startsWith = GraphQLString;
  var _0x2a22fc = {};
  _0x2a22fc.endsWith = GraphQLString;
  var _0x2e0d0f = {};
  _0x2e0d0f.contains = GraphQLString;
  var _0x3022e8 = {};
  _0x3022e8.notContains = GraphQLString;
  var _0x39e2bf = {};
  _0x39e2bf.pattern = GraphQLString;
  var _0x1adfa7 = {};
  _0x1adfa7.format = GraphQLString;
  var _0x35de94 = {};
  _0x35de94.min = GraphQLFloat;
  var _0x455a5b = {};
  _0x455a5b.max = GraphQLFloat;
  var _0x95b32c = {};
  _0x95b32c.exclusiveMin = GraphQLFloat;
  var _0x299d88 = {};
  _0x299d88.exclusiveMax = GraphQLFloat;
  var _0x5f2cf5 = {};
  _0x5f2cf5.multipleOf = GraphQLFloat;
  var _0x419db2 = {};
  _0x419db2.minItems = GraphQLInt;
  var _0x392380 = {};
  _0x392380.maxItems = GraphQLInt;

  var _0x1578ae = {};
  _0x1578ae.minLength = _0xc1aaa1;
  _0x1578ae.maxLength = _0x1e2746;
  _0x1578ae.startsWith = _0x98db03;
  _0x1578ae.endsWith = _0x2a22fc;
  _0x1578ae.contains = _0x2e0d0f;
  _0x1578ae.notContains = _0x3022e8;
  _0x1578ae.pattern = _0x39e2bf;
  _0x1578ae.format = _0x1adfa7;
  _0x1578ae.min = _0x35de94;
  _0x1578ae.max = _0x455a5b;
  _0x1578ae.exclusiveMin = _0x95b32c;
  _0x1578ae.exclusiveMax = _0x299d88;
  _0x1578ae.multipleOf = _0x5f2cf5;
  _0x1578ae.minItems = _0x419db2;
  _0x1578ae.maxItems = _0x392380;

  var _0x3fb2c4 = {};
  _0x3fb2c4.name = 'constraint';
  _0x3fb2c4.locations = [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION];
  _0x3fb2c4.args = _0x1578ae;

  var _0x515b3d = new GraphQLDirective(_0x3fb2c4);

  var _0x217f75 = {};
  _0x217f75.constraintDirectiveTypeDefs = constraintDirectiveTypeDefs;
  _0x217f75.constraintDirectiveTypeDefsObj = _0x515b3d;
  _0x427880.exports = _0x217f75;
}});

var require_query_validation_visitor = __commonJS({'../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js'(_0x2c03c5, _0xdf2ce8) {
  var { getVariableValues } = require('graphql');
  var { GraphQLString, Kind, getNamedType, isInputObjectType, isListType, isNonNullType, BREAK, valueFromAST, typeFromAST, visit, getDirectiveValues } = require('graphql');
  var _0x23dbb1 = require_error();
  var { getConstraintValidateFn: _0x25ddc6, getScalarType: _0x5a5781 } = require_type_utils();
  var { constraintDirectiveTypeDefsObj: _0x1be394 } = require_type_defs();

  _0xdf2ce8.exports = class QueryValidationVisitor {
    constructor(_0x5a44d9, _0x42f305) {
      this.context = _0x5a44d9;
      this.options = _0x42f305;
      this.variableValues = {};
      this.fieldStack = [];
      this.directiveStack = [];
      this.typeStack = [];
      this.OperationDefinition = {
        enter: this.onOperationDefinitionEnter,
        leave: this.onOperationDefinitionLeave
      };
      this.FragmentDefinition = {
        enter: this.onFragmentDefinitionEnter
      };
      this.Field = {
        enter: this.onFieldEnter,
        leave: this.onFieldLeave
      };
      this.Argument = {
        enter: this.onArgumentEnter,
        leave: this.onArgumentLeave
      };
      this.ObjectField = {
        enter: this.onObjectFieldEnter
      };
      this.ListValue = {
        enter: this.onListValueEnter
      };
    }

    onOperationDefinitionEnter(_0x188df1) {
      if (typeof this.context.getVariableValues === 'function' && this.context.getVariableValues !== _0x188df1.operation) {
        return;
      }
      this.variableValues = getVariableValues(this.context.getSchema(), _0x188df1.variableDefinitions ? [..._0x188df1.variableDefinitions] : [], this.options.variables ?? {}).coerced;
      let _0xee0ea1;
      switch (_0x188df1.operation) {
        case 'query':
          _0xee0ea1 = this.context.getSchema().getQueryType();
          break;
        case 'mutation':
          _0xee0ea1 = this.context.getSchema().getMutationType();
          break;
        case 'subscription':
          _0xee0ea1 = this.context.getSchema().getSubscriptionType();
          break;
        default:
          throw new Error('Unknown operation type: ' + _0x188df1.operation);
      }
      var _0x45220b = {};
      _0x45220b.typeDef = _0xee0ea1;
      this.typeStack = [_0x45220b];
    }

    onFragmentDefinitionEnter(_0x16935c) {
      const _0x12c517 = typeFromAST(this.context.getSchema(), _0x16935c.typeCondition);
      this.typeStack = {
        parent: this.typeStack,
        typeDef: _0x12c517
      };
    }

    onOperationDefinitionLeave() {
      this.typeStack = this.typeStack.parent;
    }

    onFieldEnter(_0x1844b5) {
      this.fieldStack = _0x1844b5;
      if (this.typeStack?.parent?.typeDef) {
        this.typeStack = {
          parent: this.typeStack,
          typeDef: this.typeStack.parent.typeDef.getFields()[_0x1844b5.name.value].type
        };
      }
      if (this.typeStack.typeDef) {
        return;
      } else {
        return BREAK;
      }
    }

    onFieldLeave() {
      this.fieldStack = this.fieldStack.parent;
    }

    onArgumentEnter(_0x2277a8) {
      this.argumentStack = this.fieldStack;
    }

    onArgumentLeave(_0x4caa3f) {
      const _0x420d68 = _0x4caa3f.name.value;
      const _0x3486c5 = this.typeStack?.typeDef?.find(_0x3b0acc => _0x3b0acc.name === _0x420d68);
      if (!_0x3486c5) return;
      const _0x4cfefd = valueFromAST(_0x4caa3f.value, _0x3486c5.type, this.variableValues);
      let _0x3264c4;
      if (_0x4caa3f.value.kind === Kind.LIST) {
        _0x3264c4 = _0x4caa3f.value.values.map(_0x1b26c3 => _0x1b26c3.value);
      }
      let _0x5dd17c = _0x3486c5.type;
      if (isNonNullType(_0x5dd17c)) {
        _0x5dd17c = _0x5dd17c.ofType;
      }
      if (isInputObjectType(_0x5dd17c)) {
        if (!_0x4cfefd) return;
        const _0x139f39 = getNamedType(_0x5dd17c);
        _0x47581b(this.context, _0x139f39, this.argumentStack, _0x3264c4, _0x4cfefd, this.typeStack, _0x3264c4, this.options);
      } else {
        if (isListType(_0x5dd17c)) {
          _0xc58942(this.context, _0x5dd17c, _0x3486c5, _0x4cfefd, this.argumentStack, this.fieldStack, this.directiveStack, _0x3264c4, this.options);
        } else {
          if (!_0x4cfefd && _0x4cfefd !== '' && _0x4cfefd !== 0) return;
          const _0x57937c = _0x3264c4 || (this.directiveStack.directiveStack ? this.directiveStack.directiveStack.join('.') : _0x420d68);
          _0xf33c9d(this.context, this.argumentStack, _0x3486c5, _0x5dd17c, _0x4cfefd, _0x3264c4, _0x420d68, _0x57937c, '', this.options);
        }
      }
    }

    onObjectFieldEnter(_0x4caa3f) {
      const _0x420d68 = _0x4caa3f.name.value;
      const _0x38ed2e = this.typeStack.typeDef.getFields()[_0x420d68];
      const _0x279a94 = this.directiveStack ? this.directiveStack.join('.') + '.' + _0x420d68 : _0x420d68;
      const _0x20d397 = this.variableValues[_0x420d68];
      let _0x1dd736 = _0x4caa3f.value;
      if (_0x1dd736.kind === Kind.LIST) {
        _0x1dd736 = _0x1dd736.values;
      }
      const _0x123634 = typeFromAST(this.context.getSchema(), _0x1dd736);
      if (isInputObjectType(_0x123634)) {
        if (!_0x20d397) return;
        _0x47581b(this.context, _0x123634, this.fieldStack, _0x20d397, this.directiveStack, this.fieldStack, _0x279a94, this.options);
      } else {
        if (isListType(_0x123634)) {
          _0xc58942(this.context, _0x123634, _0x38ed2e, _0x20d397, this.directiveStack, this.fieldStack, this.fieldStack, _0x279a94, this.options);
        } else {
          if (!_0x20d397 && _0x20d397 !== '' && _0x20d397 !== 0) return;
          _0xf33c9d(this.context, this.fieldStack, _0x38ed2e, _0x123634, _0x20d397, this.fieldStack, _0x279a94, _0x279a94, '"' + _0x279a94 + '"', this.options);
        }
      }
    }
  };

  function _0xf33c9d(_0xf1199b, _0x1f44f7, _0x4d8962, _0x113f9d, _0xd9a4f6, _0x27ceb7, _0xbc382d, _0x1ce4ed, _0x225c1f, _0x99469 = {}) {
    if (!_0x4d8962.directives) {
      return;
    }
    const _0x548bf1 = getDirectiveValues(_0x1be394, _0x4d8962.astNode);
    if (_0x548bf1) {
      const _0x270f79 = getScalarType(_0x113f9d).name;
      const _0x8b9db0 = _0x270f79 === GraphQLString ? '"' : '';
      try {
        getConstraintValidateFn(_0x270f79)(_0x1ce4ed, _0x548bf1, _0xd9a4f6, _0x99469);
      } catch (_0xea670c) {
        const _0x47d3b7 = _0x548bf1.errorMessage || (_0x27ceb7 ? 'Variable "$' + _0x27ceb7 + '" got invalid value ' + _0x8b9db0 + _0xd9a4f6 + _0x8b9db0 + '. ' + _0x225c1f + '. ' : 'Argument "' + _0xbc382d + '" of "' + _0x1f44f7.fieldNodes[0].name.value + '" got invalid value ' + _0x8b9db0 + _0xd9a4f6 + _0x8b9db0 + '. ' + _0x225c1f + '. ') + _0xea670c.message;
        const _0xa382ad = new _0x23dbb1(_0x1ce4ed, _0x47d3b7, _0xea670c.context);
        _0xa382ad.argName = _0xea670c.argName;
        _0xf1199b.reportError(_0xa382ad);
      }
    }
  }

  function _0x47581b(_0x4f401e, _0x4cf358, _0x54326e, _0xb08b7e, _0x1b26c3, _0x43ffd0, _0x2a5b03, _0x2ce183 = {}) {
    if (!_0x4cf358.getFields) {
      return;
    }
    const _0x1f3cce = new QueryValidationVisitor(_0x4f401e, _0x4cf358, _0x54326e, _0xb08b7e, _0x1b26c3, _0x43ffd0, _0x2a5b03, _0x2ce183);
    visit(_0x4cf358.astNode, _0x1f3cce);
  }

  function _0xc58942(_0x4fcd12, _0x10092d, _0x2aca86, _0x5a2b35, _0x43553f, _0x195c84, _0x931705, _0x465c98, _0x50c84d = {}) {
    if (!_0x2aca86.directives) return;
    let _0xbebb7e = _0x10092d.type;
    if (isNonNullType(_0xbebb7e)) _0xbebb7e = _0xbebb7e.ofType;
    const _0x12cd33 = getDirectiveValues(_0x1be394, _0x2aca86.astNode);
    let _0x269816 = false;
    if (_0x12cd33) {
      let _0x2d65ed;
      if (_0x931705) {
        _0x2d65ed = 'Variable "$' + _0x931705 + '.' + _0x465c98 + '" ';
      } else {
        _0x2d65ed = 'Argument "' + _0x195c84 + '" of "' + _0x43553f.fieldNodes[0].name.value + '" ';
      }
      const _0x4ecb88 = _0x2d65ed + 'got invalid value. Item count is less than ' + _0x12cd33.minItems + '.';
      const _0x5abc26 = _0x2d65ed + 'got invalid value. Item count is greater than ' + _0x12cd33.maxItems + '.';
      if (_0x12cd33.minItems && (!_0x5a2b35 || _0x5a2b35.length < _0x12cd33.minItems)) {
        _0x4fcd12.reportError(new _0x23dbb1(_0x465c98, _0x12cd33.errorMessage || _0x4ecb88, [{ arg: 'minItems', value: _0x12cd33.minItems }]));
      }
      _0x12cd33.maxItems && _0x5a2b35 && _0x5a2b35.length > _0x12cd33.maxItems && _0x4fcd12.reportError(new _0x23dbb1(_0x465c98, _0x12cd33.errorMessage || _0x5abc26, [{ arg: 'maxItems', value: _0x12cd33.maxItems }]));
      for (const _0x3c6ffb in _0x12cd33) {
        if (_0x3c6ffb !== 'minItems' && _0x3c6ffb !== 'maxItems') {
          _0x269816 = true;
          break;
        }
      }
      _0x5a2b35 && _0x5a2b35.forEach((_0x2a68b4, _0x3f0c66) => {
        if (_0x2a68b4 === null || _0x2a68b4 === undefined) return;
        const _0x5dbedd = _0x465c98 ? _0x465c98 + '[' + _0x3f0c66++ + ']' : '[' + _0x3f0c66++ + ']';
        if (isInputObjectType(_0xbebb7e)) {
          _0x47581b(_0x4fcd12, _0xbebb7e, _0x195c84, _0x931705, _0x2a68b4, _0x43553f, _0x5dbedd, _0x50c84d);
        } else {
          if (_0x269816) {
            const _0x250493 = 'Variable "$' + _0x5dbedd + '" ';
            _0xf33c9d(_0x4fcd12, _0x43553f, _0x2aca86, _0x10092d, _0x2a68b4, _0x931705, _0x195c84, _0x5dbedd, _0x250493, _0x50c84d);
          }
        }
      });
    }
  }

  var QueryValidationVisitor = _0xdf2ce8.exports;
}});

var require_validate_query = __commonJS({'../work/confuser__graphql-constraint-directive/lib/validate-query.js'(_0xfe6571, _0x4f5bba) {
  var { TypeInfo, ValidationContext, visit, visitWithTypeInfo } = require('graphql');
  var QueryValidationVisitor = require_query_validation_visitor();

  function validateQuery(_0x23d29d, _0x15b4bb, _0x2fccd5, _0x101ae0, _0x13f9ed = {}) {
    const _0x5b109c = new TypeInfo(_0x23d29d);
    const _0x37a295 = [];
    const _0x2553d3 = new ValidationContext(_0x23d29d, _0x15b4bb, _0x5b109c, _0x230b34 => _0x37a295.push(_0x230b34));
    var _0x49e9e1 = {};
    _0x49e9e1.variables = _0x2fccd5;
    _0x49e9e1.operationName = _0x101ae0;
    _0x49e9e1.options = _0x13f9ed;
    const _0x5ef378 = new QueryValidationVisitor(_0x2553d3, _0x49e9e1);
    visit(_0x15b4bb, visitWithTypeInfo(_0x5b109c, _0x5ef378));
    return _0x37a295;
  }

  var _0x4518e7 = {};
  _0x4518e7.validateQuery = validateQuery;
  _0x4f5bba.exports = _0x4518e7;
}});

var { GraphQLNonNull, GraphQLList, separateOperations, GraphQLError, getDirectiveValues } = require('graphql');
var QueryValidationVisitor = require_query_validation_visitor();
var { validateQuery } = require_validate_query();
var { getDirective, mapSchema, MapperKind } = require('@graphql-tools/utils');
var { getConstraintTypeObject, getScalarType } = require_type_utils();
var { constraintDirectiveTypeDefs, constraintDirectiveTypeDefsObj } = require_type_defs();

function constraintDirective() {
  const cache = {};

  function getConstraintType(fieldName, typeName, type, directiveValues, list, notNull) {
    let uniqueTypeName;
    if (directiveValues.errorMessage) {
      uniqueTypeName = directiveValues.errorMessage.replace(/\W/g, '');
    } else {
      uniqueTypeName = fieldName + '_' + (list ? 'List_' : '') + (notNull ? 'NotNull_' : '') + typeName.name + '_' + Object.entries(directiveValues).filter(([key]) => key !== 'errorMessage').map(([key, value]) => {
        if (key === 'minLength' || key === 'maxLength' || key === 'startsWith' || key === 'endsWith' || key === 'contains' || key === 'notContains' || key === 'pattern' || key === 'format') {
          return key + '_' + value.toString().replace(/\W/g, '');
        }
        return key + '_' + value.toString().replace(/\W/g, '');
      }).join('_');
    }
    const symbol = Symbol.for(uniqueTypeName);
    let constraintType = cache[symbol];
    if (constraintType) return constraintType;
    constraintType = getConstraintTypeObject(fieldName, typeName, uniqueTypeName, directiveValues);
    list && (constraintType = new GraphQLList(constraintType));
    if (notNull) {
      constraintType = new GraphQLNonNull(constraintType);
    }
    return cache[symbol] = constraintType, constraintType;
  }

  function processType(type, directiveValues) {
    const scalarType = getScalarType(type.ofType);
    const fieldName = type.astNode.name.value;
    type.ofType = getConstraintType(fieldName, scalarType.name, type, directiveValues, scalarType.list, scalarType.notNull);
  }

  return schema => mapSchema(schema, {
    [MapperKind.FIELD_DEFINITION]: fieldConfig => {
      const directive = getDirective(schema, fieldConfig, 'constraint')?.[0];
      if (directive) {
        processType(fieldConfig, directive);
        return fieldConfig;
      }
    },
    [MapperKind.ARGUMENT]: argumentConfig => {
      const directive = getDirective(schema, argumentConfig, 'constraint')?.[0];
      if (directive) {
        processType(argumentConfig, directive);
        return argumentConfig;
      }
    }
  });
}

function constraintDirectiveDocumentation(options) {
  const argDescriptions = {
    minLength: 'Minimum length of the string',
    maxLength: 'Maximum length of the string',
    startsWith: 'String must start with',
    endsWith: 'String must end with',
    contains: 'String must contain',
    notContains: 'String must not contain',
    pattern: 'String must match pattern',
    format: 'String must match format',
    min: 'Minimum value',
    max: 'Maximum value',
    exclusiveMin: 'Exclusive minimum value',
    exclusiveMax: 'Exclusive maximum value',
    multipleOf: 'Must be a multiple of',
    minItems: 'Minimum number of items',
    maxItems: 'Maximum number of items'
  };
  let descriptions = argDescriptions;
  if (options?.errorMessage) {
    descriptions = options.errorMessage;
  }
  let header = 'The following constraints are available:\n';
  if (options?.header) {
    header = options.header;
  }

  function addDescription(schema, directiveValues) {
    if (schema.description) {
      if (schema.description.includes(header)) return;
      schema.description += '\n\n';
    } else {
      schema.description = '';
    }
    schema.description += header + '\n';
    Object.entries(directiveValues).forEach(([key, value]) => {
      if (key === 'errorMessage' || key === 'header') return;
      schema.description += '* ' + (descriptions[key] ? descriptions[key] : key) + ': `' + value + '`\n';
    });
    if (schema.description?.astNode) {
      schema.description.astNode.description = schema.description;
    }
  }

  return schema => mapSchema(schema, {
    [MapperKind.FIELD_DEFINITION]: fieldConfig => {
      if (fieldConfig?.astNode) {
        const directiveValues = getDirectiveValues(constraintDirectiveTypeDefsObj, fieldConfig.astNode);
        if (directiveValues) {
          addDescription(fieldConfig, directiveValues);
          return fieldConfig;
        }
      }
    },
    [MapperKind.ARGUMENT]: argumentConfig => {
      if (argumentConfig?.astNode) {
        const directiveValues = getDirectiveValues(constraintDirectiveTypeDefsObj, argumentConfig.astNode);
        if (directiveValues) {
          addDescription(argumentConfig, directiveValues);
          return argumentConfig;
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
          const errors = validateQuery(schema, query, request.variables, request.operationName, options);
          if (errors.length > 0) {
            throw errors.map(error => {
              const { UserInputError } = require('apollo-server-errors');
              return new UserInputError(error.message, { field: error.argName, context: error.context });
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
        setResultAndStopExecution({
          errors: errors.map(error => new GraphQLError(error.message, { extensions: { code: error.argName, field: error.argName, context: error.context } }))
        });
      }
    }
  };
}

function createQueryValidationRule(options) {
  return context => {
    return new QueryValidationVisitor(context, options);
  };
}

var exports = {};
exports.constraintDirective = constraintDirective;
exports.constraintDirectiveDocumentation = constraintDirectiveDocumentation;
exports.constraintDirectiveTypeDefs = constraintDirectiveTypeDefs;
exports.validateQuery = validateQuery;
exports.createApolloQueryValidationPlugin = createApolloQueryValidationPlugin;
exports.createEnvelopQueryValidationPlugin = createEnvelopQueryValidationPlugin;
exports.createQueryValidationRule = createQueryValidationRule;
module.exports = exports;
