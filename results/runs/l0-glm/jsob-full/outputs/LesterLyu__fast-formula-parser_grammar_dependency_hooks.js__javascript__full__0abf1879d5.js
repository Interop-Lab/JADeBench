var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cache, module) => function() {
  return module || (cache[__getOwnPropNames(cache)[0]])((module = {exports:{}}).exports, module), module.exports;
};

var require_collection = __commonJS({'../work/LesterLyu__fast-formula-parser/grammar/type/collection.js'(exports, module) {
  class Collection {
    constructor(start, end) {
      if (start === null && end === null) {
        this.rows = [];
        this.cols = [];
      } else {
        if (start.length !== end.length) throw Error('Unequal length of start and end');
        this.rows = start;
        this.cols = end;
      }
    }
    get row() { return this.rows; }
    get col() { return this.cols; }
    get size() { return this.cols.length; }
    add(row, col) {
      this.rows.push(row);
      this.cols.push(col);
    }
  }
  module.exports = Collection;
}});

var require_helpers = __commonJS({'../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(exports, module) {
  const FormulaError = require_error();
  const Collection = require_collection();

  const Types = {
    NUMBER: 0,
    STRING: 1,
    BOOLEAN: 2,
    ARRAY: 3,
    CELLREF: 4,
    RANGEREF: 5,
    EMPTY: 6,
    COLLECTION: 10,
  };

  var TypeReverseMap = {};
  Object.keys(Types).forEach(key => {
    TypeReverseMap[Types[key]] = key;
  });

  const largePowers = [
    1, 26, 676, 17576, 456976, 11881376, 308915776, 8031810176,
    208827064576, 5429503678976, 141167095653376, 3670344486987776,
    95428956661682176, 2481152873203736576, 64509974703297150976,
    16777216000000000000,
  ];

  var TypeMap = {};
  TypeMap[Types.NUMBER] = Types.NUMBER;
  TypeMap[Types.STRING] = Types.STRING;
  TypeMap[Types.BOOLEAN] = Types.BOOLEAN;
  TypeMap[Types.EMPTY] = -1;

  class FormulaHelpers {
    constructor() {
      this.type = Types;
      this.type2Number = TypeMap;
    }

    checkType(value) {
      const type = typeof value;
      if (type === 'number') {
        if (isNaN(value)) return FormulaError.VALUE;
        if (!isFinite(value)) return FormulaError.NUM;
      }
      if (value === undefined || value === null) return Types.EMPTY;
      return value;
    }

    flatten(array) {
      return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
    }

    acceptValue(value) {
      const val = this.checkType(value);
      const isArray = Array.isArray(val);
      if (val.value) return {val: this.flatten(val.value), isArray};
      return {val, isArray};
    }

    readNumber(value, arrayMode = true, throwError = true) {
      if (value === FormulaError) return value;
      let result;
      if (typeof value === 'number') {
        result = value;
      } else if (typeof value === 'string') {
        if (throwError) result = Number(value);
        else throw FormulaError.VALUE;
      } else if (typeof value === 'boolean') {
        if (value.length > 1) throw FormulaError.VALUE;
        result = Number(value);
        if (result !== result) throw FormulaError.VALUE;
      } else if (Array.isArray(value)) {
        if (!arrayMode) {
          if (value[0].length !== 1) throw FormulaError.VALUE;
          result = this.readNumber(value[0][0]);
        } else {
          result = this.flatten(value);
        }
      } else {
        throw Error('Unknown type: ' + typeof value);
      }
      return result;
    }

    retrieveValue(value, format, throwError = true, arrayMode = true) {
      if (Array.isArray(format)) format = format[0];
      if (value === null && format === undefined) throw FormulaError.NULL;
      if (value === null) return format;
      if (typeof value === 'string' || Array.isArray(value)) return value;
      const isValueError = value.error;
      if (value.ref !== null) value = value.value;
      if (format === null) return value;
      if (value === FormulaError) throw value;
      if (format === Types.NUMBER) {
        if (Array.isArray(value)) return arrayMode ? this.flatten(value) : value;
        if (value === Collection) throw FormulaError.VALUE;
        if (arrayMode) return [value];
        else return [[value]];
      }
      throw FormulaError.VALUE;
      if (format === Types.STRING) return value;
      if (format === Types.BOOLEAN) {
        if (type === Types.NUMBER) throw FormulaError.VALUE;
        if (type === Types.BOOLEAN) value = Boolean(value);
      }
      if (format === Types.ARRAY) value = this.flatten(value, false);
      else throw FormulaError.VALUE;
      return value;
    }

    isWildcard(str) {
      if (typeof str === 'string') return /[*?]/.test(str);
      return false;
    }

    toRegex(str, flags) {
      return new RegExp(str.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/([^~]??)[?]/g, '$1.').replace(/([^~]??)[*]/g, '$1.*').replace(/~([?*])/g, '$1'), flags);
    }
  }

  const FormulaParser = {
    parse: (str) => {
      const type = typeof str;
      if (type === 'string') {
        const lower = str.toLowerCase();
        if (lower === 'true' || lower === 'false') return {op: '=', value: lower === 'true'};
        const match = str.match(/(<>|>=|<=|>|<|=)(.*)/);
        if (match) {
          let op = match[1], value;
          if (isNaN(match[2])) {
            const lower2 = match[2].toLowerCase();
            if (lower2 === 'true' || lower2 === 'false') {
              value = lower2 === 'true';
            } else {
              if (/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(match[2])) {
                value = new FormulaError(match[2]);
              } else {
                value = match[2];
                if (FormulaHelpers.isWildcard(value)) return {op: 'wc', value: FormulaHelpers.toRegex(value), match: op === '='};
              }
            }
          } else value = Number(match[2]);
          return {op, value};
        } else {
          if (FormulaHelpers.isWildcard(str)) return {op: 'wc', value: FormulaHelpers.toRegex(str), match: true};
          else return {op: '=', value: str};
        }
      } else if (type === 'number' || type === 'boolean' || (Array.isArray(str) || str === FormulaError)) {
        return {op: '=', value: str};
      } else {
        throw new Error('Unsupported type: ' + typeof str);
      }
    },
  };

  const Address = {
    columnNumberToName: (columnNumber) => {
      let num = columnNumber, name = '', remainder = 0;
      while (num > 0) {
        remainder = (num - 1) % 26;
        name = String.fromCharCode('A'.charCodeAt(0) + remainder) + name;
        num = Math.floor((num - remainder) / 26);
      }
      return name;
    },
    columnNameToNumber: (columnName) => {
      columnName = columnName.toUpperCase();
      const length = columnName.length;
      let number = 0;
      for (let i = 0; i < length; i++) {
        const char = columnName.charAt(i);
        !isNaN(char) && (number += (char - 'A' + 1) * Math.pow(26, length - i - 1));
      }
      return number;
    },
    extend: (ref, range) => {
      if (range === null) return ref;
      let fromCol, fromRow, toCol, toRow;
      if (FormulaHelpers.isCellRef(ref)) {
        fromCol = toCol = ref.col;
        fromRow = toRow = ref.row;
      } else if (FormulaHelpers.isRangeRef(ref)) {
        fromCol = Math.min(ref.ref.from.col, ref.ref.to.col);
        toCol = Math.max(ref.ref.from.col, ref.ref.to.col);
        fromRow = Math.min(ref.ref.from.row, ref.ref.to.row);
        toRow = Math.max(ref.ref.from.row, ref.ref.to.row);
      } else throw Error('Invalid reference');

      if (FormulaHelpers.isCellRef(range)) {
        if (fromCol === 0 || fromRow === 0)
          range = {ref: {from: {col: range.col, row: range.row}, to: {row: range.row + fromRow, col: range.col + toCol}}};
      } else {
        range.ref.to.col += toCol;
        range.ref.to.row += fromRow;
      }
      return range;
    },
  };

  const helpers = {};
  helpers.FormulaHelpers = new FormulaHelpers();
  helpers.Types = Types;
  helpers.TypeReverseMap = TypeReverseMap;
  helpers.largePowers = largePowers;
  helpers.Address = Address;
  helpers.FormulaParser = FormulaParser;
  module.exports = helpers;
}});

