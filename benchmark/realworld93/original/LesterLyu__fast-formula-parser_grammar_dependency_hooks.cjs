var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/LesterLyu__fast-formula-parser/grammar/type/collection.js
var require_collection = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/type/collection.js"(exports2, module2) {
    var Collection = class {
      constructor(data, refs) {
        if (data == null && refs == null) {
          this._data = [];
          this._refs = [];
        } else {
          if (data.length !== refs.length)
            throw Error("Collection: data length should match references length.");
          this._data = data;
          this._refs = refs;
        }
      }
      get data() {
        return this._data;
      }
      get refs() {
        return this._refs;
      }
      get length() {
        return this._data.length;
      }
      /**
       * Add data and references to this collection.
       * @param {{}} obj - data
       * @param {{}} ref - reference
       */
      add(obj, ref) {
        this._data.push(obj);
        this._refs.push(ref);
      }
    };
    module2.exports = Collection;
  }
});

// ../work/LesterLyu__fast-formula-parser/formulas/helpers.js
var require_helpers = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/helpers.js"(exports2, module2) {
    var FormulaError2 = require_error();
    var Collection = require_collection();
    var Types = {
      NUMBER: 0,
      ARRAY: 1,
      BOOLEAN: 2,
      STRING: 3,
      RANGE_REF: 4,
      // can be 'A:C' or '1:4', not only 'A1:C3'
      CELL_REF: 5,
      COLLECTIONS: 6,
      // Unions of references
      NUMBER_NO_BOOLEAN: 10
    };
    var Factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368e3, 20922789888e3, 355687428096e3, 6402373705728e3, 121645100408832e3, 243290200817664e4, 5109094217170944e4, 11240007277776077e5, 2585201673888498e7, 6204484017332394e8, 15511210043330986e9, 40329146112660565e10, 10888869450418352e12, 30488834461171387e13, 8841761993739702e15, 26525285981219107e16, 8222838654177922e18, 2631308369336935e20, 8683317618811886e21, 29523279903960416e22, 10333147966386145e24, 37199332678990125e25, 13763753091226346e27, 5230226174666011e29, 20397882081197444e30, 8159152832478977e32, 3345252661316381e34, 140500611775288e37, 6041526306337383e37, 2658271574788449e39, 11962222086548019e40, 5502622159812089e42, 25862324151116818e43, 12413915592536073e45, 6082818640342675e47, 30414093201713376e48, 15511187532873822e50, 8065817517094388e52, 42748832840600255e53, 2308436973392414e56, 12696403353658276e57, 7109985878048635e59, 40526919504877214e60, 23505613312828785e62, 13868311854568984e64, 832098711274139e67, 5075802138772248e68, 3146997326038794e70, 198260831540444e73, 12688693218588417e73, 8247650592082472e75, 5443449390774431e77, 3647111091818868e79, 24800355424368305e80, 1711224524281413e83, 11978571669969892e84, 8504785885678623e86, 61234458376886085e87, 44701154615126844e89, 3307885441519386e92, 248091408113954e95, 18854947016660504e95, 14518309202828587e97, 11324281178206297e99, 8946182130782976e101, 7156945704626381e103, 5797126020747368e105, 4753643337012842e107, 3945523969720659e109, 3314240134565353e111, 281710411438055e114, 24227095383672734e114, 2107757298379528e117, 18548264225739844e118, 1650795516090846e121, 14857159644817615e122, 1352001527678403e125, 12438414054641308e126, 11567725070816416e128, 1087366156656743e131, 1032997848823906e133, 9916779348709496e134, 9619275968248212e136, 9426890448883248e138, 9332621544394415e140, 9332621544394415e142];
    var ReversedTypes = {};
    Object.keys(Types).forEach((key) => {
      ReversedTypes[Types[key]] = key;
    });
    var FormulaHelpers2 = class {
      constructor() {
        this.Types = Types;
        this.type2Number = {
          number: Types.NUMBER,
          boolean: Types.BOOLEAN,
          string: Types.STRING,
          object: -1
        };
      }
      checkFunctionResult(result) {
        const type = typeof result;
        if (type === "number") {
          if (isNaN(result)) {
            return FormulaError2.VALUE;
          } else if (!isFinite(result)) {
            return FormulaError2.NUM;
          }
        }
        if (result === void 0 || result === null)
          return FormulaError2.NULL;
        return result;
      }
      /**
       * Flatten an array
       * @param {Array} arr1
       * @returns {*}
       */
      flattenDeep(arr1) {
        return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flattenDeep(val)) : acc.concat(val), []);
      }
      /**
       *
       * @param obj
       * @param isArray - if it is an array: [1,2,3], will extract the first element
       * @param allowBoolean - Allow parse boolean into number
       * @returns {number|FormulaError}
       */
      acceptNumber(obj, isArray = true, allowBoolean = true) {
        if (obj instanceof FormulaError2)
          return obj;
        let number;
        if (typeof obj === "number")
          number = obj;
        else if (typeof obj === "boolean") {
          if (allowBoolean) {
            number = Number(obj);
          } else {
            throw FormulaError2.VALUE;
          }
        } else if (typeof obj === "string") {
          if (obj.length === 0) {
            throw FormulaError2.VALUE;
          }
          number = Number(obj);
          if (number !== number) {
            throw FormulaError2.VALUE;
          }
        } else if (Array.isArray(obj)) {
          if (!isArray) {
            if (obj[0].length === 1) {
              number = this.acceptNumber(obj[0][0]);
            } else {
              throw FormulaError2.VALUE;
            }
          } else {
            number = this.acceptNumber(obj[0][0]);
          }
        } else {
          throw Error("Unknown type in FormulaHelpers.acceptNumber");
        }
        return number;
      }
      /**
       * Flatten parameters to 1D array.
       * @see {@link FormulaHelpers.accept}
       * @param {Array} params - Parameter that needs to flatten.
       * @param {Types|null} valueType - The type each item should be,
       *                          null if allows any type. This only applies to literals.
       * @param {boolean} allowUnion - Allow union, e.g. (A1:C1, E4:F3)
       * @param {function} hook - Invoked after parsing each item.
       *                         of the array.
       * @param {*} [defValue=null] - The value if an param is omitted. i.e. SUM(1,2,,,,,)
       * @param {number} [minSize=1] - The minimum size of the parameters
       */
      flattenParams(params, valueType, allowUnion, hook, defValue = null, minSize = 1) {
        if (params.length < minSize)
          throw FormulaError2.ARG_MISSING([valueType]);
        if (defValue == null) {
          defValue = valueType === Types.NUMBER ? 0 : valueType == null ? null : "";
        }
        params.forEach((param) => {
          const { isCellRef, isRangeRef, isArray } = param;
          const isUnion = param.value instanceof Collection;
          const isLiteral = !isCellRef && !isRangeRef && !isArray && !isUnion;
          const info = { isLiteral, isCellRef, isRangeRef, isArray, isUnion };
          if (isLiteral) {
            if (param.omitted)
              param = defValue;
            else
              param = this.accept(param, valueType, defValue);
            hook(param, info);
          } else if (isCellRef) {
            hook(param.value, info);
          } else if (isUnion) {
            if (!allowUnion) throw FormulaError2.VALUE;
            param = param.value.data;
            param = this.flattenDeep(param);
            param.forEach((item) => {
              hook(item, info);
            });
          } else if (isRangeRef || isArray) {
            param = this.flattenDeep(param.value);
            param.forEach((item) => {
              hook(item, info);
            });
          }
        });
      }
      /**
       * Check if the param valid, return the parsed param.
       * If type is not given, return the un-parsed param.
       * @param {*} param
       * @param {number|null} [type] - The expected type
       *           NUMBER: Expect a single number,
       *           ARRAY: Expect an flatten array,
       *           BOOLEAN: Expect a single boolean,
       *           STRING: Expect a single string,
       *           COLLECTIONS: Expect an Array of the above types
       *           null: Do not parse the value, return it directly.
       *           The collection is not a flatted array.
       * @param {*} [defValue] - Default value if the param is not given.
       *               if undefined, this param is required, a Error will throw if not given.
       *               if null, and param is undefined, null will be returned.
       * @param {boolean} [flat=true] - If the array should be flattened,
       *                      only applicable when type is ARRAY.
       *                      If false, collection is disallowed.
       * @param {boolean} allowSingleValue - If pack single value into 2d array,
       *                     only applicable when type is ARRAY.
       * @return {string|number|boolean|{}|Array}
       */
      accept(param, type = null, defValue, flat = true, allowSingleValue = false) {
        if (Array.isArray(type))
          type = type[0];
        if (param == null && defValue === void 0) {
          throw FormulaError2.ARG_MISSING([type]);
        } else if (param == null)
          return defValue;
        if (typeof param !== "object" || Array.isArray(param))
          return param;
        const isArray = param.isArray;
        if (param.value != null) param = param.value;
        if (type == null)
          return param;
        if (param instanceof FormulaError2)
          throw param;
        if (type === Types.ARRAY) {
          if (Array.isArray(param)) {
            return flat ? this.flattenDeep(param) : param;
          } else if (param instanceof Collection) {
            throw FormulaError2.VALUE;
          } else if (allowSingleValue) {
            return flat ? [param] : [[param]];
          }
          throw FormulaError2.VALUE;
        } else if (type === Types.COLLECTIONS) {
          return param;
        }
        if (isArray) {
          param = param[0][0];
        }
        const paramType = this.type(param);
        if (type === Types.STRING) {
          if (paramType === Types.BOOLEAN)
            param = param ? "TRUE" : "FALSE";
          else
            param = `${param}`;
        } else if (type === Types.BOOLEAN) {
          if (paramType === Types.STRING)
            throw FormulaError2.VALUE;
          if (paramType === Types.NUMBER)
            param = Boolean(param);
        } else if (type === Types.NUMBER) {
          param = this.acceptNumber(param, false);
        } else if (type === Types.NUMBER_NO_BOOLEAN) {
          param = this.acceptNumber(param, false, false);
        } else {
          throw FormulaError2.VALUE;
        }
        return param;
      }
      type(variable) {
        let type = this.type2Number[typeof variable];
        if (type === -1) {
          if (Array.isArray(variable))
            type = Types.ARRAY;
          else if (variable.ref) {
            if (variable.ref.from) {
              type = Types.RANGE_REF;
            } else {
              type = Types.CELL_REF;
            }
          } else if (variable instanceof Collection)
            type = Types.COLLECTIONS;
        }
        return type;
      }
      isRangeRef(param) {
        return param.ref && param.ref.from;
      }
      isCellRef(param) {
        return param.ref && !param.ref.from;
      }
      /**
       * Helper function for SUMIF, AVERAGEIF,...
       * @param context
       * @param range1
       * @param range2
       */
      retrieveRanges(context, range1, range2) {
        range2 = Address.extend(range1, range2);
        range1 = this.retrieveArg(context, range1);
        range1 = H.accept(range1, Types.ARRAY, void 0, false, true);
        if (range2 !== range1) {
          range2 = this.retrieveArg(context, range2);
          range2 = H.accept(range2, Types.ARRAY, void 0, false, true);
        } else
          range2 = range1;
        return [range1, range2];
      }
      retrieveArg(context, arg) {
        if (arg === null)
          return { value: 0, isArray: false, omitted: true };
        const res = context.utils.extractRefValue(arg);
        return { value: res.val, isArray: res.isArray, ref: arg.ref };
      }
    };
    var H = new FormulaHelpers2();
    var WildCard = {
      /**
       * @param {string|*} obj
       * @returns {*}
       */
      isWildCard: (obj) => {
        if (typeof obj === "string")
          return /[*?]/.test(obj);
        return false;
      },
      toRegex: (lookupText, flags) => {
        return RegExp(lookupText.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/([^~]??)[?]/g, "$1.").replace(/([^~]??)[*]/g, "$1.*").replace(/~([?*])/g, "$1"), flags);
      }
    };
    var Criteria = {
      /**
       * Parse criteria, support comparison and wild card match.
       * @param {string|number} criteria
       * @return {{op: string, value: string|number|boolean|RegExp, match: boolean|undefined}} - The parsed criteria.
       */
      parse: (criteria) => {
        const type = typeof criteria;
        if (type === "string") {
          const upper = criteria.toUpperCase();
          if (upper === "TRUE" || upper === "FALSE") {
            return { op: "=", value: upper === "TRUE" };
          }
          const res = criteria.match(/(<>|>=|<=|>|<|=)(.*)/);
          if (res) {
            let op = res[1], value;
            if (isNaN(res[2])) {
              const upper2 = res[2].toUpperCase();
              if (upper2 === "TRUE" || upper2 === "FALSE") {
                value = upper2 === "TRUE";
              } else if (/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(res[2])) {
                value = new FormulaError2(res[2]);
              } else {
                value = res[2];
                if (WildCard.isWildCard(value)) {
                  return { op: "wc", value: WildCard.toRegex(value), match: op === "=" };
                }
              }
            } else {
              value = Number(res[2]);
            }
            return { op, value };
          } else if (WildCard.isWildCard(criteria)) {
            return { op: "wc", value: WildCard.toRegex(criteria), match: true };
          } else {
            return { op: "=", value: criteria };
          }
        } else if (type === "boolean" || type === "number" || (Array.isArray(criteria) || criteria instanceof FormulaError2)) {
          return { op: "=", value: criteria };
        } else {
          throw Error(`Criteria.parse: type ${typeof criteria} not support`);
        }
      }
    };
    var Address = {
      columnNumberToName: (number) => {
        let dividend = number;
        let name = "";
        let modulo = 0;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          name = String.fromCharCode("A".charCodeAt(0) + modulo) + name;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return name;
      },
      columnNameToNumber: (columnName) => {
        columnName = columnName.toUpperCase();
        const len = columnName.length;
        let number = 0;
        for (let i = 0; i < len; i++) {
          const code = columnName.charCodeAt(i);
          if (!isNaN(code)) {
            number += (code - 64) * 26 ** (len - i - 1);
          }
        }
        return number;
      },
      /**
       * Extend range2 to match with the dimension in range1.
       * @param {{ref: {}}} range1
       * @param {{ref: {}}} [range2]
       */
      extend: (range1, range2) => {
        if (range2 == null) {
          return range1;
        }
        let rowOffset, colOffset;
        if (H.isCellRef(range1)) {
          rowOffset = 0;
          colOffset = 0;
        } else if (H.isRangeRef(range1)) {
          rowOffset = range1.ref.to.row - range1.ref.from.row;
          colOffset = range1.ref.to.col - range1.ref.from.col;
        } else throw Error("Address.extend should not reach here.");
        if (H.isCellRef(range2)) {
          if (rowOffset > 0 || colOffset > 0)
            range2 = {
              ref: {
                from: { col: range2.ref.col, row: range2.ref.row },
                to: { row: range2.ref.row + rowOffset, col: range2.ref.col + colOffset }
              }
            };
        } else {
          range2.ref.to.row = range2.ref.from.row + rowOffset;
          range2.ref.to.col = range2.ref.from.col + colOffset;
        }
        return range2;
      }
    };
    module2.exports = {
      FormulaHelpers: H,
      Types,
      ReversedTypes,
      Factorials,
      WildCard,
      Criteria,
      Address
    };
  }
});

