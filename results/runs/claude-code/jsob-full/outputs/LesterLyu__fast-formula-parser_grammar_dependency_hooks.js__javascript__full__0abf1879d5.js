'use strict';

const {
  createToken,
  Lexer,
  EmbeddedActionsParser,
  NotAllInputParsedException,
} = require('chevrotain');

class FormulaError extends Error {
  static errorMap = new Map();

  constructor(error, message, details) {
    super(message);
    if (message == null && details == null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }
    this._error = error;
    this.details = details;
    if (message == null && details == null) {
      FormulaError.errorMap.set(error, this);
    }
  }

  get error() {
    return this._error;
  }

  get name() {
    return this._error;
  }

  equals(other) {
    return other instanceof FormulaError && other._error === this._error;
  }

  toString() {
    return this._error;
  }
}

FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');
FormulaError.ERROR = (message, details) => new FormulaError('#ERROR!', message, details);

const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
const StringLiteral = createToken({ name: 'String', pattern: /"(""|[^"])*"/ });
const SingleQuotedString = createToken({ name: 'SingleQuotedString', pattern: /'(''|[^'])*'/ });
const SheetQuoted = createToken({ name: 'SheetQuoted', pattern: /'((?![\\/\[\]*?:]).)+?'!/ });
const FunctionToken = createToken({ name: 'Function', pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/ });
const FormulaErrorToken = createToken({ name: 'FormulaErrorT', pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/ });
const RefError = createToken({ name: 'RefError', pattern: /#REF!/ });
const Name = createToken({ name: 'Name', pattern: /[a-zA-Z_][a-zA-Z0-9_.?]*/ });
const Sheet = createToken({ name: 'Sheet', pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/ });
const Cell = createToken({ name: 'Cell', pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/, longer_alt: Name });
const NumberLiteral = createToken({ name: 'Number', pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/ });
const BooleanLiteral = createToken({ name: 'Boolean', pattern: /TRUE|FALSE/i });
const Column = createToken({ name: 'Column', pattern: /[$]?[A-Za-z]{1,3}/, longer_alt: Name });
const At = createToken({ name: 'At', pattern: /@/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const Colon = createToken({ name: 'Colon', pattern: /:/ });
const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
const OpenParen = createToken({ name: 'OpenParen', pattern: /\(/ });
const CloseParen = createToken({ name: 'CloseParen', pattern: /\)/ });
const OpenSquareParen = createToken({ name: 'OpenSquareParen', pattern: /\[/ });
const CloseSquareParen = createToken({ name: 'CloseSquareParen', pattern: /]/ });
const ExclamationMark = createToken({ name: 'exclamationMark', pattern: /!/ });
const OpenCurlyParen = createToken({ name: 'OpenCurlyParen', pattern: /{/ });
const CloseCurlyParen = createToken({ name: 'CloseCurlyParen', pattern: /}/ });
const Quote = createToken({ name: 'QuoteS', pattern: /'/ });
const MulOp = createToken({ name: 'MulOp', pattern: /\*/ });
const PlusOp = createToken({ name: 'PlusOp', pattern: /\+/ });
const DivOp = createToken({ name: 'DivOp', pattern: /\// });
const MinOp = createToken({ name: 'MinOp', pattern: /-/ });
const ConcatOp = createToken({ name: 'ConcatOp', pattern: /&/ });
const ExOp = createToken({ name: 'ExOp', pattern: /\^/ });
const PercentOp = createToken({ name: 'PercentOp', pattern: /%/ });
const NeqOp = createToken({ name: 'NeqOp', pattern: /<>/ });
const GteOp = createToken({ name: 'GteOp', pattern: />=/ });
const LteOp = createToken({ name: 'LteOp', pattern: /<=/ });
const GtOp = createToken({ name: 'GtOp', pattern: />/ });
const EqOp = createToken({ name: 'EqOp', pattern: /=/ });
const LtOp = createToken({ name: 'LtOp', pattern: /</ });

const allTokens = [
  WhiteSpace,
  StringLiteral,
  SheetQuoted,
  SingleQuotedString,
  FunctionToken,
  FormulaErrorToken,
  RefError,
  Sheet,
  Cell,
  BooleanLiteral,
  Column,
  Name,
  NumberLiteral,
  At,
  Comma,
  Colon,
  Semicolon,
  OpenParen,
  CloseParen,
  OpenSquareParen,
  CloseSquareParen,
  ExclamationMark,
  OpenCurlyParen,
  CloseCurlyParen,
  Quote,
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
  LtOp,
];

const formulaLexer = new Lexer(allTokens, { ensureOptimizations: true });

function lexFormula(formula) {
  const result = formulaLexer.tokenize(formula);
  if (result.errors.length > 0) {
    const error = result.errors[0];
    const line = error.line;
    const column = error.column;
    const marker = `\n${formula.split('\n')[line - 1]}\n${Array(column - 1).fill(' ').join('')}^\n`;
    error.message = `${marker}Error at position ${line}:${column}\n${error.message}`;
    error.errorLocation = { line, column };
    throw FormulaError.ERROR(error.message, error);
  }
  return result;
}

function columnNameToNumber(name) {
  const upperName = name.toUpperCase();
  let number = 0;
  for (let index = 0; index < upperName.length; index++) {
    const characterCode = upperName.charCodeAt(index);
    if (!Number.isNaN(characterCode)) {
      number += (characterCode - 64) * 26 ** (upperName.length - index - 1);
    }
  }
  return number;
}

function isRangeRef(value) {
  return value.ref && value.ref.from;
}

function isCellRef(value) {
  return value.ref && !value.ref.from;
}

class ReferenceCollection {
  constructor(data = [], refs = []) {
    if (data.length !== refs.length) {
      throw Error('Collection: data length should match references length.');
    }
    this._data = data;
    this._refs = refs;
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

  add(value, reference) {
    this._data.push(value);
    this._refs.push(reference);
  }
}

class DependencyUtils {
  constructor(context) {
    this.context = context;
  }

  columnNameToNumber(name) {
    return columnNameToNumber(name);
  }

  parseCellAddress(address) {
    const match = address.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
    return { ref: { col: this.columnNameToNumber(match[2]), row: +match[4] } };
  }

  parseRow(row) {
    const number = +row;
    if (!Number.isInteger(number)) {
      throw Error('Row number must be integer.');
    }
    return { ref: { col: undefined, row: number } };
  }

  parseCol(column) {
    return { ref: { col: this.columnNameToNumber(column), row: undefined } };
  }

  applyPrefix(_operator, value) {
    this.extractRefValue(value);
    return 0;
  }

  applyPostfix(value) {
    this.extractRefValue(value);
    return 0;
  }

  applyInfix(left, _operator, right) {
    this.extractRefValue(left);
    this.extractRefValue(right);
    return 0;
  }

  applyIntersect(references) {
    if (this.isFormulaError(references[0])) return references[0];
    if (!references[0].ref) throw Error(`Expecting a reference, but got ${references[0]}.`);

    const first = references.shift().ref;
    const sheet = first.sheet;
    let bottom;
    let top;
    let right;
    let left;

    if (first.from) {
      bottom = Math.max(first.from.row, first.to.row);
      top = Math.min(first.from.row, first.to.row);
      right = Math.max(first.from.col, first.to.col);
      left = Math.min(first.from.col, first.to.col);
    } else {
      if (first.row === undefined || first.col === undefined) {
        throw Error('Cannot intersect the whole row or column.');
      }
      bottom = top = first.row;
      right = left = first.col;
    }

    let intersectionError;
    references.forEach(referenceValue => {
      if (this.isFormulaError(referenceValue)) return referenceValue;
      const reference = referenceValue.ref;
      if (!reference) throw Error(`Expecting a reference, but got ${reference}.`);

      if (reference.from) {
        const nextBottom = Math.max(reference.from.row, reference.to.row);
        const nextTop = Math.min(reference.from.row, reference.to.row);
        const nextRight = Math.max(reference.from.col, reference.to.col);
        const nextLeft = Math.min(reference.from.col, reference.to.col);
        if (nextTop > bottom || nextBottom < top || nextLeft > right || nextRight < left || sheet !== reference.sheet) {
          intersectionError = FormulaError.NULL;
        }
        bottom = Math.min(bottom, nextBottom);
        top = Math.max(top, nextTop);
        right = Math.min(right, nextRight);
        left = Math.max(left, nextLeft);
      } else {
        if (reference.row === undefined || reference.col === undefined) {
          throw Error('Cannot intersect the whole row or column.');
        }
        if (reference.row > bottom || reference.row < top || reference.col > right || reference.col < left || sheet !== reference.sheet) {
          intersectionError = FormulaError.NULL;
        }
        bottom = top = reference.row;
        right = left = reference.col;
      }
    });

    if (intersectionError) return intersectionError;
    const result = bottom === top && right === left
      ? { ref: { sheet, row: bottom, col: right } }
      : { ref: { sheet, from: { row: top, col: left }, to: { row: bottom, col: right } } };
    if (!result.ref.sheet) delete result.ref.sheet;
    return result;
  }

  applyUnion(references) {
    const collection = new ReferenceCollection();
    for (const reference of references) {
      if (this.isFormulaError(reference)) return reference;
      collection.add(this.extractRefValue(reference).val, reference);
    }
    return collection;
  }

  applyRange(items) {
    let maxRow = -1;
    let maxCol = -1;
    let minRow = 1048577;
    let minCol = 16385;

    items.forEach(item => {
      if (this.isFormulaError(item)) return item;
      if (typeof item === 'number') item = this.parseRow(item);
      const reference = item.ref;
      if (reference.row === undefined) {
        minRow = 1;
        maxRow = 1048576;
      }
      if (reference.col === undefined) {
        minCol = 1;
        maxCol = 16384;
      }
      if (reference.row > maxRow) maxRow = reference.row;
      if (reference.row < minRow) minRow = reference.row;
      if (reference.col > maxCol) maxCol = reference.col;
      if (reference.col < minCol) minCol = reference.col;
    });

    if (maxRow === minRow && maxCol === minCol) {
      return { ref: { row: maxRow, col: maxCol } };
    }
    return { ref: { from: { row: minRow, col: minCol }, to: { row: maxRow, col: maxCol } } };
  }

  extractRefValue(value) {
    const isArray = Array.isArray(value);
    if (value.ref) return { val: this.context.retrieveRef(value), isArray };
    return { val: value, isArray };
  }

  toArray(value) {
    return value;
  }

  toNumber(value) {
    return Number(value);
  }

  toString(value) {
    return value.substring(1, value.length - 1).replace(/""/g, '"');
  }

  toBoolean(value) {
    return value === 'TRUE';
  }

  toError(value) {
    return new FormulaError(value.toUpperCase());
  }

  isFormulaError(value) {
    return value instanceof FormulaError;
  }
}

class FormulaParser extends EmbeddedActionsParser {
  constructor(context, utils) {
    super(allTokens, { outputCst: false, maxLookahead: 1, skipValidations: true });
    this.utils = utils;
    this.binaryOperatorsPrecedence = [
      ['^'],
      ['*', '/'],
      ['+', '-'],
      ['&'],
      ['<', '>', '=', '<>', '<=', '>='],
    ];
    const parser = this;

    parser.RULE('formulaWithBinaryOp', () => {
      const operators = [];
      const values = [parser.SUBRULE(parser.formulaWithPercentOp)];
      parser.MANY(() => {
        operators.push(parser.OR(parser.binaryOperatorAlternatives || (parser.binaryOperatorAlternatives = [
          { ALT: () => parser.CONSUME(GtOp).image },
          { ALT: () => parser.CONSUME(EqOp).image },
          { ALT: () => parser.CONSUME(LtOp).image },
          { ALT: () => parser.CONSUME(NeqOp).image },
          { ALT: () => parser.CONSUME(GteOp).image },
          { ALT: () => parser.CONSUME(LteOp).image },
          { ALT: () => parser.CONSUME(ConcatOp).image },
          { ALT: () => parser.CONSUME(PlusOp).image },
          { ALT: () => parser.CONSUME(MinOp).image },
          { ALT: () => parser.CONSUME(MulOp).image },
          { ALT: () => parser.CONSUME(DivOp).image },
          { ALT: () => parser.CONSUME(ExOp).image },
        ])));
        values.push(parser.SUBRULE2(parser.formulaWithPercentOp));
      });
      parser.ACTION(() => {
        for (const precedenceGroup of this.binaryOperatorsPrecedence) {
          for (let index = 0; index < operators.length; index++) {
            if (precedenceGroup.includes(operators[index])) {
              const value = this.utils.applyInfix(values[index], operators[index], values[index + 1]);
              operators.splice(index, 1);
              values.splice(index, 2, value);
              index--;
            }
          }
        }
      });
      return values[0];
    });

    parser.RULE('plusMinusOp', () => parser.OR([
      { ALT: () => parser.CONSUME(PlusOp).image },
      { ALT: () => parser.CONSUME(MinOp).image },
    ]));

    parser.RULE('formulaWithPercentOp', () => {
      let value = parser.SUBRULE(parser.formulaWithUnaryOp);
      parser.OPTION(() => {
        const operator = parser.CONSUME(PercentOp).image;
        value = parser.ACTION(() => this.utils.applyPostfix(value, operator));
      });
      return value;
    });

    parser.RULE('formulaWithUnaryOp', () => {
      const operators = [];
      parser.MANY(() => operators.push(parser.OR([
        { ALT: () => parser.CONSUME(PlusOp).image },
        { ALT: () => parser.CONSUME(MinOp).image },
      ])));
      const value = parser.SUBRULE(parser.formulaWithIntersect);
      return operators.length > 0 ? parser.ACTION(() => this.utils.applyPrefix(operators, value)) : value;
    });

    parser.RULE('formulaWithIntersect', () => {
      const first = parser.SUBRULE(parser.formulaWithRange);
      const references = [first];
      parser.MANY({
        GATE: () => parser.LA(1).startOffset > parser.LA(0).endOffset + 1,
        DEF: () => references.push(parser.SUBRULE3(parser.formulaWithRange)),
      });
      return references.length > 1
        ? parser.ACTION(() => parser.ACTION(() => this.utils.applyIntersect(references)))
        : first;
    });

    parser.RULE('formulaWithRange', () => {
      const first = parser.SUBRULE(parser.formula);
      const items = [first];
      parser.MANY(() => {
        parser.CONSUME(Colon);
        items.push(parser.SUBRULE2(parser.formula));
      });
      return items.length > 1
        ? parser.ACTION(() => parser.ACTION(() => this.utils.applyRange(items)))
        : first;
    });

    parser.RULE('formula', () => parser.OR9([
      { ALT: () => parser.SUBRULE(parser.referenceWithoutInfix) },
      { ALT: () => parser.SUBRULE(parser.paren) },
      { ALT: () => parser.SUBRULE(parser.constant) },
      { ALT: () => parser.SUBRULE(parser.functionCall) },
      { ALT: () => parser.SUBRULE(parser.constantArray) },
    ]));

    parser.RULE('paren', () => {
      parser.CONSUME(OpenParen);
      const values = [parser.SUBRULE(parser.formulaWithBinaryOp)];
      parser.MANY(() => {
        parser.CONSUME(Comma);
        values.push(parser.SUBRULE2(parser.formulaWithBinaryOp));
      });
      const result = values.length > 1 ? parser.ACTION(() => this.utils.applyUnion(values)) : values[0];
      parser.CONSUME(CloseParen);
      return result;
    });

    parser.RULE('constantArray', () => {
      const values = [[]];
      let row = 0;
      parser.CONSUME(OpenCurlyParen);
      values[row].push(parser.SUBRULE(parser.constantForArray));
      parser.MANY(() => {
        const separator = parser.OR([
          { ALT: () => parser.CONSUME(Comma).image },
          { ALT: () => parser.CONSUME(Semicolon).image },
        ]);
        const value = parser.SUBRULE2(parser.constantForArray);
        if (separator === ',') values[row].push(value);
        else {
          row++;
          values[row] = [value];
        }
      });
      parser.CONSUME(CloseCurlyParen);
      return parser.ACTION(() => this.utils.toArray(values));
    });

    parser.RULE('constantForArray', () => parser.OR([
      { ALT: () => {
        const sign = parser.OPTION(() => parser.SUBRULE(parser.plusMinusOp));
        const image = parser.CONSUME(NumberLiteral).image;
        const value = parser.ACTION(() => this.utils.toNumber(image));
        return sign ? parser.ACTION(() => this.utils.applyPrefix([sign], value)) : value;
      } },
      { ALT: () => {
        const image = parser.CONSUME(StringLiteral).image;
        return parser.ACTION(() => this.utils.toString(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(BooleanLiteral).image;
        return parser.ACTION(() => this.utils.toBoolean(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(FormulaErrorToken).image;
        return parser.ACTION(() => this.utils.toError(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(RefError).image;
        return parser.ACTION(() => this.utils.toError(image));
      } },
    ]));

    parser.RULE('constant', () => parser.OR([
      { ALT: () => {
        const image = parser.CONSUME(NumberLiteral).image;
        return parser.ACTION(() => this.utils.toNumber(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(StringLiteral).image;
        return parser.ACTION(() => this.utils.toString(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(BooleanLiteral).image;
        return parser.ACTION(() => this.utils.toBoolean(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(FormulaErrorToken).image;
        return parser.ACTION(() => this.utils.toError(image));
      } },
    ]));

    parser.RULE('functionCall', () => {
      const name = parser.CONSUME(FunctionToken).image.slice(0, -1);
      const args = parser.SUBRULE(parser.arguments);
      parser.CONSUME(CloseParen);
      return parser.ACTION(() => context.callFunction(name, args));
    });

    parser.RULE('arguments', () => {
      parser.MANY2(() => parser.CONSUME2(Comma));
      const args = [];
      parser.OPTION(() => {
        args.push(parser.SUBRULE(parser.formulaWithBinaryOp));
        parser.MANY(() => {
          parser.CONSUME1(Comma);
          args.push(null);
          parser.OPTION3(() => {
            args.pop();
            args.push(parser.SUBRULE2(parser.formulaWithBinaryOp));
          });
        });
      });
      return args;
    });

    parser.RULE('referenceWithoutInfix', () => parser.OR([
      { ALT: () => parser.SUBRULE(parser.referenceItem) },
      { ALT: () => {
        const sheet = parser.SUBRULE(parser.prefixName);
        const reference = parser.SUBRULE2(parser.formulaWithRange);
        return parser.ACTION(() => {
          if (this.utils.isFormulaError(reference)) return reference;
          reference.ref.sheet = sheet;
          return reference;
        });
      } },
    ]));

    parser.RULE('referenceItem', () => parser.OR([
      { ALT: () => {
        const image = parser.CONSUME(Cell).image;
        return parser.ACTION(() => this.utils.parseCellAddress(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(Name).image;
        return parser.ACTION(() => context.getVariable(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(Column).image;
        return parser.ACTION(() => this.utils.parseCol(image));
      } },
      { ALT: () => {
        const image = parser.CONSUME(RefError).image;
        return parser.ACTION(() => this.utils.toError(image));
      } },
    ]));

    parser.RULE('prefixName', () => parser.OR([
      { ALT: () => parser.CONSUME(Sheet).image.slice(0, -1) },
      { ALT: () => parser.CONSUME(SheetQuoted).image.slice(1, -2).replace(/''/g, "'") },
    ]));

    this.performSelfAnalysis();
  }
}

function formatChevrotainError(error, formula) {
  let line;
  let column;
  if (error instanceof NotAllInputParsedException) {
    line = error.token.startLine;
    column = error.token.startColumn;
  } else {
    line = error.previousToken.startLine;
    column = error.previousToken.startColumn + 1;
  }
  const sourceLine = formula.split('\n')[line - 1];
  const message = `\n${sourceLine}\n${Array(column - 1).fill(' ').join('')}^\nError at position ${line}:${column}\n${error.message}`;
  error.errorLocation = { line, column };
  return FormulaError.ERROR(message, error);
}

class DepParser {
  constructor(config) {
    this.data = [];
    this.utils = new DependencyUtils(this);
    config = Object.assign({ onVariable: () => null }, config);
    this.onVariable = config.onVariable;
    this.functions = {};
    this.parser = new FormulaParser(this, this.utils);
  }

  getCell(reference) {
    if (reference.row != null) {
      if (reference.sheet == null) reference.sheet = this.position ? this.position.sheet : undefined;
      const exists = this.data.findIndex(item =>
        item.from && item.from.row <= reference.row && item.to.row >= reference.row &&
          item.from.col <= reference.col && item.to.col >= reference.col ||
        item.row === reference.row && item.col === reference.col && item.sheet === reference.sheet,
      );
      if (exists === -1) this.data.push(reference);
    }
    return 0;
  }

  getRange(reference) {
    if (reference.from.row != null) {
      if (reference.sheet == null) reference.sheet = this.position ? this.position.sheet : undefined;
      const exists = this.data.findIndex(item => item.from &&
        item.from.row === reference.from.row && item.from.col === reference.from.col &&
        item.to.row === reference.to.row && item.to.col === reference.to.col,
      );
      if (exists === -1) this.data.push(reference);
    }
    return [[0]];
  }

  getVariable(name) {
    const value = { ref: this.onVariable(name, this.position.sheet) };
    if (value.ref == null) return FormulaError.NAME;
    if (isCellRef(value)) this.getCell(value.ref);
    else this.getRange(value.ref);
    return 0;
  }

  retrieveRef(value) {
    if (isRangeRef(value)) return this.getRange(value.ref);
    if (isCellRef(value)) return this.getCell(value.ref);
    return value;
  }

  callFunction(_name, args) {
    args.forEach(value => {
      if (value != null) this.retrieveRef(value);
    });
    return { value: 0, ref: {} };
  }

  checkFormulaResult(value) {
    this.retrieveRef(value);
  }

  parse(formula, position, ignoreError = false) {
    if (formula.length === 0) throw Error('Input must not be empty.');
    this.data = [];
    this.position = position;
    const lexResult = lexFormula(formula);
    this.parser.input = lexResult.tokens;
    try {
      const result = this.parser.formulaWithBinaryOp();
      this.checkFormulaResult(result);
    } catch (error) {
      if (!ignoreError) throw FormulaError.ERROR(error.message, error);
    }
    if (this.parser.errors.length > 0 && !ignoreError) {
      throw formatChevrotainError(this.parser.errors[0], formula);
    }
    return this.data;
  }
}

module.exports = { DepParser };
