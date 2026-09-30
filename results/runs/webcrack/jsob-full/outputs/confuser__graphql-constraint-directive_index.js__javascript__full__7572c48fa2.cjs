var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x34fdf5, _0x48d56c) => function _0x32350() {
  if (!_0x48d56c) {
    (0, _0x34fdf5[__getOwnPropNames(_0x34fdf5)[0]])((_0x48d56c = {
      exports: {}
    }).exports, _0x48d56c);
  }
  return _0x48d56c.exports;
};
var require_error = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/error.js"(_0x264129, _0x199fb4) {
    _0x199fb4.exports = class _0x1dcb9a extends Error {
      constructor(_0x1a058b, _0x387ea5, _0x4d1989) {
        super(_0x387ea5);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.code = "ERR_GRAPHQL_CONSTRAINT_VALIDATION";
        this.fieldName = _0x1a058b;
        this.context = _0x4d1989;
        this.originalError = undefined;
      }
    };
  }
});
var require_byte = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/byte.js"(_0x3f2e56, _0x350da1) {
    var {
      GraphQLError: _0x3c9d3c
    } = require("graphql/error");
    var {
      isBase64: _0x1090e2
    } = require("validator");
    _0x350da1.exports = _0x1238cb => {
      if (_0x1090e2(_0x1238cb)) {
        return true;
      }
      throw new _0x3c9d3c("Must be in byte format");
    };
  }
});
var require_date = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date.js"(_0x22a0b5, _0x2c14b7) {
    var {
      GraphQLError: _0x40b648
    } = require("graphql/error");
    var {
      isISO8601: _0xa9b0be
    } = require("validator");
    _0x2c14b7.exports = _0x3887ae => {
      if (_0xa9b0be(_0x3887ae)) {
        return true;
      }
      throw new _0x40b648("Must be a date in ISO 8601 format");
    };
  }
});
var require_date_time = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/date-time.js"(_0x202ece, _0x3d99d9) {
    var {
      GraphQLError: _0x1c1aa9
    } = require("graphql/error");
    var {
      isRFC3339: _0x168fda
    } = require("validator");
    _0x3d99d9.exports = _0x4cf3ae => {
      if (_0x168fda(_0x4cf3ae)) {
        return true;
      }
      throw new _0x1c1aa9("Must be a date-time in RFC 3339 format");
    };
  }
});
var require_email = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/email.js"(_0x126ff6, _0x5dfd25) {
    var {
      GraphQLError: _0x5f0fef
    } = require("graphql/error");
    var {
      isEmail: _0x3f34fa
    } = require("validator");
    _0x5dfd25.exports = _0x7e27be => {
      if (_0x3f34fa(_0x7e27be)) {
        return true;
      }
      throw new _0x5f0fef("Must be in email format");
    };
  }
});
var require_ipv4 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv4.js"(_0x350ce2, _0x9bdf7a) {
    var {
      GraphQLError: _0xd753bf
    } = require("graphql/error");
    var {
      isIP: _0xa7b63b
    } = require("validator");
    _0x9bdf7a.exports = _0x5f3b5d => {
      if (_0xa7b63b(_0x5f3b5d, 4)) {
        return true;
      }
      throw new _0xd753bf("Must be in IP v4 format");
    };
  }
});
var require_ipv6 = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/ipv6.js"(_0x2cc422, _0x5010d0) {
    var {
      GraphQLError: _0x4f0549
    } = require("graphql/error");
    var {
      isIP: _0x5a733a
    } = require("validator");
    _0x5010d0.exports = _0x491a92 => {
      if (_0x5a733a(_0x491a92, 6)) {
        return true;
      }
      throw new _0x4f0549("Must be in IP v6 format");
    };
  }
});
var require_uri = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uri.js"(_0x8eceb4, _0x512ffc) {
    var {
      GraphQLError: _0x44d7ab
    } = require("graphql/error");
    var {
      isURL: _0x4fcb19
    } = require("validator");
    _0x512ffc.exports = _0x158195 => {
      if (_0x4fcb19(_0x158195)) {
        return true;
      }
      throw new _0x44d7ab("Must be in URI format");
    };
  }
});
var require_uuid = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/uuid.js"(_0x36f47a, _0x4d2747) {
    var {
      GraphQLError: _0x305ece
    } = require("graphql/error");
    var {
      isUUID: _0x1852e9
    } = require("validator");
    _0x4d2747.exports = _0x1ab6e5 => {
      if (_0x1852e9(_0x1ab6e5)) {
        return true;
      }
      throw new _0x305ece("Must be in UUID format");
    };
  }
});
var require_formats = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/formats/index.js"(_0x97d8fa, _0x40993e) {
    var _0x905ad2 = require_byte();
    var _0x97451 = require_date();
    var _0x19fab0 = require_date_time();
    var _0x2cc36c = require_email();
    var _0x55a266 = require_ipv4();
    var _0x25e444 = require_ipv6();
    var _0x421720 = require_uri();
    var _0x2077af = require_uuid();
    var _0x25b208 = {
      byte: _0x905ad2,
      "date-time": _0x19fab0,
      date: _0x97451,
      email: _0x2cc36c,
      ipv4: _0x55a266,
      ipv6: _0x25e444,
      uri: _0x421720,
      uuid: _0x2077af
    };
    _0x40993e.exports = _0x25b208;
  }
});
var require_string = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/string.js"(_0x2655f9, _0x3d9793) {
    var {
      GraphQLScalarType: _0xec8a33
    } = require("graphql");
    var {
      contains: _0x3b7f65,
      isLength: _0x55deb3
    } = require("validator");
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
            _0x55cd37 = _0x3be5fe.serialize(_0x55cd37);
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
      if (_0x83a2bf.minLength && !_0x55deb3(_0x2db66d, {
        min: _0x83a2bf.minLength
      })) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must be at least " + _0x83a2bf.minLength + " characters in length"), [{
          arg: "minLength",
          value: _0x83a2bf.minLength
        }]);
      }
      if (_0x83a2bf.maxLength && !_0x55deb3(_0x2db66d, {
        max: _0x83a2bf.maxLength
      })) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must be no more than " + _0x83a2bf.maxLength + " characters in length"), [{
          arg: "maxLength",
          value: _0x83a2bf.maxLength
        }]);
      }
      if (_0x83a2bf.startsWith && !_0x2db66d.startsWith(_0x83a2bf.startsWith)) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must start with " + _0x83a2bf.startsWith), [{
          arg: "startsWith",
          value: _0x83a2bf.startsWith
        }]);
      }
      if (_0x83a2bf.endsWith && !_0x2db66d.endsWith(_0x83a2bf.endsWith)) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must end with " + _0x83a2bf.endsWith), [{
          arg: "endsWith",
          value: _0x83a2bf.endsWith
        }]);
      }
      if (_0x83a2bf.contains && !_0x3b7f65(_0x2db66d, _0x83a2bf.contains)) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must contain " + _0x83a2bf.contains), [{
          arg: "contains",
          value: _0x83a2bf.contains
        }]);
      }
      if (_0x83a2bf.notContains && _0x3b7f65(_0x2db66d, _0x83a2bf.notContains)) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must not contain " + _0x83a2bf.notContains), [{
          arg: "notContains",
          value: _0x83a2bf.notContains
        }]);
      }
      if (_0x83a2bf.pattern && !new RegExp(_0x83a2bf.pattern).test(_0x2db66d)) {
        throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Must match " + _0x83a2bf.pattern), [{
          arg: "pattern",
          value: _0x83a2bf.pattern
        }]);
      }
      if (_0x83a2bf.format) {
        const _0xf678d2 = _0x232568.pluginOptions || {};
        var _0x103189 = {
          ..._0x1c39c1,
          ...(_0xf678d2.formats || {})
        };
        const _0x530d76 = _0x103189;
        const _0xeadfaa = _0x530d76[_0x83a2bf.format];
        if (!_0xeadfaa) {
          throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, "Invalid format type " + _0x83a2bf.format), [{
            arg: "format",
            value: _0x83a2bf.format
          }]);
        }
        try {
          _0xeadfaa(_0x2db66d, _0x83a2bf);
        } catch (_0x706876) {
          throw new _0x313517(_0x230277, _0x3cfbf9(_0x83a2bf, _0x706876.message), [{
            arg: "format",
            value: _0x83a2bf.format
          }]);
        }
      }
    }
    var _0x2430c1 = {
      ConstraintStringType: _0x164da4,
      validate: _0x1969bf
    };
    _0x3d9793.exports = _0x2430c1;
  }
});
var require_number = __commonJS({
  "../work/confuser__graphql-constraint-directive/scalars/number.js"(_0x2e756e, _0x41a202) {
    var {
      GraphQLScalarType: _0x156d93
    } = require("graphql");
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
            _0x5a23d2 = _0x45a862.serialize(_0x5a23d2);
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
      const _0x11396d = Number.EPSILON * 3;
      return _0x1ecdf8 % _0x3d0abe < _0x11396d || _0x1ecdf8 % _0x3d0abe > _0x3d0abe - _0x11396d;
    }
    function _0x241640(_0x22fda7, _0x176e31) {
      return _0x22fda7.errorMessage || _0x176e31;
    }
    function _0x565b53(_0x128bdc, _0x192669, _0x4af403) {
      if (_0x192669.min !== undefined && _0x4af403 < _0x192669.min) {
        throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, "Must be at least " + _0x192669.min), [{
          arg: "min",
          value: _0x192669.min
        }]);
      }
      if (_0x192669.max !== undefined && _0x4af403 > _0x192669.max) {
        throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, "Must be no greater than " + _0x192669.max), [{
          arg: "max",
          value: _0x192669.max
        }]);
      }
      if (_0x192669.exclusiveMin !== undefined && _0x4af403 <= _0x192669.exclusiveMin) {
        throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, "Must be greater than " + _0x192669.exclusiveMin), [{
          arg: "exclusiveMin",
          value: _0x192669.exclusiveMin
        }]);
      }
      if (_0x192669.exclusiveMax !== undefined && _0x4af403 >= _0x192669.exclusiveMax) {
        throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, "Must be less than " + _0x192669.exclusiveMax), [{
          arg: "exclusiveMax",
          value: _0x192669.exclusiveMax
        }]);
      }
      if (_0x192669.multipleOf !== undefined && _0x41fe06(_0x4af403, _0x192669.multipleOf) === false) {
        throw new _0x22e830(_0x128bdc, _0x241640(_0x192669, "Must be a multiple of " + _0x192669.multipleOf), [{
          arg: "multipleOf",
          value: _0x192669.multipleOf
        }]);
      }
    }
    var _0x3fc2b3 = {
      ConstraintNumberType: _0x25d9a3,
      validate: _0x565b53
    };
    _0x41a202.exports = _0x3fc2b3;
  }
});
var require_type_utils = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-utils.js"(_0x187b39, _0x81dce) {
    var {
      GraphQLFloat: _0x47c17c,
      GraphQLInt: _0x2a677c,
      GraphQLString: _0x478c2d,
      isNonNullType: _0x5e13a7,
      isScalarType: _0x4009c6,
      isListType: _0x1fe662,
      GraphQLID: _0x2913b5
    } = require("graphql");
    var {
      ConstraintStringType: _0x135d81,
      validate: _0x4b4c13
    } = require_string();
    var {
      ConstraintNumberType: _0x2b4dfb,
      validate: _0x44dee9
    } = require_number();
    function _0x7314be(_0x475cfd, _0x547522, _0x5b2505, _0x58c33c) {
      if (_0x547522 === _0x478c2d || _0x547522 === _0x2913b5) {
        return new _0x135d81(_0x475cfd, _0x5b2505, _0x547522, _0x58c33c);
      } else if (_0x547522 === _0x47c17c || _0x547522 === _0x2a677c) {
        return new _0x2b4dfb(_0x475cfd, _0x5b2505, _0x547522, _0x58c33c);
      } else {
        throw new Error("Not a valid scalar type: " + _0x547522.toString());
      }
    }
    function _0x4d82ca(_0x3ddd99) {
      if (_0x3ddd99 === _0x478c2d || _0x3ddd99 === _0x2913b5) {
        return _0x4b4c13;
      } else if (_0x3ddd99 === _0x47c17c || _0x3ddd99 === _0x2a677c) {
        return _0x44dee9;
      } else {
        throw new Error("Not a valid scalar type: " + _0x3ddd99.toString());
      }
    }
    function _0x55c547(_0x568012) {
      if (_0x4009c6(_0x568012)) {
        var _0x40fc75 = {
          scalarType: _0x568012
        };
        return _0x40fc75;
      } else if (_0x1fe662(_0x568012)) {
        return {
          ..._0x55c547(_0x568012.ofType),
          list: true
        };
      } else if (_0x5e13a7(_0x568012) && _0x4009c6(_0x568012.ofType)) {
        var _0x36bd81 = {
          scalarType: _0x568012.ofType,
          scalarNotNull: true
        };
        return _0x36bd81;
      } else if (_0x5e13a7(_0x568012)) {
        return {
          ..._0x55c547(_0x568012.ofType),
          list: true,
          listNotNull: true
        };
      } else {
        throw new Error("Not a valid scalar type: " + _0x568012.toString());
      }
    }
    var _0x250543 = {
      getConstraintTypeObject: _0x7314be,
      getConstraintValidateFn: _0x4d82ca,
      getScalarType: _0x55c547
    };
    _0x81dce.exports = _0x250543;
  }
});
var require_type_defs = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/type-defs.js"(_0x513b11, _0x427880) {
    var {
      GraphQLString: _0x45ef18,
      GraphQLDirective: _0x408cbd,
      DirectiveLocation: _0x4fbdf6,
      GraphQLInt: _0x5ca1f6,
      GraphQLFloat: _0x47967a
    } = require("graphql");
    var _0x2d2aaa = "\n  directive @constraint(\n    # String constraints\n    minLength: Int\n    maxLength: Int\n    startsWith: String\n    endsWith: String\n    contains: String\n    notContains: String\n    pattern: String\n    format: String\n\n    # Number constraints\n    min: Float\n    max: Float\n    exclusiveMin: Float\n    exclusiveMax: Float\n    multipleOf: Float\n\n    # Array/List size constraints\n    minItems: Int\n    maxItems: Int\n\n    # Custom error message when validation fails\n    errorMessage: String\n\n    # Shared for Schema wrapper\n    uniqueTypeName: String\n\n  ) on INPUT_FIELD_DEFINITION | FIELD_DEFINITION | ARGUMENT_DEFINITION";
    var _0xc1aaa1 = {
      type: _0x5ca1f6
    };
    var _0x1e2746 = {
      type: _0x5ca1f6
    };
    var _0x98db03 = {
      type: _0x45ef18
    };
    var _0x2a22fc = {
      type: _0x45ef18
    };
    var _0x2e0d0f = {
      type: _0x45ef18
    };
    var _0x3022e8 = {
      type: _0x45ef18
    };
    var _0x39e2bf = {
      type: _0x45ef18
    };
    var _0x1adfa7 = {
      type: _0x45ef18
    };
    var _0x35de94 = {
      type: _0x47967a
    };
    var _0x455a5b = {
      type: _0x47967a
    };
    var _0x95b32c = {
      type: _0x47967a
    };
    var _0x299d88 = {
      type: _0x47967a
    };
    var _0x5f2cf5 = {
      type: _0x47967a
    };
    var _0x419db2 = {
      type: _0x5ca1f6
    };
    var _0x392380 = {
      type: _0x5ca1f6
    };
    var _0x4e623b = {
      type: _0x45ef18
    };
    var _0x4ffa2c = {
      type: _0x45ef18
    };
    var _0x1578ae = {
      minLength: _0xc1aaa1,
      maxLength: _0x1e2746,
      startsWith: _0x98db03,
      endsWith: _0x2a22fc,
      contains: _0x2e0d0f,
      notContains: _0x3022e8,
      pattern: _0x39e2bf,
      format: _0x1adfa7,
      min: _0x35de94,
      max: _0x455a5b,
      exclusiveMin: _0x95b32c,
      exclusiveMax: _0x299d88,
      multipleOf: _0x5f2cf5,
      minItems: _0x419db2,
      maxItems: _0x392380,
      errorMessage: _0x4e623b,
      uniqueTypeName: _0x4ffa2c
    };
    var _0x3fb2c4 = {
      name: "constraint",
      locations: [_0x4fbdf6.FIELD_DEFINITION, _0x4fbdf6.INPUT_FIELD_DEFINITION, _0x4fbdf6.ARGUMENT_DEFINITION],
      args: _0x1578ae
    };
    var _0x515b3d = new _0x408cbd(_0x3fb2c4);
    var _0x217f75 = {
      constraintDirectiveTypeDefs: _0x2d2aaa,
      constraintDirectiveTypeDefsObj: _0x515b3d
    };
    _0x427880.exports = _0x217f75;
  }
});
var require_query_validation_visitor = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/query-validation-visitor.js"(_0x2c03c5, _0xdf2ce8) {
    var {
      getVariableValues: _0x41129f
    } = require("graphql/execution/values.js");
    var {
      GraphQLString: _0x208337,
      Kind: _0x48744b,
      getNamedType: _0x56ea88,
      isInputObjectType: _0x31af6a,
      isListType: _0x22d051,
      isNonNullType: _0x3b3201,
      BREAK: _0x4c9bd3,
      valueFromAST: _0x2521c5,
      typeFromAST: _0x302aa4,
      visit: _0x14679c,
      getDirectiveValues: _0xf12f0b
    } = require("graphql");
    var _0x23dbb1 = require_error();
    var {
      getConstraintValidateFn: _0x25ddc6,
      getScalarType: _0x5a5781
    } = require_type_utils();
    var {
      constraintDirectiveTypeDefsObj: _0x1be394
    } = require_type_defs();
    _0xdf2ce8.exports = class _0x23760b {
      constructor(_0x5a44d9, _0x42f305) {
        this.context = _0x5a44d9;
        this.options = _0x42f305;
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
      onOperationDefinitionEnter(_0x188df1) {
        if (typeof this.options.operationName === "string" && this.options.operationName !== _0x188df1.name.value) {
          return;
        }
        this.variableValues = _0x41129f(this.context.getSchema(), _0x188df1.variableDefinitions ? [..._0x188df1.variableDefinitions] : [], this.options.variables ?? {}).coerced;
        let _0xee0ea1;
        switch (_0x188df1.operation) {
          case "query":
            _0xee0ea1 = this.context.getSchema().getQueryType();
            break;
          case "mutation":
            _0xee0ea1 = this.context.getSchema().getMutationType();
            break;
          case "subscription":
            _0xee0ea1 = this.context.getSchema().getSubscriptionType();
            break;
          default:
            throw new Error("Query validation could not be performed for operation of type " + _0x188df1.operation);
        }
        var _0x45220b = {
          typeDef: _0xee0ea1
        };
        this.currentTypeInfo = _0x45220b;
      }
      onFragmentEnter(_0x16935c) {
        const _0x12c517 = _0x302aa4(this.context.getSchema(), _0x16935c.typeCondition);
        this.currentTypeInfo = {
          parent: this.currentTypeInfo,
          typeDef: _0x12c517
        };
      }
      onFragmentLeave(_0x3a3911) {
        this.currentTypeInfo = this.currentTypeInfo.parent;
      }
      onFieldEnter(_0x1844b5) {
        this.currentField = _0x1844b5;
        if (this.currentTypeInfo?.typeDef?.getFields) {
          this.currentrFieldDef = this.currentTypeInfo.typeDef.getFields()[_0x1844b5.name.value];
        }
        if (this.currentrFieldDef) {
          const _0xd6c523 = _0x56ea88(this.currentrFieldDef.type);
          this.currentTypeInfo = {
            parent: this.currentTypeInfo,
            typeDef: _0xd6c523
          };
        } else {
          return _0x4c9bd3;
        }
      }
      onFieldLeave(_0x2277a8) {
        this.currentTypeInfo = this.currentTypeInfo.parent;
      }
      onArgumentEnter(_0x4caa3f) {
        const _0x420d68 = _0x4caa3f.name.value;
        const _0x3486c5 = this.currentrFieldDef?.args.find(_0x3b0acc => _0x3b0acc.name === _0x420d68);
        if (!_0x3486c5) {
          return;
        }
        const _0x4cfefd = _0x2521c5(_0x4caa3f.value, _0x3486c5.type, this.variableValues);
        let _0x3264c4;
        if (_0x4caa3f.value.kind === _0x48744b.VARIABLE) {
          _0x3264c4 = _0x4caa3f.value.name.value;
        }
        let _0x5dd17c = _0x3486c5.type;
        if (_0x3b3201(_0x5dd17c)) {
          _0x5dd17c = _0x5dd17c.ofType;
        }
        if (_0x31af6a(_0x5dd17c)) {
          if (!_0x4cfefd) {
            return;
          }
          const _0x139f39 = _0x56ea88(_0x5dd17c);
          _0x47581b(this.context, _0x139f39, _0x420d68, _0x3264c4, _0x4cfefd, this.currentField, _0x3264c4, this.options);
        } else if (_0x22d051(_0x5dd17c)) {
          _0xc58942(this.context, _0x5dd17c, _0x3486c5, _0x4cfefd, this.currentField, _0x420d68, _0x3264c4, _0x3264c4, this.options);
        } else {
          if (!_0x4cfefd && _0x4cfefd !== "" && _0x4cfefd !== 0) {
            return;
          }
          const _0x57937c = _0x3264c4 || this.currentField.name.value + "." + _0x420d68;
          _0xf33c9d(this.context, this.currentField, _0x3486c5, _0x5dd17c, _0x4cfefd, _0x3264c4, _0x420d68, _0x57937c, "", this.options);
        }
      }
    };
    function _0xf33c9d(_0xf1199b, _0x1f44f7, _0x4d8962, _0x113f9d, _0xd9a4f6, _0x27ceb7, _0xbc382d, _0x1ce4ed, _0x225c1f, _0x99469 = {}) {
      if (!_0x4d8962.astNode) {
        return;
      }
      const _0x548bf1 = _0xf12f0b(_0x1be394, _0x4d8962.astNode);
      if (_0x548bf1) {
        const _0x270f79 = _0x5a5781(_0x113f9d).scalarType;
        const _0x8b9db0 = _0x270f79 === _0x208337 ? "\"" : "";
        try {
          _0x25ddc6(_0x270f79)(_0x1ce4ed, _0x548bf1, _0xd9a4f6, _0x99469);
        } catch (_0xea670c) {
          const _0x47d3b7 = _0x548bf1.errorMessage || (_0x27ceb7 ? "Variable \"$" + _0x27ceb7 + "\" got invalid value " + _0x8b9db0 + _0xd9a4f6 + _0x8b9db0 + _0x225c1f + ". " + _0xea670c.message : "Argument \"" + _0xbc382d + "\" of \"" + _0x1f44f7.name.value + "\" got invalid value " + _0x8b9db0 + _0xd9a4f6 + _0x8b9db0 + _0x225c1f + ". " + _0xea670c.message);
          const _0xa382ad = new _0x23dbb1(_0x1ce4ed, _0x47d3b7, _0xea670c.context);
          _0xa382ad.originalError = _0xea670c;
          _0xf1199b.reportError(_0xa382ad);
        }
      }
    }
    function _0x47581b(_0x4f401e, _0x4cf358, _0x54326e, _0xb08b7e, _0x1b26c3, _0x43ffd0, _0x2a5b03, _0x2ce183 = {}) {
      if (!_0x4cf358.astNode) {
        return;
      }
      const _0x1f3cce = new _0x7ad58(_0x4f401e, _0x4cf358, _0x54326e, _0xb08b7e, _0x1b26c3, _0x43ffd0, _0x2a5b03, _0x2ce183);
      _0x14679c(_0x4cf358.astNode, _0x1f3cce);
    }
    function _0xc58942(_0x4fcd12, _0x10092d, _0x2aca86, _0x5a2b35, _0x43553f, _0x195c84, _0x931705, _0x465c98, _0x50c84d = {}) {
      if (!_0x2aca86.astNode) {
        return;
      }
      let _0xbebb7e = _0x10092d.ofType;
      if (_0x3b3201(_0xbebb7e)) {
        _0xbebb7e = _0xbebb7e.ofType;
      }
      const _0x12cd33 = _0xf12f0b(_0x1be394, _0x2aca86.astNode);
      let _0x269816 = false;
      if (_0x12cd33) {
        let _0x2d65ed;
        if (_0x931705) {
          _0x2d65ed = "Variable \"$" + _0x931705 + "\" at \"" + _0x465c98 + "\" ";
        } else {
          _0x2d65ed = "Argument \"" + _0x195c84 + "\" of \"" + _0x43553f.name.value + "\" ";
        }
        const _0x4ecb88 = _0x2d65ed + ("must be at least " + _0x12cd33.minItems + " in length");
        const _0x5abc26 = _0x2d65ed + ("must be no more than " + _0x12cd33.maxItems + " in length");
        if (_0x12cd33.minItems && (!_0x5a2b35 || _0x5a2b35.length < _0x12cd33.minItems)) {
          _0x4fcd12.reportError(new _0x23dbb1(_0x465c98, _0x12cd33.errorMessage || _0x4ecb88, [{
            arg: "minItems",
            value: _0x12cd33.minItems
          }]));
        }
        if (_0x12cd33.maxItems && _0x5a2b35 && _0x5a2b35.length > _0x12cd33.maxItems) {
          _0x4fcd12.reportError(new _0x23dbb1(_0x465c98, _0x12cd33.errorMessage || _0x5abc26, [{
            arg: "maxItems",
            value: _0x12cd33.maxItems
          }]));
        }
        for (const _0x3c6ffb in _0x12cd33) {
          if (_0x3c6ffb !== "maxItems" && _0x3c6ffb !== "minItems") {
            _0x269816 = true;
            break;
          }
        }
      }
      if (_0x5a2b35) {
        _0x5a2b35.forEach((_0x2a68b4, _0x3f0c66) => {
          if (_0x2a68b4 === null || _0x2a68b4 === undefined) {
            return;
          }
          const _0x5dbedd = _0x465c98 ? _0x465c98 + "[" + _0x3f0c66++ + "]" : "[" + _0x3f0c66++ + "]";
          if (_0x31af6a(_0xbebb7e)) {
            _0x47581b(_0x4fcd12, _0xbebb7e, _0x195c84, _0x931705, _0x2a68b4, _0x43553f, _0x5dbedd, _0x50c84d);
          } else if (_0x269816) {
            const _0x250493 = " at \"" + _0x5dbedd + "\"";
            _0xf33c9d(_0x4fcd12, _0x43553f, _0x2aca86, _0x10092d, _0x2a68b4, _0x931705, _0x195c84, _0x5dbedd, _0x250493, _0x50c84d);
          }
        });
      }
    }
    var _0x7ad58 = class {
      constructor(_0x17c1a4, _0xd90a2a, _0x5aaba2, _0x5f3203, _0x474b36, _0x17dbd0, _0x27855d, _0x40b64a = {}) {
        this.context = _0x17c1a4;
        this.argName = _0x5aaba2;
        this.variableName = _0x5f3203;
        this.inputObjectValue = _0x474b36;
        this.inputObjectTypeDef = _0xd90a2a;
        this.value = _0x474b36;
        this.currentField = _0x17dbd0;
        this.parentNames = _0x27855d;
        this.options = _0x40b64a;
        this.InputValueDefinition = {
          enter: this.onInputValueDefinition
        };
      }
      onInputValueDefinition(_0xbf7105) {
        const _0x8497cc = _0xbf7105.name.value;
        const _0x38ed2e = this.inputObjectTypeDef.getFields()[_0x8497cc];
        const _0x279a94 = this.parentNames ? this.parentNames + "." + _0x8497cc : _0x8497cc;
        const _0x20d397 = this.value[_0x8497cc];
        let _0x1dd736 = _0xbf7105.type;
        if (_0x1dd736.kind === _0x48744b.NON_NULL_TYPE) {
          _0x1dd736 = _0x1dd736.type;
        }
        const _0x123634 = _0x302aa4(this.context.getSchema(), _0x1dd736);
        if (_0x31af6a(_0x123634)) {
          if (!_0x20d397) {
            return;
          }
          _0x47581b(this.context, _0x123634, this.argName, this.variableName, _0x20d397, this.currentField, _0x279a94, this.options);
        } else if (_0x22d051(_0x123634)) {
          _0xc58942(this.context, _0x123634, _0x38ed2e, _0x20d397, this.currentField, this.argName, this.variableName, _0x279a94, this.options);
        } else {
          if (!_0x20d397 && _0x20d397 !== "" && _0x20d397 !== 0) {
            return;
          }
          _0xf33c9d(this.context, this.currentField, _0x38ed2e, _0x123634, _0x20d397, this.variableName, this.argName, _0x279a94, " at \"" + _0x279a94 + "\"", this.options);
        }
      }
    };
  }
});
var require_validate_query = __commonJS({
  "../work/confuser__graphql-constraint-directive/lib/validate-query.js"(_0xfe6571, _0x4f5bba) {
    var {
      TypeInfo: _0x23f4e4,
      ValidationContext: _0x5d6a03,
      visit: _0x25c752,
      visitWithTypeInfo: _0x547011
    } = require("graphql");
    var _0x4a4e96 = require_query_validation_visitor();
    function _0x41dba9(_0x23d29d, _0x15b4bb, _0x2fccd5, _0x101ae0, _0x13f9ed = {}) {
      const _0x5b109c = new _0x23f4e4(_0x23d29d);
      const _0x37a295 = [];
      const _0x2553d3 = new _0x5d6a03(_0x23d29d, _0x15b4bb, _0x5b109c, _0x230b34 => _0x37a295.push(_0x230b34));
      var _0x49e9e1 = {
        variables: _0x2fccd5,
        operationName: _0x101ae0,
        pluginOptions: _0x13f9ed
      };
      const _0x5ef378 = new _0x4a4e96(_0x2553d3, _0x49e9e1);
      _0x25c752(_0x15b4bb, _0x547011(_0x5b109c, _0x5ef378));
      return _0x37a295;
    }
    var _0x4518e7 = {
      validateQuery: _0x41dba9
    };
    _0x4f5bba.exports = _0x4518e7;
  }
});
var {
  GraphQLNonNull,
  GraphQLList,
  separateOperations,
  GraphQLError,
  getDirectiveValues
} = require("graphql");
var QueryValidationVisitor = require_query_validation_visitor();
var {
  validateQuery
} = require_validate_query();
var {
  getDirective,
  mapSchema,
  MapperKind
} = require("@graphql-tools/utils");
var {
  getConstraintTypeObject,
  getScalarType
} = require_type_utils();
var {
  constraintDirectiveTypeDefs,
  constraintDirectiveTypeDefsObj
} = require_type_defs();
function constraintDirective() {
  const _0x240a2f = {};
  function _0x186cb5(_0xfb71, _0x192b1b, _0x4ba566, _0x136dfa, _0x4e89cf, _0xdeb74b) {
    let _0x129e76;
    if (_0x136dfa.uniqueTypeName) {
      _0x129e76 = _0x136dfa.uniqueTypeName.replace(/\W/g, "");
    } else {
      _0x129e76 = _0xfb71 + "_" + (_0x4e89cf ? "List_" : "") + (_0xdeb74b ? "ListNotNull_" : "") + _0x192b1b.name + "_" + (_0x4ba566 ? "NotNull_" : "") + Object.entries(_0x136dfa).filter(([_0xf02d6]) => _0xf02d6 !== "errorMessage").map(([_0x32d6d8, _0xe9029e]) => {
        if (_0x32d6d8 === "min" || _0x32d6d8 === "max" || _0x32d6d8 === "exclusiveMin" || _0x32d6d8 === "exclusiveMax" || _0x32d6d8 === "multipleOf") {
          return _0x32d6d8 + "_" + _0xe9029e.toString().replace(/\W/g, "dot");
        }
        return _0x32d6d8 + "_" + _0xe9029e.toString().replace(/\W/g, "");
      }).join("_");
    }
    const _0x2407fb = Symbol.for(_0x129e76);
    let _0x29b624 = _0x240a2f[_0x2407fb];
    if (_0x29b624) {
      return _0x29b624;
    }
    _0x29b624 = getConstraintTypeObject(_0xfb71, _0x192b1b, _0x129e76, _0x136dfa);
    if (_0x4ba566) {
      _0x29b624 = new GraphQLNonNull(_0x29b624);
    }
    if (_0x4e89cf) {
      _0x29b624 = new GraphQLList(_0x29b624);
      if (_0xdeb74b) {
        _0x29b624 = new GraphQLNonNull(_0x29b624);
      }
    }
    _0x240a2f[_0x2407fb] = _0x29b624;
    return _0x29b624;
  }
  function _0x50a990(_0x37532b, _0x22bc2d) {
    const _0x3e7a29 = getScalarType(_0x37532b.type);
    const _0xe3719e = _0x37532b.astNode.name.value;
    _0x37532b.type = _0x186cb5(_0xe3719e, _0x3e7a29.scalarType, _0x3e7a29.scalarNotNull, _0x22bc2d, _0x3e7a29.list, _0x3e7a29.listNotNull);
  }
  return _0x5464a4 => mapSchema(_0x5464a4, {
    [MapperKind.FIELD]: _0x264d40 => {
      const _0x2f216d = getDirective(_0x5464a4, _0x264d40, "constraint")?.[0];
      if (_0x2f216d) {
        _0x50a990(_0x264d40, _0x2f216d);
        return _0x264d40;
      }
    },
    [MapperKind.ARGUMENT]: _0x3a6d5e => {
      const _0x1bfedb = getDirective(_0x5464a4, _0x3a6d5e, "constraint")?.[0];
      if (_0x1bfedb) {
        _0x50a990(_0x3a6d5e, _0x1bfedb);
        return _0x3a6d5e;
      }
    }
  });
}
function constraintDirectiveDocumentation(_0x319354) {
  let _0x2e8d2b = {
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
  if (_0x319354?.descriptionsMap) {
    _0x2e8d2b = _0x319354.descriptionsMap;
  }
  let _0x1b95aa = "*Constraints:*";
  if (_0x319354?.header) {
    _0x1b95aa = _0x319354.header;
  }
  function _0x21a517(_0x568ca9, _0x3a1c5c) {
    if (_0x568ca9.description) {
      if (_0x568ca9.description.includes(_0x1b95aa)) {
        return;
      }
      _0x568ca9.description += "\n\n";
    } else {
      _0x568ca9.description = "";
    }
    _0x568ca9.description += _0x1b95aa + "\n";
    Object.entries(_0x3a1c5c).forEach(([_0x23e15b, _0x4c82b4]) => {
      if (_0x23e15b === "uniqueTypeName" || _0x23e15b === "errorMessage") {
        return;
      }
      _0x568ca9.description += "* " + (_0x2e8d2b[_0x23e15b] ? _0x2e8d2b[_0x23e15b] : _0x23e15b) + ": `" + _0x4c82b4 + "`\n";
    });
    if (_0x568ca9.astNode?.description) {
      _0x568ca9.astNode.description.value = _0x568ca9.description;
    }
  }
  return _0x10a463 => mapSchema(_0x10a463, {
    [MapperKind.FIELD]: _0x5077fe => {
      if (_0x5077fe?.astNode) {
        const _0xaeeb13 = getDirectiveValues(constraintDirectiveTypeDefsObj, _0x5077fe.astNode);
        if (_0xaeeb13) {
          _0x21a517(_0x5077fe, _0xaeeb13);
          return _0x5077fe;
        }
      }
    },
    [MapperKind.ARGUMENT]: _0x1bb25f => {
      if (_0x1bb25f?.astNode) {
        const _0x13411e = getDirectiveValues(constraintDirectiveTypeDefsObj, _0x1bb25f.astNode);
        if (_0x13411e) {
          _0x21a517(_0x1bb25f, _0x13411e);
          return _0x1bb25f;
        }
      }
    }
  });
}
function createApolloQueryValidationPlugin({
  schema: _0x8ae493
}, _0xc0a420 = {}) {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({
          request: _0x1ee1f0,
          document: _0x59052c
        }) {
          const _0x472f9f = _0x1ee1f0.operationName ? separateOperations(_0x59052c)[_0x1ee1f0.operationName] : _0x59052c;
          const _0x4fe254 = validateQuery(_0x8ae493, _0x472f9f, _0x1ee1f0.variables, _0x1ee1f0.operationName, _0xc0a420);
          if (_0x4fe254.length > 0) {
            throw _0x4fe254.map(_0x295323 => {
              const {
                UserInputError: _0xf3d2bc
              } = require("apollo-server-errors");
              return new _0xf3d2bc(_0x295323.message, {
                field: _0x295323.fieldName,
                context: _0x295323.context
              });
            });
          }
        }
      };
    }
  };
}
function createEnvelopQueryValidationPlugin(_0x3b389c = {}) {
  return {
    onExecute({
      args: _0x1fcc2f,
      setResultAndStopExecution: _0x2d86ff
    }) {
      const _0x142e02 = validateQuery(_0x1fcc2f.schema, _0x1fcc2f.document, _0x1fcc2f.variableValues, _0x1fcc2f.operationName, _0x3b389c);
      if (_0x142e02.length > 0) {
        _0x2d86ff({
          errors: _0x142e02.map(_0x4b2289 => {
            return new GraphQLError(_0x4b2289.message, {
              extensions: {
                code: _0x4b2289.code,
                field: _0x4b2289.fieldName,
                context: _0x4b2289.context
              }
            });
          })
        });
      }
    }
  };
}
function createQueryValidationRule(_0xddfada) {
  return _0x2992d0 => {
    return new QueryValidationVisitor(_0x2992d0, _0xddfada);
  };
}
var _0x48e65f = {
  constraintDirective: constraintDirective,
  constraintDirectiveDocumentation: constraintDirectiveDocumentation,
  constraintDirectiveTypeDefs: constraintDirectiveTypeDefs,
  validateQuery: validateQuery,
  createApolloQueryValidationPlugin: createApolloQueryValidationPlugin,
  createEnvelopQueryValidationPlugin: createEnvelopQueryValidationPlugin,
  createQueryValidationRule: createQueryValidationRule
};
module.exports = _0x48e65f;