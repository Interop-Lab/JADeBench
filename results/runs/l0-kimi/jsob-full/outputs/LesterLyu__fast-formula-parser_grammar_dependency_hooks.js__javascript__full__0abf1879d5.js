var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_collection = __commonJS({
  '../work/LesterLyu__fast-formula-parser/grammar/type/collection.js'(exports, module) {
    var Collection = class {
      constructor(rows, cols) {
        if (rows === null && cols === null) {
          this.rows = [];
          this.cols = [];
        } else {
          if (rows.length !== cols.length) {
            throw new Error('rows and cols must have the same length');
          }
          this.rows = rows;
          this.cols = cols;
        }
      }
      get length() {
        return this.rows.length;
      }
      get isEmpty() {
        return this.length === 0;
      }
      get first() {
        return this.rows[0];
      }
      push(row, col) {
        this.rows.push(row);
        this.cols.push(col);
      }
    };
    module.exports = Collection;
  }
});

var require_helpers = __commonJS({
  '../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(exports, module) {
    var FormulaError = require_error();
    var Collection = require_collection();
    
    var Types = {
      Number: 0,
      String: 1,
      Boolean: 2,
      Date: 3,
      Error: 4,
      Array: 5,
      Collection: 6,
      CellRef: 10
    };
    
    var typeNames = {};
    Object.keys(Types).forEach(key => {
      typeNames[Types[key]] = key;
    });
    
    var Address = class {
      constructor() {
        this.Types = Types;
        this.typeInfo = {
          Number: Types.Number,
          String: Types.String,
          Boolean: Types.Boolean,
          Date: Types.Date,
          Error: Types.Error,
          Array: Types.Array,
          Collection: Types.Collection,
          CellRef: Types.CellRef,
          default: -1
        };
      }
      
      getType(value) {
        const type = typeof value;
        if (type === 'number') {
          if (isNaN(value)) {
            return FormulaError.NA;
          }
          if (!isFinite(value)) {
            return FormulaError.NUM;
          }
        }
        if (value === undefined || value === null) {
          return FormulaError.NA;
        }
        return value;
      }
      
      flatten(array) {
        return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
      }
      
      parseNumber(value, convertString = true, convertBoolean = true) {
        if (value === FormulaError) return value;
        let result;
        if (typeof value === 'number') {
          result = value;
        } else if (typeof value === 'string') {
          if (convertString) {
            result = Number(value);
          } else {
            throw FormulaError.VALUE;
          }
        } else if (typeof value === 'boolean') {
          if (convertBoolean) {
            result = Number(value);
          } else {
            throw FormulaError.VALUE;
          }
        } else if (Array.isArray(value)) {
          if (!convertString) {
            if (value[0][0].isArray) {
              result = this.flatten(value[0]);
            } else {
              throw FormulaError.VALUE;
            }
          } else {
            result = this.flatten(value[0]);
          }
        } else {
          throw new Error('Unsupported type');
        }
        return result;
      }
      
      applyEach(array, context, callback, index = null, defaultValue = null) {
        if (index !== null && array[index].isArray) {
          throw FormulaError.REF;
        }
        if (defaultValue === null) {
          defaultValue = context === Types.Array ? 0 : context === null ? null : '';
        }
        array.forEach(item => {
          const { isCellRef, isRangeRef, isArray } = item;
          const isCollection = item instanceof Collection;
          const isValue = !isCellRef && !isRangeRef && !isArray && !isCollection;
          const info = { isValue, isCellRef, isRangeRef, isArray, isCollection };
          if (isValue) {
            if (item.isArray) {
              item = defaultValue;
            } else {
              item = this.parseNumber(item, context, defaultValue);
            }
            callback(item, info);
          } else if (isCellRef) {
            callback(item.ref, info);
          } else if (isCollection) {
            if (!callback) throw FormulaError.REF;
            item = item.first;
            item = this.parseNumber(item);
            item.forEach(subItem => callback(subItem, info));
          } else if (isRangeRef || isArray) {
            item = this.flatten(item.ref);
            item.forEach(subItem => callback(subItem, info));
          }
        });
      }
      
      getValue(value, type = null, context, allowArray = true, convertString = false) {
        if (value === null && context === undefined) {
          throw FormulaError.REF;
        }
        if (value === null) return context;
        if (typeof value === 'number' || Array.isArray(value)) return value;
        const hasFormula = value.formula;
        if (value.value !== null) value = value.value;
        if (type === null) return value;
        if (type === Types.Array) {
          if (Array.isArray(value)) {
            return allowArray ? this.flatten(value) : value;
          } else if (value instanceof Collection) {
            throw FormulaError.REF;
          } else {
            if (convertString) return allowArray ? [value] : [[value]];
            throw FormulaError.VALUE;
          }
          throw FormulaError.VALUE;
        } else if (type === Types.Boolean) {
          if (this.getType(value) === Types.Error) throw FormulaError.VALUE;
          if (this.getType(value) === Types.Boolean) value = Boolean(value);
        } else if (type === Types.Number) {
          value = this.parseNumber(value, false);
        } else if (type === Types.String) {
          value = String(value);
        } else {
          throw FormulaError.VALUE;
        }
        return value;
      }
      
      getTypeOf(value) {
        let type = this.typeInfo[typeof value];
        if (type === -1) {
          if (Array.isArray(value)) {
            type = Types.Array;
          } else if (value.isArray) {
            type = value.isArray ? Types.Array : Types.CellRef;
          } else if (value instanceof Collection) {
            type = Types.Collection;
          }
        }
        return type;
      }
      
      isRangeRef(value) {
        return value.ref && value.ref.from && value.ref.to;
      }
      
      isCellRef(value) {
        return value.ref && !value.ref.from;
      }
      
      compare(left, op, right) {
        right = this.parseNumber(right);
        left = this.parseNumber(left, right);
        left = this.getValue(left, Types.Number, undefined, false, true);
        if (op === right) {
          const defaultValue = this.typeInfo.default;
          this.applyEach(defaultValue);
        } else {
          right = left;
        }
        return [left, right];
      }
      
      toRegex(pattern, flags) {
        return new RegExp(pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/([^~]??)[?]/g, '$1.').replace(/([^~]??)[*]/g, '$1.*').replace(/~([?*])/g, '$1'), flags);
      }
    };
    
    module.exports = { Types, Address };
  }
});

