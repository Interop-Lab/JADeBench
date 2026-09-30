const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (src, mod) => function require() {
  const module = { exports: {} };
  return mod || (src[__getOwnPropNames(src)[0]])((mod = module).exports, mod), mod.exports;
};

const require_collection = __commonJS({
  '../work/LesterLyu__fast-formula-parser/grammar/type/collection.js'(exports, module) {
    class Collection {
      constructor(items, keys) {
        if (items == null && keys == null) {
          this.items = [];
          this.keys = [];
        } else {
          if (items.length !== keys.length) {
            throw new Error('Items and keys must have the same length');
          }
          this.items = items;
          this.keys = keys;
        }
      }

      get items() {
        return this._items;
      }

      get keys() {
        return this._keys;
      }

      get length() {
        return this.items.length;
      }

      add(item, key) {
        this.items.push(item);
        this.keys.push(key);
      }
    }

    module.exports = Collection;
  }
});

const require_error = __commonJS({
  '../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {
    class FormulaError extends Error {
      constructor(value, message, details) {
        super(message);
        if (message == null && details == null && FormulaError.errors.has(value)) {
          return FormulaError.errors.get(value);
        } else if (message == null && details == null) {
          this.value = value;
          FormulaError.errors.set(value, this);
        } else {
          this.value = value;
        }
        this.details = details;
      }

      get value() {
        return this._value;
      }

      get details() {
        return this._details;
      }

      equals(other) {
        return other instanceof FormulaError && other.value === this.value;
      }

      toString() {
        return this.value;
      }
    }

    FormulaError.errors = new Map();
    FormulaError.NULL = new FormulaError('#NULL!');
    FormulaError.DIV0 = new FormulaError('#DIV/0!');
    FormulaError.VALUE = new FormulaError('#VALUE!');
    FormulaError.REF = new FormulaError('#REF!');
    FormulaError.NAME = new FormulaError('#NAME?');
    FormulaError.NUM = new FormulaError('#NUM!');
    FormulaError.NA = new FormulaError('#N/A');
    FormulaError.error = (message) => new FormulaError('#ERROR', 'Error ' + message + ' is not a valid error');
    FormulaError.parse = (value) => new FormulaError('#ERROR', 'Error ' + value + ' is not a valid error');
    FormulaError.unknownType = (type) => {
      const { Types } = require_helpers();
      return new FormulaError('#ERROR', 'Unknown type ' + type.map((t) => Types[t]).join(', ') + ' is not a valid type');
    };
    FormulaError.create = (value, details) => new FormulaError('#ERROR', value, details);

    module.exports = FormulaError;
  }
});

