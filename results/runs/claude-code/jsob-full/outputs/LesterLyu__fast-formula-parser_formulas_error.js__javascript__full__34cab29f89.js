'use strict';

class FormulaError extends Error {
  constructor(error, message, details) {
    super(message);

    if (message == null && details == null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }

    this._error = error;
    FormulaError.errorMap.set(error, this);
    this.details = details;
  }

  get error() {
    return this._error;
  }

  get name() {
    return this._error;
  }

  equals(other) {
    return other instanceof FormulaError && other.error === this.error;
  }

  toString() {
    return this._error;
  }
}

FormulaError.errorMap = new Map();
FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');

FormulaError.NOT_IMPLEMENTED = functionName =>
  new FormulaError('#NAME?', `Function ${functionName} is not implemented.`);

FormulaError.TOO_MANY_ARGS = functionName =>
  new FormulaError('#N/A', `Function ${functionName} has too many arguments.`);

const Types = {
  NUMBER: 0,
  ARRAY: 1,
  BOOLEAN: 2,
  STRING: 3,
  RANGE_REF: 4,
  CELL_REF: 5,
  COLLECTIONS: 6,
  NUMBER_NO_BOOLEAN: 10,
};

FormulaError.ARG_MISSING = types =>
  new FormulaError(
    '#N/A',
    `Argument type ${types.map(type => Types[type]).join(', ')} is missing.`,
  );

FormulaError.ERROR = (message, details) =>
  new FormulaError('#ERROR!', message, details);

module.exports = FormulaError;