var require_error = __commonJS({
  '../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {
    var FormulaError = class extends Error {
      constructor(type, message, details) {
        super(message);
        if (message === null && details === null && FormulaError.cache.has(type)) {
          return FormulaError.cache.get(type);
        }
        if (message !== null && details !== null) {
          this.type = type;
          FormulaError.cache.set(type, this);
        } else {
          this.type = type;
        }
        this.details = details;
      }
      
      get message() {
        return this.details;
      }
      
      get value() {
        return this.type;
      }
      
      equals(other) {
        return other instanceof FormulaError && other.type === this.type;
      }
      
      toString() {
        return this.type;
      }
    };
    
    FormulaError.cache = new Map();
    FormulaError.DIV0 = new FormulaError('#DIV/0!');
    FormulaError.NA = new FormulaError('#N/A');
    FormulaError.NAME = new FormulaError('#NAME?');
    FormulaError.NULL = new FormulaError('#NULL!');
    FormulaError.NUM = new FormulaError('#NUM!');
    FormulaError.REF = new FormulaError('#REF!');
    FormulaError.VALUE = new FormulaError('#VALUE!');
    
    FormulaError.getError = (code) => {
      return new FormulaError(code, 'Error ' + code + ' occurred in formula evaluation');
    };
    
    FormulaError.getErrorByCode = (code) => {
      return new FormulaError(code, 'Error with code ' + code);
    };
    
    FormulaError.getErrorByType = (type) => {
      const { Types } = require_helpers();
      return new FormulaError(type, 'Error: ' + Object.keys(Types).filter(k => Types[k] === type).join(', '));
    };
    
    FormulaError.isError = (value) => {
      return value instanceof FormulaError;
    };
    
    module.exports = FormulaError;
  }
});

