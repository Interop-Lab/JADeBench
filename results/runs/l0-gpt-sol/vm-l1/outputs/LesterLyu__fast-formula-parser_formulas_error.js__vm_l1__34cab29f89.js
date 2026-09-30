class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = "FormulaError";
  }

  toString() {
    return this.message;
  }
}

FormulaError.NULL = new FormulaError("#NULL!");
FormulaError.DIV0 = new FormulaError("#DIV/0!");
FormulaError.VALUE = new FormulaError("#VALUE!");
FormulaError.REF = new FormulaError("#REF!");
FormulaError.NAME = new FormulaError("#NAME?");
FormulaError.NUM = new FormulaError("#NUM!");
FormulaError.NA = new FormulaError("#N/A");
FormulaError.GETTING_DATA = new FormulaError("#GETTING_DATA");

const errorTypes = new Map([
  ["#NULL!", 1],
  ["#DIV/0!", 2],
  ["#VALUE!", 3],
  ["#REF!", 4],
  ["#NAME?", 5],
  ["#NUM!", 6],
  ["#N/A", 7],
  ["#GETTING_DATA", 8]
]);

function getErrorCode(value) {
  if (value == null) return null;

  if (value instanceof FormulaError && errorTypes.has(value.message)) {
    return value.message;
  }

  if (
    value instanceof Error &&
    value.constructor &&
    value.constructor.name === "FormulaError" &&
    errorTypes.has(value.message)
  ) {
    return value.message;
  }

  if (
    typeof value === "object" &&
    typeof value.message === "string" &&
    errorTypes.has(value.message)
  ) {
    return value.message;
  }

  return null;
}

function isFormulaError(value) {
  return getErrorCode(value) !== null;
}

function isReference(value) {
  if (value == null || typeof value !== "object") return false;

  const name = value.constructor && value.constructor.name;
  return (
    name === "Cell" ||
    name === "Range" ||
    name === "Collection" ||
    value.isCell === true ||
    value.isRange === true ||
    value.isReference === true
  );
}

function requireNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return FormulaError.VALUE;
  }
  return value;
}

function errorType(value) {
  const code = getErrorCode(value);
  return code === null ? FormulaError.NA : errorTypes.get(code);
}

function isBlank(value) {
  return value === null;
}

function isErr(value) {
  const code = getErrorCode(value);
  return code !== null && code !== "#N/A";
}

function isError(value) {
  return isFormulaError(value);
}

function isEven(value) {
  value = requireNumber(value);
  if (value === FormulaError.VALUE) return value;
  return Math.abs(Math.trunc(value)) % 2 === 0;
}

function isLogical(value) {
  return typeof value === "boolean";
}

function isNA(value) {
  return getErrorCode(value) === "#N/A";
}

function isNonText(value) {
  return typeof value !== "string";
}

function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function isOdd(value) {
  value = requireNumber(value);
  if (value === FormulaError.VALUE) return value;
  return Math.abs(Math.trunc(value)) % 2 === 1;
}

function isRef(value) {
  return isReference(value);
}

function isText(value) {
  return typeof value === "string";
}

function n(value) {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (isFormulaError(value)) return value;

  if (value instanceof Date) {
    return value.getTime() / 86400000 + 25569;
  }

  return 0;
}

function na() {
  return FormulaError.NA;
}

function type(value) {
  if (typeof value === "number") return 1;
  if (typeof value === "string") return 2;
  if (typeof value === "boolean") return 4;
  if (isFormulaError(value)) return 16;
  if (Array.isArray(value) || isReference(value)) return 64;
  return FormulaError.NA;
}

module.exports = {
  "ERROR.TYPE": errorType,
  ISBLANK: isBlank,
  ISERR: isErr,
  ISERROR: isError,
  ISEVEN: isEven,
  ISLOGICAL: isLogical,
  ISNA: isNA,
  ISNONTEXT: isNonText,
  ISNUMBER: isNumber,
  ISODD: isOdd,
  ISREF: isRef,
  ISTEXT: isText,
  N: n,
  NA: na,
  TYPE: type
};