// ../work/LesterLyu__fast-formula-parser/formulas/error.js
var require_error = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/error.js"(exports2, module2) {
    var FormulaError2 = class _FormulaError extends Error {
      /**
       * @param {string} error - error code, i.e. #NUM!
       * @param {string} [msg] - detailed error message
       * @param {object|Error} [details]
       * @returns {FormulaError}
       */
      constructor(error, msg, details) {
        super(msg);
        if (msg == null && details == null && _FormulaError.errorMap.has(error))
          return _FormulaError.errorMap.get(error);
        else if (msg == null && details == null) {
          this._error = error;
          _FormulaError.errorMap.set(error, this);
        } else {
          this._error = error;
        }
        this.details = details;
      }
      /**
       * Get the error name.
       * @returns {string} formula error
       */
      get error() {
        return this._error;
      }
      get name() {
        return this._error;
      }
      /**
       * Return true if two errors are same.
       * @param {FormulaError} err
       * @returns {boolean} if two errors are same.
       */
      equals(err) {
        return err instanceof _FormulaError && err._error === this._error;
      }
      /**
       * Return the formula error in string representation.
       * @returns {string} the formula error in string representation.
       */
      toString() {
        return this._error;
      }
    };
    FormulaError2.errorMap = /* @__PURE__ */ new Map();
    FormulaError2.DIV0 = new FormulaError2("#DIV/0!");
    FormulaError2.NA = new FormulaError2("#N/A");
    FormulaError2.NAME = new FormulaError2("#NAME?");
    FormulaError2.NULL = new FormulaError2("#NULL!");
    FormulaError2.NUM = new FormulaError2("#NUM!");
    FormulaError2.REF = new FormulaError2("#REF!");
    FormulaError2.VALUE = new FormulaError2("#VALUE!");
    FormulaError2.NOT_IMPLEMENTED = (functionName) => {
      return new FormulaError2("#NAME?", `Function ${functionName} is not implemented.`);
    };
    FormulaError2.TOO_MANY_ARGS = (functionName) => {
      return new FormulaError2("#N/A", `Function ${functionName} has too many arguments.`);
    };
    FormulaError2.ARG_MISSING = (args) => {
      const { Types } = require_helpers();
      return new FormulaError2("#N/A", `Argument type ${args.map((arg) => Types[arg]).join(", ")} is missing.`);
    };
    FormulaError2.ERROR = (msg, details) => {
      return new FormulaError2("#ERROR!", msg, details);
    };
    module2.exports = FormulaError2;
  }
});