var require_lexing = __commonJS({
  '../work/LesterLyu__fast-formula-parser/grammar/lexing.js'(exports, module) {
    var { createToken, Lexer } = require('chevrotain');
    var FormulaError = require_error();
    
    var tokenMap = {};
    
    var WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
    var String = createToken({ name: 'String', pattern: /"(""|[^"])*"/ });
    var SheetQuoted = createToken({ name: 'SheetQuoted', pattern: /'(''|[^'])*'/ });
    var ExcelRefFunction = createToken({ name: 'ExcelRefFunction', pattern: /'((?![\\\/\[\]*?:]).)+?'!/ });
    var Function = createToken({ name: 'Function', pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/ });
    var FormulaErrorT = createToken({ name: 'FormulaErrorT', pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/ });
    var RefError = createToken({ name: 'RefError', pattern: /#REF!/ });
    var Name = createToken({ name: 'Name', pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/ });
    var Cell = createToken({ name: 'Cell', pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/, longer_alt: undefined });
    var Boolean = createToken({ name: 'Boolean', pattern: /TRUE|FALSE/i });
    var Column = createToken({ name: 'Column', pattern: /[$]?[A-Za-z]{1,3}/, longer_alt: undefined });
    var Number = createToken({ name: 'Number', pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/ });
    var At = createToken({ name: 'At', pattern: /@/ });
    var Comma = createToken({ name: 'Comma', pattern: /,/ });
    var Colon = createToken({ name: 'Colon', pattern: /:/ });
    var Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
    var OpenParen = createToken({ name: 'OpenParen', pattern: /\(/ });
    var CloseParen = createToken({ name: 'CloseParen', pattern: /\)/ });
    var OpenCurlyParen = createToken({ name: 'OpenCurlyParen', pattern: /{/ });
    var CloseCurlyParen = createToken({ name: 'CloseCurlyParen', pattern: /}/ });
    var QuoteS = createToken({ name: 'QuoteS', pattern: /'/ });
    var MulOp = createToken({ name: 'MulOp', pattern: /\*/ });
    var PlusOp = createToken({ name: 'PlusOp', pattern: /\+/ });
    var DivOp = createToken({ name: 'DivOp', pattern: /\// });
    var MinOp = createToken({ name: 'MinOp', pattern: /-/ });
    var ConcatOp = createToken({ name: 'ConcatOp', pattern: /&/ });
    var ExOp = createToken({ name: 'ExOp', pattern: /\^/ });
    var PercentOp = createToken({ name: 'PercentOp', pattern: /%/ });
    var GtOp = createToken({ name: 'GtOp', pattern: />/ });
    var EqOp = createToken({ name: 'EqOp', pattern: /=/ });
    var LtOp = createToken({ name: 'LtOp', pattern: /</ });
    var NeqOp = createToken({ name: 'NeqOp', pattern: /<>/ });
    var GteOp = createToken({ name: 'GteOp', pattern: />=/ });
    var LteOp = createToken({ name: 'LteOp', pattern: /<=/ });
    
    var allTokens = [
      WhiteSpace, String, ExcelRefFunction, SheetQuoted, Function, FormulaErrorT, RefError,
      Name, Cell, Boolean, Column, Number, At, Comma, Colon, Semicolon,
      OpenParen, CloseParen, OpenCurlyParen, CloseCurlyParen, QuoteS,
      MulOp, PlusOp, DivOp, MinOp, ConcatOp, ExOp, MulOp, PercentOp,
      NeqOp, GteOp, LteOp, GtOp, EqOp, LtOp
    ];
    
    var lexerConfig = { recoveryEnabled: true };
    var formulaLexer = new Lexer(allTokens, lexerConfig);
    
    allTokens.forEach(token => {
      tokenMap[token.name] = token;
    });
    
    module.exports = {
      tokenVocabulary: tokenMap,
      lex: function(input) {
        const result = formulaLexer.tokenize(input);
        if (result.errors.length > 0) {
          const error = result.errors[0];
          const line = error.line;
          const column = error.column;
          let message = '\n'.repeat(input.split('\n').slice(0, line - 1).length) + '\n';
          message += Array(column).fill(' ').join('') + '^\n';
          error.message = message + 'Error at line ' + line + ', column ' + column + '\n' + error.message;
          var errorInfo = { line, column };
          error.recognitionException = errorInfo;
          throw FormulaError.VALUE(error.message, error);
        }
        return result;
      }
    };
  }
});

var require_parsing = __commonJS({
  '../work/LesterLyu__fast-formula-parser/grammar/parsing.js'(exports, module) {
    var lexer = require_lexing();
    var { EmbeddedActionsParser } = require('chevrotain');
    var FormulaError = require_error();
    var { String, SheetQuoted, ExcelRefFunction, ExcelConditionalRefFunction, Function, FormulaErrorT, RefError, Cell, Sheet, Name, Number, Boolean, Column, Comma, Colon, Semicolon, OpenParen, CloseParen, OpenCurlyParen, CloseCurlyParen, MulOp, PlusOp, DivOp, MinOp, ConcatOp, ExOp, PercentOp, NeqOp, GteOp, LteOp, GtOp, EqOp, LtOp } = lexer.tokenVocabulary;
    
    var FormulaParser = class extends EmbeddedActionsParser {
      constructor(context, options) {
        super(lexer.tokenVocabulary, { recoveryEnabled: true, maxLookahead: 1 });
        this.context = context;
        this.operators = [['^'], ['*', '/'], ['+', '-'], ['&'], ['<', '>', '=', '<>', '<=', '>=']];
        const $ = this;
        
        $.RULE('expression', () => {
          const result = [];
          const alternatives = [$.SUBRULE($.comparison)];
          return $.OR(alternatives);
        });
        
        $.RULE('comparison', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.concatenation) }
          ]);
        });
        
        $.RULE('concatenation', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.additive) }
          ]);
        });
        
        $.RULE('additive', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.multiplicative) }
          ]);
        });
        
        $.RULE('multiplicative', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.exponential) }
          ]);
        });
        
        $.RULE('exponential', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.percent) }
          ]);
        });
        
        $.RULE('percent', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.unary) }
          ]);
        });
        
        $.RULE('unary', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.postfix) }
          ]);
        });
        
        $.RULE('postfix', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.primary) }
          ]);
        });
        
        $.RULE('primary', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.number) },
            { ALT: () => $.SUBRULE($.string) },
            { ALT: () => $.SUBRULE($.boolean) },
            { ALT: () => $.SUBRULE($.error) },
            { ALT: () => $.SUBRULE($.cell) },
            { ALT: () => $.SUBRULE($.range) },
            { ALT: () => $.SUBRULE($.functionCall) },
            { ALT: () => $.SUBRULE($.parenthesizedExpression) }
          ]);
        });
        
        $.RULE('number', () => {
          const num = $.CONSUME(Number).image;
          return parseFloat(num);
        });
        
        $.RULE('string', () => {
          const str = $.CONSUME(String).image;
          return str.slice(1, -1).replace(/""/g, '"');
        });
        
        $.RULE('boolean', () => {
          const bool = $.CONSUME(Boolean).image;
          return bool.toUpperCase() === 'TRUE';
        });
        
        $.RULE('error', () => {
          return $.OR([
            { ALT: () => $.CONSUME(FormulaErrorT).image },
            { ALT: () => $.CONSUME(RefError).image }
          ]);
        });
        
        $.RULE('cell', () => {
          const cell = $.CONSUME(Cell).image;
          return this.parseCell(cell);
        });
        
        $.RULE('range', () => {
          return $.OR([
            { ALT: () => $.SUBRULE($.cellRange) },
            { ALT: () => $.SUBRULE($.colRange) },
            { ALT: () => $.SUBRULE($.rowRange) }
          ]);
        });
        
        $.RULE('cellRange', () => {
          const start = $.SUBRULE($.cell);
          $.CONSUME(Colon);
          const end = $.SUBRULE2($.cell);
          return { ref: { from: start.ref, to: end.ref } };
        });
        
        $.RULE('colRange', () => {
          const start = $.SUBRULE($.column);
          $.CONSUME(Colon);
          const end = $.SUBRULE2($.column);
          return { ref: { from: { col: start, row: null }, to: { col: end, row: null } } };
        });
        
        $.RULE('rowRange', () => {
          const start = $.SUBRULE($.row);
          $.CONSUME(Colon);
          const end = $.SUBRULE2($.row);
          return { ref: { from: { col: null, row: start }, to: { col: null, row: end } } };
        });
        
        $.RULE('column', () => {
          const col = $.CONSUME(Column).image;
          return this.columnNameToNumber(col);
        });
        
        $.RULE('row', () => {
          const row = $.CONSUME(Number).image;
          return parseInt(row);
        });
        
        $.RULE('functionCall', () => {
          const name = $.CONSUME(Function).image.slice(0, -1);
          const args = $.SUBRULE($.argumentList);
          $.CONSUME(CloseParen);
          return { name, args };
        });
        
        $.RULE('argumentList', () => {
          const args = [];
          $.OPTION(() => {
            args.push($.SUBRULE($.expression));
            $.MANY(() => {
              $.CONSUME(Comma);
              args.push($.SUBRULE2($.expression));
            });
          });
          return args;
        });
        
        $.RULE('parenthesizedExpression', () => {
          $.CONSUME(OpenParen);
          const expr = $.SUBRULE($.expression);
          $.CONSUME(CloseParen);
          return expr;
        });
        
        this.performSelfAnalysis();
      }
      
      parseCell(cell) {
        const match = cell.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            address: match[0],
            col: this.columnNameToNumber(match[2]),
            row: parseInt(match[4])
          }
        };
      }
      
      columnNameToNumber(name) {
        name = name.toUpperCase();
        const len = name.length;
        let result = 0;
        for (let i = 0; i < len; i++) {
          const charCode = name.charCodeAt(i);
          if (!isNaN(charCode)) {
            result += (charCode - 64) * Math.pow(26, len - i - 1);
          }
        }
        return result;
      }
      
      parse(input) {
        this.input = lexer.lex(input).tokens;
        const result = this.expression();
        if (this.errors.length > 0) {
          throw FormulaError.VALUE(this.errors[0].message);
        }
        return result;
      }
    };
    
    module.exports = { Parser: FormulaParser };
  }
});

