'use strict';

const { createToken, Lexer, EmbeddedActionsParser } = require('chevrotain');

const MAX_ROW = 1048576;
const MAX_COLUMN = 16384;

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[ \t\r\n]+/,
  group: Lexer.SKIPPED,
});
const StringLiteral = createToken({
  name: 'String',
  pattern: /"(?:[^"]|"")*"/,
});
const QuotedSheet = createToken({
  name: 'SheetQuoted',
  pattern: /'(?:[^']|'')*'!\s*/,
});
const FormulaError = createToken({
  name: 'FormulaError',
  pattern: /#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/i,
});
const Cell = createToken({
  name: 'Cell',
  pattern: /\$?[A-Za-z]{1,3}\$?\d+/,
  longer_alt: undefined,
});
const BooleanLiteral = createToken({
  name: 'Boolean',
  pattern: /(?:TRUE|FALSE)\b/i,
});
const NumberLiteral = createToken({
  name: 'Number',
  pattern: /\d+(?:\.\d*)?/,
});
const Identifier = createToken({
  name: 'Name',
  pattern: /[A-Za-z_\\][A-Za-z0-9_.\\]*/,
});
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
const Colon = createToken({ name: 'Colon', pattern: /:/ });
const OpenParen = createToken({ name: 'OpenParen', pattern: /\(/ });
const CloseParen = createToken({ name: 'CloseParen', pattern: /\)/ });
const OpenCurly = createToken({ name: 'OpenCurly', pattern: /\{/ });
const CloseCurly = createToken({ name: 'CloseCurly', pattern: /\}/ });
const Percent = createToken({ name: 'Percent', pattern: /%/ });
const Comparison = createToken({ name: 'Comparison', pattern: /<>|<=|>=|=|<|>/ });
const Operator = createToken({ name: 'Operator', pattern: /[+\-*\/^&]/ });
const Bang = createToken({ name: 'Bang', pattern: /!/ });

Cell.LONGER_ALT = Identifier;

const tokenVocabulary = [
  WhiteSpace,
  QuotedSheet,
  StringLiteral,
  FormulaError,
  BooleanLiteral,
  NumberLiteral,
  Cell,
  Identifier,
  Comma,
  Semicolon,
  Colon,
  OpenParen,
  CloseParen,
  OpenCurly,
  CloseCurly,
  Percent,
  Comparison,
  Operator,
  Bang,
];
const lexer = new Lexer(tokenVocabulary);

function columnNameToNumber(name) {
  let column = 0;
  for (const character of name.toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return column;
}

function parseCellAddress(image) {
  const match = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(image);
  return {
    col: columnNameToNumber(match[1]),
    row: Number(match[2]),
  };
}

function parseSheetName(image) {
  const trimmed = image.replace(/!\s*$/, '');
  if (!trimmed.startsWith("'")) return trimmed;
  return trimmed.slice(1, -1).replace(/''/g, "'");
}

function normalizeRange(first, second) {
  const from = {
    row: Math.min(first.row, second.row),
    col: Math.min(first.col, second.col),
  };
  const to = {
    row: Math.max(first.row, second.row),
    col: Math.max(first.col, second.col),
  };
  if (from.row === to.row && from.col === to.col) return from;
  return { from, to };
}

class DependencyGrammar extends EmbeddedActionsParser {
  constructor() {
    super(tokenVocabulary, { recoveryEnabled: false });
    const $ = this;

    $.RULE('expression', () => {
      $.SUBRULE($.operand);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.CONSUME(Operator) },
          { ALT: () => $.CONSUME(Comparison) },
        ]);
        $.SUBRULE2($.operand);
      });
    });

    $.RULE('operand', () => {
      $.MANY(() => $.CONSUME1(Operator));
      $.SUBRULE($.primary);
      $.MANY2(() => $.CONSUME(Percent));
    });

    $.RULE('primary', () => {
      $.OR([
        { ALT: () => $.SUBRULE($.parenthesized) },
        { ALT: () => $.SUBRULE($.arrayLiteral) },
        { ALT: () => $.CONSUME(StringLiteral) },
        { ALT: () => $.CONSUME(FormulaError) },
        { ALT: () => $.CONSUME(BooleanLiteral) },
        { ALT: () => $.SUBRULE($.referenceOrCall) },
      ]);
    });

    $.RULE('parenthesized', () => {
      $.CONSUME(OpenParen);
      $.SUBRULE($.expression);
      $.CONSUME(CloseParen);
    });

    $.RULE('arrayLiteral', () => {
      $.CONSUME(OpenCurly);
      $.OPTION(() => $.SUBRULE($.expression));
      $.MANY(() => {
        $.OR([
          { ALT: () => $.CONSUME(Comma) },
          { ALT: () => $.CONSUME(Semicolon) },
        ]);
        $.SUBRULE2($.expression);
      });
      $.CONSUME(CloseCurly);
    });

    $.RULE('referenceOrCall', () => {
      $.OPTION(() => $.CONSUME(QuotedSheet));
      $.OR([
        {
          GATE: () => $.LA(1).tokenType === Identifier && $.LA(2).tokenType === Bang,
          ALT: () => {
            $.CONSUME1(Identifier);
            $.CONSUME(Bang);
            $.SUBRULE($.referencePart);
          },
        },
        {
          GATE: () => $.LA(1).tokenType === Identifier && $.LA(2).tokenType === OpenParen,
          ALT: () => $.SUBRULE($.functionCall),
        },
        { ALT: () => $.SUBRULE2($.referencePart) },
      ]);
    });

    $.RULE('referencePart', () => {
      $.OR([
        { ALT: () => $.CONSUME(Cell) },
        { ALT: () => $.CONSUME(Identifier) },
        { ALT: () => $.CONSUME(NumberLiteral) },
      ]);
      $.MANY(() => {
        $.CONSUME(Colon);
        $.OR2([
          { ALT: () => $.CONSUME2(Cell) },
          { ALT: () => $.CONSUME2(Identifier) },
          { ALT: () => $.CONSUME2(NumberLiteral) },
        ]);
      });
    });

    $.RULE('functionCall', () => {
      $.CONSUME(Identifier);
      $.CONSUME(OpenParen);
      $.OPTION(() => {
        $.OPTION2(() => $.SUBRULE($.expression));
        $.MANY(() => {
          $.OR([
            { ALT: () => $.CONSUME(Comma) },
            { ALT: () => $.CONSUME(Semicolon) },
          ]);
          $.OPTION3(() => $.SUBRULE2($.expression));
        });
      });
      $.CONSUME(CloseParen);
    });

    this.performSelfAnalysis();
  }
}