// ../work/LesterLyu__fast-formula-parser/grammar/lexing.js
var require_lexing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/lexing.js"(exports2, module2) {
    var { createToken, Lexer } = require("chevrotain");
    var FormulaError2 = require_error();
    var tokenVocabulary = {};
    var WhiteSpace = createToken({
      name: "WhiteSpace",
      pattern: /\s+/,
      group: Lexer.SKIPPED
    });
    var String2 = createToken({
      name: "String",
      pattern: /"(""|[^"])*"/
    });
    var SingleQuotedString = createToken({
      name: "SingleQuotedString",
      pattern: /'(''|[^'])*'/
    });
    var SheetQuoted = createToken({
      name: "SheetQuoted",
      pattern: /'((?![\\\/\[\]*?:]).)+?'!/
    });
    var Function = createToken({
      name: "Function",
      pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/
    });
    var FormulaErrorT = createToken({
      name: "FormulaErrorT",
      pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/
    });
    var RefError = createToken({
      name: "RefError",
      pattern: /#REF!/
    });
    var Name = createToken({
      name: "Name",
      pattern: /[a-zA-Z_][a-zA-Z0-9_.?]*/
      // longer_alt: RangeColumn // e.g. A:AA
    });
    var Sheet = createToken({
      name: "Sheet",
      pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/
    });
    var Cell = createToken({
      name: "Cell",
      pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/,
      longer_alt: Name
    });
    var Number2 = createToken({
      name: "Number",
      pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/
    });
    var Boolean2 = createToken({
      name: "Boolean",
      pattern: /TRUE|FALSE/i
    });
    var Column = createToken({
      name: "Column",
      pattern: /[$]?[A-Za-z]{1,3}/,
      longer_alt: Name
    });
    var At = createToken({
      name: "At",
      pattern: /@/
    });
    var Comma = createToken({
      name: "Comma",
      pattern: /,/
    });
    var Colon = createToken({
      name: "Colon",
      pattern: /:/
    });
    var Semicolon = createToken({
      name: "Semicolon",
      pattern: /;/
    });
    var OpenParen = createToken({
      name: "OpenParen",
      pattern: /\(/
    });
    var CloseParen = createToken({
      name: "CloseParen",
      pattern: /\)/
    });
    var OpenSquareParen = createToken({
      name: "OpenSquareParen",
      pattern: /\[/
    });
    var CloseSquareParen = createToken({
      name: "CloseSquareParen",
      pattern: /]/
    });
    var ExclamationMark = createToken({
      name: "exclamationMark",
      pattern: /!/
    });
    var OpenCurlyParen = createToken({
      name: "OpenCurlyParen",
      pattern: /{/
    });
    var CloseCurlyParen = createToken({
      name: "CloseCurlyParen",
      pattern: /}/
    });
    var QuoteS = createToken({
      name: "QuoteS",
      pattern: /'/
    });
    var MulOp = createToken({
      name: "MulOp",
      pattern: /\*/
    });
    var PlusOp = createToken({
      name: "PlusOp",
      pattern: /\+/
    });
    var DivOp = createToken({
      name: "DivOp",
      pattern: /\//
    });
    var MinOp = createToken({
      name: "MinOp",
      pattern: /-/
    });
    var ConcatOp = createToken({
      name: "ConcatOp",
      pattern: /&/
    });
    var ExOp = createToken({
      name: "ExOp",
      pattern: /\^/
    });
    var PercentOp = createToken({
      name: "PercentOp",
      pattern: /%/
    });
    var GtOp = createToken({
      name: "GtOp",
      pattern: />/
    });
    var EqOp = createToken({
      name: "EqOp",
      pattern: /=/
    });
    var LtOp = createToken({
      name: "LtOp",
      pattern: /</
    });
    var NeqOp = createToken({
      name: "NeqOp",
      pattern: /<>/
    });
    var GteOp = createToken({
      name: "GteOp",
      pattern: />=/
    });
    var LteOp = createToken({
      name: "LteOp",
      pattern: /<=/
    });
    var allTokens = [
      WhiteSpace,
      String2,
      SheetQuoted,
      SingleQuotedString,
      Function,
      FormulaErrorT,
      RefError,
      Sheet,
      Cell,
      Boolean2,
      Column,
      Name,
      Number2,
      At,
      Comma,
      Colon,
      Semicolon,
      OpenParen,
      CloseParen,
      OpenSquareParen,
      CloseSquareParen,
      // ExclamationMark,
      OpenCurlyParen,
      CloseCurlyParen,
      QuoteS,
      MulOp,
      PlusOp,
      DivOp,
      MinOp,
      ConcatOp,
      ExOp,
      MulOp,
      PercentOp,
      NeqOp,
      GteOp,
      LteOp,
      GtOp,
      EqOp,
      LtOp
    ];
    var SelectLexer = new Lexer(allTokens, { ensureOptimizations: true });
    allTokens.forEach((tokenType) => {
      tokenVocabulary[tokenType.name] = tokenType;
    });
    module2.exports = {
      tokenVocabulary,
      lex: function(inputText) {
        const lexingResult = SelectLexer.tokenize(inputText);
        if (lexingResult.errors.length > 0) {
          const error = lexingResult.errors[0];
          const line = error.line, column = error.column;
          let msg = "\n" + inputText.split("\n")[line - 1] + "\n";
          msg += Array(column - 1).fill(" ").join("") + "^\n";
          error.message = msg + `Error at position ${line}:${column}
` + error.message;
          error.errorLocation = { line, column };
          throw FormulaError2.ERROR(error.message, error);
        }
        return lexingResult;
      }
    };
  }
});

