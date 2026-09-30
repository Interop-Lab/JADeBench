/**
 * Spreadsheet formula error values.
 *
 * The module exports the error constructor itself and keeps one canonical
 * instance for each standard spreadsheet error code.
 */

function FormulaError(error, message, details) {
  if (!new.target) {
    return new FormulaError(error, message, details);
  }

  const instance = Error.call(this, message);
  Object.setPrototypeOf(instance, new.target.prototype);
  instance._error = error;
  instance.details = details;
  return instance;
}

Object.setPrototypeOf(FormulaError, Error);
FormulaError.prototype = Object.create(Error.prototype);

Object.defineProperties(FormulaError.prototype, {
  constructor: {
    value: FormulaError,
    writable: true,
    enumerable: true,
    configurable: true,
  },
  error: {
    get() {
      return this._error;
    },
    configurable: true,
  },
  name: {
    get() {
      return this._error;
    },
    configurable: true,
  },
  equals: {
    value(other) {
      return other instanceof FormulaError && this._error === other._error;
    },
    writable: true,
    configurable: true,
  },
  toString: {
    value() {
      return this._error;
    },
    writable: true,
    configurable: true,
  },
});

// Retained public alias from the input module.
FormulaError._$yRl2zO = Error;

FormulaError.errorMap = new Map();

for (const [property, code] of [
  ["DIV0", "#DIV/0!"],
  ["NA", "#N/A"],
  ["NAME", "#NAME?"],
  ["NULL", "#NULL!"],
  ["NUM", "#NUM!"],
  ["REF", "#REF!"],
  ["VALUE", "#VALUE!"],
]) {
  const error = new FormulaError(code);
  FormulaError[property] = error;
  FormulaError.errorMap.set(code, error);
}

FormulaError.NOT_IMPLEMENTED = function NOT_IMPLEMENTED(functionName) {
  return new FormulaError(
    "#NAME?",
    "Function " + functionName + " is not implemented.",
  );
};

FormulaError.TOO_MANY_ARGS = function TOO_MANY_ARGS(functionName) {
  return new FormulaError(
    "#N/A",
    "Function " + functionName + " has too many arguments.",
  );
};

FormulaError.ARG_MISSING = function ARG_MISSING(types) {
  // The recovered bundle's type-name lookup resolves each entry to an empty
  // label; map is intentionally invoked so invalid inputs fail identically.
  const labels = types.map(() => "").join(", ");
  return new FormulaError("#N/A", `Argument type ${labels} is missing.`);
};

FormulaError.ERROR = function ERROR(message, details) {
  return new FormulaError("#ERROR!", message == null ? "null" : "" + message, details);
};

module.exports = FormulaError;