var require_error = __commonJS({'../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {
  class FormulaError extends Error {
    constructor(error, details, info) {
      super(details);
      if (details === null && info === null && FormulaError.cache.has(error)) return FormulaError.cache.get(error);
      else {
        if (details === null && info === null) {
          this.error = error;
          FormulaError.cache.set(error, this);
        } else {
          this.error = error;
        }
      }
      this.details = info;
    }
    get error() { return this._error; }
    get details() { return this._details; }
    equals(other) { return other === FormulaError && other.error === this.error; }
    toString() { return this.error; }
  }
  FormulaError.cache = new Map();
  FormulaError.NULL = new FormulaError('#NULL!');
  FormulaError.DIV0 = new FormulaError('#DIV/0!');
  FormulaError.VALUE = new FormulaError('#VALUE!');
  FormulaError.REF = new FormulaError('#REF!');
  FormulaError.NAME = new FormulaError('#NAME?');
  FormulaError.NUM = new FormulaError('#NUM!');
  FormulaError.NA = new FormulaError('#N/A');
  FormulaError.ERROR = msg => new FormulaError('#ERROR!', 'Error: ' + msg + ' occurred');
  FormulaError.NOT_IMPLEMENTED = msg => new FormulaError('#NAME?', 'Function ' + msg + ' not implemented');
  FormulaError.ARG_TYPE = args => {
    const {Types} = require_helpers();
    return new FormulaError('#VALUE!', 'Wrong argument type, expecting: ' + args.map(arg => Types[arg]).join(', '));
  };
  FormulaError.TOO_LONG = () => new FormulaError('#VALUE!', 'Formula is too long');
  module.exports = FormulaError;
}});

