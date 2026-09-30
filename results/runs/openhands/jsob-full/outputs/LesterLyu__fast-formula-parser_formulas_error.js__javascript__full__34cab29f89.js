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

class FormulaError extends Error {
  static errorMap = new Map();

  constructor(error, message, details) {
    super(message);

    if (message == null && details == null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }

    this._error = error;
    if (message == null && details == null) {
      FormulaError.errorMap.set(error, this);
    }
    this.details = details;
  }

  get error() {
    return this._error;
  }

  get name() {
    return this._error;
  }

  equals(other) {
    return other instanceof FormulaError && other._error === this._error;
  }

  toString() {
    return this._error;
  }
}

FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.VALUE = new FormulaError('#VALUE!');

FormulaError.NOT_IMPLEMENTED = function NOT_IMPLEMENTED(name) {
  return new FormulaError('#NAME?', `Function ${name} is not implemented.`);
};

FormulaError.TOO_MANY_ARGS = function TOO_MANY_ARGS(name) {
  return new FormulaError('#N/A', `Function ${name} has too many arguments.`);
};

FormulaError.ARG_MISSING = function ARG_MISSING(types) {
  const names = types.map(type => Types[type]).join(', ');
  return new FormulaError('#N/A', `Argument type ${names} is missing.`);
};

FormulaError.ERROR = function ERROR(message, details) {
  return new FormulaError('#ERROR!', message, details);
};

module.exports = FormulaError;