// ../work/LesterLyu__fast-formula-parser/grammar/parsing.js
var require_parsing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/parsing.js"(exports2, module2) {
    var lexer2 = require_lexing();
    var { EmbeddedActionsParser } = require("chevrotain");
    var tokenVocabulary = lexer2.tokenVocabulary;
    var {
      String: String2,
      SheetQuoted,
      ExcelRefFunction,
      ExcelConditionalRefFunction,
      Function,
      FormulaErrorT,
      RefError,
      Cell,
      Sheet,
      Name,
      Number: Number2,
      Boolean: Boolean2,
      Column,
      // At,
      Comma,
      Colon,
      Semicolon,
      OpenParen,
      CloseParen,
      // OpenSquareParen,
      // CloseSquareParen,
      // ExclamationMark,
      OpenCurlyParen,
      CloseCurlyParen,
      MulOp,
      PlusOp,
      DivOp,
      MinOp,
      ConcatOp,
      ExOp,
      PercentOp,
      NeqOp,
      GteOp,
      LteOp,
      GtOp,
      EqOp,
      LtOp
    } = lexer2.tokenVocabulary;
    var Parsing = class extends EmbeddedActionsParser {
      /**
       *
       * @param {FormulaParser|DepParser} context
       * @param {Utils} utils
       */
      constructor(context, utils) {
        super(tokenVocabulary, {
          outputCst: false,
          maxLookahead: 1,
          skipValidations: true
          // traceInitPerf: true,
        });
        this.utils = utils;
        this.binaryOperatorsPrecedence = [
          ["^"],
          ["*", "/"],
          ["+", "-"],
          ["&"],
          ["<", ">", "=", "<>", "<=", ">="]
        ];
        const $ = this;
        $.RULE("formulaWithBinaryOp", () => {
          const infixes = [];
          const values = [$.SUBRULE($.formulaWithPercentOp)];
          $.MANY(() => {
            infixes.push($.OR($.c1 || ($.c1 = [
              { ALT: () => $.CONSUME(GtOp).image },
              { ALT: () => $.CONSUME(EqOp).image },
              { ALT: () => $.CONSUME(LtOp).image },
              { ALT: () => $.CONSUME(NeqOp).image },
              { ALT: () => $.CONSUME(GteOp).image },
              { ALT: () => $.CONSUME(LteOp).image },
              { ALT: () => $.CONSUME(ConcatOp).image },
              { ALT: () => $.CONSUME(PlusOp).image },
              { ALT: () => $.CONSUME(MinOp).image },
              { ALT: () => $.CONSUME(MulOp).image },
              { ALT: () => $.CONSUME(DivOp).image },
              { ALT: () => $.CONSUME(ExOp).image }
            ])));
            values.push($.SUBRULE2($.formulaWithPercentOp));
          });
          $.ACTION(() => {
            for (const ops of this.binaryOperatorsPrecedence) {
              for (let index = 0, length = infixes.length; index < length; index++) {
                const infix = infixes[index];
                if (!ops.includes(infix)) continue;
                infixes.splice(index, 1);
                values.splice(index, 2, this.utils.applyInfix(values[index], infix, values[index + 1]));
                index--;
                length--;
              }
            }
          });
          return values[0];
        });
        $.RULE("plusMinusOp", () => $.OR([
          { ALT: () => $.CONSUME(PlusOp).image },
          { ALT: () => $.CONSUME(MinOp).image }
        ]));
        $.RULE("formulaWithPercentOp", () => {
          let value = $.SUBRULE($.formulaWithUnaryOp);
          $.OPTION(() => {
            const postfix = $.CONSUME(PercentOp).image;
            value = $.ACTION(() => this.utils.applyPostfix(value, postfix));
          });
          return value;
        });
        $.RULE("formulaWithUnaryOp", () => {
          const prefixes = [];
          $.MANY(() => {
            const op = $.OR([
              { ALT: () => $.CONSUME(PlusOp).image },
              { ALT: () => $.CONSUME(MinOp).image }
            ]);
            prefixes.push(op);
          });
          const formula = $.SUBRULE($.formulaWithIntersect);
          if (prefixes.length > 0) return $.ACTION(() => this.utils.applyPrefix(prefixes, formula));
          return formula;
        });
        $.RULE("formulaWithIntersect", () => {
          let ref1 = $.SUBRULE($.formulaWithRange);
          const refs = [ref1];
          $.MANY({
            GATE: () => {
              const prevToken = $.LA(0);
              const nextToken = $.LA(1);
              return nextToken.startOffset > prevToken.endOffset + 1;
            },
            DEF: () => {
              refs.push($.SUBRULE3($.formulaWithRange));
            }
          });
          if (refs.length > 1) {
            return $.ACTION(() => $.ACTION(() => this.utils.applyIntersect(refs)));
          }
          return ref1;
        });
        $.RULE("formulaWithRange", () => {
          const ref1 = $.SUBRULE($.formula);
          const refs = [ref1];
          $.MANY(() => {
            $.CONSUME(Colon);
            refs.push($.SUBRULE2($.formula));
          });
          if (refs.length > 1)
            return $.ACTION(() => $.ACTION(() => this.utils.applyRange(refs)));
          return ref1;
        });
        $.RULE("formula", () => $.OR9([
          { ALT: () => $.SUBRULE($.referenceWithoutInfix) },
          { ALT: () => $.SUBRULE($.paren) },
          { ALT: () => $.SUBRULE($.constant) },
          { ALT: () => $.SUBRULE($.functionCall) },
          { ALT: () => $.SUBRULE($.constantArray) }
        ]));
        $.RULE("paren", () => {
          $.CONSUME(OpenParen);
          let result;
          const refs = [];
          refs.push($.SUBRULE($.formulaWithBinaryOp));
          $.MANY(() => {
            $.CONSUME(Comma);
            refs.push($.SUBRULE2($.formulaWithBinaryOp));
          });
          if (refs.length > 1)
            result = $.ACTION(() => this.utils.applyUnion(refs));
          else
            result = refs[0];
          $.CONSUME(CloseParen);
          return result;
        });
        $.RULE("constantArray", () => {
          const arr = [[]];
          let currentRow = 0;
          $.CONSUME(OpenCurlyParen);
          arr[currentRow].push($.SUBRULE($.constantForArray));
          $.MANY(() => {
            const sep = $.OR([
              { ALT: () => $.CONSUME(Comma).image },
              { ALT: () => $.CONSUME(Semicolon).image }
            ]);
            const constant = $.SUBRULE2($.constantForArray);
            if (sep === ",") {
              arr[currentRow].push(constant);
            } else {
              currentRow++;
              arr[currentRow] = [];
              arr[currentRow].push(constant);
            }
          });
          $.CONSUME(CloseCurlyParen);
          return $.ACTION(() => this.utils.toArray(arr));
        });
        $.RULE("constantForArray", () => $.OR([
          {
            ALT: () => {
              const prefix = $.OPTION(() => $.SUBRULE($.plusMinusOp));
              const image = $.CONSUME(Number2).image;
              const number = $.ACTION(() => this.utils.toNumber(image));
              if (prefix)
                return $.ACTION(() => this.utils.applyPrefix([prefix], number));
              return number;
            }
          },
          {
            ALT: () => {
              const str = $.CONSUME(String2).image;
              return $.ACTION(() => this.utils.toString(str));
            }
          },
          {
            ALT: () => {
              const bool = $.CONSUME(Boolean2).image;
              return $.ACTION(() => this.utils.toBoolean(bool));
            }
          },
          {
            ALT: () => {
              const err = $.CONSUME(FormulaErrorT).image;
              return $.ACTION(() => this.utils.toError(err));
            }
          },
          {
            ALT: () => {
              const err = $.CONSUME(RefError).image;
              return $.ACTION(() => this.utils.toError(err));
            }
          }
        ]));
        $.RULE("constant", () => $.OR([
          {
            ALT: () => {
              const number = $.CONSUME(Number2).image;
              return $.ACTION(() => this.utils.toNumber(number));
            }
          },
          {
            ALT: () => {
              const str = $.CONSUME(String2).image;
              return $.ACTION(() => this.utils.toString(str));
            }
          },
          {
            ALT: () => {
              const bool = $.CONSUME(Boolean2).image;
              return $.ACTION(() => this.utils.toBoolean(bool));
            }
          },
          {
            ALT: () => {
              const err = $.CONSUME(FormulaErrorT).image;
              return $.ACTION(() => this.utils.toError(err));
            }
          }
        ]));
        $.RULE("functionCall", () => {
          const functionName = $.CONSUME(Function).image.slice(0, -1);
          const args = $.SUBRULE($.arguments);
          $.CONSUME(CloseParen);
          return $.ACTION(() => context.callFunction(functionName, args));
        });
        $.RULE("arguments", () => {
          $.MANY2(() => {
            $.CONSUME2(Comma);
          });
          const args = [];
          $.OPTION(() => {
            args.push($.SUBRULE($.formulaWithBinaryOp));
            $.MANY(() => {
              $.CONSUME1(Comma);
              args.push(null);
              $.OPTION3(() => {
                args.pop();
                args.push($.SUBRULE2($.formulaWithBinaryOp));
              });
            });
          });
          return args;
        });
        $.RULE("referenceWithoutInfix", () => $.OR([
          { ALT: () => $.SUBRULE($.referenceItem) },
          {
            // sheet name prefix
            ALT: () => {
              const sheetName = $.SUBRULE($.prefixName);
              const referenceItem = $.SUBRULE2($.formulaWithRange);
              $.ACTION(() => {
                if (this.utils.isFormulaError(referenceItem))
                  return referenceItem;
                referenceItem.ref.sheet = sheetName;
              });
              return referenceItem;
            }
          }
          // {ALT: () => $.SUBRULE('dynamicDataExchange')},
        ]));
        $.RULE("referenceItem", () => $.OR([
          {
            ALT: () => {
              const address = $.CONSUME(Cell).image;
              return $.ACTION(() => this.utils.parseCellAddress(address));
            }
          },
          {
            ALT: () => {
              const name = $.CONSUME(Name).image;
              return $.ACTION(() => context.getVariable(name));
            }
          },
          {
            ALT: () => {
              const column = $.CONSUME(Column).image;
              return $.ACTION(() => this.utils.parseCol(column));
            }
          },
          // A row check should be here, but the token is same with Number,
          // In other to resolve ambiguities, I leave this empty, and
          // parse the number to row number when needed.
          {
            ALT: () => {
              const err = $.CONSUME(RefError).image;
              return $.ACTION(() => this.utils.toError(err));
            }
          }
          // {ALT: () => $.SUBRULE($.udfFunctionCall)},
          // {ALT: () => $.SUBRULE($.structuredReference)},
        ]));
        $.RULE("prefixName", () => $.OR([
          { ALT: () => $.CONSUME(Sheet).image.slice(0, -1) },
          { ALT: () => $.CONSUME(SheetQuoted).image.slice(1, -2).replace(/''/g, "'") }
        ]));
        this.performSelfAnalysis();
      }
    };
    module2.exports = {
      Parser: Parsing
    };
  }
});

