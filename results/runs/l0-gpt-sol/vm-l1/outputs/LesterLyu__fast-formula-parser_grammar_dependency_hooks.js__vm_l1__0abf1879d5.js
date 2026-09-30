"use strict";

const FormulaError = require("../../formulas/error");
const { FormulaHelpers } = require("../../formulas/helpers");
const { Parser } = require("../parsing");
const lexer = require("../lexing");
const Utils = require("./utils");
const { formatChevrotainError } = require("../utils");

class DepParser {
  constructor(config = {}) {
    this.onVariable =
      typeof config.onVariable === "function"
        ? config.onVariable
        : () => undefined;

    this.references = [];
    this.parser = new Parser(this);
  }

  parse(formula) {
    this.references = [];

    const lexResult = lexer.tokenize(formula);
    if (lexResult.errors && lexResult.errors.length) {
      throw new Error(formatChevrotainError(lexResult.errors[0], formula));
    }

    this.parser.input = lexResult.tokens;

    if (typeof this.parser.formulaWithBinaryOp === "function") {
      this.parser.formulaWithBinaryOp();
    } else {
      this.parser.formula();
    }

    if (this.parser.errors && this.parser.errors.length) {
      throw new Error(formatChevrotainError(this.parser.errors[0], formula));
    }

    return this.references;
  }

  getCell(cell) {
    this.references.push(cell);
    return 0;
  }

  getRange(range) {
    this.references.push(range);
    return 0;
  }

  getVariable(name) {
    const value = this.onVariable(name);

    if (value === undefined || value === null) {
      return 0;
    }

    return this.retrieveRef(value);
  }

  retrieveRef(reference) {
    if (reference === undefined || reference === null) {
      return 0;
    }

    if (Array.isArray(reference)) {
      for (const item of reference) {
        this.retrieveRef(item);
      }
      return 0;
    }

    this.references.push(reference);
    return 0;
  }

  callFunction(name, args) {
    return 0;
  }

  checkFormulaResult(result) {
    if (result instanceof FormulaError) {
      return result;
    }
    return result;
  }
}

module.exports = { DepParser };