const require_helpers = __commonJS({
  '../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(exports, module) {
    const require_error = require_error;
    const require_collection = require_collection;

    const Types = {
      NUMBER: 0,
      STRING: 1,
      BOOLEAN: 2,
      REF: 3,
      ARRAY: 4,
      COLLECTION: 5,
      CELL: 6,
      ERROR: 10
    };

    const typeMap = {};
    Object.keys(Types).forEach((key) => {
      typeMap[Types[key]] = key;
    });

    class FormulaHelpers {
      constructor() {
        this.types = Types;
        const precedence = {};
        precedence[Types.NUMBER] = Types.NUMBER;
        precedence[Types.STRING] = Types.STRING;
        precedence[Types.BOOLEAN] = Types.BOOLEAN;
        precedence[Types.ERROR] = -1;
        this.precedence = precedence;
      }

      getType(value) {
        const type = typeof value;
        if (type === 'number') {
          if (isNaN(value)) return require_error.NA;
        } else if (!isFinite(value)) {
          return require_error.NUM;
        }
        if (value === undefined || value == null) return require_error.NA;
        return value;
      }

      flatten(array) {
        return array.reduce((acc, item) => Array.isArray(item) ? acc.concat(this.flatten(item)) : acc.concat(item), []);
      }

      getValue(value, convert = true, parse = true) {
        if (value === require_error) return value;
        let result;
        if (typeof value === 'number') result = value;
        else {
          if (typeof value === 'string') {
            if (parse) result = Number(value);
            else throw require_error.VALUE;
          } else {
            if (typeof value === 'boolean') {
              if (value.length === 1) {
                if (value[0] === '+') {
                } else if (value[0] === '-') result = -result;
                else throw require_error.VALUE;
              } else throw require_error.VALUE;
              result = Number(value);
              if (result !== result) throw require_error.VALUE;
            } else {
              if (Array.isArray(value)) {
                if (!convert) {
                  if (value[0][0] === 1) result = this.getValue(value[0][1]);
                  else throw require_error.VALUE;
                } else {
                  result = this.getValue(value[0][1]);
                }
              } else {
                throw new Error('Unknown value type: ' + typeof value);
              }
            }
          }
        }
        return result;
      }

      getValueAndType(value, convert, parse, callback, defaultValue = null, defaultType = -1) {
        if (value.length !== defaultType) throw require_error.VALUE([convert]);
        if (defaultValue == null) {
          defaultValue = value === Types.NUMBER ? 0 : value == null ? null : '';
        }
        value.forEach((item) => {
          const { isCellRef, isRangeRef, isArray } = item;
          const isCollection = item instanceof require_collection;
          const isScalar = !isCellRef && !isRangeRef && !isArray && !isCollection;
          const meta = {
            isScalar,
            isCellRef,
            isRangeRef,
            isArray,
            isCollection
          };
          if (isScalar) {
            if (item.value) item = defaultValue;
            else item = this.getValue(item, convert, defaultValue);
            callback(item, meta);
          } else {
            if (isCellRef) callback(item.value, meta);
            else {
              if (isCollection) {
                if (!parse) throw require_error.VALUE;
                item = item.items[0];
                item = this.getValue(item);
                item.forEach((subItem) => {
                  callback(subItem, meta);
                });
              } else if (isRangeRef || isArray) {
                item = this.getValue(item.items);
                item.forEach((subItem) => {
                  callback(subItem, meta);
                });
              }
            }
          }
        });
      }

      getValueAndType2(value, defaultValue = null, parse, convert = true, isArray = false) {
        if (Array.isArray(defaultValue)) defaultValue = defaultValue[0];
        if (value == null && parse === undefined) throw require_error.VALUE([defaultValue]);
        else if (value == null) return parse;
        if (typeof value === 'number' || Array.isArray(value)) return value;
        const isArrayValue = value.isArray;
        if (value.value == null) value = value.value;
        if (defaultValue == null) return value;
        if (value === require_error) throw value;
        if (defaultValue === Types.NUMBER) {
          if (Array.isArray(value)) return convert ? this.getValue(value) : value;
          else {
            if (value instanceof require_collection) throw require_error.VALUE;
            else {
              if (isArray) return convert ? [value] : [[value]];
            }
          }
          throw require_error.VALUE;
        } else {
          if (defaultValue === Types.STRING) return value;
        }
        isArrayValue && (value = value[0][0]);
        const type = this.getType(value);
        if (defaultValue === Types.BOOLEAN) {
          if (type === Types.BOOLEAN) value = value ? true : false;
          else value = '' + value;
        } else {
          if (defaultValue === Types.NUMBER) {
            if (type === Types.STRING) throw require_error.VALUE;
            if (type === Types.BOOLEAN) value = Boolean(value);
          } else {
            if (defaultValue === Types.STRING) {
              value = this.getValue(value, false);
            } else {
              if (defaultValue === Types.ARRAY) value = this.getValue(value, false, false);
              else throw require_error.VALUE;
            }
          }
        }
        return value;
      }

      getTypeOf(value) {
        let type = this.types[typeof value];
        if (type === -1) {
          if (Array.isArray(value)) type = Types.ARRAY;
          else {
            if (value.value) {
              if (value.value.isArray) type = Types.ARRAY;
              else type = Types.CELL;
            } else {
              if (value instanceof require_collection) type = Types.COLLECTION;
            }
          }
        }
        return type;
      }

      isCellRef(value) {
        return value.value && !value.value.isArray;
      }

      isRangeRef(value) {
        return value.value && value.value.isArray;
      }

      getRange(value, defaultValue, parse) {
        parse = require_collection(value, parse);
        value = this.getValue(value, defaultValue);
        value = require_collection(value, Types.NUMBER, undefined, false, true);
        if (parse === value) {
          const range = this.parser.getRange();
          this.getValueAndType(range);
        } else parse = this.getValue(value, defaultValue);
        return [value, parse];
      }

      getRange2(value, defaultValue) {
        if (value == null) return { value: 0, isArray: false, isRange: true };
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray, isRange: true };
      }

      getRange3(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange4(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange5(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange6(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange7(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange8(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange9(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange10(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange11(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange12(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange13(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange14(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange15(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange16(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange17(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange18(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange19(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange20(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange21(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange22(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange23(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange24(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange25(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange26(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange27(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange28(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange29(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange30(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange31(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange32(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange33(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange34(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange35(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange36(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange37(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange38(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange39(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange40(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange41(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange42(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange43(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange44(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange45(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange46(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange47(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange48(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange49(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange50(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange51(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange52(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange53(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange54(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange55(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange56(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange57(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange58(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange59(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange60(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange61(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange62(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange63(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange64(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange65(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange66(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange67(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange68(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange69(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange70(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange71(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange72(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange73(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange74(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange75(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange76(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange77(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange78(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange79(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange80(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange81(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange82(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange83(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange84(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange85(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange86(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange87(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange88(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange89(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange90(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange91(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange92(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange93(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange94(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange95(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange96(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange97(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange98(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange99(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange100(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange101(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange102(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange103(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange104(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange105(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange106(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange107(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange108(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange109(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange110(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange111(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange112(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange113(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange114(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange115(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange116(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange117(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange118(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange119(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange120(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange121(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange122(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange123(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange124(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange125(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange126(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange127(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange128(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange129(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange130(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange131(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange132(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange133(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange134(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange135(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange136(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange137(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange138(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange139(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange140(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange141(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange142(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange143(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange144(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange145(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange146(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange147(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange148(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange149(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange150(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange151(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange152(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange153(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange154(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange155(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange156(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange157(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange158(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange159(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange160(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange161(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange162(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange163(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange164(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange165(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange166(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange167(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange168(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange169(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange170(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange171(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange172(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange173(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange174(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange175(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange176(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange177(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange178(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange179(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange180(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange181(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange182(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange183(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange184(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange185(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange186(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange187(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange188(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange189(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange190(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange191(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange192(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange193(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange194(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange195(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange196(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange197(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange198(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange199(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange200(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange201(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange202(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange203(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange204(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange205(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange206(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange207(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange208(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange209(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange210(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange211(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange212(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange213(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange214(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange215(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange216(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange217(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange218(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange219(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange220(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange221(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange222(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange223(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange224(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange225(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange226(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange227(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange228(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange229(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange230(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange231(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange232(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange233(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange234(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange235(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange236(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange237(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange238(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange239(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange240(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange241(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange242(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange243(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange244(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange245(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange246(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange247(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange248(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange249(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange250(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange251(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange252(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange253(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange254(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange255(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange256(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange257(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange258(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange259(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange260(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange261(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange262(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange263(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange264(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange265(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange266(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange267(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange268(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange269(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange270(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange271(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange272(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange273(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange274(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange275(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange276(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange277(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange278(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange279(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange280(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange281(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange282(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange283(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange284(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange285(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange286(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange287(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange288(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange289(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange290(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange291(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange292(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange293(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange294(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange295(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange296(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange297(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange298(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange299(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange300(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange301(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange302(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange303(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange304(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange305(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange306(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange307(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange308(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange309(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange310(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange311(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange312(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange313(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange314(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange315(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange316(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange317(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange318(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange319(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange320(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange321(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange322(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange323(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange324(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange325(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange326(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange327(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange328(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange329(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange330(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange331(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange332(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange333(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange334(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange335(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange336(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange337(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange338(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange339(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange340(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange341(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange342(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange343(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange344(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange345(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange346(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange347(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange348(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange349(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange350(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange351(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange352(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange353(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange354(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange355(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange356(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange357(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange358(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange359(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange360(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange361(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange362(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange363(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange364(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange365(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange366(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange367(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange368(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange369(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange370(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange371(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange372(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange373(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange374(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange375(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange376(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange377(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange378(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange379(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange380(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange381(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange382(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange383(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange384(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange385(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange386(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange387(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange388(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange389(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange390(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange391(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange392(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange393(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange394(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange395(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange396(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange397(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange398(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange399(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange400(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange401(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange402(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange403(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange404(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange405(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange406(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange407(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange408(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange409(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange410(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange411(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange412(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange413(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange414(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange415(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange416(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange417(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange418(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange419(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange420(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange421(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange422(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange423(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange424(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange425(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange426(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange427(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange428(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange429(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange430(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange431(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange432(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange433(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange434(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange435(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange436(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange437(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange438(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange439(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange440(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange441(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange442(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange443(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange444(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange445(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange446(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange447(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange448(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange449(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange450(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange451(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange452(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange453(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange454(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange455(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange456(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange457(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange458(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange459(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange460(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange461(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange462(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange463(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange464(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange465(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange466(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange467(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange468(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange469(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange470(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange471(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange472(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange473(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange474(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange475(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange476(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange477(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange478(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange479(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange480(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange481(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange482(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange483(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange484(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange485(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange486(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange487(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange488(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange489(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange490(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange491(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange492(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange493(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange494(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange495(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange496(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange497(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange498(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange499(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange500(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange501(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange502(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange503(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange504(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange505(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange506(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange507(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange508(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange509(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange510(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange511(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange512(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange513(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange514(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange515(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange516(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange517(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange518(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange519(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange520(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange521(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange522(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange523(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange524(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange525(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange526(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange527(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange528(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange529(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange530(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange531(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange532(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange533(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange534(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange535(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange536(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange537(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange538(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange539(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange540(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange541(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange542(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange543(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange544(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange545(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange546(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange547(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange548(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange549(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange550(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange551(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange552(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange553(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange554(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange555(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange556(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange557(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange558(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange559(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange560(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange561(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange562(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange563(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange564(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange565(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange566(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange567(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange568(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange569(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange570(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange571(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange572(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange573(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange574(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange575(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange576(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange577(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange578(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange579(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange580(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange581(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange582(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange583(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange584(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange585(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange586(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange587(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange588(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange589(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange590(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange591(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange592(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange593(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange594(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange595(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange596(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange597(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange598(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange599(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange600(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange601(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange602(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange603(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange604(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange605(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange606(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange607(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange608(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange609(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange610(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange611(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange612(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange613(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange614(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange615(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange616(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange617(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange618(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange619(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange620(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange621(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange622(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange623(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange624(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange625(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange626(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange627(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange628(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange629(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange630(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange631(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange632(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange633(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange634(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange635(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange636(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange637(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange638(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange639(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange640(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange641(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange642(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange643(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange644(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange645(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange646(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange647(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange648(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange649(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange650(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange651(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange652(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange653(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange654(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange655(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange656(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange657(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange658(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange659(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange660(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange661(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange662(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange663(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange664(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange665(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange666(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange667(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange668(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange669(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange670(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange671(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange672(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange673(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange674(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange675(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange676(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange677(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange678(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange679(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange680(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange681(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange682(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange683(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange684(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange685(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange686(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange687(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange688(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange689(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange690(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange691(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange692(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange693(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange694(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange695(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange696(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange697(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange698(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange699(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange700(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange701(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange702(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange703(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange704(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange705(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange706(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange707(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange708(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange709(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange710(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange711(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange712(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange713(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange714(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange715(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange716(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange717(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange718(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange719(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange720(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange721(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange722(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange723(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange724(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange725(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange726(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange727(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange728(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange729(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange730(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange731(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange732(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange733(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange734(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange735(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange736(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange737(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange738(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange739(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange740(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange741(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange742(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange743(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange744(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange745(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange746(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange747(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange748(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange749(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange750(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange751(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange752(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange753(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange754(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange755(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange756(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange757(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange758(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange759(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange760(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange761(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange762(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange763(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange764(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange765(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange766(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange767(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange768(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange769(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange770(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange771(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange772(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange773(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange774(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange775(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange776(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange777(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange778(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange779(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange780(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange781(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange782(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange783(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange784(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange785(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange786(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange787(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange788(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange789(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange790(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange791(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange792(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange793(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange794(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange795(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange796(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange797(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange798(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange799(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange800(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange801(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange802(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange803(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange804(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange805(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange806(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange807(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange808(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange809(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange810(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange811(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange812(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange813(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange814(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange815(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange816(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange817(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange818(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange819(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange820(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange821(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange822(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange823(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange824(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray };
      }

      getRange825(value, defaultValue) {
        const range = this.parser.getRange(value);
        return { value: range.value, isArray: range.isArray
