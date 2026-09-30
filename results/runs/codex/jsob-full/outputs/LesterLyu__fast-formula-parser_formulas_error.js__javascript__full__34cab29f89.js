class FormulaError extends Error {
  constructor(code, message, details) {
    super(message);

    if (message == null && details == null && FormulaError.errorMap.has(code)) {
      return FormulaError.errorMap.get(code);
    }

    this._error = code;
    this.details = details;

    if (message == null && details == null) {
      FormulaError.errorMap.set(code, this);
    }
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

  static NOT_IMPLEMENTED(functionName) {
    return new FormulaError(
      FormulaError.NAME,
      `Function ${functionName} is not implemented.`,
    );
  }

  static TOO_MANY_ARGS(functionName) {
    return new FormulaError(
      FormulaError.NA,
      `Function ${functionName} has too many arguments.`,
    );
  }

  static ARG_MISSING(argumentTypes) {
    return new FormulaError(
      FormulaError.NA,
      `Argument type ${argumentTypes.join(', ')} is missing.`,
    );
  }

  static ERROR(code, message, details) {
    return new FormulaError(code, message, details);
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

module.exports = FormulaError;
