var __commonJS = (moduleFactories, cachedModule) => function requireModule() {
  if (!cachedModule) {
    cachedModule = {
      exports: {}
    };
    const moduleName = Object.getOwnPropertyNames(moduleFactories)[0];
    (0, moduleFactories[moduleName])(cachedModule.exports, cachedModule);
  }
  return cachedModule.exports;
}, require_collection = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/type/collection.js"(value6, module1) {
    module1.exports = class Collection {
      constructor(data, references) {
        if (null == data && null == references) this._data = [], this._refs = []; else {
          if (data.length !== references.length) throw Error("Collection: data length should match references length.");
          this._data = data, this._refs = references;
        }
      }
      get data() {
        return this._data;
      }
      get refs() {
        return this._refs;
      }
      get length() {
        return this._data.length;
      }
      add(value7, reference) {
        this._data.push(value7), this._refs.push(reference);
      }
    };
  }
}), require_helpers = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/helpers.js"(value8, module2) {
    var formulaError = require_error(), collection = require_collection(), result1 = {
      NUMBER: 0,
      ARRAY: 1,
      BOOLEAN: 2,
      STRING: 3,
      RANGE_REF: 4,
      CELL_REF: 5,
      COLLECTIONS: 6,
      NUMBER_NO_BOOLEAN: 10
    }, result2 = {};
    Object.keys(result1).forEach((value9 => {
      result2[result1[value9]] = value9;
    }));
    var instance = new class {
      constructor() {
        this.Types = result1, this.type2Number = {
          number: 0,
          boolean: 2,
          string: 3,
          object: -1
        };
      }
      checkFunctionResult(value10) {
        if ("number" == typeof value10) {
          if (isNaN(value10)) return formulaError.VALUE;
          if (!isFinite(value10)) return formulaError.NUM;
        }
        return null == value10 ? formulaError.NULL : value10;
      }
      flattenDeep(values) {
        return values.reduce(((value11, otherValue2) => Array.isArray(otherValue2) ? value11.concat(this.flattenDeep(otherValue2)) : value11.concat(otherValue2)), []);
      }
      acceptNumber(value12, value13 = !0, value14 = !0) {
        {
          if (value12 instanceof formulaError) return value12;
          let value15;
          if ("number" == typeof value12) value15 = value12; else if ("boolean" == typeof value12) {
            if (!value14) throw formulaError.VALUE;
            value15 = Number(value12);
          } else if ("string" == typeof value12) {
            if (0 === value12.length) throw formulaError.VALUE;
            if (value15 = Number(value12), value15 != value15) throw formulaError.VALUE;
          } else {
            if (!Array.isArray(value12)) throw Error("Unknown type in FormulaHelpers.acceptNumber");
            if (value13) value15 = this.acceptNumber(value12[0][0]); else {
              if (1 !== value12[0].length) throw formulaError.VALUE;
              value15 = this.acceptNumber(value12[0][0]);
            }
          }
          return value15;
        }
      }
      flattenParams(value16, otherValue3, argument3, argument4, value17 = null, value18 = 1) {
        if (value16.length < value18) throw formulaError.ARG_MISSING([ otherValue3 ]);
        null == value17 && (value17 = 0 === otherValue3 ? 0 : null == otherValue3 ? null : ""), 
        value16.forEach((value19 => {
          {
            const {isCellRef: isCellRef1, isRangeRef: isRangeRef1, isArray: isArray1} = value19, isUnion1 = value19.value instanceof collection, isLiteral1 = !(isCellRef1 || isRangeRef1 || isArray1 || isUnion1);
            var result3 = {};
            result3.isLiteral = isLiteral1, result3.isCellRef = isCellRef1, result3.isRangeRef = isRangeRef1, 
            result3.isArray = isArray1, result3.isUnion = isUnion1;
            const value20 = result3;
            if (isLiteral1) value19 = value19.omitted ? value17 : this.accept(value19, otherValue3, value17), 
            argument4(value19, value20); else if (isCellRef1) argument4(value19.value, value20); else if (isUnion1) {
              if (!argument3) throw formulaError.VALUE;
              value19 = value19.value.data, (value19 = this.flattenDeep(value19)).forEach((value21 => {
                argument4(value21, value20);
              }));
            } else (isRangeRef1 || isArray1) && (value19 = this.flattenDeep(value19.value)).forEach((value22 => {
              argument4(value22, value20);
            }));
          }
        }));
      }
      accept(value23, value24 = null, argument31, value25 = !0, value26 = !1) {
        {
          if (Array.isArray(value24) && (value24 = value24[0]), null == value23 && void 0 === argument31) throw formulaError.ARG_MISSING([ value24 ]);
          if (null == value23) return argument31;
          if ("object" != typeof value23 || Array.isArray(value23)) return value23;
          const isArray2 = value23.isArray;
          if (null != value23.value && (value23 = value23.value), null == value24) return value23;
          if (value23 instanceof formulaError) throw value23;
          if (1 === value24) {
            if (Array.isArray(value23)) return value25 ? this.flattenDeep(value23) : value23;
            if (value23 instanceof collection) throw formulaError.VALUE;
            if (value26) return value25 ? [ value23 ] : [ [ value23 ] ];
            throw formulaError.VALUE;
          }
          if (6 === value24) return value23;
          isArray2 && (value23 = value23[0][0]);
          const typeResult = this.type(value23);
          if (3 === value24) value23 = 2 === typeResult ? value23 ? "TRUE" : "FALSE" : "" + value23; else if (2 === value24) {
            if (3 === typeResult) throw formulaError.VALUE;
            0 === typeResult && (value23 = Boolean(value23));
          } else if (0 === value24) value23 = this.acceptNumber(value23, !1); else {
            if (10 !== value24) throw formulaError.VALUE;
            value23 = this.acceptNumber(value23, !1, !1);
          }
          return value23;
        }
      }
      type(value27) {
        {
          let value28 = this.type2Number[typeof value27];
          return -1 === value28 && (Array.isArray(value27) ? value28 = 1 : value27.ref ? value28 = value27.ref.from ? 4 : 5 : value27 instanceof collection && (value28 = 6)), 
          value28;
        }
      }
      isRangeRef(value29) {
        return value29.ref && value29.ref.from;
      }
      isCellRef(value30) {
        return value30.ref && !value30.ref.from;
      }
      retrieveRanges(value31, otherValue4, argument32) {
        return argument32 = result4.extend(otherValue4, argument32), otherValue4 = this.retrieveArg(value31, otherValue4), 
        argument32 !== (otherValue4 = instance.accept(otherValue4, 1, void 0, !1, !0)) ? (argument32 = this.retrieveArg(value31, argument32), 
        argument32 = instance.accept(argument32, 1, void 0, !1, !0)) : argument32 = otherValue4, 
        [ otherValue4, argument32 ];
      }
      retrieveArg(value32, otherValue5) {
        {
          if (null === otherValue5) return {
            value: 0,
            isArray: !1,
            omitted: !0
          };
          const extractRefValueResult = value32.utils.extractRefValue(otherValue5);
          var result5 = {};
          return result5.value = extractRefValueResult.val, result5.isArray = extractRefValueResult.isArray, 
          result5.ref = otherValue5.ref, result5;
        }
      }
    }, result6 = {
      isWildCard: value33 => !("string" != typeof value33) && /[*?]/.test(value33),
      toRegex: (pattern1, flags) => RegExp(pattern1.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/([^~]??)[?]/g, "$1.").replace(/([^~]??)[*]/g, "$1.*").replace(/~([?*])/g, "$1"), flags)
    }, result7 = {
      parse: input1 => {
        var value34;
        {
          const value35 = typeof input1;
          if ("string" === value35) {
            const toUpperCaseResult = input1.toUpperCase();
            if ("TRUE" === toUpperCaseResult || "FALSE" === toUpperCaseResult) return {
              op: "=",
              value: (value34 = toUpperCaseResult, "TRUE" === value34)
            };
            const matchResult = input1.match(/(<>|>=|<=|>|<|=)(.*)/);
            if (matchResult) {
              let value36, value37 = matchResult[1];
              if (isNaN(matchResult[2])) {
                const toUpperCaseResult1 = matchResult[2].toUpperCase();
                if ("TRUE" === toUpperCaseResult1 || "FALSE" === toUpperCaseResult1) value36 = "TRUE" === toUpperCaseResult1; else if (/#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A|#REF!/.test(matchResult[2])) value36 = new formulaError(matchResult[2]); else if (value36 = matchResult[2], 
                result6.isWildCard(value36)) return {
                  op: "wc",
                  value: result6.toRegex(value36),
                  match: "=" === value37
                };
              } else value36 = Number(matchResult[2]);
              var result8 = {};
              return result8.op = value37, result8.value = value36, result8;
            }
            if (result6.isWildCard(input1)) return {
              op: "wc",
              value: result6.toRegex(input1),
              match: !0
            };
            var result9 = {
              op: "="
            };
            return result9.value = input1, result9;
          }
          if ("boolean" === value35 || "number" === value35 || Array.isArray(input1) || input1 instanceof formulaError) {
            var result10 = {
              op: "="
            };
            return result10.value = input1, result10;
          }
          throw Error("Criteria.parse: type " + typeof input1 + " not support");
        }
      }
    }, result4 = {
      columnNumberToName: columnNumber => {
        let value38 = columnNumber, value39 = "", number1 = 0;
        for (;value38 > 0; ) number1 = (value38 - 1) % 26, value39 = String.fromCharCode("A".charCodeAt(0) + number1) + value39, 
        value38 = Math.floor((value38 - number1) / 26);
        return value39;
      },
      columnNameToNumber: columnName => {
        {
          const length1 = (columnName = columnName.toUpperCase()).length;
          let number2 = 0;
          for (let number3 = 0; number3 < length1; number3++) {
            const charCodeAtResult = columnName.charCodeAt(number3);
            !isNaN(charCodeAtResult) && (number2 += (charCodeAtResult - 64) * 26 ** (length1 - number3 - 1));
          }
          return number2;
        }
      },
      extend: (value40, otherValue6) => {
        {
          if (null == otherValue6) return value40;
          let value41, value42;
          if (instance.isCellRef(value40)) value41 = 0, value42 = 0; else {
            if (!instance.isRangeRef(value40)) throw Error("Address.extend should not reach here.");
            value41 = value40.ref.to.row - value40.ref.from.row, value42 = value40.ref.to.col - value40.ref.from.col;
          }
          return instance.isCellRef(otherValue6) ? (value41 > 0 || value42 > 0) && (otherValue6 = {
            ref: {
              from: {
                col: otherValue6.ref.col,
                row: otherValue6.ref.row
              },
              to: {
                row: otherValue6.ref.row + value41,
                col: otherValue6.ref.col + value42
              }
            }
          }) : (otherValue6.ref.to.row = otherValue6.ref.from.row + value41, otherValue6.ref.to.col = otherValue6.ref.from.col + value42), 
          otherValue6;
        }
      }
    }, result11 = {};
    result11.FormulaHelpers = instance, result11.Types = result1, result11.ReversedTypes = result2, 
    result11.Factorials = [ 1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368e3, 20922789888e3, 355687428096e3, 6402373705728e3, 0x1b02b9306890000, 243290200817664e4, 5109094217170944e4, 11240007277776077e5, 2585201673888498e7, 6204484017332394e8, 15511210043330986e9, 40329146112660565e10, 10888869450418352e12, 30488834461171387e13, 8.841761993739702e30, 26525285981219107e16, 8222838654177922e18, 2631308369336935e20, 8683317618811886e21, 29523279903960416e22, 1.0333147966386145e40, 37199332678990125e25, 13763753091226346e27, 5230226174666011e29, 20397882081197444e30, 8159152832478977e32, 3345252661316381e34, 140500611775288e37, 6041526306337383e37, 2658271574788449e39, 11962222086548019e40, 5502622159812089e42, 25862324151116818e43, 12413915592536073e45, 6082818640342675e47, 30414093201713376e48, 15511187532873822e50, 8065817517094388e52, 42748832840600255e53, 2308436973392414e56, 12696403353658276e57, 7109985878048635e59, 40526919504877214e60, 23505613312828785e62, 1.3868311854568984e80, 832098711274139e67, 5075802138772248e68, 3146997326038794e70, 198260831540444e73, 12688693218588417e73, 8.247650592082472e90, 5443449390774431e77, 3647111091818868e79, 24800355424368305e80, 1711224524281413e83, 1.1978571669969892e100, 8504785885678623e86, 61234458376886085e87, 44701154615126844e89, 3307885441519386e92, 248091408113954e95, 18854947016660504e95, 14518309202828587e97, 11324281178206297e99, 8946182130782976e101, 7156945704626381e103, 5.797126020747368e120, 4753643337012842e107, 3945523969720659e109, 3314240134565353e111, 281710411438055e114, 2.4227095383672734e130, 2107757298379528e117, 18548264225739844e118, 1650795516090846e121, 14857159644817615e122, 1.352001527678403e140, 12438414054641308e126, 11567725070816416e128, 1087366156656743e131, 1032997848823906e133, 9916779348709496e134, 9619275968248212e136, 9426890448883248e138, 9332621544394415e140, 9332621544394415e142 ], 
    result11.WildCard = result6, result11.Criteria = result7, result11.Address = result4, 
    module2.exports = result11;
  }
}), require_error = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/error.js"(value43, module3) {
    var exports1 = class value44 extends Error {
      constructor(options1, references1, argument33) {
        if (super(references1), null == references1 && null == argument33 && value44.errorMap.has(options1)) return value44.errorMap.get(options1);
        null == references1 && null == argument33 ? (this._error = options1, value44.errorMap.set(options1, this)) : this._error = options1, 
        this.details = argument33;
      }
      get error() {
        return this._error;
      }
      get name() {
        return this._error;
      }
      equals(value45) {
        return value45 instanceof value44 && value45._error === this._error;
      }
      toString() {
        return this._error;
      }
    };
    exports1.errorMap = new Map, exports1.DIV0 = new exports1("#DIV/0!"), exports1.NA = new exports1("#N/A"), 
    exports1.NAME = new exports1("#NAME?"), exports1.NULL = new exports1("#NULL!"), 
    exports1.NUM = new exports1("#NUM!"), exports1.REF = new exports1("#REF!"), exports1.VALUE = new exports1("#VALUE!"), 
    exports1.NOT_IMPLEMENTED = value46 => new exports1("#NAME?", "Function " + value46 + " is not implemented."), 
    exports1.TOO_MANY_ARGS = value47 => new exports1("#N/A", "Function " + value47 + " has too many arguments."), 
    exports1.ARG_MISSING = value48 => {
      {
        const {Types: types} = require_helpers();
        return new exports1("#N/A", "Argument type " + value48.map((value49 => types[value49])).join(", ") + " is missing.");
      }
    }, exports1.ERROR = (value50, otherValue7) => new exports1("#ERROR!", value50, otherValue7), 
    module3.exports = exports1;
  }
}), require_lexing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/lexing.js"(value51, module4) {
    var value52, value53, {createToken: createToken1, Lexer: lexer1} = require("chevrotain"), formulaError1 = require_error(), result12 = {}, result13 = createToken1({
      name: "WhiteSpace",
      pattern: /\s+/,
      group: lexer1.SKIPPED
    }), result14 = createToken1({
      name: "String",
      pattern: /"(""|[^"])*"/
    }), result15 = createToken1({
      name: "SingleQuotedString",
      pattern: /'(''|[^'])*'/
    }), result16 = createToken1({
      name: "SheetQuoted",
      pattern: /'((?![\\\/\[\]*?:]).)+?'!/
    }), result17 = createToken1({
      name: "Function",
      pattern: /[A-Za-z_]+[A-Za-z_0-9.]*\(/
    }), result18 = createToken1({
      name: "FormulaErrorT",
      pattern: /#NULL!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#N\/A/
    }), result19 = createToken1({
      name: "RefError",
      pattern: /#REF!/
    }), result20 = createToken1({
      name: "Name",
      pattern: /[a-zA-Z_][a-zA-Z0-9_.?]*/
    }), result21 = createToken1({
      name: "Sheet",
      pattern: /[A-Za-z_.\d\u007F-\uFFFF]+!/
    }), result22 = createToken1({
      name: "Cell",
      pattern: /[$]?[A-Za-z]{1,3}[$]?[1-9][0-9]*/,
      longer_alt: result20
    }), result23 = createToken1({
      name: "Number",
      pattern: /[0-9]+[.]?[0-9]*([eE][+\-][0-9]+)?/
    }), result24 = createToken1({
      name: "Boolean",
      pattern: /TRUE|FALSE/i
    }), result25 = createToken1({
      name: "Column",
      pattern: /[$]?[A-Za-z]{1,3}/,
      longer_alt: result20
    }), result26 = createToken1({
      name: "At",
      pattern: /@/
    }), result27 = createToken1({
      name: "Comma",
      pattern: /,/
    }), result28 = createToken1({
      name: "Colon",
      pattern: /:/
    }), result29 = createToken1({
      name: "Semicolon",
      pattern: /;/
    }), result30 = createToken1({
      name: "OpenParen",
      pattern: /\(/
    }), result31 = createToken1({
      name: "CloseParen",
      pattern: /\)/
    }), result32 = createToken1({
      name: "OpenSquareParen",
      pattern: /\[/
    }), result33 = createToken1({
      name: "CloseSquareParen",
      pattern: /]/
    }), value54 = (createToken1({
      name: "exclamationMark",
      pattern: /!/
    }), createToken1({
      name: "OpenCurlyParen",
      pattern: /{/
    })), result34 = createToken1({
      name: "CloseCurlyParen",
      pattern: /}/
    }), result35 = createToken1({
      name: "QuoteS",
      pattern: /'/
    }), result36 = createToken1({
      name: "MulOp",
      pattern: /\*/
    }), result37 = createToken1({
      name: "PlusOp",
      pattern: /\+/
    }), result38 = createToken1({
      name: "DivOp",
      pattern: /\//
    }), result39 = createToken1({
      name: "MinOp",
      pattern: /-/
    }), result40 = createToken1({
      name: "ConcatOp",
      pattern: /&/
    }), result41 = createToken1({
      name: "ExOp",
      pattern: /\^/
    }), result42 = createToken1({
      name: "PercentOp",
      pattern: /%/
    }), result43 = createToken1({
      name: "GtOp",
      pattern: />/
    }), result44 = createToken1({
      name: "EqOp",
      pattern: /=/
    }), result45 = createToken1({
      name: "LtOp",
      pattern: /</
    }), items = [ result13, result14, result16, result15, result17, result18, result19, result21, result22, result24, result25, result20, result23, result26, result27, result28, result29, result30, result31, result32, result33, value54, result34, result35, result36, result37, result38, result39, result40, result41, result36, result42, createToken1({
      name: "NeqOp",
      pattern: /<>/
    }), createToken1({
      name: "GteOp",
      pattern: />=/
    }), (value52 = createToken1, value53 = {
      name: "LteOp",
      pattern: /<=/
    }, value52(value53)), result43, result44, result45 ], instance1 = new lexer1(items, {
      ensureOptimizations: !0
    });
    items.forEach((value55 => {
      result12[value55.name] = value55;
    })), module4.exports = {
      tokenVocabulary: result12,
      lex: function(input2) {
        const tokenizeResult = instance1.tokenize(input2);
        if (tokenizeResult.errors.length > 0) {
          const value56 = tokenizeResult.errors[0], line1 = value56.line, column1 = value56.column;
          let value57 = "\n" + input2.split("\n")[line1 - 1] + "\n";
          value57 += (value58 = Array, value59 = column1 - 1, value58(value59)).fill(" ").join("") + "^\n", 
          value56.message = value57 + "Error at position " + line1 + ":" + column1 + "\n" + value56.message;
          var result46 = {};
          throw result46.line = line1, result46.column = column1, value56.errorLocation = result46, 
          formulaError1.ERROR(value56.message, value56);
        }
        var value58, value59;
        return tokenizeResult;
      }
    };
  }
}), require_parsing = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/parsing.js"(value60, module5) {
    var lexer2 = require_lexing(), {EmbeddedActionsParser: embeddedActionsParser} = require("chevrotain"), tokenVocabulary1 = lexer2.tokenVocabulary, {String: string1, SheetQuoted: sheetQuoted, ExcelRefFunction: excelRefFunction, ExcelConditionalRefFunction: excelConditionalRefFunction, Function: functionToken, FormulaErrorT: formulaErrorT, RefError: refError, Cell: cell, Sheet: sheet1, Name: name1, Number: number4, Boolean: boolean1, Column: column2, Comma: comma, Colon: colon, Semicolon: semicolon, OpenParen: openParen, CloseParen: closeParen, OpenCurlyParen: openCurlyParen, CloseCurlyParen: closeCurlyParen, MulOp: mulOp, PlusOp: plusOp, DivOp: divOp, MinOp: minOp, ConcatOp: concatOp1, ExOp: exOp, PercentOp: percentOp1, NeqOp: neqOp, GteOp: gteOp, LteOp: lteOp, GtOp: gtOp, EqOp: eqOp, LtOp: ltOp} = lexer2.tokenVocabulary, result47 = {};
    result47.Parser = class extends embeddedActionsParser {
      constructor(options2, references2) {
        super(tokenVocabulary1, {
          outputCst: !1,
          maxLookahead: 1,
          skipValidations: !0
        }), this.utils = references2, this.binaryOperatorsPrecedence = [ [ "^" ], [ "*", "/" ], [ "+", "-" ], [ "&" ], [ "<", ">", "=", "<>", "<=", ">=" ] ];
        const parser1 = this;
        parser1.RULE("formulaWithBinaryOp", (() => {
          {
            const items1 = [], items2 = [ parser1.SUBRULE(parser1.formulaWithPercentOp) ];
            return parser1.MANY((() => {
              items1.push(parser1.OR(parser1.c1 || (parser1.c1 = [ {
                ALT: () => parser1.CONSUME(gtOp).image
              }, {
                ALT: () => parser1.CONSUME(eqOp).image
              }, {
                ALT: () => parser1.CONSUME(ltOp).image
              }, {
                ALT: () => parser1.CONSUME(neqOp).image
              }, {
                ALT: () => parser1.CONSUME(gteOp).image
              }, {
                ALT: () => parser1.CONSUME(lteOp).image
              }, {
                ALT: () => parser1.CONSUME(concatOp1).image
              }, {
                ALT: () => parser1.CONSUME(plusOp).image
              }, {
                ALT: () => parser1.CONSUME(minOp).image
              }, {
                ALT: () => parser1.CONSUME(mulOp).image
              }, {
                ALT: () => parser1.CONSUME(divOp).image
              }, {
                ALT: () => parser1.CONSUME(exOp).image
              } ]))), items2.push(parser1.SUBRULE2(parser1.formulaWithPercentOp));
            })), parser1.ACTION((() => {
              for (const value61 of this.binaryOperatorsPrecedence) for (let number5 = 0, length2 = items1.length; number5 < length2; number5++) {
                const value62 = items1[number5];
                value61.includes(value62) && (items1.splice(number5, 1), items2.splice(number5, 2, this.utils.applyInfix(items2[number5], value62, items2[(value63 = number5, 
                value63 + 1)])), number5--, length2--);
              }
              var value63;
            })), items2[0];
          }
        })), parser1.RULE("plusMinusOp", (() => parser1.OR([ {
          ALT: () => parser1.CONSUME(plusOp).image
        }, {
          ALT: () => parser1.CONSUME(minOp).image
        } ]))), parser1.RULE("formulaWithPercentOp", (() => {
          let sUBRULEResult = parser1.SUBRULE(parser1.formulaWithUnaryOp);
          return parser1.OPTION((() => {
            {
              const image1 = parser1.CONSUME(percentOp1).image;
              sUBRULEResult = parser1.ACTION((() => this.utils.applyPostfix(sUBRULEResult, image1)));
            }
          })), sUBRULEResult;
        })), parser1.RULE("formulaWithUnaryOp", (() => {
          {
            const items3 = [];
            parser1.MANY((() => {
              const oRResult = parser1.OR([ {
                ALT: () => parser1.CONSUME(plusOp).image
              }, {
                ALT: () => parser1.CONSUME(minOp).image
              } ]);
              items3.push(oRResult);
            }));
            const sUBRULEResult1 = parser1.SUBRULE(parser1.formulaWithIntersect);
            return items3.length > 0 ? parser1.ACTION((() => this.utils.applyPrefix(items3, sUBRULEResult1))) : sUBRULEResult1;
          }
        })), parser1.RULE("formulaWithIntersect", (() => {
          let sUBRULEResult2 = parser1.SUBRULE(parser1.formulaWithRange);
          const items4 = [ sUBRULEResult2 ];
          return parser1.MANY({
            GATE: () => {
              const lAResult = parser1.LA(0);
              return parser1.LA(1).startOffset > lAResult.endOffset + 1;
            },
            DEF: () => {
              items4.push(parser1.SUBRULE3(parser1.formulaWithRange));
            }
          }), items4.length > 1 ? parser1.ACTION((() => parser1.ACTION((() => this.utils.applyIntersect(items4))))) : sUBRULEResult2;
        })), parser1.RULE("formulaWithRange", (() => {
          const sUBRULEResult3 = parser1.SUBRULE(parser1.formula), items5 = [ sUBRULEResult3 ];
          return parser1.MANY((() => {
            parser1.CONSUME(colon), items5.push(parser1.SUBRULE2(parser1.formula));
          })), items5.length > 1 ? parser1.ACTION((() => parser1.ACTION((() => this.utils.applyRange(items5))))) : sUBRULEResult3;
        })), parser1.RULE("formula", (() => parser1.OR9([ {
          ALT: () => parser1.SUBRULE(parser1.referenceWithoutInfix)
        }, {
          ALT: () => parser1.SUBRULE(parser1.paren)
        }, {
          ALT: () => parser1.SUBRULE(parser1.constant)
        }, {
          ALT: () => parser1.SUBRULE(parser1.functionCall)
        }, {
          ALT: () => parser1.SUBRULE(parser1.constantArray)
        } ]))), parser1.RULE("paren", (() => {
          let value64;
          parser1.CONSUME(openParen);
          const items6 = [];
          return items6.push(parser1.SUBRULE(parser1.formulaWithBinaryOp)), parser1.MANY((() => {
            parser1.CONSUME(comma), items6.push(parser1.SUBRULE2(parser1.formulaWithBinaryOp));
          })), value64 = items6.length > 1 ? parser1.ACTION((() => this.utils.applyUnion(items6))) : items6[0], 
          parser1.CONSUME(closeParen), value64;
        })), parser1.RULE("constantArray", (() => {
          const items7 = [ [] ];
          let number6 = 0;
          return parser1.CONSUME(openCurlyParen), items7[number6].push(parser1.SUBRULE(parser1.constantForArray)), 
          parser1.MANY((() => {
            const oRResult1 = parser1.OR([ {
              ALT: () => parser1.CONSUME(comma).image
            }, {
              ALT: () => parser1.CONSUME(semicolon).image
            } ]), sUBRULE2Result = parser1.SUBRULE2(parser1.constantForArray);
            "," === oRResult1 || (number6++, items7[number6] = []), items7[number6].push(sUBRULE2Result);
          })), parser1.CONSUME(closeCurlyParen), parser1.ACTION((() => this.utils.toArray(items7)));
        })), parser1.RULE("constantForArray", (() => parser1.OR([ {
          ALT: () => {
            {
              const oPTIONResult = parser1.OPTION((() => parser1.SUBRULE(parser1.plusMinusOp))), image2 = parser1.CONSUME(number4).image, aCTIONResult = parser1.ACTION((() => this.utils.toNumber(image2)));
              return oPTIONResult ? parser1.ACTION((() => this.utils.applyPrefix([ oPTIONResult ], aCTIONResult))) : aCTIONResult;
            }
          }
        }, {
          ALT: () => {
            const image3 = parser1.CONSUME(string1).image;
            return parser1.ACTION((() => this.utils.toString(image3)));
          }
        }, {
          ALT: () => {
            const image4 = parser1.CONSUME(boolean1).image;
            return parser1.ACTION((() => this.utils.toBoolean(image4)));
          }
        }, {
          ALT: () => {
            {
              const image5 = parser1.CONSUME(formulaErrorT).image;
              return parser1.ACTION((() => this.utils.toError(image5)));
            }
          }
        }, {
          ALT: () => {
            const image6 = parser1.CONSUME(refError).image;
            return parser1.ACTION((() => this.utils.toError(image6)));
          }
        } ]))), parser1.RULE("constant", (() => parser1.OR([ {
          ALT: () => {
            {
              const image7 = parser1.CONSUME(number4).image;
              return parser1.ACTION((() => this.utils.toNumber(image7)));
            }
          }
        }, {
          ALT: () => {
            const image8 = parser1.CONSUME(string1).image;
            return parser1.ACTION((() => this.utils.toString(image8)));
          }
        }, {
          ALT: () => {
            const image9 = parser1.CONSUME(boolean1).image;
            return parser1.ACTION((() => this.utils.toBoolean(image9)));
          }
        }, {
          ALT: () => {
            const image10 = parser1.CONSUME(formulaErrorT).image;
            return parser1.ACTION((() => this.utils.toError(image10)));
          }
        } ]))), parser1.RULE("functionCall", (() => {
          const sliceResult = parser1.CONSUME(functionToken).image.slice(0, -1), sUBRULEResult4 = parser1.SUBRULE(parser1.arguments);
          return parser1.CONSUME(closeParen), parser1.ACTION((() => options2.callFunction(sliceResult, sUBRULEResult4)));
        })), parser1.RULE("arguments", (() => {
          parser1.MANY2((() => {
            parser1.CONSUME2(comma);
          }));
          const items8 = [];
          return parser1.OPTION((() => {
            items8.push(parser1.SUBRULE(parser1.formulaWithBinaryOp)), parser1.MANY((() => {
              parser1.CONSUME1(comma), items8.push(null), parser1.OPTION3((() => {
                items8.pop(), items8.push(parser1.SUBRULE2(parser1.formulaWithBinaryOp));
              }));
            }));
          })), items8;
        })), parser1.RULE("referenceWithoutInfix", (() => parser1.OR([ {
          ALT: () => parser1.SUBRULE(parser1.referenceItem)
        }, {
          ALT: () => {
            {
              const sUBRULEResult5 = parser1.SUBRULE(parser1.prefixName), sUBRULE2Result1 = parser1.SUBRULE2(parser1.formulaWithRange);
              return parser1.ACTION((() => {
                if (this.utils.isFormulaError(sUBRULE2Result1)) return sUBRULE2Result1;
                sUBRULE2Result1.ref.sheet = sUBRULEResult5;
              })), sUBRULE2Result1;
            }
          }
        } ]))), parser1.RULE("referenceItem", (() => parser1.OR([ {
          ALT: () => {
            const image11 = parser1.CONSUME(cell).image;
            return parser1.ACTION((() => this.utils.parseCellAddress(image11)));
          }
        }, {
          ALT: () => {
            const image12 = parser1.CONSUME(name1).image;
            return parser1.ACTION((() => options2.getVariable(image12)));
          }
        }, {
          ALT: () => {
            const image13 = parser1.CONSUME(column2).image;
            return parser1.ACTION((() => this.utils.parseCol(image13)));
          }
        }, {
          ALT: () => {
            const image14 = parser1.CONSUME(refError).image;
            return parser1.ACTION((() => this.utils.toError(image14)));
          }
        } ]))), parser1.RULE("prefixName", (() => parser1.OR([ {
          ALT: () => parser1.CONSUME(sheet1).image.slice(0, -1)
        }, {
          ALT: () => parser1.CONSUME(sheetQuoted).image.slice(1, -2).replace(/''/g, "'")
        } ]))), this.performSelfAnalysis();
      }
    }, module5.exports = result47;
  }
}), require_operators = __commonJS({
  "../work/LesterLyu__fast-formula-parser/formulas/operators.js"(value65, module6) {
    var formulaError2 = require_error(), {FormulaHelpers: formulaHelpers} = require_helpers(), result48 = {
      unaryOp: (value66, otherValue8, argument34) => {
        let number7 = 1;
        if (value66.forEach((value67 => {
          if ("+" === value67) ; else {
            if ("-" !== value67) throw new Error("Unrecognized prefix: " + value67);
            number7 = -number7;
          }
        })), null == otherValue8 && (otherValue8 = 0), 1 === number7) return otherValue8;
        try {
          otherValue8 = formulaHelpers.acceptNumber(otherValue8, argument34);
        } catch (error2) {
          if (!(error2 instanceof formulaError2)) throw error2;
          Array.isArray(otherValue8) && (otherValue8 = otherValue8[0][0]);
        }
        return "number" == typeof otherValue8 && isNaN(otherValue8) ? formulaError2.VALUE : -otherValue8;
      }
    }, result49 = {
      percentOp: (value68, otherValue9, argument35) => {
        try {
          value68 = formulaHelpers.acceptNumber(value68, argument35);
        } catch (error3) {
          if (error3 instanceof formulaError2) return error3;
          throw error3;
        }
        if ("%" === otherValue9) return value68 / 100;
        throw new Error("Unrecognized postfix: " + otherValue9);
      }
    }, result50 = {
      boolean: 3,
      string: 2,
      number: 1
    }, result51 = {
      compareOp: (value69, otherValue10, argument36, argument41, argument5) => {
        {
          null == value69 && (value69 = 0), null == argument36 && (argument36 = 0), argument41 && (value69 = value69[0][0]), 
          argument5 && (argument36 = argument36[0][0]);
          const value70 = typeof value69, value71 = typeof argument36;
          if (value70 === value71) switch (otherValue10) {
           case "=":
            return value69 === argument36;

           case ">":
            return value69 > argument36;

           case "<":
            return value69 < argument36;

           case "<>":
            return value69 !== argument36;

           case "<=":
            return value69 <= argument36;

           case ">=":
            return value69 >= argument36;
          } else switch (otherValue10) {
           case "=":
            return !1;

           case ">":
            return result50[value70] > result50[value71];

           case "<":
            return result50[value70] < result50[value71];

           case "<>":
            return !0;

           case "<=":
            return result50[value70] <= result50[value71];

           case ">=":
            return result50[value70] >= result50[value71];
          }
          throw Error("Infix.compareOp: Should not reach here.");
        }
      },
      concatOp: (value72, otherValue11, argument37, argument42, argument51) => (null == value72 && (value72 = ""), 
      null == argument37 && (argument37 = ""), argument42 && (value72 = value72[0][0]), 
      argument51 && (argument37 = argument37[0][0]), "boolean" == typeof value72 && (value72 = value72 ? "TRUE" : "FALSE"), 
      "boolean" == typeof argument37 && (argument37 = argument37 ? "TRUE" : "FALSE"), 
      "" + value72 + argument37),
      mathOp: (value73, otherValue12, argument38, argument43, argument52) => {
        null == value73 && (value73 = 0), null == argument38 && (argument38 = 0);
        try {
          value73 = formulaHelpers.acceptNumber(value73, argument43), argument38 = formulaHelpers.acceptNumber(argument38, argument52);
        } catch (error4) {
          if (error4 instanceof formulaError2) return error4;
          throw error4;
        }
        switch (otherValue12) {
         case "+":
          return value73 + argument38;

         case "-":
          return value73 - argument38;

         case "*":
          return value73 * argument38;

         case "/":
          return 0 === argument38 ? formulaError2.DIV0 : value73 / argument38;

         case "^":
          return value73 ** argument38;
        }
        throw Error("Infix.mathOp: Should not reach here.");
      }
    }, result52 = {};
    result52.Prefix = result48, result52.Postfix = result49, result52.Infix = result51, 
    result52.Operators = {
      compareOp: [ "<", ">", "=", "<>", "<=", ">=" ],
      concatOp: [ "&" ],
      mathOp: [ "+", "-", "*", "/", "^" ]
    }, module6.exports = result52;
  }
}), require_utils = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/dependency/utils.js"(value74, module7) {
    var formulaError3 = require_error(), {FormulaHelpers: formulaHelpers1, Types: types1, Address: address1} = require_helpers(), {Prefix: prefix, Postfix: postfix, Infix: infix, Operators: operators} = require_operators(), collection1 = require_collection();
    module7.exports = class {
      constructor(options3) {
        this.context = options3;
      }
      columnNameToNumber(columnName1) {
        return address1.columnNameToNumber(columnName1);
      }
      parseCellAddress(value75) {
        {
          const matchResult1 = value75.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
          return {
            ref: {
              col: this.columnNameToNumber(matchResult1[2]),
              row: +matchResult1[4]
            }
          };
        }
      }
      parseRow(value76) {
        const value77 = +value76;
        if (!Number.isInteger(value77)) throw Error("Row number must be integer.");
        var result53 = {
          col: void 0
        };
        result53.row = +value76;
        var result54 = {};
        return result54.ref = result53, result54;
      }
      parseCol(value78) {
        return {
          ref: {
            col: this.columnNameToNumber(value78),
            row: void 0
          }
        };
      }
      applyPrefix(value79, otherValue13) {
        return this.extractRefValue(otherValue13), 0;
      }
      applyPostfix(value80, otherValue14) {
        return this.extractRefValue(value80), 0;
      }
      applyInfix(value81, otherValue15, argument39) {
        return this.extractRefValue(value81), this.extractRefValue(argument39), 0;
      }
      applyIntersect(value82) {
        {
          if (this.isFormulaError(value82[0])) return value82[0];
          if (!value82[0].ref) throw Error("Expecting a reference, but got " + value82[0] + ".");
          let row1, col1, row2, col2, sheet2, value83;
          const ref1 = value82.shift().ref;
          if (sheet2 = ref1.sheet, ref1.from) row1 = Math.max(ref1.from.row, ref1.to.row), 
          row2 = Math.min(ref1.from.row, ref1.to.row), col1 = Math.max(ref1.from.col, ref1.to.col), 
          col2 = Math.min(ref1.from.col, ref1.to.col); else {
            if (void 0 === ref1.row || void 0 === ref1.col) throw Error("Cannot intersect the whole row or column.");
            row1 = row2 = ref1.row, col1 = col2 = ref1.col;
          }
          let value84;
          if (value82.forEach((value85 => {
            if (this.isFormulaError(value85)) return value85;
            if (!(value85 = value85.ref)) throw Error("Expecting a reference, but got " + value85 + ".");
            if (value85.from) {
              const maxResult = Math.max(value85.from.row, value85.to.row), minResult = Math.min(value85.from.row, value85.to.row), maxResult1 = Math.max(value85.from.col, value85.to.col), minResult1 = Math.min(value85.from.col, value85.to.col);
              (minResult > row1 || maxResult < row2 || minResult1 > col1 || maxResult1 < col2 || sheet2 !== value85.sheet) && (value84 = formulaError3.NULL), 
              row1 = Math.min(row1, maxResult), row2 = Math.max(row2, minResult), col1 = Math.min(col1, maxResult1), 
              col2 = Math.max(col2, minResult1);
            } else {
              if (void 0 === value85.row || void 0 === value85.col) throw Error("Cannot intersect the whole row or column.");
              (value85.row > row1 || value85.row < row2 || value85.col > col1 || value85.col < col2 || sheet2 !== value85.sheet) && (value84 = formulaError3.NULL), 
              row1 = row2 = value85.row, col1 = col2 = value85.col;
            }
          })), value84) return value84;
          if (row1 === row2 && col1 === col2) {
            var result55 = {};
            result55.sheet = sheet2, result55.row = row1, result55.col = col1;
            var result56 = {};
            result56.ref = result55, value83 = result56;
          } else {
            var result57 = {};
            result57.row = row2, result57.col = col2;
            var result58 = {};
            result58.row = row1, result58.col = col1;
            var result59 = {};
            result59.sheet = sheet2, result59.from = result57, result59.to = result58;
            var result60 = {};
            result60.ref = result59, value83 = result60;
          }
          return value83.ref.sheet || delete value83.ref.sheet, value83;
        }
      }
      applyUnion(value86) {
        {
          const instance2 = new collection1;
          for (let number8 = 0; number8 < value86.length; number8++) {
            if (this.isFormulaError(value86[number8])) return value86[number8];
            instance2.add(this.extractRefValue(value86[number8]).val, value86[number8]);
          }
          return instance2;
        }
      }
      applyRange(value87) {
        {
          let value88, row3 = -1, col3 = -1, number9 = 1048577, number10 = 16385;
          if (value87.forEach((value89 => {
            if (this.isFormulaError(value89)) return value89;
            "number" == typeof value89 && (value89 = this.parseRow(value89)), void 0 === (value89 = value89.ref).row && (number9 = 1, 
            row3 = 1048576), void 0 === value89.col && (number10 = 1, col3 = 16384), value89.row > row3 && (row3 = value89.row), 
            value89.row < number9 && (number9 = value89.row), value89.col > col3 && (col3 = value89.col), 
            value89.col < number10 && (number10 = value89.col);
          })), row3 === number9 && col3 === number10) {
            var result61 = {};
            result61.row = row3, result61.col = col3;
            var result62 = {};
            result62.ref = result61, value88 = result62;
          } else {
            var result63 = {};
            result63.row = number9, result63.col = number10;
            var result64 = {};
            result64.row = row3, result64.col = col3;
            var result65 = {};
            result65.from = result63, result65.to = result64;
            var result66 = {};
            result66.ref = result65, value88 = result66;
          }
          return value88;
        }
      }
      extractRefValue(value90) {
        {
          const isArrayResult = Array.isArray(value90);
          if (value90.ref) return {
            val: this.context.retrieveRef(value90),
            isArray: isArrayResult
          };
          var result67 = {};
          return result67.val = value90, result67.isArray = isArrayResult, result67;
        }
      }
      toArray(value91) {
        return value91;
      }
      toNumber(value92) {
        return Number(value92);
      }
      toString(value93) {
        return value93.substring(1, (value94 = value93.length, value94 - 1)).replace(/""/g, '"');
        var value94;
      }
      toBoolean(value95) {
        return "TRUE" === value95;
      }
      toError(value96) {
        return new formulaError3(value96.toUpperCase());
      }
      isFormulaError(value97) {
        return value97 instanceof formulaError3;
      }
    };
  }
}), require_utils2 = __commonJS({
  "../work/LesterLyu__fast-formula-parser/grammar/utils.js"(value98, module8) {
    var formulaError4 = require_error(), {Address: address2} = require_helpers(), {Prefix: prefix1, Postfix: postfix1, Infix: infix1, Operators: operators1} = require_operators(), collection2 = require_collection(), {NotAllInputParsedException: notAllInputParsedException} = require("chevrotain");
    module8.exports = class {
      constructor(options4) {
        this.context = options4;
      }
      columnNameToNumber(columnName2) {
        return address2.columnNameToNumber(columnName2);
      }
      parseCellAddress(value99) {
        const matchResult2 = value99.match(/([$]?)([A-Za-z]{1,3})([$]?)([1-9][0-9]*)/);
        return {
          ref: {
            address: matchResult2[0],
            col: this.columnNameToNumber(matchResult2[2]),
            row: +matchResult2[4]
          }
        };
      }
      parseRow(value100) {
        {
          const value101 = +value100;
          if (!Number.isInteger(value101)) throw Error("Row number must be integer.");
          var result68 = {
            col: void 0
          };
          result68.row = +value100;
          var result69 = {};
          return result69.ref = result68, result69;
        }
      }
      parseCol(value102) {
        return {
          ref: {
            col: this.columnNameToNumber(value102),
            row: void 0
          }
        };
      }
      parseColRange(value103, otherValue16) {
        return value103 = this.columnNameToNumber(value103), otherValue16 = this.columnNameToNumber(otherValue16), 
        {
          ref: {
            from: {
              col: Math.min(value103, otherValue16),
              row: null
            },
            to: {
              col: Math.max(value103, otherValue16),
              row: null
            }
          }
        };
      }
      parseRowRange(value104, otherValue17) {
        return {
          ref: {
            from: {
              col: null,
              row: Math.min(value104, otherValue17)
            },
            to: {
              col: null,
              row: Math.max(value104, otherValue17)
            }
          }
        };
      }
      _applyPrefix(value105, otherValue18, argument310) {
        return this.isFormulaError(otherValue18) ? otherValue18 : prefix1.unaryOp(value105, otherValue18, argument310);
      }
      async applyPrefixAsync(value106, otherValue19) {
        {
          const {val: val1, isArray: isArray3} = this.extractRefValue(await otherValue19);
          return this._applyPrefix(value106, val1, isArray3);
        }
      }
      applyPrefix(value107, otherValue20) {
        if (this.context.async) return this.applyPrefixAsync(value107, otherValue20);
        {
          const {val: val2, isArray: isArray4} = this.extractRefValue(otherValue20);
          return this._applyPrefix(value107, val2, isArray4);
        }
      }
      _applyPostfix(value108, otherValue21, argument311) {
        return this.isFormulaError(value108) ? value108 : postfix1.percentOp(value108, argument311, otherValue21);
      }
      async applyPostfixAsync(value109, otherValue22) {
        {
          const {val: val3, isArray: isArray5} = this.extractRefValue(await value109);
          return this._applyPostfix(val3, isArray5, otherValue22);
        }
      }
      applyPostfix(value110, otherValue23) {
        if (!this.context.async) {
          const {val: val4, isArray: isArray6} = this.extractRefValue(value110);
          return this._applyPostfix(val4, isArray6, otherValue23);
        }
        return this.applyPostfixAsync(value110, otherValue23);
      }
      _applyInfix(value111, otherValue24, argument312) {
        {
          const val5 = value111.val, isArray7 = value111.isArray, val6 = argument312.val, isArray8 = argument312.isArray;
          if (this.isFormulaError(val5)) return val5;
          if (this.isFormulaError(val6)) return val6;
          if (operators1.compareOp.includes(otherValue24)) return infix1.compareOp(val5, otherValue24, val6, isArray7, isArray8);
          if (operators1.concatOp.includes(otherValue24)) return infix1.concatOp(val5, otherValue24, val6, isArray7, isArray8);
          if (operators1.mathOp.includes(otherValue24)) return infix1.mathOp(val5, otherValue24, val6, isArray7, isArray8);
          throw new Error("Unrecognized infix: " + otherValue24);
        }
      }
      async applyInfixAsync(value112, otherValue25, argument313) {
        const extractRefValueResult1 = this.extractRefValue(await value112), extractRefValueResult2 = this.extractRefValue(await argument313);
        return this._applyInfix(extractRefValueResult1, otherValue25, extractRefValueResult2);
      }
      applyInfix(value113, otherValue26, argument314) {
        if (!this.context.async) {
          const extractRefValueResult3 = this.extractRefValue(value113), extractRefValueResult4 = this.extractRefValue(argument314);
          return this._applyInfix(extractRefValueResult3, otherValue26, extractRefValueResult4);
        }
        return this.applyInfixAsync(value113, otherValue26, argument314);
      }
      applyIntersect(value114) {
        {
          if (this.isFormulaError(value114[0])) return value114[0];
          if (!value114[0].ref) throw Error("Expecting a reference, but got " + value114[0] + ".");
          let row4, col4, row5, col5, sheet3, value115;
          const ref2 = value114.shift().ref;
          if (sheet3 = ref2.sheet, ref2.from) row4 = Math.max(ref2.from.row, ref2.to.row), 
          row5 = Math.min(ref2.from.row, ref2.to.row), col4 = Math.max(ref2.from.col, ref2.to.col), 
          col5 = Math.min(ref2.from.col, ref2.to.col); else {
            if (void 0 === ref2.row || void 0 === ref2.col) throw Error("Cannot intersect the whole row or column.");
            row4 = row5 = ref2.row, col4 = col5 = ref2.col;
          }
          let value116;
          if (value114.forEach((value117 => {
            if (this.isFormulaError(value117)) return value117;
            if (!(value117 = value117.ref)) throw Error("Expecting a reference, but got " + value117 + ".");
            if (value117.from) {
              const maxResult2 = Math.max(value117.from.row, value117.to.row), minResult2 = Math.min(value117.from.row, value117.to.row), maxResult3 = Math.max(value117.from.col, value117.to.col), minResult3 = Math.min(value117.from.col, value117.to.col);
              (minResult2 > row4 || maxResult2 < row5 || minResult3 > col4 || maxResult3 < col5 || sheet3 !== value117.sheet) && (value116 = formulaError4.NULL), 
              row4 = Math.min(row4, maxResult2), row5 = Math.max(row5, minResult2), col4 = Math.min(col4, maxResult3), 
              col5 = Math.max(col5, minResult3);
            } else {
              if (void 0 === value117.row || void 0 === value117.col) throw Error("Cannot intersect the whole row or column.");
              (value117.row > row4 || value117.row < row5 || value117.col > col4 || value117.col < col5 || sheet3 !== value117.sheet) && (value116 = formulaError4.NULL), 
              row4 = row5 = value117.row, col4 = col5 = value117.col;
            }
          })), value116) return value116;
          if (row4 === row5 && col4 === col5) {
            var result70 = {};
            result70.sheet = sheet3, result70.row = row4, result70.col = col4;
            var result71 = {};
            result71.ref = result70, value115 = result71;
          } else {
            var result72 = {};
            result72.row = row5, result72.col = col5;
            var result73 = {};
            result73.row = row4, result73.col = col4;
            var result74 = {};
            result74.sheet = sheet3, result74.from = result72, result74.to = result73;
            var result75 = {};
            result75.ref = result74, value115 = result75;
          }
          return value115.ref.sheet || delete value115.ref.sheet, value115;
        }
      }
      applyUnion(value118) {
        {
          const instance3 = new collection2;
          for (let number11 = 0; number11 < value118.length; number11++) {
            if (this.isFormulaError(value118[number11])) return value118[number11];
            instance3.add(this.extractRefValue(value118[number11]).val, value118[number11]);
          }
          return instance3;
        }
      }
      applyRange(value119) {
        let value120, row6 = -1, col6 = -1, number12 = 1048577, number13 = 16385;
        if (value119.forEach((value121 => {
          if (this.isFormulaError(value121)) return value121;
          "number" == typeof value121 && (value121 = this.parseRow(value121)), void 0 === (value121 = value121.ref).row && (number12 = 1, 
          row6 = 1048576), void 0 === value121.col && (number13 = 1, col6 = 16384), value121.row > row6 && (row6 = value121.row), 
          value121.row < number12 && (number12 = value121.row), value121.col > col6 && (col6 = value121.col), 
          value121.col < number13 && (number13 = value121.col);
        })), row6 === number12 && col6 === number13) {
          var result76 = {};
          result76.row = row6, result76.col = col6;
          var result77 = {};
          result77.ref = result76, value120 = result77;
        } else {
          var result78 = {};
          result78.row = number12, result78.col = number13;
          var result79 = {};
          result79.row = row6, result79.col = col6;
          var result80 = {};
          result80.from = result78, result80.to = result79;
          var result81 = {};
          result81.ref = result80, value120 = result81;
        }
        return value120;
      }
      extractRefValue(value122) {
        {
          let val7 = value122, isArray9 = !1;
          if (Array.isArray(val7) && (isArray9 = !0), value122.ref) return {
            val: this.context.retrieveRef(value122),
            isArray: isArray9
          };
          var result82 = {};
          return result82.val = val7, result82.isArray = isArray9, result82;
        }
      }
      toArray(value123) {
        return value123;
      }
      toNumber(value124) {
        return Number(value124);
      }
      toString(value125) {
        return value125.substring(1, value125.length - 1).replace(/""/g, '"');
      }
      toBoolean(value126) {
        return "TRUE" === value126;
      }
      toError(value127) {
        return new formulaError4(value127.toUpperCase());
      }
      isFormulaError(value128) {
        return value128 instanceof formulaError4;
      }
      static formatChevrotainError(error5, input3) {
        let line2, column3, value129 = "";
        var value130, value131;
        error5 instanceof notAllInputParsedException ? (line2 = error5.token.startLine, 
        column3 = error5.token.startColumn) : (line2 = error5.previousToken.startLine, column3 = error5.previousToken.startColumn + 1), 
        value129 += "\n" + input3.split("\n")[line2 - 1] + "\n", value129 += (value130 = Array, 
        value131 = column3 - 1, value130(value131)).fill(" ").join("") + "^\n", value129 += "Error at position " + line2 + ":" + column3 + "\n" + error5.message;
        var result83 = {};
        return result83.line = line2, result83.column = column3, error5.errorLocation = result83, 
        formulaError4.ERROR(value129, error5);
      }
    };
  }
}), FormulaError = require_error(), {FormulaHelpers: FormulaHelpers} = require_helpers(), {Parser: Parser} = require_parsing(), lexer = require_lexing(), Utils = require_utils(), {formatChevrotainError: formatChevrotainError} = require_utils2(), exported = {
  DepParser: class {
    constructor(options) {
      this.data = [];
      this.utils = new Utils(this);
      options = Object.assign({
        onVariable: () => null
      }, options);
      this.onVariable = options.onVariable;
      this.functions = {};
      this.parser = new Parser(this, this.utils);
    }
    getCell(reference1) {
      return null != reference1.row && (null == reference1.sheet && (reference1.sheet = this.position ? this.position.sheet : void 0), 
      -1 === this.data.findIndex((value132 => value132.from && value132.from.row <= reference1.row && value132.to.row >= reference1.row && value132.from.col <= reference1.col && value132.to.col >= reference1.col || value132.row === reference1.row && value132.col === reference1.col && value132.sheet === reference1.sheet)) && this.data.push(reference1)), 
      0;
    }
    getRange(range) {
      return null != range.from.row && (null == range.sheet && (range.sheet = this.position ? this.position.sheet : void 0), 
      -1 === this.data.findIndex((value133 => value133.from && value133.from.row === range.from.row && value133.from.col === range.from.col && value133.to.row === range.to.row && value133.to.col === range.to.col)) && this.data.push(range)), 
      [ [ 0 ] ];
    }
    getVariable(name2) {
      const result85 = {
        ref: this.onVariable(name2, this.position.sheet)
      };
      return null == result85.ref ? FormulaError.NAME : (FormulaHelpers.isCellRef(result85) ? this.getCell(result85.ref) : this.getRange(result85.ref), 
      0);
    }
    retrieveRef(value134) {
      return FormulaHelpers.isRangeRef(value134) ? this.getRange(value134.ref) : FormulaHelpers.isCellRef(value134) ? this.getCell(value134.ref) : value134;
    }
    callFunction(name3, args) {
      return args.forEach((value135 => {
        null == value135 || this.retrieveRef(value135);
      })), {
        value: 0,
        ref: {}
      };
    }
    checkFormulaResult(result86) {
      this.retrieveRef(result86);
    }
    parse(input, position, ignoreErrors = !1) {
      if (0 === input.length) throw Error("Input must not be empty.");
      this.data = [], this.position = position;
      const lexResult = lexer.lex(input);
      this.parser.input = lexResult.tokens;
      try {
        {
          const formulaWithBinaryOpResult = this.parser.formulaWithBinaryOp();
          this.checkFormulaResult(formulaWithBinaryOpResult);
        }
      } catch (error6) {
        if (!ignoreErrors) throw FormulaError.ERROR(error6.message, error6);
      }
      if (this.parser.errors.length > 0 && !ignoreErrors) {
        const parserError = this.parser.errors[0];
        throw formatChevrotainError(parserError, input);
      }
      return this.data;
    }
  }
};

module.exports = exported;
