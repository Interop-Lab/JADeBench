'use strict';

class FormulaError extends Error {
    static errorMap = new Map();

    constructor(code, message, details) {
        if (message == null && details == null && FormulaError.errorMap.has(code)) {
            return FormulaError.errorMap.get(code);
        }
        super(message);
        this.code = code;
        this.details = details;
        if (message == null && details == null) FormulaError.errorMap.set(code, this);
    }

    get error() {
        return this.code;
    }

    get name() {
        return this.code;
    }

    equals(other) {
        return other instanceof FormulaError && other.code === this.code;
    }

    toString() {
        return this.code;
    }

    static ERROR(message, details) {
        return new FormulaError('#ERROR!', message, details);
    }
}

FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');

const MAX_ROW = 1048576;
const MAX_COLUMN = 16384;
const ERROR_PATTERN = /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/y;
const CELL_PATTERN = /\$?([A-Za-z]{1,3})\$?([1-9][0-9]*)/y;
const IDENTIFIER_PATTERN = /[A-Za-z_][A-Za-z0-9_.?]*/y;
const NUMBER_PATTERN = /(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?/y;

function columnNameToNumber(name) {
    let column = 0;
    for (const character of name.replace(/\$/g, '').toUpperCase()) {
        column = column * 26 + character.charCodeAt(0) - 64;
    }
    return column;
}

function tokenError(formula, offset, message) {
    const before = formula.slice(0, offset);
    const line = before.split('\n').length;
    const column = offset - before.lastIndexOf('\n');
    const sourceLine = formula.split('\n')[line - 1];
    const fullMessage = `\n${sourceLine}\n${' '.repeat(column - 1)}^\nError at position ${line}:${column}\n${message}`;
    const details = new Error(message);
    details.errorLocation = { line, column };
    return FormulaError.ERROR(fullMessage, details);
}

function readQuoted(formula, offset, quote) {
    let cursor = offset + 1;
    while (cursor < formula.length) {
        if (formula[cursor] !== quote) {
            cursor++;
            continue;
        }
        if (formula[cursor + 1] === quote) {
            cursor += 2;
            continue;
        }
        return cursor + 1;
    }
    throw tokenError(formula, offset, `Unterminated ${quote === '"' ? 'string' : 'quoted name'}.`);
}

function tokenize(formula) {
    const tokens = [];
    let offset = 0;
    while (offset < formula.length) {
        const character = formula[offset];
        if (/\s/.test(character)) {
            offset++;
            continue;
        }
        const start = offset;
        if (character === '"') {
            offset = readQuoted(formula, offset, '"');
            tokens.push({ type: 'string', image: formula.slice(start, offset), start, end: offset });
            continue;
        }
        if (character === "'") {
            offset = readQuoted(formula, offset, "'");
            const quoted = formula.slice(start, offset);
            if (formula[offset] === '!') {
                offset++;
                tokens.push({ type: 'sheet', image: quoted.slice(1, -1).replace(/''/g, "'"), start, end: offset });
            } else {
                tokens.push({ type: 'singleQuotedString', image: quoted, start, end: offset });
            }
            continue;
        }
        ERROR_PATTERN.lastIndex = offset;
        const error = ERROR_PATTERN.exec(formula);
        if (error) {
            offset = ERROR_PATTERN.lastIndex;
            tokens.push({ type: 'error', image: error[0], start, end: offset });
            continue;
        }
        CELL_PATTERN.lastIndex = offset;
        const cell = CELL_PATTERN.exec(formula);
        if (cell) {
            offset = CELL_PATTERN.lastIndex;
            tokens.push({ type: 'cell', image: cell[0], column: cell[1], row: Number(cell[2]), start, end: offset });
            continue;
        }
        NUMBER_PATTERN.lastIndex = offset;
        const number = NUMBER_PATTERN.exec(formula);
        if (number) {
            offset = NUMBER_PATTERN.lastIndex;
            tokens.push({ type: 'number', image: number[0], value: Number(number[0]), start, end: offset });
            continue;
        }
        IDENTIFIER_PATTERN.lastIndex = offset;
        const identifier = IDENTIFIER_PATTERN.exec(formula);
        if (identifier) {
            offset = IDENTIFIER_PATTERN.lastIndex;
            const image = identifier[0];
            if (formula[offset] === '!') {
                offset++;
                tokens.push({ type: 'sheet', image, start, end: offset });
            } else if (/^(TRUE|FALSE)$/i.test(image)) {
                tokens.push({ type: 'boolean', image, value: /^TRUE$/i.test(image), start, end: offset });
            } else {
                tokens.push({ type: 'identifier', image, start, end: offset });
            }
            continue;
        }
        const twoCharacterOperator = formula.slice(offset, offset + 2);
        if (['<>', '<=', '>='].includes(twoCharacterOperator)) {
            offset += 2;
            tokens.push({ type: 'operator', image: twoCharacterOperator, start, end: offset });
            continue;
        }
        const punctuation = {
            '(': 'openParen', ')': 'closeParen', '{': 'openBrace', '}': 'closeBrace',
            ',': 'comma', ';': 'semicolon', ':': 'colon', '%': 'percent'
        }[character];
        if (punctuation) {
            offset++;
            tokens.push({ type: punctuation, image: character, start, end: offset });
            continue;
        }
        if ('+-*/^&=<>'.includes(character)) {
            offset++;
            tokens.push({ type: 'operator', image: character, start, end: offset });
            continue;
        }
        throw tokenError(formula, offset, `Unexpected character ${JSON.stringify(character)}.`);
    }
    tokens.push({ type: 'eof', image: '', start: formula.length, end: formula.length });
    return tokens;
}

function isReference(value) {
    return value && value.ref;
}

function isRangeReference(value) {
    return isReference(value) && value.ref.from;
}

function normalizeReferenceBounds(reference) {
    if (reference.from) return reference;
    return { from: reference, to: reference, sheet: reference.sheet };
}

class DependencyFormulaParser {
    constructor(context) {
        this.context = context;
    }

    parse(formula) {
        this.formula = formula;
        this.tokens = tokenize(formula);
        this.index = 0;
        const result = this.parseExpression();
        this.expect('eof');
        return result;
    }

    current() {
        return this.tokens[this.index];
    }

    previous() {
        return this.tokens[this.index - 1];
    }

    match(type, image) {
        const token = this.current();
        if (token.type !== type || image != null && token.image !== image) return null;
        this.index++;
        return token;
    }

    expect(type, image) {
        const token = this.match(type, image);
        if (token) return token;
        const expected = image == null ? type : JSON.stringify(image);
        throw tokenError(this.formula, this.current().start, `Expected ${expected} but found ${JSON.stringify(this.current().image)}.`);
    }

    parseExpression(minimumPrecedence = 0) {
        let left = this.parsePrefix();
        const precedence = { '<': 1, '>': 1, '=': 1, '<>': 1, '<=': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };
        while (this.current().type === 'operator' && precedence[this.current().image] >= minimumPrecedence) {
            const operator = this.current().image;
            const operatorPrecedence = precedence[operator];
            this.index++;
            const right = this.parseExpression(operatorPrecedence + (operator === '^' ? 0 : 1));
            this.context.retrieveRef(left);
            this.context.retrieveRef(right);
            left = 0;
        }
        return left;
    }

    parsePrefix() {
        const prefixes = [];
        while (this.current().type === 'operator' && ['+', '-'].includes(this.current().image)) {
            prefixes.push(this.current().image);
            this.index++;
        }
        let value = this.parseRange();
        if (prefixes.length) {
            this.context.retrieveRef(value);
            value = 0;
        }
        if (this.match('percent')) {
            this.context.retrieveRef(value);
            value = 0;
        }
        return value;
    }

    parseRange() {
        let left = this.parsePrimary();
        while (this.match('colon')) {
            const right = this.parsePrimary();
            left = this.combineRange(left, right);
        }
        const intersections = [left];
        while (this.startsReference(this.current()) && this.previous().end < this.current().start) {
            intersections.push(this.parseRange());
        }
        if (intersections.length > 1) {
            intersections.forEach(reference => this.context.retrieveRef(reference));
            return left;
        }
        return left;
    }

    startsReference(token) {
        return ['cell', 'sheet'].includes(token.type) || token.type === 'identifier';
    }

    parsePrimary() {
        const sheet = this.match('sheet');
        if (sheet) {
            const reference = this.parseReferenceItem();
            if (!isReference(reference)) throw tokenError(this.formula, this.previous().start, 'A sheet prefix must be followed by a reference.');
            reference.ref.sheet = sheet.image;
            return reference;
        }
        const cell = this.match('cell');
        if (cell) return { ref: { col: columnNameToNumber(cell.column), row: cell.row } };
        const number = this.match('number');
        if (number) return number.value;
        const string = this.match('string');
        if (string) return string.image.slice(1, -1).replace(/""/g, '"');
        const boolean = this.match('boolean');
        if (boolean) return boolean.value;
        const error = this.match('error');
        if (error) return new FormulaError(error.image.toUpperCase());
        const identifier = this.match('identifier');
        if (identifier) {
            if (this.match('openParen')) return this.parseFunctionCall(identifier.image);
            if (/^\$?[A-Za-z]{1,3}$/.test(identifier.image)) {
                return { ref: { col: columnNameToNumber(identifier.image), row: undefined } };
            }
            return this.context.getVariable(identifier.image);
        }
        if (this.match('openParen')) return this.parseParenthesized();
        if (this.match('openBrace')) return this.parseArray();
        throw tokenError(this.formula, this.current().start, `Expected a formula value but found ${JSON.stringify(this.current().image)}.`);
    }

    parseReferenceItem() {
        const cell = this.match('cell');
        if (cell) return { ref: { col: columnNameToNumber(cell.column), row: cell.row } };
        const identifier = this.match('identifier');
        if (identifier && /^\$?[A-Za-z]{1,3}$/.test(identifier.image)) {
            return { ref: { col: columnNameToNumber(identifier.image), row: undefined } };
        }
        if (identifier) return this.context.getVariable(identifier.image);
        const error = this.match('error');
        if (error) return new FormulaError(error.image.toUpperCase());
        throw tokenError(this.formula, this.current().start, 'Expected a cell, column, or named reference.');
    }

    parseFunctionCall(name) {
        const args = [];
        if (!this.match('closeParen')) {
            while (true) {
                if (this.current().type === 'comma' || this.current().type === 'closeParen') args.push(null);
                else args.push(this.parseExpression());
                if (!this.match('comma')) break;
            }
            this.expect('closeParen');
        }
        return this.context.callFunction(name, args);
    }

    parseParenthesized() {
        const values = [this.parseExpression()];
        while (this.match('comma')) values.push(this.parseExpression());
        this.expect('closeParen');
        if (values.length === 1) return values[0];
        values.forEach(value => this.context.retrieveRef(value));
        return 0;
    }

    parseArray() {
        if (this.match('closeBrace')) return [];
        const rows = [[]];
        while (true) {
            rows[rows.length - 1].push(this.parseExpression());
            if (this.match('comma')) continue;
            if (this.match('semicolon')) {
                rows.push([]);
                continue;
            }
            break;
        }
        this.expect('closeBrace');
        return rows;
    }

    combineRange(left, right) {
        if (typeof left === 'number' && typeof right === 'number' && Number.isInteger(left) && Number.isInteger(right)) {
            left = { ref: { row: left, col: undefined } };
            right = { ref: { row: right, col: undefined } };
        }
        if (!isReference(left) || !isReference(right)) {
            throw tokenError(this.formula, this.previous().start, 'Range endpoints must be references.');
        }
        const leftBounds = normalizeReferenceBounds(left.ref);
        const rightBounds = normalizeReferenceBounds(right.ref);
        const from = {
            row: Math.min(leftBounds.from.row ?? 1, rightBounds.from.row ?? 1),
            col: Math.min(leftBounds.from.col ?? 1, rightBounds.from.col ?? 1)
        };
        const to = {
            row: Math.max(leftBounds.to.row ?? MAX_ROW, rightBounds.to.row ?? MAX_ROW),
            col: Math.max(leftBounds.to.col ?? MAX_COLUMN, rightBounds.to.col ?? MAX_COLUMN)
        };
        const sheet = left.ref.sheet ?? right.ref.sheet;
        return { ref: { from, to, ...(sheet == null ? {} : { sheet }) } };
    }
}

class DepParser {
    constructor(config) {
        const options = Object.assign({ onVariable: () => null }, config);
        this.data = [];
        this.onVariable = options.onVariable;
        this.functions = {};
        this.parser = new DependencyFormulaParser(this);
    }

    getCell(cell) {
        if (cell.row == null) return undefined;
        if (cell.sheet == null) cell.sheet = this.position ? this.position.sheet : undefined;
        const alreadyCovered = this.data.some(dependency =>
            dependency.from &&
            dependency.from.row <= cell.row && dependency.to.row >= cell.row &&
            dependency.from.col <= cell.col && dependency.to.col >= cell.col ||
            dependency.row === cell.row && dependency.col === cell.col && dependency.sheet === cell.sheet
        );
        if (!alreadyCovered) this.data.push(cell);
        return 0;
    }

    getRange(range) {
        if (range.from.row == null) return undefined;
        if (range.sheet == null) range.sheet = this.position ? this.position.sheet : undefined;
        const duplicate = this.data.some(dependency =>
            dependency.from && dependency.from.row === range.from.row && dependency.from.col === range.from.col &&
            dependency.to.row === range.to.row && dependency.to.col === range.to.col && dependency.sheet === range.sheet
        );
        if (!duplicate) this.data.push(range);
        return [[0]];
    }

    getVariable(name) {
        const reference = this.onVariable(name, this.position && this.position.sheet);
        if (reference == null) return FormulaError.NAME;
        if (reference.from) this.getRange(reference);
        else this.getCell(reference);
        return 0;
    }

    retrieveRef(value) {
        if (isRangeReference(value)) return this.getRange(value.ref);
        if (isReference(value)) return this.getCell(value.ref);
        return value;
    }

    callFunction(name, args) {
        args.forEach(arg => {
            if (arg != null) this.retrieveRef(arg);
        });
        return { value: 0, ref: {} };
    }

    checkFormulaResult(result) {
        this.retrieveRef(result);
    }

    parse(formula, position, ignoreErrors = false) {
        if (formula.length === 0) throw Error('Input must not be empty.');
        this.data = [];
        this.position = position;
        try {
            const result = this.parser.parse(formula);
            this.checkFormulaResult(result);
        } catch (error) {
            if (!ignoreErrors) {
                if (error instanceof FormulaError) throw error;
                throw FormulaError.ERROR(error.message, error);
            }
        }
        return this.data;
    }
}

module.exports = { DepParser };
