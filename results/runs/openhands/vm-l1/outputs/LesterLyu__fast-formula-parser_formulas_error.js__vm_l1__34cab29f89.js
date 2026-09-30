class FormulaError extends Error {
  constructor(error, message, details) {
    super(message);
    this._error = error;
    this.details = details;
    if (message == null) FormulaError.errorMap.set(error, this);
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

// The source module exposes its superclass as an enumerable static property.
FormulaError._$yRl2zO = Error;
FormulaError.errorMap = new Map();

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
  const names = types.map(() => '').join(', ');
  return new FormulaError('#N/A', `Argument type ${names} is missing.`);
};

FormulaError.ERROR = function ERROR(message, details) {
  return new FormulaError('#ERROR!', message, details);
};

module.exports = FormulaError;
