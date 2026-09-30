'use strict';

const MAX_EXCEL_ROW = 1_048_576;

const CELL_PATTERN = /^\$?([A-Za-z]{1,3})\$?([1-9][0-9]*)/;
const COLUMN_PATTERN = /^\$?([A-Za-z]{1,3})/;
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_.?]*/;
const NUMBER_PATTERN = /^[0-9]+(?:\.[0-9]*)?(?:[eE][+-][0-9]+)?/;

const ERROR_LITERALS = [
  '#NULL!',
  '#DIV/0!',
  '#VALUE!',
  '#NAME?',
  '#NUM!',
  '#N/A',
  '#REF!',
];

function columnNameToNumber(name) {
  let column = 0;
  for (const character of name.toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return column;
}

function unquoteSheetName(image) {
  if (image.startsWith("'")) {
    return image.slice(1, -2).replace(/''/g, "'");
  }
  return image.slice(0, -1);
}

function withDefaultSheet(reference, sheet) {
  if (reference.sheet === undefined) {
    reference.sheet = sheet;
  }
  return reference;
}

class FormulaScanner {
  constructor(context) {
    this.context = context;
    this.source = '';
    this.index = 0;
  }

  scan(source) {
    this.source = source;
    this.index = 0;

    while (this.index < this.source.length) {
      if (this.skipWhitespace() || this.skipQuotedValue() || this.skipError()) {
        continue;
      }

      const start = this.index;
      const sheet = this.readSheetName();
      const firstReference = this.readReferenceItem();

      if (firstReference) {
        if (this.source[this.index] === ':') {
          this.index += 1;
          const secondSheet = this.readSheetName();
          const secondReference = this.readReferenceItem(
            firstReference.kind === 'column',
          );
          if (secondReference) {
            this.recordRange(sheet, firstReference, secondSheet, secondReference);
            continue;
          }
        }

        if (firstReference.kind === 'cell') {
          this.context.getCell({
            row: firstReference.row,
            col: firstReference.col,
            sheet: sheet ?? this.context.position.sheet,
          });
          continue;
        }
      }

      if (sheet !== undefined) {
        if (this.skipError()) continue;
        const qualifiedName = this.readName();
        if (qualifiedName) {
          this.context.notifyVariable(qualifiedName, sheet);
          continue;
        }
      }

      this.index = start;
      if (this.skipNumber() || this.skipOperator()) {
        continue;
      }

      const name = this.readName();
      if (name) {
        if (this.source[this.index] === '(') {
          this.index += 1;
        } else if (!/^(?:TRUE|FALSE)$/i.test(name)) {
          this.context.getVariable(name);
        }
        continue;
      }

      this.index += 1;
    }
  }

  skipWhitespace() {
    const match = /^\s+/.exec(this.source.slice(this.index));
    if (!match) return false;
    this.index += match[0].length;
    return true;
  }

  skipQuotedValue() {
    if (this.source[this.index] !== '"') return false;
    this.index += 1;
    while (this.index < this.source.length) {
      if (this.source[this.index] !== '"') {
        this.index += 1;
      } else if (this.source[this.index + 1] === '"') {
        this.index += 2;
      } else {
        this.index += 1;
        break;
      }
    }
    return true;
  }

  skipError() {
    const remaining = this.source.slice(this.index).toUpperCase();
    const error = ERROR_LITERALS.find((literal) => remaining.startsWith(literal));
    if (!error) return false;
    this.index += error.length;
    return true;
  }

  skipNumber() {
    const match = NUMBER_PATTERN.exec(this.source.slice(this.index));
    if (!match) return false;
    this.index += match[0].length;
    return true;
  }

  skipOperator() {
    const operator = /^(?:<>|>=|<=|[,+\-*/&^%=;(){}\[\]@])/.exec(
      this.source.slice(this.index),
    );
    if (!operator) return false;
    this.index += operator[0].length;
    return true;
  }

  readSheetName() {
    const remaining = this.source.slice(this.index);
    if (remaining.startsWith("'")) {
      const match = /^'(?:''|[^'\\/\[\]*?:])+'!/.exec(remaining);
      if (match) {
        this.index += match[0].length;
        return unquoteSheetName(match[0]);
      }
      return undefined;
    }

    const match = /^[A-Za-z_.\d\u007F-\uFFFF]+!/.exec(remaining);
    if (!match) return undefined;
    this.index += match[0].length;
    return unquoteSheetName(match[0]);
  }

  readReferenceItem(allowBareColumn = false) {
    const remaining = this.source.slice(this.index);
    const cell = CELL_PATTERN.exec(remaining);
    if (cell && !/[A-Za-z0-9_.?]/.test(remaining[cell[0].length] ?? '')) {
      this.index += cell[0].length;
      return {
        kind: 'cell',
        row: Number(cell[2]),
        col: columnNameToNumber(cell[1]),
      };
    }

    const column = COLUMN_PATTERN.exec(remaining);
    if (
      column &&
      (allowBareColumn || this.source[this.index + column[0].length] === ':')
    ) {
      this.index += column[0].length;
      return { kind: 'column', col: columnNameToNumber(column[1]) };
    }

    return undefined;
  }

  readName() {
    const match = NAME_PATTERN.exec(this.source.slice(this.index));
    if (!match) return undefined;
    this.index += match[0].length;
    return match[0];
  }

  recordRange(firstSheet, first, secondSheet, second) {
    if (first.kind !== second.kind) return;

    const sheet = firstSheet ?? secondSheet ?? this.context.position.sheet;
    if (first.kind === 'column') {
      this.context.getRange({
        from: { row: 1, col: first.col },
        to: { row: MAX_EXCEL_ROW, col: second.col },
        sheet,
      });
      return;
    }

    this.context.getRange({
      from: { row: first.row, col: first.col },
      to: { row: second.row, col: second.col },
      sheet,
    });
  }
}

class DepParser {
  constructor(config = {}) {
    this.data = [];
    this.utils = { context: this };
    this.onVariable = config.onVariable;
    this.functions = config.functions || {};
    this.parser = new FormulaScanner(this);
  }

  getCell(reference) {
    this.data.push(reference);
    return 0;
  }

  getRange(reference) {
    this.data.push(reference);
    return [[0]];
  }

  getVariable(name) {
    this.notifyVariable(name, this.position.sheet);
    return 0;
  }

  notifyVariable(name, sheet) {
    if (typeof this.onVariable === 'function') this.onVariable(name, sheet);
  }

  retrieveRef(result) {
    if (result.ref) {
      const reference = withDefaultSheet(result.ref, this.position.sheet);
      if (reference.from && reference.to) return this.getRange(reference);
      return this.getCell(reference);
    }
    return result;
  }

  callFunction(_name, args) {
    for (const argument of args) this.retrieveRef(argument);
    return { value: 0, ref: {} };
  }

  checkFormulaResult(result) {
    this.retrieveRef(result);
  }

  parse(formula, position) {
    this.data = [];
    this.position = position;
    this.parser.scan(formula);
    return this.data;
  }
}

module.exports = { DepParser };
