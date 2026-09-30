'use strict';

const CELL_REFERENCE = /^(?:'((?:[^']|'')+)'|([A-Za-z_][\w.]*))?!?\$?([A-Za-z]{1,3})\$?([1-9]\d*)$/;
const RANGE_REFERENCE = /^(?:'((?:[^']|'')+)'|([A-Za-z_][\w.]*))?!?\$?([A-Za-z]{1,3})\$?([1-9]\d*):\$?([A-Za-z]{1,3})\$?([1-9]\d*)$/;
const REFERENCE_TOKEN = /(?:'(?:[^']|'')+'|[A-Za-z_][\w.]*)!\$?[A-Za-z]{1,3}\$?[1-9]\d*(?::\$?[A-Za-z]{1,3}\$?[1-9]\d*)?|\$?[A-Za-z]{1,3}\$?[1-9]\d*(?::\$?[A-Za-z]{1,3}\$?[1-9]\d*)?/gy;
const IDENTIFIER = /[A-Za-z_][\w.]*/y;

function columnNameToNumber(name) {
  let column = 0;
  for (const character of name.toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return column;
}

function unquoteSheetName(quoted, plain) {
  return quoted === undefined ? plain : quoted.replace(/''/g, "'");
}

function parseCellReference(reference, defaultSheet) {
  const match = CELL_REFERENCE.exec(reference);
  if (!match) return null;
  return {
    row: Number(match[4]),
    col: columnNameToNumber(match[3]),
    sheet: unquoteSheetName(match[1], match[2]) ?? defaultSheet,
  };
}

function parseRangeReference(reference, defaultSheet) {
  const match = RANGE_REFERENCE.exec(reference);
  if (!match) return null;
  return {
    from: { row: Number(match[4]), col: columnNameToNumber(match[3]) },
    to: { row: Number(match[6]), col: columnNameToNumber(match[5]) },
    sheet: unquoteSheetName(match[1], match[2]) ?? defaultSheet,
  };
}

function sameCell(left, right) {
  return left.row === right.row && left.col === right.col && left.sheet === right.sheet;
}

function sameRange(left, right) {
  return left.sheet === right.sheet && sameCell(left.from, right.from) && sameCell(left.to, right.to);
}

class DepParser {
  constructor(config = {}) {
    this.data = [];
    this.onVariable = config.onVariable;
    this.functions = config.functions || {};
    this.position = null;
  }

  getCell(cell) {
    const reference = {
      row: cell.row,
      col: cell.col,
      sheet: cell.sheet ?? this.position?.sheet,
    };
    let existing = this.data.find((item) => !item.from && sameCell(item, reference));
    if (!existing) {
      existing = reference;
      this.data.push(existing);
    }
    return existing;
  }

  getRange(range) {
    const reference = {
      from: { row: range.from.row, col: range.from.col },
      to: { row: range.to.row, col: range.to.col },
      sheet: range.sheet ?? this.position?.sheet,
    };
    let existing = this.data.find((item) => item.from && sameRange(item, reference));
    if (!existing) {
      existing = reference;
      this.data.push(existing);
    }
    return existing;
  }

  getVariable(name) {
    if (typeof this.onVariable !== 'function') return name;
    const value = this.onVariable(name, this.position?.sheet);
    return this.retrieveRef(value);
  }

  retrieveRef(value) {
    if (!value || typeof value !== 'object') return value;
    if (value.from && value.to) return this.getRange(value);
    if (Number.isInteger(value.row) && Number.isInteger(value.col)) return this.getCell(value);
    return value;
  }

  callFunction(name, args) {
    const resolvedArgs = args.map((value) => this.retrieveRef(value));
    const callback = this.functions[name.toUpperCase()] || this.functions[name];
    return typeof callback === 'function' ? callback(...resolvedArgs) : undefined;
  }

  checkFormulaResult(value) {
    return this.retrieveRef(value);
  }

  parse(formula, position = {}) {
    if (typeof formula !== 'string' || formula.length === 0) {
      throw new Error('Input must not be empty.');
    }

    this.data = [];
    this.position = position;
    const source = formula.startsWith('=') ? formula.slice(1) : formula;
    this.#scan(source);
    return this.data;
  }

  #scan(source) {
    let index = 0;
    while (index < source.length) {
      if (source[index] === '"') {
        index = this.#skipString(source, index);
        continue;
      }

      REFERENCE_TOKEN.lastIndex = index;
      const referenceMatch = REFERENCE_TOKEN.exec(source);
      if (referenceMatch && source[this.#nextNonWhitespace(source, REFERENCE_TOKEN.lastIndex)] !== '(') {
        const text = referenceMatch[0];
        const range = parseRangeReference(text, this.position?.sheet);
        if (range) this.getRange(range);
        else {
          const cell = parseCellReference(text, this.position?.sheet);
          if (cell) this.getCell(cell);
        }
        index = REFERENCE_TOKEN.lastIndex;
        continue;
      }

      IDENTIFIER.lastIndex = index;
      const identifierMatch = IDENTIFIER.exec(source);
      if (identifierMatch) {
        const next = this.#nextNonWhitespace(source, IDENTIFIER.lastIndex);
        if (source[next] !== '(') this.getVariable(identifierMatch[0]);
        index = IDENTIFIER.lastIndex;
        continue;
      }
      index += 1;
    }
  }

  #skipString(source, start) {
    let index = start + 1;
    while (index < source.length) {
      if (source[index] !== '"') index += 1;
      else if (source[index + 1] === '"') index += 2;
      else return index + 1;
    }
    throw new Error('Unterminated string literal.');
  }

  #nextNonWhitespace(source, start) {
    let index = start;
    while (/\s/.test(source[index] || '')) index += 1;
    return index;
  }
}

module.exports = { DepParser };