// ../work/LesterLyu__fast-formula-parser/formulas/operators.js
var require_operators = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/operators.js"(exports2, module2) {
    var FormulaError2 = require_error();
    var { FormulaHelpers: FormulaHelpers2 } = require_helpers();
    var Prefix = {
      unaryOp: (prefixes, value, isArray) => {
        let sign = 1;
        prefixes.forEach((prefix) => {
          if (prefix === "+") {
          } else if (prefix === "-") {
            sign = -sign;
          } else {
            throw new Error(`Unrecognized prefix: ${prefix}`);
          }
        });
        if (value == null) {
          value = 0;
        }
        if (sign === 1) {
          return value;
        }
        try {
          value = FormulaHelpers2.acceptNumber(value, isArray);
        } catch (e) {
          if (e instanceof FormulaError2) {
            if (Array.isArray(value))
              value = value[0][0];
          } else
            throw e;
        }
        if (typeof value === "number" && isNaN(value)) return FormulaError2.VALUE;
        return -value;
      }
    };
    var Postfix = {
      percentOp: (value, postfix, isArray) => {
        try {
          value = FormulaHelpers2.acceptNumber(value, isArray);
        } catch (e) {
          if (e instanceof FormulaError2)
            return e;
          throw e;
        }
        if (postfix === "%") {
          return value / 100;
        }
        throw new Error(`Unrecognized postfix: ${postfix}`);
      }
    };
    var type2Number = { "boolean": 3, "string": 2, "number": 1 };
    var Infix = {
      compareOp: (value1, infix, value2, isArray1, isArray2) => {
        if (value1 == null) value1 = 0;
        if (value2 == null) value2 = 0;
        if (isArray1) {
          value1 = value1[0][0];
        }
        if (isArray2) {
          value2 = value2[0][0];
        }
        const type1 = typeof value1, type2 = typeof value2;
        if (type1 === type2) {
          switch (infix) {
            case "=":
              return value1 === value2;
            case ">":
              return value1 > value2;
            case "<":
              return value1 < value2;
            case "<>":
              return value1 !== value2;
            case "<=":
              return value1 <= value2;
            case ">=":
              return value1 >= value2;
          }
        } else {
          switch (infix) {
            case "=":
              return false;
            case ">":
              return type2Number[type1] > type2Number[type2];
            case "<":
              return type2Number[type1] < type2Number[type2];
            case "<>":
              return true;
            case "<=":
              return type2Number[type1] <= type2Number[type2];
            case ">=":
              return type2Number[type1] >= type2Number[type2];
          }
        }
        throw Error("Infix.compareOp: Should not reach here.");
      },
      concatOp: (value1, infix, value2, isArray1, isArray2) => {
        if (value1 == null) value1 = "";
        if (value2 == null) value2 = "";
        if (isArray1) {
          value1 = value1[0][0];
        }
        if (isArray2) {
          value2 = value2[0][0];
        }
        const type1 = typeof value1, type2 = typeof value2;
        if (type1 === "boolean")
          value1 = value1 ? "TRUE" : "FALSE";
        if (type2 === "boolean")
          value2 = value2 ? "TRUE" : "FALSE";
        return "" + value1 + value2;
      },
      mathOp: (value1, infix, value2, isArray1, isArray2) => {
        if (value1 == null) value1 = 0;
        if (value2 == null) value2 = 0;
        try {
          value1 = FormulaHelpers2.acceptNumber(value1, isArray1);
          value2 = FormulaHelpers2.acceptNumber(value2, isArray2);
        } catch (e) {
          if (e instanceof FormulaError2)
            return e;
          throw e;
        }
        switch (infix) {
          case "+":
            return value1 + value2;
          case "-":
            return value1 - value2;
          case "*":
            return value1 * value2;
          case "/":
            if (value2 === 0)
              return FormulaError2.DIV0;
            return value1 / value2;
          case "^":
            return value1 ** value2;
        }
        throw Error("Infix.mathOp: Should not reach here.");
      }
    };
    module2.exports = {
      Prefix,
      Postfix,
      Infix,
      Operators: {
        compareOp: ["<", ">", "=", "<>", "<=", ">="],
        concatOp: ["&"],
        mathOp: ["+", "-", "*", "/", "^"]
      }
    };
  }
});