var require_lexing = __commonJS({'../work/LesterLyu__fast-formula-parser/grammar/lexing.js'(exports, module) {
  const {createToken, Lexer} = require('chevrotain');
  const FormulaError = require_error();
  const tokenVocabulary = {};

  const WhiteSpace = createToken({name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED});
  const String = createToken({name: 'String', pattern: /"(""|[^"])*"/});
  const SheetQuoted = createToken({name: 'SheetQuoted', pattern: /'(''|[^'])*'/});
  const SingleQuoted = createToken({name: 'SingleQuoted', pattern: /'((?![\\\/\[\]*?:]).)+?'!/});
  const Function = createToken({name: 'Function', pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/});
  const FormulaErrorT = createToken({name: 'FormulaErrorT', pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/});
  const RefError = createToken({name: 'RefError', pattern: /#REF!/});
  const Name = createToken({name: 'Name', pattern: /[a-zA-Z_][a-zA-Z0-9_.?]*/});
  const Sheet = createToken({name: 'Sheet', pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/});
  const Cell = createToken({name: 'Cell', pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/, longer_alt: Name});
  const Number = createToken({name: 'Number', pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/});
  const Boolean = createToken({name: 'Boolean', pattern: /TRUE|FALSE/i});
  const Column = createToken({name: 'Column', pattern: /[$]?[A-Za-z]{1,3}/, longer_alt: Name});
  const At = createToken({name: 'At', pattern: /@/});
  const Comma = createToken({name: 'Comma', pattern: /,/});
  const Colon = createToken({name: 'Colon', pattern: /:/});
  const Semicolon = createToken({name: 'Semicolon', pattern: /;/});
  const OpenParen = createToken({name: 'OpenParen', pattern: /\(/});
  const CloseParen = createToken({name: 'CloseParen', pattern: /\)/});
  const OpenBracket = createToken({name: 'OpenBracket', pattern: /\[/});
  const CloseBracket = createToken({name: 'CloseBracket', pattern: /]/});
  const Exclamation = createToken({name: 'Exclamation', pattern: /!/});
  const OpenCurlyParen = createToken({name: 'OpenCurlyParen', pattern: /{/});
  const CloseCurlyParen = createToken({name: 'CloseCurlyParen', pattern: /}/});
  const Quote = createToken({name: 'Quote', pattern: /'/});
  const MulOp = createToken({name: 'MulOp', pattern: /\*/});
  const PlusOp = createToken({name: 'PlusOp', pattern: /\+/});
  const DivOp = createToken({name: 'DivOp', pattern: /\//});
  const MinOp = createToken({name: 'MinOp', pattern: /-/});
  const ConcatOp = createToken({name: 'ConcatOp', pattern: /&/});
  const ExOp = createToken({name: 'ExOp', pattern: /\^/});
  const PercentOp = createToken({name: 'PercentOp', pattern: /%/});
  const NeqOp = createToken({name: 'NeqOp', pattern: /<>/});
  const GteOp = createToken({name: 'GteOp', pattern: />=/});
  const LteOp = createToken({name: 'LteOp', pattern: /<=/});
  const GtOp = createToken({name: 'GtOp', pattern: />/});
  const EqOp = createToken({name: 'EqOp', pattern: /=/});
  const LtOp = createToken({name: 'LtOp', pattern: /</});

  const allTokens = [
    WhiteSpace, String, SingleQuoted, SheetQuoted, Function, FormulaErrorT,
    RefError, Sheet, Cell, Boolean, Column, Name, Number, At, Comma, Colon,
    Semicolon, OpenParen, CloseParen, OpenBracket, CloseBracket, OpenCurlyParen,
    CloseCurlyParen, Quote, MulOp, PlusOp, DivOp, MinOp, ConcatOp, ExOp, MulOp,
    PercentOp, NeqOp, GteOp, LteOp, GtOp, EqOp, LtOp,
  ];

  const lexerConfig = {lineTerminatorsPattern: /\n|\r\n?/};
  const lexer = new Lexer(allTokens, lexerConfig);

  allTokens.forEach(token => {
    tokenVocabulary[token.name] = token;
  });

  module.exports = {
    tokenVocabulary,
    lex: function(input) {
      const lexResult = lexer.tokenize(input);
      if (lexResult.errors.length > 0) {
        const error = lexResult.errors[0];
        const line = error.line, column = error.column;
        let msg = '\n' + input.split('\n')[line - 1] + '\n';
        msg += Array(column).join(' ') + '^\n';
        error.message = msg + 'Error at line ' + line + ':' + column + '\n';
        error.line = line;
        error.column = column;
        throw FormulaError.ERROR(error.message, error);
      }
      return lexResult;
    }
  };
}});

var require_parsing = __commonJS({'../work/LesterLyu__fast-formula-parser/grammar/parsing.js'(exports, module) {
  const lexing = require_lexing();
  const {EmbeddedActionsParser} = require('chevrotain');
  const tokenVocabulary = lexing.tokenVocabulary;
  const {
    String, SheetQuoted, ExcelRefFunction, ExcelConditionalRefFunction, Function,
    FormulaErrorT, RefError, Cell, Sheet, Name, Number, Boolean, Column, Comma,
    Colon, Semicolon, OpenParen, CloseParen, OpenCurlyParen, CloseCurlyParen,
    MulOp, PlusOp, DivOp, MinOp, ConcatOp, ExOp, PercentOp, NeqOp, GteOp, LteOp,
    GtOp, EqOp, LtOp
  } = tokenVocabulary;

  class Parser extends EmbeddedActionsParser {
    constructor(utils, options) {
      super(tokenVocabulary, {recoveryEnabled: false, outputCst: false, maxLookahead: 1, ignoredIssues: true});
      this.utils = utils;
      this.operatorPrecedence = [['^'], ['*', '/'], ['+', '-'], ['&'], ['<', '>', '=', '<>', '<=', '>=']];
      const $ = this;

      $.RULE('formula', () => {
        const args = [];
        const expressions = [$.SUBRULE($.expression)];
        return $.OR([{
          ALT: () => {
            $.MANY(() => {
              args.push($.OR([{
                ALT: () => $.CONSUME(GtOp).image
              }, {
                ALT: () => $.CONSUME(EqOp).image
              }, {
                ALT: () => $.CONSUME(LtOp).image
              }, {
                ALT: () => $.CONSUME(NeqOp).image
              }, {
                ALT: () => $.CONSUME(GteOp).image
              }, {
                ALT: () => $.CONSUME(LteOp).image
              }, {
                ALT: () => $.CONSUME(ConcatOp).image
              }, {
                ALT: () => $.CONSUME(PlusOp).image
              }, {
                ALT: () => $.CONSUME(MinOp).image
              }, {
                ALT: () => $.CONSUME(MulOp).image
              }, {
                ALT: () => $.CONSUME(DivOp).image
              }, {
                ALT: () => $.CONSUME(ExOp).image
              }]));
              expressions.push($.SUBRULE($.expression));
            });
            return expressions;
          }
        }, {
          ALT: () => $.OR([{
            ALT: () => $.CONSUME(PlusOp).image
          }, {
            ALT: () => $.CONSUME(MinOp).image
          }])
        }]);
      });

      $.RULE('expression', () => {
        let expr = $.SUBRULE($.primaryExpression);
        const ops = [$.SUBRULE($.postfixExpression)];
        $.MANY(() => {
          const op = $.OR([{
            ALT: () => $.CONSUME(PlusOp).image
          }, {
            ALT: () => $.CONSUME(MinOp).image
          }]);
          ops.push($.SUBRULE($.primaryExpression));
        });
        $.MANY(() => {
          for (const precedence of this.operatorPrecedence) {
            for (let i = 0, len = ops.length; i < len; i++) {
              const op = ops[i];
              if (!precedence.includes(op)) continue;
              ops.splice(i, 1);
              expressions.splice(i, 1, this.utils.applyInfix(expressions[i], op, expressions[i + 1]));
              i--;
              len--;
            }
          }
        });
        return expressions[0];
      });

      $.RULE('postfixExpression', () => {
        let expr = $.SUBRULE($.primaryExpression);
        $.MANY(() => {
          const op = $.CONSUME(PercentOp).image;
          expr = $.ACTION(() => this.utils.applyPostfix(expr, op));
        });
        return expr;
      });

      $.RULE('primaryExpression', () => {
        const args = [];
        $.MANY(() => {
          const arg = $.OR([{
            ALT: () => $.CONSUME(PlusOp).image
          }, {
            ALT: () => $.CONSUME(MinOp).image
          }]);
          args.push(arg);
        });
        const expr = $.SUBRULE($.atomicExpression);
        return $.ACTION(() => this.utils.applyPrefix(args, expr));
      });

      $.RULE('atomicExpression', () => {
        return $.OR([{
          ALT: () => {
            const ref = $.SUBRULE($.cellRef);
            const name = $.CONSUME(Function).image;
            const args = $.SUBRULE($.functionArguments);
            return $.ACTION(() => this.utils.callFunction(name, ref, args));
          }
        }, {
          ALT: () => {
            const ref = $.SUBRULE($.cellRef);
            const name = $.SUBRULE($.excelRefFunction);
            const args = $.SUBRULE($.functionArguments);
            return $.ACTION(() => this.utils.callFunction(name, ref, args));
          }
        }, {
          ALT: () => {
            const ref = $.SUBRULE($.cellRef);
            const name = $.SUBRULE($.excelConditionalRefFunction);
            const args = $.SUBRULE($.functionArguments);
            return $.ACTION(() => this.utils.callFunction(name, ref, args));
          }
        }, {
          ALT: () => $.SUBRULE($.cellRef)
        }, {
          ALT: () => $.SUBRULE($.rangeRef)
        }, {
          ALT: () => $.SUBRULE($.refError)
        }, {
          ALT: () => $.SUBRULE($.name)
        }]);
      });

      $.RULE('functionArguments', () => {
        $.CONSUME(OpenParen);
        let result;
        const args = [];
        args.push($.SUBRULE($.expression));
        $.MANY(() => {
          const sep = $.OR([{
            ALT: () => $.CONSUME(Comma).image
          }, {
            ALT: () => $.CONSUME(Semicolon).image
          }]);
          if (sep === ',') args.push($.SUBRULE($.expression));
          else {
            args.push(null);
            $.SUBRULE($.expression);
          }
        });
        $.CONSUME(CloseParen);
        return args;
      });

      $.RULE('arrayExpression', () => {
        const rows = [[]];
        let row = 0;
        $.CONSUME(OpenCurlyParen);
        rows[row].push($.SUBRULE($.expression));
        $.MANY(() => {
          const sep = $.OR([{
            ALT: () => $.CONSUME(Comma).image
          }, {
            ALT: () => $.CONSUME(Semicolon).image
          }]);
          if (sep === ',') rows[row].push($.SUBRULE($.expression));
          else {
            row++;
            rows[row] = [];
            rows[row].push($.SUBRULE($.expression));
          }
        });
        $.CONSUME(CloseCurlyParen);
        return $.ACTION(() => this.utils.parseArray(rows));
      });

      $.RULE('cellRef', () => $.OR([{
        ALT: () => {
          const ref = $.OPTION(() => $.SUBRULE($.sheetName));
          const cell = $.CONSUME(Cell).image;
          return $.ACTION(() => this.utils.parseCellRef(cell, ref));
        }
      }, {
        ALT: () => {
          const ref = $.SUBRULE($.sheetName);
          const cell = $.SUBRULE($.column);
          return $.ACTION(() => this.utils.parseColRef(cell, ref));
        }
      }, {
        ALT: () => {
          const ref = $.SUBRULE($.sheetName);
          const cell = $.SUBRULE($.row);
          return $.ACTION(() => this.utils.parseRowRef(cell, ref));
        }
      }, {
        ALT: () => {
          const ref = $.SUBRULE($.sheetName);
          const cell = $.SUBRULE($.refError);
          return $.ACTION(() => this.utils.parseRefError(cell, ref));
        }
      }, {
        ALT: () => {
          const ref = $.SUBRULE($.sheetName);
          const cell = $.SUBRULE($.name);
          return $.ACTION(() => this.utils.parseName(cell, ref));
        }
      }]));

      $.RULE('rangeRef', () => $.OR([{
        ALT: () => {
          const start = $.SUBRULE($.cellRef);
          $.CONSUME(Colon);
          const end = $.SUBRULE($.cellRef);
          return $.ACTION(() => this.utils.parseRange(start, end));
        }
      }, {
        ALT: () => {
          const start = $.SUBRULE($.cellRef);
          $.CONSUME(Colon);
          const end = $.SUBRULE($.column);
          return $.ACTION(() => this.utils.parseColRange(start, end));
        }
      }, {
        ALT: () => {
          const start = $.SUBRULE($.cellRef);
          $.CONSUME(Colon);
          const end = $.SUBRULE($.row);
          return $.ACTION(() => this.utils.parseRowRange(start, end));
        }
      }, {
        ALT: () => {
          const start = $.SUBRULE($.cellRef);
          $.CONSUME(Colon);
          const end = $.SUBRULE($.refError);
          return $.ACTION(() => this.utils.parseRange(start, end));
        }
      }]));

      $.RULE('sheetName', () => $.OR([{
        ALT: () => $.CONSUME(Sheet).image.slice(0, -1)
      }, {
        ALT: () => {
          const name = $.CONSUME(SheetQuoted).image;
          return $.ACTION(() => name.slice(1, -1).replace(/''/g, '\''));
        }
      }]));

      $.RULE('row', () => {
        const num = +$.CONSUME(Number).image;
        if (!Number.isInteger(num)) throw Error('Invalid row number');
        return {row: num};
      });

      $.RULE('column', () => {
        return {ref: {col: this.utils.columnNameToNumber($.CONSUME(Column).image), row: void 0}};
      });

      $.RULE('refError', () => {
        return new FormulaError($.CONSUME(RefError).image.slice(0, -1));
      });

      $.RULE('name', () => $.CONSUME(Name).image);

      this.performSelfAnalysis();
    }
  }

  module.exports = {Parser};
}});

var require_operators = __commonJS({'../work/LesterLyu__fast-formula-parser/formulas/operators.js'(exports, module) {
  const FormulaError = require_error();
  const {FormulaHelpers} = require_helpers();

  const Operators = {
    unaryOp: (operators, value, utils) => {
      let sign = 1;
      operators.forEach(op => {
        if (op === '+') {}
        else if (op === '-') sign = -sign;
        else throw new Error('Unexpected operator: ' + op);
      });
      if (value === null) value = 0;
      if (sign === 1) return value;
      try {
        value = FormulaHelpers.readNumber(value, utils);
      } catch (e) {
        if (e === FormulaError) return e;
        throw e;
      }
      if (typeof value === 'number' && isNaN(value)) return FormulaError.NUM;
      return -value;
    },
    percentOp: {
      percentOp: (value, op, utils) => {
        try {
          value = FormulaHelpers.readNumber(value, utils);
        } catch (e) {
          if (e === FormulaError) return e;
          throw e;
        }
        if (op === '%') return value / 100;
        throw new Error('Unexpected operator: ' + op);
      }
    },
    compareOp: {
      compareOp: (left, op, right, leftIsArray, rightIsArray) => {
        if (left === null) left = 0;
        if (right === null) right = 0;
        if (leftIsArray) left = left[0][0];
        if (rightIsArray) right = right[0][0];
        const leftType = typeof left, rightType = typeof right;
        if (leftType === rightType) {
          switch (op) {
            case '=': return left === right;
            case '>': return left > right;
            case '<': return left < right;
            case '<>': return left !== right;
            case '<=': return left <= right;
            case '>=': return left >= right;
          }
        } else {
          switch (op) {
            case '=': return false;
            case '>': return typePrecedence[leftType] > typePrecedence[rightType];
            case '<': return typePrecedence[leftType] < typePrecedence[rightType];
            case '<>': return true;
            case '<=': return typePrecedence[leftType] <= typePrecedence[rightType];
            case '>=': return typePrecedence[leftType] >= typePrecedence[rightType];
          }
        }
        throw Error('Unexpected operator: ' + op);
      }
    },
    concatOp: {
      concatOp: (left, op, right, leftIsArray, rightIsArray) => {
        if (left === null) left = '';
        if (right === null) right = '';
        leftIsArray && (left = left[0][0]);
        rightIsArray && (right = right[0][0]);
        const leftType = typeof left, rightType = typeof right;
        if (leftType === 'boolean') left = left ? 'TRUE' : 'FALSE';
        if (rightType === 'boolean') right = right ? 'TRUE' : 'FALSE';
        return '' + left + right;
      }
    },
    mathOp: {
      mathOp: (left, op, right, leftIsArray, rightIsArray) => {
        if (left === null) left = 0;
        if (right === null) right = 0;
        try {
          left = FormulaHelpers.readNumber(left, leftIsArray);
          right = FormulaHelpers.readNumber(right, rightIsArray);
        } catch (e) {
          if (e === FormulaError) return e;
          throw e;
        }
        switch (op) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (right === 0) return FormulaError.DIV0;
            return left / right;
          case '^': return left ** right;
        }
        throw Error('Unexpected operator: ' + op);
      }
    },
    operatorGroups: {
      compareOp: ['<', '>', '=', '<>', '<=', '>='],
      concatOp: ['&'],
      mathOp: ['+', '-', '*', '/', '^'],
    }
  };

  var typePrecedence = {};
  typePrecedence['number'] = 3;
  typePrecedence['string'] = 2;
  typePrecedence['boolean'] = 1;

  module.exports = Operators;
}});

var require_utils = __commonJS({'../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js'(exports, module) {
  const FormulaError = require_error();
  const {FormulaHelpers, Types, Address} = require_helpers();
  const {Prefix, Postfix, Infix, Operators} = require_operators();
  const Collection = require_collection();

  const MAX_ROW = 1048576;
  const MAX_COLUMN = 16384;

  class Utils {
    constructor(depParser) {
      this.depParser = depParser;
    }

    columnNameToNumber(name) {
      return Address.columnNameToNumber(name);
    }

    parseCellRef(str) {
      const match = str.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
      return {ref: {col: this.columnNameToNumber(match[2]), row: +match[4]}};
    }

    parseColRef(str) {
      return {ref: {col: this.columnNameToNumber(str), row: void 0}};
    }

    parseRowRef(str) {
      const num = +str;
      if (!Number.isInteger(num)) throw Error('Invalid row number');
      return {ref: {row: num, col: void 0}};
    }

    parseRange(start, end) {
      return this.parseCellRef(start), this.parseCellRef(end), {ref: {from: {col: Math.min(start.col, end.col), row: Math.min(start.row, end.row)}, to: {col: Math.max(start.col, end.col), row: Math.max(start.row, end.row)}}};
    }

    parseColRange(start, end) {
      return this.parseCellRef(start), this.parseCellRef(end), {ref: {from: {col: Math.min(start.col, end.col), row: null}, to: {col: Math.max(start.col, end.col), row: null}}};
    }

    parseRowRange(start, end) {
      return this.parseCellRef(start), this.parseCellRef(end), {ref: {from: {col: null, row: Math.min(start.row, end.row)}, to: {col: null, row: Math.max(start.row, end.row)}}};
    }

    parseRefError(str) {
      return new FormulaError(str.slice(0, -1));
    }

    parseName(name) {
      return new Collection(name.slice(0, -1));
    }

    parseArray(arr) {
      const collection = new Collection();
      for (let i = 0; i < arr.length; i++) {
        if (this.isWildcard(arr[i])) return arr[i];
        collection.add(this.parseCellRef(arr[i]).ref, arr[i]);
      }
      return collection;
    }

    parseCellRange(ref) {
      let fromCol, fromRow = -1, toCol = -1, toRow = MAX_ROW, sheet;
      ref.forEach(r => {
        if (this.isWildcard(r)) return r;
        if (typeof r === 'string') r = this.parseCellRef(r);
        r = r.ref;
        if (r.row !== undefined) {
          toRow = MAX_ROW, fromRow = MAX_ROW;
        }
        if (r.col !== undefined) {
          toCol = MAX_COLUMN, toCol = MAX_COLUMN;
        }
        if (r.row < fromRow) fromRow = r.row;
        if (r.col < toCol) toCol = r.col;
        if (r.row > toRow) toRow = r.row;
        if (r.col > toCol) toCol = r.col;
      });
      if (fromRow === toRow && fromCol === toCol) {
        return {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      } else {
        return {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      }
    }

    flatten(array) {
      return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
    }

    acceptValue(value) {
      const val = this.checkType(value);
      const isArray = Array.isArray(val);
      if (val.value) return {val: this.flatten(val.value), isArray};
      return {val, isArray};
    }

    checkType(value) {
      const type = typeof value;
      if (type === 'number') {
        if (isNaN(value)) return FormulaError.VALUE;
        if (!isFinite(value)) return FormulaError.NUM;
      }
      if (value === undefined || value === null) return Types.EMPTY;
      return value;
    }

    isWildcard(str) {
      if (typeof str === 'string') return /[*?]/.test(str);
      return false;
    }

    toRegex(str, flags) {
      return new RegExp(str.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/([^~]??)[?]/g, '$1.').replace(/([^~]??)[*]/g, '$1.*').replace(/~([?*])/g, '$1'), flags);
    }

    isCellRef(ref) {
      return ref.ref && ref.ref.row !== undefined;
    }

    isRangeRef(ref) {
      return ref.ref && !ref.ref.row;
    }

    applyInfix(left, op, right) {
      const leftVal = left.value, leftIsArray = left.isArray, rightVal = right.value, rightIsArray = right.isArray;
      if (this.isCellRef(leftVal)) return leftVal;
      if (this.isCellRef(rightVal)) return rightVal;
      if (Operators.operatorGroups.compareOp.includes(op)) return Infix.compareOp(leftVal, op, rightVal, leftIsArray, rightIsArray);
      else if (Operators.operatorGroups.concatOp.includes(op)) return Infix.concatOp(leftVal, op, rightVal, leftIsArray, rightIsArray);
      else if (Operators.operatorGroups.mathOp.includes(op)) return Infix.mathOp(leftVal, op, rightVal, leftIsArray, rightIsArray);
      else throw new Error('Unexpected operator: ' + op);
    }

    applyPrefix(operators, expr) {
      if (this.isWildcard(expr)) return expr;
      return Prefix.unaryOp(operators, expr, this);
    }

    applyPostfix(value, op) {
      if (this.isWildcard(value)) return value;
      return Postfix.percentOp(value, op, this);
    }

    async applyPostfixAsync(value, op) {
      const {val, isArray} = this.acceptValue(await value);
      return this.applyPostfix(val, isArray, op);
    }

    applyInfixSync(left, op, right) {
      if (this.depParser.async) return this.applyInfixAsync(left, op, right);
      else {
        const {val, isArray} = this.acceptValue(right);
        return this.applyInfix(left, op, val, isArray);
      }
    }

    async applyInfixAsync(left, op, right) {
      const {val: leftVal, isArray: leftIsArray} = this.acceptValue(await left);
      const {val: rightVal, isArray: rightIsArray} = this.acceptValue(await right);
      return this.applyInfix(leftVal, op, rightVal, rightIsArray);
    }

    applyInfix(left, op, right) {
      if (this.depParser.async) return this.applyInfixAsync(left, op, right);
      else {
        const {val, isArray} = this.acceptValue(right);
        return this.applyInfix(left, op, val, isArray);
      }
    }

    callFunction(name, ref, args) {
      if (this.depParser.onFunction) return this.depParser.onFunction(name, ref, args);
      else {
        const {val, isArray} = this.acceptValue(args);
        return this.callFunctionSync(name, val, isArray);
      }
    }

    async callFunctionAsync(name, ref, args) {
      const {val, isArray} = this.acceptValue(await args);
      return this.callFunctionSync(name, val, isArray);
    }

    callFunctionSync(name, value, isArray) {
      if (this.depParser.onFunction) return this.depParser.onFunction(name, value, isArray);
      else {
        const {val, isArray} = this.acceptValue(value);
        return this.callFunctionSync(name, val, isArray);
      }
    }

    async callFunctionAsync2(name, ref, args) {
      const {val, isArray} = this.acceptValue(await ref);
      const {val: val2, isArray: isArray2} = this.acceptValue(await args);
      return this.callFunctionSync(name, val, val2, isArray2);
    }

    applyInfix(left, op, right) {
      if (this.depParser.async) return this.applyInfixAsync(left, op, right);
      else {
        const {val, isArray} = this.acceptValue(right);
        return this.applyInfix(left, op, val, isArray);
      }
    }

    parseCellRange(ref) {
      if (this.isWildcard(ref[0])) return ref[0];
      if (!ref[0].ref) throw Error('Invalid reference');
      let fromCol, fromRow, toCol, toRow, sheet, result;
      const first = ref[0].ref;
      sheet = first.sheet;
      if (!first.ref) {
        if (first.col === undefined || first.row === undefined) throw Error('Invalid reference');
        fromCol = toCol = first.col;
        fromRow = toRow = first.row;
      } else {
        fromCol = Math.min(first.ref.from.col, first.ref.to.col);
        toCol = Math.max(first.ref.from.col, first.ref.to.col);
        fromRow = Math.min(first.ref.from.row, first.ref.to.row);
        toRow = Math.max(first.ref.from.row, first.ref.to.row);
      }
      let error;
      ref.forEach(r => {
        if (this.isWildcard(r)) return r;
        r = r.ref;
        if (!r) throw Error('Invalid reference: ' + r);
        if (!r.ref) {
          if (r.col === undefined || r.row === undefined) throw Error('Invalid reference');
          (r.col < fromCol || r.col > toCol || r.row < fromRow || r.row > toRow || sheet !== r.sheet) && (error = FormulaError.REF);
          fromCol = toCol = r.col;
          fromRow = toRow = r.row;
        } else {
          const minCol = Math.min(r.ref.from.col, r.ref.to.col);
          const maxCol = Math.max(r.ref.from.col, r.ref.to.col);
          const minRow = Math.min(r.ref.from.row, r.ref.to.row);
          const maxRow = Math.max(r.ref.from.row, r.ref.to.row);
          (maxCol < fromCol || minCol > toCol || maxRow < fromRow || minRow > toRow || sheet !== r.sheet) && (error = FormulaError.REF);
          fromCol = Math.min(fromCol, minCol);
          toCol = Math.max(toCol, maxCol);
          fromRow = Math.min(fromRow, minRow);
          toRow = Math.max(toRow, maxRow);
        }
      });
      if (error) return error;
      if (fromCol === toCol && fromRow === toRow) {
        result = {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      } else {
        result = {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      }
      if (!result.ref.sheet) delete result.ref.sheet;
      return result;
    }

    parseArray(arr) {
      const collection = new Collection();
      for (let i = 0; i < arr.length; i++) {
        if (this.isWildcard(arr[i])) return arr[i];
        collection.add(this.parseCellRef(arr[i]).ref, arr[i]);
      }
      return collection;
    }

    parseCellRange(ref) {
      let fromRow = -1, fromCol = -1, toRow = MAX_ROW, toCol = MAX_COLUMN;
      ref.forEach(r => {
        if (this.isWildcard(r)) return r;
        if (typeof r === 'string') r = this.parseCellRef(r);
        r = r.ref;
        if (r.row !== undefined) {
          toRow = MAX_ROW, fromRow = MAX_ROW;
        }
        if (r.col !== undefined) {
          toCol = MAX_COLUMN, toCol = MAX_COLUMN;
        }
        if (r.row < fromRow) fromRow = r.row;
        if (r.col < toCol) toCol = r.col;
        if (r.row > toRow) toRow = r.row;
        if (r.col > toCol) toCol = r.col;
      });
      if (fromRow === toRow && fromCol === toCol) {
        return {ref: {from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      } else {
        return {ref: {from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      }
    }

    flatten(array) {
      return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
    }

    acceptValue(value) {
      const val = this.checkType(value);
      const isArray = Array.isArray(val);
      if (val.value) return {val: this.flatten(val.value), isArray};
      return {val, isArray};
    }

    checkType(value) {
      const type = typeof value;
      if (type === 'number') {
        if (isNaN(value)) return FormulaError.VALUE;
        if (!isFinite(value)) return FormulaError.NUM;
      }
      if (value === undefined || value === null) return Types.EMPTY;
      return value;
    }

    isWildcard(str) {
      if (typeof str === 'string') return /[*?]/.test(str);
      return false;
    }

    toRegex(str, flags) {
      return new RegExp(str.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/([^~]??)[?]/g, '$1.').replace(/([^~]??)[*]/g, '$1.*').replace(/~([?*])/g, '$1'), flags);
    }

    isCellRef(ref) {
      return ref.ref && ref.ref.row !== undefined;
    }

    isRangeRef(ref) {
      return ref.ref && !ref.ref.row;
    }

    parseNumber(str) {
      return Number(str);
    }

    parseString(str) {
      return str.slice(1, -1).replace(/""/g, '"');
    }

    parseBoolean(str) {
      return str.toUpperCase() === 'TRUE';
    }

    parseError(str) {
      return new FormulaError(str.slice(0, -1));
    }

    parseName(name) {
      return new Collection(name.slice(0, -1));
    }

    static formatChevrotainError(error, input) {
      let line, column, msg = '';
      if (error instanceof NotAllInputParsedException) {
        line = error.token.startLine;
        column = error.token.startColumn;
      } else {
        line = error.previousToken.startLine;
        column = error.previousToken.startColumn + 1;
      }
      msg += '\n' + input.split('\n')[line - 1] + '\n';
      msg += Array(column).join(' ') + '^\n';
      msg += 'Error at line ' + line + ':' + column + '\n';
      error.line = line;
      error.column = column;
      return FormulaError.ERROR(msg, error);
    }
  }

  module.exports = Utils;
}});

var require_utils2 = __commonJS({'../work/LesterLyu__fast-formula-parser/grammar/utils.js'(exports, module) {
  const FormulaError = require_error();
  const {Address} = require_helpers();
  const {Prefix, Postfix, Infix, Operators} = require_operators();
  const Collection = require_collection();

  const MAX_ROW = 1048576;
  const MAX_COLUMN = 16384;

  const {NotAllInputParsedException} = require('chevrotain');

  class Utils {
    constructor(parser) {
      this.parser = parser;
    }

    columnNameToNumber(name) {
      return Address.columnNameToNumber(name);
    }

    parseCellRef(str) {
      const match = str.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
      return {ref: {address: match[0], col: this.columnNameToNumber(match[2]), row: +match[4]}};
    }

    parseNumber(str) {
      const num = +str;
      if (!Number.isInteger(num)) throw Error('Invalid row number');
      return {ref: {row: num, col: void 0}};
    }

    parseColRef(str) {
      return {ref: {col: this.columnNameToNumber(str), row: void 0}};
    }

    parseRowRange(start, end) {
      return start = this.columnNameToNumber(start), end = this.columnNameToNumber(end), {ref: {from: {col: Math.min(start, end), row: null}, to: {col: Math.max(start, end), row: null}}};
    }

    parseColRange(start, end) {
      return {ref: {from: {col: null, row: Math.min(start, end)}, to: {col: null, row: Math.max(start, end)}}};
    }

    applyPrefix(operators, value, utils) {
      if (this.isWildcard(value)) return value;
      return Prefix.unaryOp(operators, value, utils);
    }

    async applyPostfixAsync(value, op) {
      const {val, isArray} = this.acceptValue(await value);
      return this.applyPostfix(val, op, isArray);
    }

    applyPostfixSync(value, op) {
      if (this.parser.async) return this.applyPostfixAsync(value, op);
      else {
        const {val, isArray} = this.acceptValue(value);
        return this.applyPostfix(val, op, isArray);
      }
    }

    applyPostfix(value, op, isArray) {
      if (this.isWildcard(value)) return value;
      return Postfix.percentOp(value, op, isArray);
    }

    async applyInfixAsync(left, op, right) {
      const {val, isArray} = this.acceptValue(await left);
      const {val: val2, isArray: isArray2} = this.acceptValue(await right);
      return this.applyInfix(val, op, val2, isArray2);
    }

    applyInfix(left, op, right) {
      if (this.parser.async) return this.applyInfixAsync(left, op, right);
      else {
        const {val, isArray} = this.acceptValue(right);
        return this.applyInfix(left, op, val, isArray);
      }
    }

    callFunction(name, ref, args) {
      if (this.parser.onFunction) return this.parser.onFunction(name, ref, args);
      else {
        const {val, isArray} = this.acceptValue(args);
        return this.callFunctionSync(name, val, isArray);
      }
    }

    async callFunctionAsync(name, ref, args) {
      const {val, isArray} = this.acceptValue(await args);
      return this.callFunctionSync(name, val, isArray);
    }

    callFunctionSync(name, value, isArray) {
      if (this.parser.onFunction) return this.parser.onFunction(name, value, isArray);
      else {
        const {val, isArray} = this.acceptValue(value);
        return this.callFunctionSync(name, val, isArray);
      }
    }

    async callFunctionAsync2(name, ref, args) {
      const {val, isArray} = this.acceptValue(await ref);
      const {val: val2, isArray: isArray2} = this.acceptValue(await args);
      return this.callFunctionSync(name, val, val2, isArray2);
    }

    applyInfix(left, op, right) {
      if (this.parser.async) return this.applyInfixAsync(left, op, right);
      else {
        const {val, isArray} = this.acceptValue(right);
        return this.applyInfix(left, op, val, isArray);
      }
    }

    parseCellRange(ref) {
      if (this.isWildcard(ref[0])) return ref[0];
      if (!ref[0].ref) throw Error('Invalid reference');
      let fromCol, fromRow, toCol, toRow, sheet, result;
      const first = ref[0].ref;
      sheet = first.sheet;
      if (!first.ref) {
        if (first.col === undefined || first.row === undefined) throw Error('Invalid reference');
        fromCol = toCol = first.col;
        fromRow = toRow = first.row;
      } else {
        fromCol = Math.min(first.ref.from.col, first.ref.to.col);
        toCol = Math.max(first.ref.from.col, first.ref.to.col);
        fromRow = Math.min(first.ref.from.row, first.ref.to.row);
        toRow = Math.max(first.ref.from.row, first.ref.to.row);
      }
      let error;
      ref.forEach(r => {
        if (this.isWildcard(r)) return r;
        r = r.ref;
        if (!r) throw Error('Invalid reference: ' + r);
        if (!r.ref) {
          if (r.col === undefined || r.row === undefined) throw Error('Invalid reference');
          (r.col < fromCol || r.col > toCol || r.row < fromRow || r.row > toRow || sheet !== r.sheet) && (error = FormulaError.REF);
          fromCol = toCol = r.col;
          fromRow = toRow = r.row;
        } else {
          const minCol = Math.min(r.ref.from.col, r.ref.to.col);
          const maxCol = Math.max(r.ref.from.col, r.ref.to.col);
          const minRow = Math.min(r.ref.from.row, r.ref.to.row);
          const maxRow = Math.max(r.ref.from.row, r.ref.to.row);
          (maxCol < fromCol || minCol > toCol || maxRow < fromRow || minRow > toRow || sheet !== r.sheet) && (error = FormulaError.REF);
          fromCol = Math.min(fromCol, minCol);
          toCol = Math.max(toCol, maxCol);
          fromRow = Math.min(fromRow, minRow);
          toRow = Math.max(toRow, maxRow);
        }
      });
      if (error) return error;
      if (fromCol === toCol && fromRow === toRow) {
        result = {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      } else {
        result = {ref: {sheet, from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      }
      if (!result.ref.sheet) delete result.ref.sheet;
      return result;
    }

    parseArray(arr) {
      const collection = new Collection();
      for (let i = 0; i < arr.length; i++) {
        if (this.isWildcard(arr[i])) return arr[i];
        collection.add(this.parseCellRef(arr[i]).ref, arr[i]);
      }
      return collection;
    }

    parseCellRange(ref) {
      let fromRow = -1, fromCol = -1, toRow = MAX_ROW, toCol = MAX_COLUMN;
      ref.forEach(r => {
        if (this.isWildcard(r)) return r;
        if (typeof r === 'string') r = this.parseCellRef(r);
        r = r.ref;
        if (r.row !== undefined) {
          toRow = MAX_ROW, fromRow = MAX_ROW;
        }
        if (r.col !== undefined) {
          toCol = MAX_COLUMN, toCol = MAX_COLUMN;
        }
        if (r.row < fromRow) fromRow = r.row;
        if (r.col < toCol) toCol = r.col;
        if (r.row > toRow) toRow = r.row;
        if (r.col > toCol) toCol = r.col;
      });
      if (fromRow === toRow && fromCol === toCol) {
        return {ref: {from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      } else {
        return {ref: {from: {col: fromCol, row: fromRow}, to: {col: toCol, row: toRow}}};
      }
    }

    flatten(array) {
      return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
    }

    acceptValue(value) {
      let val = value, isArray = false;
      if (Array.isArray(val)) isArray = true;
      if (value.value) return {val: this.flatten(value.value), isArray};
      return {val, isArray};
    }

    parseNumber(str) {
      return Number(str);
    }

    parseString(str) {
      return str.slice(1, -1).replace(/""/g, '"');
    }

    parseBoolean(str) {
      return str.toUpperCase() === 'TRUE';
    }

    parseError(str) {
      return new FormulaError(str.slice(0, -1));
    }

    parseName(name) {
      return new Collection(name.slice(0, -1));
    }

    static formatChevrotainError(error, input) {
      let line, column, msg = '';
      if (error instanceof NotAllInputParsedException) {
        line = error.token.startLine;
        column = error.token.startColumn;
      } else {
        line = error.previousToken.startLine;
        column = error.previousToken.startColumn + 1;
      }
      msg += '\n' + input.split('\n')[line - 1] + '\n';
      msg += Array(column).join(' ') + '^\n';
      msg += 'Error at line ' + line + ':' + column + '\n';
      error.line = line;
      error.column = column;
      return FormulaError.ERROR(msg, error);
    }
  }

  module.exports = Utils;
}});

const FormulaError = require_error();
const {FormulaHelpers} = require_helpers();
const {Parser} = require_parsing();
const lexer = require_lexing();
const Utils = require_utils();
const {formatChevrotainError} = require_utils2();

class DepParser {
  constructor(options) {
    this.utils = new Utils(this);
    options = Object.assign({onCell: () => null}, options);
    this.onCell = options.onCell;
    this.parser = new Parser(this, this.utils);
    this.variables = {};
    this.list = [];
  }

  parse(formula) {
    if (formula.length === 0) throw Error('Empty formula');
    this.list = [];
    this.formula = formula;
    const lexResult = lexer.lex(formula);
    this.parser.input = lexResult.tokens;
    try {
      const result = this.parser.formula();
      this.handleResult(result);
    } catch (e) {
      throw FormulaError.ERROR(e.message, e);
    }
    if (this.parser.errors.length > 0) {
      const error = this.parser.errors[0];
      throw formatChevrotainError(error, formula);
    }
    return this.list;
  }

  handleResult(result) {
    const ref = {ref: this.onCell(result, this.variables.onCell)};
    if (ref.ref === null) return FormulaError.NULL;
    if (FormulaHelpers.isCellRef(ref)) this.addDep(ref.ref);
    else this.addDep(ref.ref);
    return 0;
  }

  addDep(ref) {
    if (FormulaHelpers.isCellRef(ref)) return this.addCell(ref.ref);
    if (FormulaHelpers.isRangeRef(ref)) return this.addRange(ref.ref);
    return ref;
  }

  addCell(cell) {
    cell.forEach(c => {
      if (c === null) return;
      this.addDep(c);
    });
    return {status: 0, deps: {}};
  }

  handleResult(result) {
    this.addDep(result);
  }

  parse(formula, variables, returnErrors = false) {
    if (formula.length === 0) throw Error('Empty formula');
    this.list = [];
    this.variables = variables;
    const lexResult = lexer.lex(formula);
    this.parser.input = lexResult.tokens;
    try {
      const result = this.parser.formula();
      this.handleResult(result);
    } catch (e) {
      if (!returnErrors) {
        throw FormulaError.ERROR(e.message, e);
      }
    }
    if (this.parser.errors.length > 0 && !returnErrors) {
      const error = this.parser.errors[0];
      throw formatChevrotainError(error, formula);
    }
    return this.list;
  }
}

const _exports = {};
_exports.DepParser = DepParser;
module.exports = _exports;
