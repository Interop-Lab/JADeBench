const DepParser = class {
  constructor(config) {
    this.config = config;
    this.parser = new Parser();
    this.lexer = lexer;
    this.utils = Utils;
    this.helpers = new FormulaHelpers();
  }

  parse(formula) {
    const lexResult = this.lexer.tokenize(formula);
    if (lexResult.errors.length > 0) {
      throw formatChevrotainError(lexResult.errors);
    }
    this.parser.input = lexResult.tokens;
    const cst = this.parser.formula();
    if (this.parser.errors.length > 0) {
      throw formatChevrotainError(this.parser.errors);
    }
    return cst;
  }

  getRange(ref) {
    return this.utils.getRange(ref);
  }

  getVariable(name) {
    return this.config && this.config.getVariable ? this.config.getVariable(name) : undefined;
  }

  getCell(ref) {
    return this.config && this.config.getCell ? this.config.getCell(ref) : undefined;
  }

  retrieveRef(ref) {
    return this.config && this.config.retrieveRef ? this.config.retrieveRef(ref) : undefined;
  }

  callFunction(name, params) {
    if (this.config && this.config.callFunction) {
      return this.config.callFunction(name, params);
    }
    return this.helpers.callFunction(name, params);
  }

  checkFormulaResult(result) {
    if (result instanceof FormulaError) {
      throw result;
    }
    return result;
  }

  parseAndEvaluate(formula) {
    const cst = this.parse(formula);
    return this.checkFormulaResult(this.evaluate(cst));
  }
};

module.exports = { DepParser };
