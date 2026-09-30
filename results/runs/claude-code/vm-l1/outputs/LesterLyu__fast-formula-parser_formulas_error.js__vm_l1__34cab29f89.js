'use strict';

const reversedTypes = {
  0: 'NUMBER',
  1: 'ARRAY',
  2: 'BOOLEAN',
  3: 'STRING',
  4: 'RANGE_REF',
  5: 'CELL_REF',
  6: 'COLLECTIONS',
  10: 'NUMBER_NO_BOOLEAN'
};

class FormulaError extends Error {
  constructor(error, message, details) {
    super(message);
    this._error = error;
    this.details = details;
    FormulaError.errorMap.set(error, this);
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

FormulaError._$yRl2zO = Error;
FormulaError.errorMap = new Map();

FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');

FormulaError.NOT_IMPLEMENTED = function NOT_IMPLEMENTED(functionName) {
  return new FormulaError('#NAME?', `Function ${functionName} is not implemented.`);
};

FormulaError.TOO_MANY_ARGS = function TOO_MANY_ARGS(functionName) {
  return new FormulaError('#N/A', `Function ${functionName} has too many arguments.`);
};

FormulaError.ARG_MISSING = function ARG_MISSING(types) {
  return new FormulaError(
    '#N/A',
    `Argument type ${types.map(type => reversedTypes[type]).join(', ')} is missing.`
  );
};

FormulaError.ERROR = function ERROR(message, details) {
  return new FormulaError('#ERROR!', message, details);
};

module.exports = FormulaError;