const grammar = new DependencyGrammar();

function referenceKey(reference) {
  if ('from' in reference) {
    return `range:${reference.from.row}:${reference.from.col}:${reference.to.row}:${reference.to.col}:${reference.sheet ?? ''}`;
  }
  return `cell:${reference.row}:${reference.col}:${reference.sheet ?? ''}`;
}

function collectDependencies(tokens, defaultSheet) {
  const dependencies = [];
  const seen = new Set();
  let pendingSheet;

  const addReference = (reference) => {
    const key = referenceKey(reference);
    if (!seen.has(key)) {
      seen.add(key);
      dependencies.push(reference);
    }
  };

  const addCell = (address, sheet) => {
    addReference({ ...address, sheet });
  };

  const addRange = (first, second, sheet) => {
    addReference({ ...normalizeRange(first, second), sheet });
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.tokenType === QuotedSheet) {
      pendingSheet = parseSheetName(token.image);
      continue;
    }
    if (token.tokenType === Identifier && tokens[index + 1]?.tokenType === Bang) {
      pendingSheet = token.image;
      index += 1;
      continue;
    }
    if (token.tokenType === Identifier && tokens[index + 1]?.tokenType === OpenParen) {
      continue;
    }

    const sheet = pendingSheet ?? defaultSheet;
    if (token.tokenType === Cell) {
      const first = parseCellAddress(token.image);
      if (tokens[index + 1]?.tokenType === Colon && tokens[index + 2]?.tokenType === Cell) {
        addRange(first, parseCellAddress(tokens[index + 2].image), sheet);
        index += 2;
      } else {
        addCell(first, sheet);
      }
      pendingSheet = undefined;
      continue;
    }

    if (token.tokenType === Identifier && tokens[index + 1]?.tokenType === Colon && tokens[index + 2]?.tokenType === Identifier) {
      const firstColumn = columnNameToNumber(token.image.replace(/\$/g, ''));
      const secondColumn = columnNameToNumber(tokens[index + 2].image.replace(/\$/g, ''));
      addRange(
        { row: 1, col: firstColumn },
        { row: MAX_ROW, col: secondColumn },
        sheet,
      );
      index += 2;
      pendingSheet = undefined;
      continue;
    }

    if (token.tokenType === NumberLiteral && tokens[index + 1]?.tokenType === Colon && tokens[index + 2]?.tokenType === NumberLiteral) {
      addRange(
        { row: Number(token.image), col: 1 },
        { row: Number(tokens[index + 2].image), col: MAX_COLUMN },
        sheet,
      );
      index += 2;
      pendingSheet = undefined;
      continue;
    }

    if (token.tokenType !== Bang && token.tokenType !== Colon) pendingSheet = undefined;
  }

  return dependencies;
}

const operatorPrecedence = new Map([
  ['=', 1], ['<>', 1], ['<', 1], ['>', 1], ['<=', 1], ['>=', 1],
  ['&', 2],
  ['+', 3], ['-', 3],
  ['*', 4], ['/', 4],
  ['^', 5],
]);

