class FormulaError extends Error {
  static errorMap = new Map();

  constructor(error, message = null, details = null) {
    if (message === null && details === null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }
    super(message);
    this.error = error;
    if (message === null && details === null) FormulaError.errorMap.set(error, this);
    this.details = details;
  }

  get name() {
    return this.error;
  }

  get type() {
    return this.error;
  }

  equals(other) {
    return other instanceof FormulaError && other.error === this.error;
  }

  toString() {
    return this.error;
  }

  static of(error, message, details) {
    return new FormulaError(error, message, details);
  }

  static from(error) {
    return new FormulaError(error);
  }

  static omittedArgument(argument) {
    return new FormulaError(FormulaError.VALUE.error, `Argument ${argument} is omitted`);
  }

  static unsupportedType(type) {
    return new FormulaError(FormulaError.VALUE.error, `Type ${type} is not supported`);
  }
}

FormulaError.NULL = new FormulaError('#NULL!');
FormulaError.DIV0 = new FormulaError('#DIV/0!');
FormulaError.VALUE = new FormulaError('#VALUE!');
FormulaError.REF = new FormulaError('#REF!');
FormulaError.NAME = new FormulaError('#NAME?');
FormulaError.NUM = new FormulaError('#NUM!');
FormulaError.NA = new FormulaError('#N/A');
FormulaError.ERROR = new FormulaError('#ERROR!');

module.exports = FormulaError;
