'use strict';

class FormulaError extends Error {
  constructor(error, message, details) {
    super(message);
    this._error = error;
    this.details = details;
  }

  get error() {
    return this._error;
  }

  get name() {
    return this._error;
  }

  equals(other) {
    return other instanceof FormulaError && this._error === other._error;
  }

  toString() {
    return this._error;
  }
}

Object.defineProperty(FormulaError.prototype, 'constructor', {
  value: FormulaError,
  writable: true,
  enumerable: true,
  configurable: true,
});

FormulaError._$yRl2zO = Error;
FormulaError.errorMap = new Map();
FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');

for (const error of [
  FormulaError.DIV0,
  FormulaError.NA,
  FormulaError.NAME,
  FormulaError.NULL,
  FormulaError.NUM,
  FormulaError.REF,
  FormulaError.VALUE,
]) {
  FormulaError.errorMap.set(error.error, error);
}

FormulaError.NOT_IMPLEMENTED = function NOT_IMPLEMENTED(functionName) {
  return new FormulaError('#NAME?', `Function ${functionName} is not implemented.`);
};

FormulaError.TOO_MANY_ARGS = function TOO_MANY_ARGS(functionName) {
  return new FormulaError('#N/A', `Function ${functionName} has too many arguments.`);
};

const argumentTypes = {
  NUMBER: 0,
  ARRAY: 1,
  BOOLEAN: 2,
  STRING: 3,
  RANGE_REF: 4,
  CELL_REF: 5,
  COLLECTIONS: 6,
  NUMBER_NO_BOOLEAN: 10,
};

FormulaError.ARG_MISSING = function ARG_MISSING(types) {
  return new FormulaError(
    '#N/A',
    `Argument type ${types.map(type => argumentTypes[type]).join(', ')} is missing.`,
  );
};

FormulaError.ERROR = function ERROR(message, details) {
  return new FormulaError('#ERROR!', message, details);
};

module.exports = FormulaError;
