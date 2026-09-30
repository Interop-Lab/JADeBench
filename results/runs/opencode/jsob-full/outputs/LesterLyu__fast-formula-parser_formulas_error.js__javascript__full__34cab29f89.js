'use strict';

/**
 * Spreadsheet formula error value.
 *
 * The constructor interns errors created without a message or details, matching
 * the source module's identity semantics for its standard error constants.
 */
class FormulaError extends Error {
  constructor(error, message, details) {
    if (message == null && details == null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }

    super(message);
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
    return other instanceof FormulaError && this._error === other._error;
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

FormulaError.NOT_IMPLEMENTED = function notImplemented(functionName) {
  return new FormulaError(
    '#NAME?',
    `Function ${functionName} is not implemented.`
  );
};

FormulaError.TOO_MANY_ARGS = function tooManyArguments(functionName) {
  return new FormulaError(
    '#N/A',
    `Function ${functionName} has too many arguments.`
  );
};

FormulaError.ARG_MISSING = function argumentMissing(types) {
  // The helper module's Types object is reverse-indexed by numeric enum values.
  // Unknown/non-enum values therefore appear as empty names, as in the source.
  const typeNames = types.map(() => '').join(', ');
  return new FormulaError('#N/A', `Argument type ${typeNames} is missing.`);
};

FormulaError.ERROR = function error(message, details) {
  return new FormulaError('#ERROR!', message, details);
};

module.exports = FormulaError;