// ../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js
var require_utils = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js"(exports2, module2) {
    var FormulaError2 = require_error();
    var { FormulaHelpers: FormulaHelpers2, Types, Address } = require_helpers();
    var { Prefix, Postfix, Infix, Operators } = require_operators();
    var Collection = require_collection();
    var MAX_ROW = 1048576, MAX_COLUMN = 16384;
    var Utils2 = class {
      constructor(context) {
        this.context = context;
      }
      columnNameToNumber(columnName) {
        return Address.columnNameToNumber(columnName);
      }
      /**
       * Parse the cell address only.
       * @param {string} cellAddress
       * @return {{ref: {col: number, address: string, row: number}}}
       */
      parseCellAddress(cellAddress) {
        const res = cellAddress.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            col: this.columnNameToNumber(res[2]),
            row: +res[4]
          }
        };
      }
      parseRow(row) {
        const rowNum = +row;
        if (!Number.isInteger(rowNum))
          throw Error("Row number must be integer.");
        return {
          ref: {
            col: void 0,
            row: +row
          }
        };
      }
      parseCol(col) {
        return {
          ref: {
            col: this.columnNameToNumber(col),
            row: void 0
          }
        };
      }
      /**
       * Apply + or - unary prefix.
       * @param {Array.<string>} prefixes
       * @param {*} value
       * @return {*}
       */
      applyPrefix(prefixes, value) {
        this.extractRefValue(value);
        return 0;
      }
      applyPostfix(value, postfix) {
        this.extractRefValue(value);
        return 0;
      }
      applyInfix(value1, infix, value2) {
        this.extractRefValue(value1);
        this.extractRefValue(value2);
        return 0;
      }
      applyIntersect(refs) {
        if (this.isFormulaError(refs[0]))
          return refs[0];
        if (!refs[0].ref)
          throw Error(`Expecting a reference, but got ${refs[0]}.`);
        let maxRow, maxCol, minRow, minCol, sheet, res;
        const ref = refs.shift().ref;
        sheet = ref.sheet;
        if (!ref.from) {
          if (ref.row === void 0 || ref.col === void 0) {
            throw Error("Cannot intersect the whole row or column.");
          }
          maxRow = minRow = ref.row;
          maxCol = minCol = ref.col;
        } else {
          maxRow = Math.max(ref.from.row, ref.to.row);
          minRow = Math.min(ref.from.row, ref.to.row);
          maxCol = Math.max(ref.from.col, ref.to.col);
          minCol = Math.min(ref.from.col, ref.to.col);
        }
        let err;
        refs.forEach((ref2) => {
          if (this.isFormulaError(ref2))
            return ref2;
          ref2 = ref2.ref;
          if (!ref2) throw Error(`Expecting a reference, but got ${ref2}.`);
          if (!ref2.from) {
            if (ref2.row === void 0 || ref2.col === void 0) {
              throw Error("Cannot intersect the whole row or column.");
            }
            if (ref2.row > maxRow || ref2.row < minRow || ref2.col > maxCol || ref2.col < minCol || sheet !== ref2.sheet) {
              err = FormulaError2.NULL;
            }
            maxRow = minRow = ref2.row;
            maxCol = minCol = ref2.col;
          } else {
            const refMaxRow = Math.max(ref2.from.row, ref2.to.row);
            const refMinRow = Math.min(ref2.from.row, ref2.to.row);
            const refMaxCol = Math.max(ref2.from.col, ref2.to.col);
            const refMinCol = Math.min(ref2.from.col, ref2.to.col);
            if (refMinRow > maxRow || refMaxRow < minRow || refMinCol > maxCol || refMaxCol < minCol || sheet !== ref2.sheet) {
              err = FormulaError2.NULL;
            }
            maxRow = Math.min(maxRow, refMaxRow);
            minRow = Math.max(minRow, refMinRow);
            maxCol = Math.min(maxCol, refMaxCol);
            minCol = Math.max(minCol, refMinCol);
          }
        });
        if (err) return err;
        if (maxRow === minRow && maxCol === minCol) {
          res = {
            ref: {
              sheet,
              row: maxRow,
              col: maxCol
            }
          };
        } else {
          res = {
            ref: {
              sheet,
              from: { row: minRow, col: minCol },
              to: { row: maxRow, col: maxCol }
            }
          };
        }
        if (!res.ref.sheet)
          delete res.ref.sheet;
        return res;
      }
      applyUnion(refs) {
        const collection = new Collection();
        for (let i = 0; i < refs.length; i++) {
          if (this.isFormulaError(refs[i]))
            return refs[i];
          collection.add(this.extractRefValue(refs[i]).val, refs[i]);
        }
        return collection;
      }
      /**
       * Apply multiple references, e.g. A1:B3:C8:A:1:.....
       * @param refs
       // * @return {{ref: {from: {col: number, row: number}, to: {col: number, row: number}}}}
       */
      applyRange(refs) {
        let res, maxRow = -1, maxCol = -1, minRow = MAX_ROW + 1, minCol = MAX_COLUMN + 1;
        refs.forEach((ref) => {
          if (this.isFormulaError(ref))
            return ref;
          if (typeof ref === "number") {
            ref = this.parseRow(ref);
          }
          ref = ref.ref;
          if (ref.row === void 0) {
            minRow = 1;
            maxRow = MAX_ROW;
          }
          if (ref.col === void 0) {
            minCol = 1;
            maxCol = MAX_COLUMN;
          }
          if (ref.row > maxRow)
            maxRow = ref.row;
          if (ref.row < minRow)
            minRow = ref.row;
          if (ref.col > maxCol)
            maxCol = ref.col;
          if (ref.col < minCol)
            minCol = ref.col;
        });
        if (maxRow === minRow && maxCol === minCol) {
          res = {
            ref: {
              row: maxRow,
              col: maxCol
            }
          };
        } else {
          res = {
            ref: {
              from: { row: minRow, col: minCol },
              to: { row: maxRow, col: maxCol }
            }
          };
        }
        return res;
      }
      /**
       * Throw away the refs, and retrieve the value.
       * @return {{val: *, isArray: boolean}}
       */
      extractRefValue(obj) {
        const isArray = Array.isArray(obj);
        if (obj.ref) {
          return { val: this.context.retrieveRef(obj), isArray };
        }
        return { val: obj, isArray };
      }
      /**
       *
       * @param array
       * @return {Array}
       */
      toArray(array) {
        return array;
      }
      /**
       * @param {string} number
       * @return {number}
       */
      toNumber(number) {
        return Number(number);
      }
      /**
       * @param {string} string
       * @return {string}
       */
      toString(string) {
        return string.substring(1, string.length - 1).replace(/""/g, '"');
      }
      /**
       * @param {string} bool
       * @return {boolean}
       */
      toBoolean(bool) {
        return bool === "TRUE";
      }
      /**
       * Parse an error.
       * @param {string} error
       * @return {FormulaError}
       */
      toError(error) {
        return new FormulaError2(error.toUpperCase());
      }
      isFormulaError(obj) {
        return obj instanceof FormulaError2;
      }
    };
    module2.exports = Utils2;
  }
});

