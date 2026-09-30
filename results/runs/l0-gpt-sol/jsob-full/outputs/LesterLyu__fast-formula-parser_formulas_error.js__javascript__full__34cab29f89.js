class FormulaError extends Error {
  constructor(error, message, details) {
    super(message);

    if (message == null && details == null && FormulaError.errorMap.has(error)) {
      return FormulaError.errorMap.get(error);
    }

    this.error = error;

    if (message == null && details == null) {
      FormulaError.errorMap.set(error, this);
    }

    this.details = details;
  }

  get name() {
    return this.error;
  }

  get message() {
    return this.error;
  }

  equals(other) {
    return other instanceof FormulaError && other.error === this.error;
  }

  toString() {
    return this.error;
  }
}

FormulaError.errorMap = new Map();

FormulaError.DIV0 = new FormulaError("#DIV/0!");
FormulaError.NA = new FormulaError("#N/A");
FormulaError.NAME = new FormulaError("#NAME?");
FormulaError.NULL = new FormulaError("#NULL!");
FormulaError.NUM = new FormulaError("#NUM!");
FormulaError.REF = new FormulaError("#REF!");
FormulaError.VALUE = new FormulaError("#VALUE!");

FormulaError.ARG_MISSING = argument =>
  new FormulaError("#N/A", "Argument " + argument + " is missing.");

FormulaError.ARG_EXTRA = argument =>
  new FormulaError("#N/A", "Argument " + argument + " is extra.");

FormulaError.ARG_TYPE = types => {
  const typeNames = {
    0: "NUMBER",
    1: "STRING",
    2: "BOOLEAN",
    3: "ARRAY",
    4: "CELL_REF",
    5: "RANGE_REF",
    6: "COLLECTION",
    10: "ANY"
  };

  return new FormulaError(
    "#VALUE!",
    "Argument type must be " +
      types.map(type => typeNames[type]).join(", ") +
      "."
  );
};

FormulaError.ERROR = (message, details) =>
  new FormulaError("#ERROR!", message, details);

module.exports = FormulaError;
