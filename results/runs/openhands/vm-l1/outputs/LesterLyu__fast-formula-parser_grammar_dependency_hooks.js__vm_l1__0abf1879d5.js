'use strict';

const MAX_ROWS = 1048576;
const MAX_COLUMNS = 16384;

class FormulaError extends Error {
  constructor(code, message = '', details) {
    super(message);
    this.name = code;
    this._error = code;
    this.details = details;
  }

  toString() {
    return this.name;
  }

  static parsing(message, details) {
    return new FormulaError('#ERROR!', message, details);
  }
}

FormulaError.NAME = new FormulaError('#NAME?');

function columnNameToNumber(name) {
  const letters = name.replaceAll('$', '').toUpperCase();
  let column = 0;
  for (const letter of letters) {
    column = column * 26 + letter.charCodeAt(0) - 64;
  }
  return column;
}

function isCellReference(value) {
  return Boolean(value && Number.isFinite(value.row) && Number.isFinite(value.col));
}

function isRangeReference(value) {
  return Boolean(value && value.from && value.to);
}

function token(type, image, start, end, gapBefore, value = image) {
  return { type, image, start, end, gapBefore, value };
}

function tokenize(formula) {
  const tokens = [];
  const errors = [];
  let index = 0;
  let sawWhitespace = false;

  const add = (type, image, value = image) => {
    tokens.push(token(type, image, index, index + image.length, sawWhitespace, value));
    index += image.length;
    sawWhitespace = false;
  };

  while (index < formula.length) {
    const rest = formula.slice(index);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      index += whitespace[0].length;
      sawWhitespace = true;
      continue;
    }

    if (formula[index] === '"') {
      let end = index + 1;
      while (end < formula.length) {
        if (formula[end] === '"' && formula[end + 1] === '"') {
          end += 2;
        } else if (formula[end] === '"') {
          end += 1;
          break;
        } else {
          end += 1;
        }
      }
      add('STRING', formula.slice(index, end));
      continue;
    }

    if (formula[index] === "'") {
      let end = index + 1;
      let sheetName = '';
      let closed = false;
      while (end < formula.length) {
        if (formula[end] === "'" && formula[end + 1] === "'") {
          sheetName += "'";
          end += 2;
        } else if (formula[end] === "'") {
          end += 1;
          closed = true;
          break;
        } else {
          sheetName += formula[end++];
        }
      }
      if (closed && formula[end] === '!') {
        end += 1;
        add('SHEET', formula.slice(index, end), sheetName);
      } else {
        add('STRING', formula.slice(index, end));
      }
      continue;
    }

    const sheet = rest.match(/^[A-Za-z_.\d\u007F-\uFFFF]+!/u);
    if (sheet) {
      add('SHEET', sheet[0], sheet[0].slice(0, -1));
      continue;
    }

    const functionName = rest.match(/^[A-Za-z_]+[A-Za-z_0-9.]*\(/);
    if (functionName) {
      add('FUNCTION', functionName[0], functionName[0].slice(0, -1));
      continue;
    }

    const formulaError = rest.match(/^#(?:NULL!|DIV\/0!|VALUE!|NAME\?|NUM!|N\/A|REF!)/i);
    if (formulaError) {
      add('ERROR', formulaError[0].toUpperCase());
      continue;
    }

    const twoCharacterOperator = rest.match(/^(?:<>|>=|<=)/);
    if (twoCharacterOperator) {
      add('OPERATOR', twoCharacterOperator[0]);
      continue;
    }

    const punctuation = {
      ',': 'COMMA', ':': 'COLON', ';': 'SEMICOLON',
      '(': 'OPEN_PAREN', ')': 'CLOSE_PAREN',
      '[': 'OPEN_SQUARE', ']': 'CLOSE_SQUARE',
      '{': 'OPEN_CURLY', '}': 'CLOSE_CURLY',
      '@': 'AT',
    };
    if (punctuation[formula[index]]) {
      add(punctuation[formula[index]], formula[index]);
      continue;
    }

    if ('*+/-&^%=<>'.includes(formula[index])) {
      add('OPERATOR', formula[index]);
      continue;
    }

    const identifier = rest.match(/^[a-zA-Z_][a-zA-Z0-9_.?]*/);
    const cell = rest.match(/^[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/);
    if (cell && (!identifier || cell[0].length >= identifier[0].length)) {
      add('CELL', cell[0]);
      continue;
    }

    const boolean = rest.match(/^(?:TRUE|FALSE)(?![A-Za-z0-9_.?])/i);
    if (boolean) {
      add('BOOLEAN', boolean[0].toUpperCase(), boolean[0].toUpperCase() === 'TRUE');
      continue;
    }

    const column = rest.match(/^[$]?[A-Za-z]{1,3}(?![A-Za-z0-9_.?])/);
    if (column) {
      add('COLUMN', column[0]);
      continue;
    }

    if (identifier) {
      add('NAME', identifier[0]);
      continue;
    }

    const number = rest.match(/^[0-9]+[.]?[0-9]*(?:[eE][+\-][0-9]+)?/);
    if (number) {
      add('NUMBER', number[0], Number(number[0]));
      continue;
    }

    errors.push({ offset: index, character: formula[index] });
    index += 1;
    sawWhitespace = false;
  }

  return { tokens, errors };
}

function parseCellAddress(image) {
  const match = image.match(/^[$]?([A-Za-z]{1,3})[$]?([1-9][0-9]*)$/);
  if (!match) return null;
  return {
    row: Number(match[2]),
    col: columnNameToNumber(match[1]),
    kind: 'cell',
  };
}

function endpointFromToken(currentToken) {
  if (!currentToken) return null;
  if (currentToken.type === 'CELL') return parseCellAddress(currentToken.image);
  if (currentToken.type === 'COLUMN') {
    return { row: null, col: columnNameToNumber(currentToken.image), kind: 'column' };
  }
  if (currentToken.type === 'NUMBER' && Number.isInteger(currentToken.value)) {
    return { row: currentToken.value, col: null, kind: 'row' };
  }
  return null;
}

function normalizeRange(left, right, sheet) {
  let from;
  let to;
  if (left.kind === 'column' || right.kind === 'column') {
    from = { row: 1, col: Math.min(left.col ?? 1, right.col ?? 1) };
    to = { row: MAX_ROWS, col: Math.max(left.col ?? MAX_COLUMNS, right.col ?? MAX_COLUMNS) };
  } else if (left.kind === 'row' || right.kind === 'row') {
    from = { row: Math.min(left.row ?? 1, right.row ?? 1), col: 1 };
    to = { row: Math.max(left.row ?? MAX_ROWS, right.row ?? MAX_ROWS), col: MAX_COLUMNS };
  } else {
    from = { row: Math.min(left.row, right.row), col: Math.min(left.col, right.col) };
    to = { row: Math.max(left.row, right.row), col: Math.max(left.col, right.col) };
  }
  return { from, to, sheet };
}

function formatLexingError(formula, error) {
  const pointer = ' '.repeat(error.offset) + '^';
  return '\n' + formula + '\n' + pointer + '\nError at position 1:' + (error.offset + 1)
    + '\nunexpected character: ->' + error.character + '<- at offset: ' + error.offset
    + ', skipped 1 characters.';
}

class DependencyUtils {
  constructor(owner) {
    this.owner = owner;
  }

  columnNameToNumber(name) {
    return columnNameToNumber(name);
  }

  parseCellAddress(image) {
    const address = parseCellAddress(image);
    return address ? { ref: { col: address.col, row: address.row } } : FormulaError.NAME;
  }

  parseRow(image) {
    const row = Number(String(image).replaceAll('$', ''));
    if (!Number.isInteger(row)) throw new Error('Row number must be integer.');
    return { ref: { row } };
  }

  parseCol(image) {
    return { ref: { col: columnNameToNumber(String(image)) } };
  }

  applyPrefix() { return 0; }
  applyPostfix() { return 0; }
  applyInfix() { return 0; }
  applyIntersect() { return new FormulaError('#NULL!'); }

  applyUnion(values) {
    return { _data: values.map(() => 0), _refs: values };
  }

  applyRange(values) {
    const left = values[0] && values[0].ref;
    const right = values[1] && values[1].ref;
    return left && right ? { ref: normalizeRange(
      { ...left, kind: left.row == null ? 'column' : left.col == null ? 'row' : 'cell' },
      { ...right, kind: right.row == null ? 'column' : right.col == null ? 'row' : 'cell' },
      left.sheet,
    ) } : FormulaError.NAME;
  }

  extractRefValue() { return { val: 0, isArray: false }; }
  toArray(value) { return value; }
  toNumber(value) { return Number(value); }
  toString(value) { return String(value); }
  toBoolean() { return false; }
  toError(value) { return new FormulaError(value); }
  isFormulaError(value) { return value instanceof FormulaError; }
}

class DependencyParserEngine {
  constructor(owner) {
    this.owner = owner;
    this.tokens = [];
    this.errors = [];
    this.formula = '';
  }

  formulaWithBinaryOp() {
    const { owner, tokens, formula } = this;
    const candidates = [];
    let parenthesisDepth = 0;
    let curlyDepth = 0;
    let cutoff = formula.length;
    let parseError = null;

    for (const currentToken of tokens) {
      currentToken.parenthesisDepth = parenthesisDepth;
      currentToken.curlyDepth = curlyDepth;
      if (currentToken.type === 'FUNCTION' || currentToken.type === 'OPEN_PAREN') parenthesisDepth += 1;
      else if (currentToken.type === 'CLOSE_PAREN') parenthesisDepth = Math.max(0, parenthesisDepth - 1);
      else if (currentToken.type === 'OPEN_CURLY') curlyDepth += 1;
      else if (currentToken.type === 'CLOSE_CURLY') curlyDepth = Math.max(0, curlyDepth - 1);
      else if ((currentToken.type === 'COMMA' || currentToken.type === 'SEMICOLON') && parenthesisDepth === 0 && curlyDepth === 0) {
        cutoff = currentToken.start;
        parseError = 'Redundant input';
        break;
      }
    }

    const lastToken = tokens.findLast((currentToken) => currentToken.start < cutoff);
    const firstToken = tokens.find((currentToken) => currentToken.start < cutoff);
    const trailingOperator = lastToken && (
      ['COLON', 'COMMA', 'SEMICOLON', 'FUNCTION', 'OPEN_PAREN'].includes(lastToken.type)
      || (lastToken.type === 'OPERATOR' && lastToken.image !== '%')
    );
    const invalidLeadingToken = firstToken && (firstToken.type === 'AT' || (firstToken.type === 'OPERATOR' && !['+', '-'].includes(firstToken.image)));
    const containsReferenceInArray = tokens.some((currentToken) => currentToken.curlyDepth > 0 && ['CELL', 'COLUMN', 'NAME'].includes(currentToken.type));
    const suppressAll = Boolean(trailingOperator || invalidLeadingToken || containsReferenceInArray);
    if (suppressAll && !parseError) parseError = 'Invalid formula';

    for (let index = 0; index < tokens.length && tokens[index].start < cutoff;) {
      const startIndex = index;
      let sheet;
      if (tokens[index].type === 'SHEET') {
        sheet = tokens[index].value;
        index += 1;
      }

      const left = endpointFromToken(tokens[index]);
      if (left && tokens[index].curlyDepth === 0) {
        const leftToken = tokens[index];
        index += 1;
        if (tokens[index] && tokens[index].type === 'COLON') {
          index += 1;
          if (tokens[index] && tokens[index].type === 'SHEET') index += 1;
          const right = endpointFromToken(tokens[index]);
          if (right) {
            const rightToken = tokens[index++];
            candidates.push({
              type: 'range',
              value: normalizeRange(left, right, sheet ?? owner.position?.sheet),
              start: tokens[startIndex].start,
              end: rightToken.end,
            });
            continue;
          }
        }
        if (left.kind === 'cell') {
          candidates.push({
            type: 'cell',
            value: { col: left.col, row: left.row, sheet: sheet ?? owner.position?.sheet },
            start: tokens[startIndex].start,
            end: leftToken.end,
          });
        }
        continue;
      }

      if (!sheet && tokens[index] && tokens[index].type === 'NAME' && tokens[index].curlyDepth === 0) {
        candidates.push({ type: 'variable', value: tokens[index].image, start: tokens[index].start, end: tokens[index].end });
      }
      index = Math.max(index + 1, startIndex + 1);
    }

    const suppressed = new Set();
    for (let index = 1; index < candidates.length; index += 1) {
      const previous = candidates[index - 1];
      const current = candidates[index];
      const between = formula.slice(previous.end, current.start);
      if (between.length > 0 && /^\s+$/.test(between)) {
        suppressed.add(previous);
        suppressed.add(current);
      }
    }

    if (!suppressAll) {
      for (const candidate of candidates) {
        if (suppressed.has(candidate)) continue;
        if (candidate.type === 'range') owner.getRange(candidate.value);
        else if (candidate.type === 'cell') owner.getCell(candidate.value);
        else owner.getVariable(candidate.value);
      }
    }

    if (parseError) this.errors.push({ message: parseError });
    return null;
  }
}

class DepParser {
  constructor(options) {
    const settings = Object.assign({ onVariable: () => null }, options);
    this.data = [];
    this.utils = new DependencyUtils(this);
    this.onVariable = settings.onVariable;
    this.functions = {};
    this.parser = new DependencyParserEngine(this);
  }

  getCell(cell) {
    if (cell.row != null && cell.sheet == null) {
      cell.sheet = this.position ? this.position.sheet : undefined;
    }
    const index = this.data.findIndex((item) => (
      item.from
      && item.from.row <= cell.row
      && item.to.row >= cell.row
      && item.from.col <= cell.col
      && item.to.col >= cell.col
    ) || (
      item.row === cell.row
      && item.col === cell.col
      && item.sheet === cell.sheet
    ));
    if (index === -1) this.data.push(cell);
    return 0;
  }

  getRange(range) {
    if (range.from.row != null && range.sheet == null) {
      range.sheet = this.position ? this.position.sheet : undefined;
    }
    const index = this.data.findIndex((item) => item.from
      && item.from.row === range.from.row
      && item.from.col === range.from.col
      && item.to.row === range.to.row
      && item.to.col === range.to.col);
    if (index === -1) this.data.push(range);
    return [[0]];
  }

  getVariable(name) {
    const result = { ref: this.onVariable(name, this.position.sheet) };
    if (result.ref == null) return FormulaError.NAME;
    if (isCellReference(result.ref)) this.getCell(result.ref);
    else this.getRange(result.ref);
    return 0;
  }

  retrieveRef(value) {
    if (value && isRangeReference(value.ref)) return this.getRange(value.ref);
    if (value && isCellReference(value.ref)) return this.getCell(value.ref);
    return value;
  }

  callFunction(_name, args) {
    args.forEach((argument) => {
      if (argument != null) this.retrieveRef(argument);
    });
    return { value: 0, ref: {} };
  }

  checkFormulaResult(result) {
    this.retrieveRef(result);
  }

  parse(formula, position, allowReturnErrors = false) {
    if (formula.length === 0) throw new Error('Input must not be empty.');
    this.data = [];
    this.position = position;

    const lexResult = tokenize(formula);
    if (lexResult.errors.length > 0) {
      throw FormulaError.parsing(formatLexingError(formula, lexResult.errors[0]), lexResult.errors[0]);
    }

    this.parser.formula = formula;
    this.parser.tokens = lexResult.tokens;
    this.parser.errors = [];
    try {
      const result = this.parser.formulaWithBinaryOp();
      this.checkFormulaResult(result);
    } catch (error) {
      if (!allowReturnErrors) throw FormulaError.parsing(error.message, error);
    }

    if (this.parser.errors.length > 0 && !allowReturnErrors) {
      throw FormulaError.parsing(this.parser.errors[0].message, this.parser.errors[0]);
    }
    return this.data;
  }
}

module.exports = { DepParser };