// ../work/LesterLyu__fast-formula-parser/grammar/utils.js
var require_utils2 = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/utils.js"(exports2, module2) {
    var FormulaError2 = require_error();
    var { Address } = require_helpers();
    var { Prefix, Postfix, Infix, Operators } = require_operators();
    var Collection = require_collection();
    var MAX_ROW = 1048576, MAX_COLUMN = 16384;
    var { NotAllInputParsedException } = require("chevrotain");
    var Utils2 = class {
      constructor(context) {
        this.context = context;
      }
      columnNameToNumber(columnName) {
        return Address.columnNameToNumber(columnName);
      }
      /**
       * Parse the cell address only.
       * @param {string} cellAddress
       * @return {{ref: {col: number, address: string, row: number}}}
       */
      parseCellAddress(cellAddress) {
        const res = cellAddress.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            address: res[0],
            col: this.columnNameToNumber(res[2]),
            row: +res[4]
          }
        };
      }
      parseRow(row) {
        const rowNum = +row;
        if (!Number.isInteger(rowNum))
          throw Error("Row number must be integer.");
        return {
          ref: {
            col: void 0,
            row: +row
          }
        };
      }
      parseCol(col) {
        return {
          ref: {
            col: this.columnNameToNumber(col),
            row: void 0
          }
        };
      }
      parseColRange(col1, col2) {
        col1 = this.columnNameToNumber(col1);
        col2 = this.columnNameToNumber(col2);
        return {
          ref: {
            from: {
              col: Math.min(col1, col2),
              row: null
            },
            to: {
              col: Math.max(col1, col2),
              row: null
            }
          }
        };
      }
      parseRowRange(row1, row2) {
        return {
          ref: {
            from: {
              col: null,
              row: Math.min(row1, row2)
            },
            to: {
              col: null,
              row: Math.max(row1, row2)
            }
          }
        };
      }
      _applyPrefix(prefixes, val, isArray) {
        if (this.isFormulaError(val))
          return val;
        return Prefix.unaryOp(prefixes, val, isArray);
      }
      async applyPrefixAsync(prefixes, value) {
        const { val, isArray } = this.extractRefValue(await value);
        return this._applyPrefix(prefixes, val, isArray);
      }
      /**
       * Apply + or - unary prefix.
       * @param {Array.<string>} prefixes
       * @param {*} value
       * @return {*}
       */
      applyPrefix(prefixes, value) {
        if (this.context.async) {
          return this.applyPrefixAsync(prefixes, value);
        } else {
          const { val, isArray } = this.extractRefValue(value);
          return this._applyPrefix(prefixes, val, isArray);
        }
      }
      _applyPostfix(val, isArray, postfix) {
        if (this.isFormulaError(val))
          return val;
        return Postfix.percentOp(val, postfix, isArray);
      }
      async applyPostfixAsync(value, postfix) {
        const { val, isArray } = this.extractRefValue(await value);
        return this._applyPostfix(val, isArray, postfix);
      }
      applyPostfix(value, postfix) {
        if (this.context.async) {
          return this.applyPostfixAsync(value, postfix);
        } else {
          const { val, isArray } = this.extractRefValue(value);
          return this._applyPostfix(val, isArray, postfix);
        }
      }
      _applyInfix(res1, infix, res2) {
        const val1 = res1.val, isArray1 = res1.isArray;
        const val2 = res2.val, isArray2 = res2.isArray;
        if (this.isFormulaError(val1))
          return val1;
        if (this.isFormulaError(val2))
          return val2;
        if (Operators.compareOp.includes(infix))
          return Infix.compareOp(val1, infix, val2, isArray1, isArray2);
        else if (Operators.concatOp.includes(infix))
          return Infix.concatOp(val1, infix, val2, isArray1, isArray2);
        else if (Operators.mathOp.includes(infix))
          return Infix.mathOp(val1, infix, val2, isArray1, isArray2);
        else
          throw new Error(`Unrecognized infix: ${infix}`);
      }
      async applyInfixAsync(value1, infix, value2) {
        const res1 = this.extractRefValue(await value1);
        const res2 = this.extractRefValue(await value2);
        return this._applyInfix(res1, infix, res2);
      }
      applyInfix(value1, infix, value2) {
        if (this.context.async) {
          return this.applyInfixAsync(value1, infix, value2);
        } else {
          const res1 = this.extractRefValue(value1);
          const res2 = this.extractRefValue(value2);
          return this._applyInfix(res1, infix, res2);
        }
      }
      applyIntersect(refs) {
        if (this.isFormulaError(refs[0]))
          return refs[0];
        if (!refs[0].ref)
          throw Error(`Expecting a reference, but got ${refs[0]}.`);
        let maxRow, maxCol, minRow, minCol, sheet, res;
        const ref = refs.shift().ref;
        sheet = ref.sheet;
        if (!ref.from) {
          if (ref.row === void 0 || ref.col === void 0) {
            throw Error("Cannot intersect the whole row or column.");
          }
          maxRow = minRow = ref.row;
          maxCol = minCol = ref.col;
        } else {
          maxRow = Math.max(ref.from.row, ref.to.row);
          minRow = Math.min(ref.from.row, ref.to.row);
          maxCol = Math.max(ref.from.col, ref.to.col);
          minCol = Math.min(ref.from.col, ref.to.col);
        }
        let err;
        refs.forEach((ref2) => {
          if (this.isFormulaError(ref2))
            return ref2;
          ref2 = ref2.ref;
          if (!ref2) throw Error(`Expecting a reference, but got ${ref2}.`);
          if (!ref2.from) {
            if (ref2.row === void 0 || ref2.col === void 0) {
              throw Error("Cannot intersect the whole row or column.");
            }
            if (ref2.row > maxRow || ref2.row < minRow || ref2.col > maxCol || ref2.col < minCol || sheet !== ref2.sheet) {
              err = FormulaError2.NULL;
            }
            maxRow = minRow = ref2.row;
            maxCol = minCol = ref2.col;
          } else {
            const refMaxRow = Math.max(ref2.from.row, ref2.to.row);
            const refMinRow = Math.min(ref2.from.row, ref2.to.row);
            const refMaxCol = Math.max(ref2.from.col, ref2.to.col);
            const refMinCol = Math.min(ref2.from.col, ref2.to.col);
            if (refMinRow > maxRow || refMaxRow < minRow || refMinCol > maxCol || refMaxCol < minCol || sheet !== ref2.sheet) {
              err = FormulaError2.NULL;
            }
            maxRow = Math.min(maxRow, refMaxRow);
            minRow = Math.max(minRow, refMinRow);
            maxCol = Math.min(maxCol, refMaxCol);
            minCol = Math.max(minCol, refMinCol);
          }
        });
        if (err) return err;
        if (maxRow === minRow && maxCol === minCol) {
          res = {
            ref: {
              sheet,
              row: maxRow,
              col: maxCol
            }
          };
        } else {
          res = {
            ref: {
              sheet,
              from: { row: minRow, col: minCol },
              to: { row: maxRow, col: maxCol }
            }
          };
        }
        if (!res.ref.sheet)
          delete res.ref.sheet;
        return res;
      }
      applyUnion(refs) {
        const collection = new Collection();
        for (let i = 0; i < refs.length; i++) {
          if (this.isFormulaError(refs[i]))
            return refs[i];
          collection.add(this.extractRefValue(refs[i]).val, refs[i]);
        }
        return collection;
      }
      /**
       * Apply multiple references, e.g. A1:B3:C8:A:1:.....
       * @param refs
       // * @return {{ref: {from: {col: number, row: number}, to: {col: number, row: number}}}}
       */
      applyRange(refs) {
        let res, maxRow = -1, maxCol = -1, minRow = MAX_ROW + 1, minCol = MAX_COLUMN + 1;
        refs.forEach((ref) => {
          if (this.isFormulaError(ref))
            return ref;
          if (typeof ref === "number") {
            ref = this.parseRow(ref);
          }
          ref = ref.ref;
          if (ref.row === void 0) {
            minRow = 1;
            maxRow = MAX_ROW;
          }
          if (ref.col === void 0) {
            minCol = 1;
            maxCol = MAX_COLUMN;
          }
          if (ref.row > maxRow)
            maxRow = ref.row;
          if (ref.row < minRow)
            minRow = ref.row;
          if (ref.col > maxCol)
            maxCol = ref.col;
          if (ref.col < minCol)
            minCol = ref.col;
        });
        if (maxRow === minRow && maxCol === minCol) {
          res = {
            ref: {
              row: maxRow,
              col: maxCol
            }
          };
        } else {
          res = {
            ref: {
              from: { row: minRow, col: minCol },
              to: { row: maxRow, col: maxCol }
            }
          };
        }
        return res;
      }
      /**
       * Throw away the refs, and retrieve the value.
       * @return {{val: *, isArray: boolean}}
       */
      extractRefValue(obj) {
        let res = obj, isArray = false;
        if (Array.isArray(res))
          isArray = true;
        if (obj.ref) {
          return { val: this.context.retrieveRef(obj), isArray };
        }
        return { val: res, isArray };
      }
      /**
       *
       * @param array
       * @return {Array}
       */
      toArray(array) {
        return array;
      }
      /**
       * @param {string} number
       * @return {number}
       */
      toNumber(number) {
        return Number(number);
      }
      /**
       * @param {string} string
       * @return {string}
       */
      toString(string) {
        return string.substring(1, string.length - 1).replace(/""/g, '"');
      }
      /**
       * @param {string} bool
       * @return {boolean}
       */
      toBoolean(bool) {
        return bool === "TRUE";
      }
      /**
       * Parse an error.
       * @param {string} error
       * @return {string}
       */
      toError(error) {
        return new FormulaError2(error.toUpperCase());
      }
      isFormulaError(obj) {
        return obj instanceof FormulaError2;
      }
      static formatChevrotainError(error, inputText) {
        let line, column, msg = "";
        if (error instanceof NotAllInputParsedException) {
          line = error.token.startLine;
          column = error.token.startColumn;
        } else {
          line = error.previousToken.startLine;
          column = error.previousToken.startColumn + 1;
        }
        msg += "\n" + inputText.split("\n")[line - 1] + "\n";
        msg += Array(column - 1).fill(" ").join("") + "^\n";
        msg += `Error at position ${line}:${column}
` + error.message;
        error.errorLocation = { line, column };
        return FormulaError2.ERROR(msg, error);
      }
    };
    module2.exports = Utils2;
  }
});

