var __getOwnPropNames = Object.getOwnPropertyNames;
globalThis['__getOwnPropNames'] = __getOwnPropNames;

var __commonJS = (cb, mod) => function __commonJS() {
  return cb.apply(mod, arguments);
};
globalThis['__commonJS'] = __commonJS;

var require_collection = __commonJS({ '../work/LesterLyu__fast-formula-parser/grammar/type/collection.js'(exports, module) {} });
globalThis['require_collection'] = require_collection;

var require_helpers = __commonJS({ '../work/LesterLyu__fast-formula-parser/formulas/helpers.js'(exports, module) {} });
globalThis['require_helpers'] = require_helpers;

var require_error = __commonJS({ '../work/LesterLyu__fast-formula-parser/formulas/error.js'(exports, module) {} });
globalThis['require_error'] = require_error;

var require_lexing = __commonJS({ '../work/LesterLyu__fast-formula-parser/grammar/lexing.js'(exports, module) {} });
globalThis['require_lexing'] = require_lexing;

var require_parsing = __commonJS({ '../work/LesterLyu__fast-formula-parser/grammar/parsing.js'(exports, module) {} });
globalThis['require_parsing'] = require_parsing;

var require_operators = __commonJS({ '../work/LesterLyu__fast-formula-parser/formulas/operators.js'(exports, module) {} });
globalThis['require_operators'] = require_operators;

var require_utils = __commonJS({ '../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js'(exports, module) {} });
globalThis['require_utils'] = require_utils;

var require_utils2 = __commonJS({ '../work/LesterLyu__fast-formula-parser/grammar/utils.js'(exports, module) {} });
globalThis['require_utils2'] = require_utils2;

var FormulaError = require_error();
globalThis['FormulaError'] = FormulaError;

var { FormulaHelpers } = require_helpers();
globalThis['FormulaHelpers'] = FormulaHelpers;

var { Parser } = require_parsing();
globalThis['Parser'] = Parser;

var lexer = require_lexing();
globalThis['lexer'] = lexer;

var Utils = require_utils();
globalThis['Utils'] = Utils;

var { formatChevrotainError } = require_utils2();
globalThis['formatChevrotainError'] = formatChevrotainError;

var DepParser = class {
  constructor(parser) {}
  parse(text) {}
  getCellRef(token) {}
  getRangeRef(token) {}
  getVariable(token) {}
  retrieveRef(token) {}
  callFunction(name, args) {}
  checkFormulaResult(result) {}
  throwError(error) {}
};

globalThis['DepParser'] = DepParser;

module.exports = { DepParser };
