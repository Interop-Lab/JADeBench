"use strict";

const MAX_ROW = 1_048_576;
const MAX_COLUMN = 16_384;

/** Error type used by the formula parser. */
class FormulaParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "#ERROR!";
  }
}

function columnNumber(label) {
  let result = 0;
  for (const character of label.toUpperCase()) {
    result = result * 26 + character.charCodeAt(0) - 64;
  }
  return result;
}

function removeAbsoluteMarkers(value) {
  return value.replace(/\$/g, "");
}

function unquoteSheetName(value) {
  if (!value) return undefined;
  if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

function sameDependency(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function orderRange(from, to) {
  return {
    from: {
      row: Math.min(from.row, to.row),
      col: Math.min(from.col, to.col),
    },
    to: {
      row: Math.max(from.row, to.row),
      col: Math.max(from.col, to.col),
    },
  };
}

/**
 * Extracts cell and range dependencies from spreadsheet formulas.
 *
 * Formulas are supplied without a leading `=`. Each dependency is returned as
 * either `{ row, col, sheet? }` or `{ from, to, sheet? }`.
 */
class DepParser {
  constructor(options = {}) {
    this.data = [];
    this.position = undefined;
    this.onVariable = options.onVariable || (() => undefined);
    this.functions = {};
  }

  getCell(reference) {
    const text = typeof reference === "string" ? reference : reference?.image;
    const match = /^\$?([A-Za-z]{1,3})\$?([1-9]\d*)$/.exec(text || "");
    if (!match) return 0;

    const cell = {
      col: columnNumber(match[1]),
      row: Number(match[2]),
    };
    if (this.position?.sheet !== undefined) cell.sheet = this.position.sheet;
    return this.addDependency(cell);
  }

  getRange(reference) {
    if (!reference) return 0;
    const from = this.retrieveRef(reference.from ?? reference[0]);
    const to = this.retrieveRef(reference.to ?? reference[1]);
    if (!from || !to) return 0;

    const range = orderRange(from, to);
    const sheet = from.sheet ?? to.sheet ?? this.position?.sheet;
    if (sheet !== undefined) range.sheet = sheet;
    return this.addDependency(range);
  }

  getVariable(name) {
    return this.onVariable(name, this.position);
  }

  retrieveRef(value) {
    if (typeof value === "number" && this.data[value]) return this.data[value];
    if (value && typeof value === "object" && "ref" in value) return value.ref;
    return value;
  }

  callFunction(_name, args = []) {
    for (const argument of args.flat(Infinity)) this.checkFormulaResult(argument);
    return { value: 0, ref: {} };
  }

  checkFormulaResult(result) {
    if (result?.ref) this.addDependency(result.ref);
  }

  addDependency(dependency) {
    const existing = this.data.findIndex((item) => sameDependency(item, dependency));
    if (existing !== -1) return existing;
    this.data.push(dependency);
    if (this.dependencyOffsets) this.dependencyOffsets.push(this.currentOffset ?? 0);
    return this.data.length - 1;
  }

  parse(formula, position) {
    if (typeof formula !== "string") {
      throw new FormulaParseError("Formula must be a string");
    }
    if (formula.startsWith("=")) {
      throw new FormulaParseError("Formulas must not include a leading '='");
    }

    this.data = [];
    this.dependencyOffsets = [];
    this.position = position;
    const source = this.maskStrings(formula);
    this.rejectUnexpectedInput(source, formula);

    const bareReference = "(?:(?:'(?:[^']|'')*'|[A-Za-z_][A-Za-z0-9_.]*)!)?\\$?[A-Za-z]{1,3}\\$?[1-9]\\d*";
    if (new RegExp(`${bareReference}\\s+${bareReference}`, "i").test(source)) return [];

    const occupied = new Uint8Array(source.length);
    this.collectRanges(source, occupied);
    this.collectCells(source, occupied);
    this.data = this.data
      .map((dependency, index) => ({ dependency, offset: this.dependencyOffsets[index] }))
      .sort((left, right) => left.offset - right.offset)
      .map(({ dependency }) => dependency);
    this.dependencyOffsets = null;
    return this.data;
  }

  maskStrings(formula) {
    let result = "";
    for (let index = 0; index < formula.length;) {
      if (formula[index] !== '"') {
        result += formula[index++];
        continue;
      }

      result += " ";
      index++;
      while (index < formula.length) {
        if (formula[index] === '"') {
          if (formula[index + 1] === '"') {
            result += "  ";
            index += 2;
            continue;
          }
          result += " ";
          index++;
          break;
        }
        result += " ";
        index++;
      }
    }
    return result;
  }

  rejectUnexpectedInput(masked, original) {
    const invalid = /[#\[\]]/.exec(masked.replace(/#(?:REF|NULL|DIV\/0|VALUE|NAME\?|NUM|N\/A)!/gi, ""));
    if (invalid) {
      throw new FormulaParseError(`Unexpected character '${invalid[0]}' in formula: ${original}`);
    }

    let depth = 0;
    for (const character of masked) {
      if (character === "(") depth++;
      else if (character === ")" && --depth < 0) break;
    }
    if (depth !== 0) throw new FormulaParseError(`Unbalanced parentheses in formula: ${original}`);
  }

  collectRanges(source, occupied) {
    const sheet = "(?:'(?:[^']|'')*'|[A-Za-z_][A-Za-z0-9_.]*)!";
    const cell = "\\$?[A-Za-z]{1,3}\\$?[1-9]\\d*";
    const column = "\\$?[A-Za-z]{1,3}";
    const row = "\\$?[1-9]\\d*";
    const rangePattern = new RegExp(
      `(?<![A-Za-z0-9_.])(?:${sheet})?(?:${cell}(?::(?:${sheet})?${cell})+|${column}:${column}|${row}:${row})(?![A-Za-z0-9_.])`,
      "gi",
    );

    for (const match of source.matchAll(rangePattern)) {
      this.mark(occupied, match.index, match[0].length);
      this.currentOffset = match.index;
      this.addRangeText(match[0]);
    }
  }

  addRangeText(text) {
    const parts = text.split(":");
    const first = this.parseReference(parts[0]);
    const last = this.parseReference(parts.at(-1));
    if (!first || !last) return;

    let from;
    let to;
    if (first.kind === "column" && last.kind === "column") {
      from = { row: 1, col: first.col };
      to = { row: MAX_ROW, col: last.col };
    } else if (first.kind === "row" && last.kind === "row") {
      from = { row: first.row, col: 1 };
      to = { row: last.row, col: MAX_COLUMN };
    } else if (first.kind === "cell" && last.kind === "cell") {
      from = { row: first.row, col: first.col };
      to = { row: last.row, col: last.col };
    } else {
      return;
    }

    const range = orderRange(from, to);
    const sheet = first.sheet ?? last.sheet ?? this.position?.sheet;
    if (sheet !== undefined) range.sheet = sheet;
    this.addDependency(range);
  }

  collectCells(source, occupied) {
    const pattern = /(?<![A-Za-z0-9_.])(?:(?:'(?:[^']|'')*'|[A-Za-z_][A-Za-z0-9_.]*)!)?\$?[A-Za-z]{1,3}\$?[1-9]\d*(?![A-Za-z0-9_.])/gi;
    for (const match of source.matchAll(pattern)) {
      if (this.isMarked(occupied, match.index, match[0].length)) continue;
      if (source.slice(match.index + match[0].length).trimStart().startsWith("(")) continue;
      const reference = this.parseReference(match[0]);
      if (!reference || reference.kind !== "cell") continue;
      this.currentOffset = match.index;
      const cell = { col: reference.col, row: reference.row };
      const sheet = reference.sheet ?? this.position?.sheet;
      if (sheet !== undefined) cell.sheet = sheet;
      this.addDependency(cell);
    }
  }

  parseReference(text) {
    let sheet;
    const bang = text.lastIndexOf("!");
    if (bang !== -1) {
      sheet = unquoteSheetName(text.slice(0, bang));
      text = text.slice(bang + 1);
    }
    text = removeAbsoluteMarkers(text);

    let match = /^([A-Za-z]{1,3})([1-9]\d*)$/.exec(text);
    if (match) return { kind: "cell", col: columnNumber(match[1]), row: Number(match[2]), sheet };
    if (/^[A-Za-z]{1,3}$/.test(text)) return { kind: "column", col: columnNumber(text), sheet };
    if (/^[1-9]\d*$/.test(text)) return { kind: "row", row: Number(text), sheet };
    return null;
  }

  mark(occupied, start, length) {
    occupied.fill(1, start, start + length);
  }

  isMarked(occupied, start, length) {
    for (let index = start; index < start + length; index++) {
      if (occupied[index]) return true;
    }
    return false;
  }
}

module.exports = { DepParser };