// ../work/LesterLyu__fast-formula-parser/grammar/dependency/hooks.js
var FormulaError = require_error();
var { FormulaHelpers } = require_helpers();
var { Parser } = require_parsing();
var lexer = require_lexing();
var Utils = require_utils();
var { formatChevrotainError } = require_utils2();
var DepParser = class {
  /**
   *
   * @param {{onVariable: Function}} [config]
   */
  constructor(config) {
    this.data = [];
    this.utils = new Utils(this);
    config = Object.assign({
      onVariable: () => null
    }, config);
    this.utils = new Utils(this);
    this.onVariable = config.onVariable;
    this.functions = {};
    this.parser = new Parser(this, this.utils);
  }
  /**
   * Get value from the cell reference
   * @param ref
   * @return {*}
   */
  getCell(ref) {
    if (ref.row != null) {
      if (ref.sheet == null)
        ref.sheet = this.position ? this.position.sheet : void 0;
      const idx = this.data.findIndex((element) => {
        return element.from && element.from.row <= ref.row && element.to.row >= ref.row && element.from.col <= ref.col && element.to.col >= ref.col || element.row === ref.row && element.col === ref.col && element.sheet === ref.sheet;
      });
      if (idx === -1)
        this.data.push(ref);
    }
    return 0;
  }
  /**
   * Get values from the range reference.
   * @param ref
   * @return {*}
   */
  getRange(ref) {
    if (ref.from.row != null) {
      if (ref.sheet == null)
        ref.sheet = this.position ? this.position.sheet : void 0;
      const idx = this.data.findIndex((element) => {
        return element.from && element.from.row === ref.from.row && element.from.col === ref.from.col && element.to.row === ref.to.row && element.to.col === ref.to.col;
      });
      if (idx === -1)
        this.data.push(ref);
    }
    return [[0]];
  }
  /**
   * TODO:
   * Get references or values from a user defined variable.
   * @param name
   * @return {*}
   */
  getVariable(name) {
    const res = { ref: this.onVariable(name, this.position.sheet) };
    if (res.ref == null)
      return FormulaError.NAME;
    if (FormulaHelpers.isCellRef(res))
      this.getCell(res.ref);
    else {
      this.getRange(res.ref);
    }
    return 0;
  }
  /**
   * Retrieve values from the given reference.
   * @param valueOrRef
   * @return {*}
   */
  retrieveRef(valueOrRef) {
    if (FormulaHelpers.isRangeRef(valueOrRef)) {
      return this.getRange(valueOrRef.ref);
    }
    if (FormulaHelpers.isCellRef(valueOrRef)) {
      return this.getCell(valueOrRef.ref);
    }
    return valueOrRef;
  }
  /**
   * Call an excel function.
   * @param name - Function name.
   * @param args - Arguments that pass to the function.
   * @return {*}
   */
  callFunction(name, args) {
    args.forEach((arg) => {
      if (arg == null)
        return;
      this.retrieveRef(arg);
    });
    return { value: 0, ref: {} };
  }
  /**
   * Check and return the appropriate formula result.
   * @param result
   * @return {*}
   */
  checkFormulaResult(result) {
    this.retrieveRef(result);
  }
  /**
   * Parse an excel formula and return the dependencies
   * @param {string} inputText
   * @param {{row: number, col: number, sheet: string}} position
   * @param {boolean} [ignoreError=false] if true, throw FormulaError when error occurred.
   *                                      if false, the parser will return partial dependencies.
   * @returns {Array.<{}>}
   */
  parse(inputText, position, ignoreError = false) {
    if (inputText.length === 0) throw Error("Input must not be empty.");
    this.data = [];
    this.position = position;
    const lexResult = lexer.lex(inputText);
    this.parser.input = lexResult.tokens;
    try {
      const res = this.parser.formulaWithBinaryOp();
      this.checkFormulaResult(res);
    } catch (e) {
      if (!ignoreError) {
        throw FormulaError.ERROR(e.message, e);
      }
    }
    if (this.parser.errors.length > 0 && !ignoreError) {
      const error = this.parser.errors[0];
      throw formatChevrotainError(error, inputText);
    }
    return this.data;
  }
};
module.exports = {
  DepParser
};