var FormulaError = require_error();
var { FormulaHelpers } = require_helpers();
var { Parser } = require_parsing();
var lexer = require_lexing();
var Utils = require_utils();

var DepParser = class {
  constructor(options) {
    options = Object.assign({ getCell: () => null }, options);
    this.getCell = options.getCell;
    this.dependencies = [];
    this.parser = new Parser(this, options);
    this.utils = new Utils(this);
  }
  
  addDependency(ref) {
    if (ref.sheet === null) {
      if (ref.book === null) {
        ref.sheet = this.utils ? this.utils.sheet : undefined;
      }
    }
    const exists = this.dependencies.some(dep => 
      dep.from.col === ref.from.col &&
      dep.from.row === ref.from.row &&
      dep.to.col === ref.to.col &&
      dep.to.row === ref.to.row &&
      dep.sheet === ref.sheet &&
      dep.book === ref.book
    );
    if (exists === -1) {
      this.dependencies.push(ref);
    }
    return 0;
  }
  
  parse(formula) {
    this.dependencies = [];
    this.parser.input = lexer.lex(formula).tokens;
    try {
      const result = this.parser.expression();
      this.addDependency(result);
    } catch (e) {
      if (!this.parser.errors.length) {
        throw FormulaError.VALUE(e.message, e);
      }
    }
    if (this.parser.errors.length && !this.parser.errors[0].recovered) {
      const error = this.parser.errors[0];
      throw formatChevrotainError(error, formula);
    }
    return this.dependencies;
  }
};

module.exports = { DepParser };
