var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  var cache = {};
  return mod || (cb[__getOwnPropNames(cb)[0]])((mod = {exports: {}}).exports, mod), mod.exports;
};

var require_error = __commonJS({
  '../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {
    var FormulaError = class FormulaError extends Error {
      constructor(error, message, details) {
        super(message);
        if (message !== null && details !== null && FormulaError.errors.has(error)) {
          return FormulaError.errors.get(error);
        } else if (message !== null && details !== null) {
          this.error = error;
          FormulaError.errors.set(error, this);
        } else {
          this.error = error;
        }
        this.details = details;
      }

      get name() {
        return this.error;
      }

      get #details() {
        return this.details;
      }

      equals(other) {
        return other instanceof FormulaError && other.error === this.error;
      }

      toString() {
        return this.error;
      }
    };

    FormulaError.errors = new Map();
    FormulaError.NULL = new FormulaError('#NULL!');
    FormulaError.NA = new FormulaError('#N/A');
    FormulaError.REF = new FormulaError('#REF!');
    FormulaError.DIV0 = new FormulaError('#DIV/0!');
    FormulaError.NUM = new FormulaError('#NUM!');
    FormulaError.VALUE = new FormulaError('#VALUE!');
    FormulaError.NAME = new FormulaError('#NAME?');
    FormulaError.ERROR = new FormulaError('#ERROR!');
    FormulaError.NOT_AVAILABLE = (errorMessage) => {
      return new FormulaError('#N/A', '#N/A ' + errorMessage + ' is not available.');
    };
    FormulaError.ARG_TYPE = (expectedTypes, receivedType) => {
      const { Types } = require_helpers();
      return new FormulaError('#VALUE!', 'Expected ' + expectedTypes.map(t => Types[t]).join(', ') + ' but got ' + receivedType + '.');
    };
    FormulaError.TOO_MANY_ARGS = (funcName, maxArgs) => {
      return new FormulaError('#ERROR!', funcName, maxArgs);
    };

    module.exports = FormulaError;
  }
});

module.exports = require_error();
