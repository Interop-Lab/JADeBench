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
    var FormulaError = require_error();
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
    var FormulaHelpers = class {
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
            return FormulaError.VALUE;
          } else if (!isFinite(result)) {
            return FormulaError.NUM;
          }
        }
        if (result === void 0 || result === null)
          return FormulaError.NULL;
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
        if (obj instanceof FormulaError)
          return obj;
        let number;
        if (typeof obj === "number")
          number = obj;
        else if (typeof obj === "boolean") {
          if (allowBoolean) {
            number = Number(obj);
          } else {
            throw FormulaError.VALUE;
          }
        } else if (typeof obj === "string") {
          if (obj.length === 0) {
            throw FormulaError.VALUE;
          }
          number = Number(obj);
          if (number !== number) {
            throw FormulaError.VALUE;
          }
        } else if (Array.isArray(obj)) {
          if (!isArray) {
            if (obj[0].length === 1) {
              number = this.acceptNumber(obj[0][0]);
            } else {
              throw FormulaError.VALUE;
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
          throw FormulaError.ARG_MISSING([valueType]);
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
            if (!allowUnion) throw FormulaError.VALUE;
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
          throw FormulaError.ARG_MISSING([type]);
        } else if (param == null)
          return defValue;
        if (typeof param !== "object" || Array.isArray(param))
          return param;
        const isArray = param.isArray;
        if (param.value != null) param = param.value;
        if (type == null)
          return param;
        if (param instanceof FormulaError)
          throw param;
        if (type === Types.ARRAY) {
          if (Array.isArray(param)) {
            return flat ? this.flattenDeep(param) : param;
          } else if (param instanceof Collection) {
            throw FormulaError.VALUE;
          } else if (allowSingleValue) {
            return flat ? [param] : [[param]];
          }
          throw FormulaError.VALUE;
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
            throw FormulaError.VALUE;
          if (paramType === Types.NUMBER)
            param = Boolean(param);
        } else if (type === Types.NUMBER) {
          param = this.acceptNumber(param, false);
        } else if (type === Types.NUMBER_NO_BOOLEAN) {
          param = this.acceptNumber(param, false, false);
        } else {
          throw FormulaError.VALUE;
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
    var H = new FormulaHelpers();
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
                value = new FormulaError(res[2]);
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
        } else if (type === "boolean" || type === "number" || (Array.isArray(criteria) || criteria instanceof FormulaError)) {
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
    var FormulaError = class _FormulaError extends Error {
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
    FormulaError.errorMap = /* @__PURE__ */ new Map();
    FormulaError.DIV0 = new FormulaError("#DIV/0!");
    FormulaError.NA = new FormulaError("#N/A");
    FormulaError.NAME = new FormulaError("#NAME?");
    FormulaError.NULL = new FormulaError("#NULL!");
    FormulaError.NUM = new FormulaError("#NUM!");
    FormulaError.REF = new FormulaError("#REF!");
    FormulaError.VALUE = new FormulaError("#VALUE!");
    FormulaError.NOT_IMPLEMENTED = (functionName) => {
      return new FormulaError("#NAME?", `Function ${functionName} is not implemented.`);
    };
    FormulaError.TOO_MANY_ARGS = (functionName) => {
      return new FormulaError("#N/A", `Function ${functionName} has too many arguments.`);
    };
    FormulaError.ARG_MISSING = (args) => {
      const { Types } = require_helpers();
      return new FormulaError("#N/A", `Argument type ${args.map((arg) => Types[arg]).join(", ")} is missing.`);
    };
    FormulaError.ERROR = (msg, details) => {
      return new FormulaError("#ERROR!", msg, details);
    };
    module2.exports = FormulaError;
  }
});
module.exports = require_error();