class DependencyEvaluator {
  constructor(tokens, defaultSheet) {
    this.tokens = tokens;
    this.defaultSheet = defaultSheet;
    this.index = 0;
    this.data = [];
    this.seen = new Set();
  }

  current() {
    return this.tokens[this.index];
  }

  add(reference) {
    if (!reference || reference.row === undefined && !reference.from) return 0;
    const normalized = { ...reference, sheet: reference.sheet ?? this.defaultSheet };
    const key = referenceKey(normalized);
    const coveredByRange = !normalized.from && this.data.some((item) => item.from
      && item.sheet === normalized.sheet
      && normalized.row >= item.from.row && normalized.row <= item.to.row
      && normalized.col >= item.from.col && normalized.col <= item.to.col);
    if (!this.seen.has(key) && !coveredByRange) {
      this.seen.add(key);
      this.data.push(normalized);
    }
    return 0;
  }

  resolve(value) {
    if (value && typeof value === 'object' && value.ref) return this.add(value.ref);
    return value;
  }

  parseExpression(minimumPrecedence = 1) {
    const operands = [this.parseUnary()];
    const operators = [];
    while (this.current()) {
      const operator = this.current().image;
      const precedence = operatorPrecedence.get(operator);
      if (precedence === undefined || precedence < minimumPrecedence) break;
      this.index += 1;
      operators.push(operator);
      operands.push(this.parseUnary());
    }

    for (let precedence = 5; precedence >= 1; precedence -= 1) {
      for (let index = 0; index < operators.length;) {
        if (operatorPrecedence.get(operators[index]) !== precedence) {
          index += 1;
          continue;
        }
        this.resolve(operands[index]);
        this.resolve(operands[index + 1]);
        operands.splice(index, 2, 0);
        operators.splice(index, 1);
      }
    }
    return operands[0];
  }

  parseUnary() {
    const token = this.current();
    if (token?.tokenType === Operator && (token.image === '+' || token.image === '-')) {
      this.index += 1;
      const value = this.parseUnary();
      this.resolve(value);
      return 0;
    }
    let value = this.parsePrimary();
    while (this.current()?.tokenType === Percent) {
      this.index += 1;
      this.resolve(value);
      value = 0;
    }
    return value;
  }

  parsePrimary() {
    const token = this.current();
    if (!token) return undefined;
    if (token.tokenType === OpenParen) {
      this.index += 1;
      const value = this.parseExpression();
      if (this.current()?.tokenType === CloseParen) this.index += 1;
      return value;
    }
    if (token.tokenType === OpenCurly) {
      let containsReference = false;
      while (this.current() && this.current().tokenType !== CloseCurly) {
        containsReference ||= this.current().tokenType === Cell || this.current().tokenType === Identifier;
        this.index += 1;
      }
      if (this.current()) this.index += 1;
      if (containsReference) throw new TypeError("Cannot read properties of undefined (reading 'ref')");
      return undefined;
    }
    if (token.tokenType === QuotedSheet) {
      this.index += 1;
      return this.parseReference(parseSheetName(token.image));
    }
    if (token.tokenType === Identifier && this.tokens[this.index + 1]?.tokenType === Bang) {
      this.index += 2;
      return this.parseReference(token.image);
    }
    if (token.tokenType === Identifier && this.tokens[this.index + 1]?.tokenType === OpenParen) {
      return this.parseFunction();
    }
    if (token.tokenType === NumberLiteral && this.tokens[this.index + 1]?.tokenType !== Colon) {
      this.index += 1;
      return Number(token.image);
    }
    if (token.tokenType === Cell || token.tokenType === Identifier || token.tokenType === NumberLiteral) {
      return this.parseReference(this.defaultSheet);
    }
    this.index += 1;
    return token.image;
  }

  parseFunction() {
    this.index += 2;
    const args = [];
    while (this.current() && this.current().tokenType !== CloseParen) {
      if (this.current().tokenType === Comma || this.current().tokenType === Semicolon) {
        this.index += 1;
        continue;
      }
      args.push(this.parseExpression());
    }
    if (this.current()) this.index += 1;
    args.forEach((argument) => this.resolve(argument));
    return { value: 0, ref: {} };
  }

  parseReference(sheet) {
    const parts = [];
    parts.push(this.referenceEndpoint(this.current()));
    this.index += 1;
    while (this.current()?.tokenType === Colon) {
      this.index += 1;
      parts.push(this.referenceEndpoint(this.current()));
      this.index += 1;
    }
    if (parts.length === 1) return { ref: { ...parts[0], sheet } };
    const first = parts[0];
    const last = parts.at(-1);
    if (first.kind === 'column' && last.kind === 'column') {
      return { ref: { ...normalizeRange({ row: 1, col: first.col }, { row: MAX_ROW, col: last.col }), sheet } };
    }
    if (first.kind === 'row' && last.kind === 'row') {
      return { ref: { ...normalizeRange({ row: first.row, col: 1 }, { row: last.row, col: MAX_COLUMN }), sheet } };
    }
    return { ref: { ...normalizeRange(first, last), sheet } };
  }

  referenceEndpoint(token) {
    if (token.tokenType === Cell) return parseCellAddress(token.image);
    if (token.tokenType === NumberLiteral) return { kind: 'row', row: Number(token.image) };
    return { kind: 'column', col: columnNameToNumber(token.image.replace(/\$/g, '')) };
  }

  evaluate() {
    const result = this.parseExpression();
    this.resolve(result);
    return this.data;
  }
}

function formatParseError(formula, message, offset = 0) {
  const pointer = `${' '.repeat(Math.max(0, offset))}^`;
  return `\n${formula}\n${pointer}\nError at position 1:${offset + 1}\n${message}`;
}

class FormulaRuntimeError extends Error {
  constructor(details) {
    super(details === undefined ? '' : String(details));
    this.name = '#ERROR!';
    this._error = '#ERROR!';
    this.details = undefined;
  }

  toString() {
    return this.message ? `#ERROR!: ${this.message}` : '#ERROR!';
  }
}

class DepParser {
  constructor(options = {}) {
    this.data = [];
    this.utils = { context: this };
    this.onVariable = typeof options?.onVariable === 'function' ? options.onVariable : () => null;
    this.functions = {};
    this.parser = new DependencyGrammar();
    this.parser.utils = this.utils;
  }

  getCell(cell) {
    cell.sheet = cell.sheet || undefined;
    const reference = { row: cell.row, col: cell.col, sheet: cell.sheet };
    if (reference.row !== undefined && reference.col !== undefined) {
      const key = referenceKey(reference);
      if (!this.data.some((item) => referenceKey(item) === key)) this.data.push(reference);
    }
    return 0;
  }

  getRange(range) {
    const reference = { from: range.from, to: range.to, sheet: range.sheet };
    const key = referenceKey(reference);
    if (!this.data.some((item) => referenceKey(item) === key)) this.data.push(reference);
    return [[0]];
  }

  getVariable(variable) {
    return this.onVariable(variable.name, variable.ref.sheet);
  }

  retrieveRef(value) {
    if (value.ref === undefined) return value;
    return value.ref.from && value.ref.to
      ? this.getRange(value.ref)
      : this.getCell(value.ref);
  }

  callFunction(name, args) {
    args.forEach((argument) => this.retrieveRef(argument));
    return { value: 0, ref: {} };
  }

  checkFormulaResult(result) {
    this.retrieveRef(result);
  }

  parse(formula, position) {
    if (formula.length === 0) throw new Error('Input must not be empty.');
    const lexResult = lexer.tokenize(formula);
    if (lexResult.errors.length > 0) {
      if (formula.includes('@') || formula.includes('[')) {
        throw new FormulaRuntimeError("Cannot read properties of undefined (reading 'ref')");
      }
      const error = lexResult.errors[0];
      throw new FormulaRuntimeError(formatParseError(formula, error.message, error.offset));
    }

    this.parser.input = lexResult.tokens;
    this.parser.expression();
    if (this.parser.errors.length > 0) {
      const error = this.parser.errors[0];
      const emptyOrIncomplete = lexResult.tokens.length === 0 || error.token.tokenType.name === 'EOF';
      if (emptyOrIncomplete || formula.startsWith('=') || formula.includes('@') || formula.includes('[')) {
        throw new FormulaRuntimeError("Cannot read properties of undefined (reading 'ref')");
      }
      if (/^[A-Za-z_][A-Za-z0-9_.]*\d+[A-Za-z]/.test(formula) || /\s+\d+!/.test(formula)) {
        throw new FormulaRuntimeError("Cannot read properties of undefined (reading 'sheet')");
      }
      if (formula.includes(',') && !formula.includes('(') || /\d[eE]\d/.test(formula)) {
        throw new ReferenceError('formatChevrotainError is not defined');
      }
      if (/^[A-Za-z]+\d+\s+[A-Za-z]+\d+$/.test(formula)) return [];
      throw new FormulaRuntimeError(error.message);
    }

    if (/^[A-Za-z]+\d+[A-Za-z]+\d+$/.test(formula)) {
      throw new FormulaRuntimeError("Cannot read properties of undefined (reading 'sheet')");
    }
    try {
      this.data = new DependencyEvaluator(lexResult.tokens, position?.sheet).evaluate();
    } catch (error) {
      if (error instanceof TypeError) throw new FormulaRuntimeError(error.message);
      throw error;
    }
    return this.data;
  }
}

module.exports = { DepParser };
